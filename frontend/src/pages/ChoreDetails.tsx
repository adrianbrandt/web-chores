import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useChore, useChoreInstances, useCompleteChoreInstance, useDeleteChore, useUpdateChore } from '../hooks/useChores';
import AppLayout from '../components/layout/AppLayout';
import { isBefore, format } from 'date-fns';

const ChoreDetails = () => {
  const { id } = useParams();
  const choreId = id ? parseInt(id) : 0;
  const navigate = useNavigate();

  const { data: chore, isLoading, isError } = useChore(choreId);
  const { data: instances } = useChoreInstances(choreId);
  const completeChore = useCompleteChoreInstance();
  const deleteChore = useDeleteChore();
  const updateChore = useUpdateChore();

  // State for edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');

  // Initialize form data when chore data is loaded
  if (chore && !isEditing && title === '') {
    setTitle(chore.title);
    setDescription(chore.description || '');
    setFrequency(chore.frequency as 'daily' | 'weekly' | 'monthly');
  }

  if (isLoading) {
    return (
      <AppLayout>
        <div className="chore-details-page">
          <h1>Chore Details</h1>
          <p>Loading chore details...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError || !chore) {
    return (
      <AppLayout>
        <div className="chore-details-page">
          <h1>Chore Details</h1>
          <p className="error-message">Error loading chore details. The chore may have been deleted.</p>
          <button
            className="back-button"
            onClick={() => navigate('/chores')}
          >
            Back to Chores
          </button>
        </div>
      </AppLayout>
    );
  }

  const latestInstance = chore.instances && chore.instances.length > 0
    ? chore.instances[0]
    : null;

  const handleComplete = async (instanceId: number, dueDate: string) => {
    // Check if the chore is in the future
    const today = new Date();
    const choreDate = new Date(dueDate);

    // Only allow completing chores that are due today or in the past
    if (!isBefore(choreDate, today) && choreDate.toDateString() !== today.toDateString()) {
      alert('You cannot complete future chores! This chore is not yet due.');
      return;
    }

    try {
      await completeChore.mutateAsync(instanceId);
    } catch (error) {
      console.error('Failed to complete chore:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm('Are you sure you want to delete this chore? This action cannot be undone.')) {
      try {
        await deleteChore.mutateAsync(choreId);
        navigate('/chores');
      } catch (error) {
        console.error('Failed to delete chore:', error);
      }
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await updateChore.mutateAsync({
        id: choreId,
        data: {
          title,
          description,
          frequency
        }
      });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update chore:', error);
    }
  };

  // Calculate completion percentage for history chart
  const calculateCompletionPercentage = () => {
    if (!instances || instances.length === 0) return 0;
    const completedInstances = instances.filter(instance => instance.completedAt);
    return Math.round((completedInstances.length / instances.length) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  return (
    <AppLayout>
      <div className="chore-details-page">
        <div className="page-header">
          <button
            className="back-button"
            onClick={() => navigate('/chores')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>

          <div className="header-actions">
            {!isEditing && (
              <>
                <button
                  className="edit-button"
                  onClick={() => setIsEditing(true)}
                >
                  Edit
                </button>
                <button
                  className="delete-button"
                  onClick={handleDelete}
                  disabled={deleteChore.isPending}
                >
                  {deleteChore.isPending ? 'Deleting...' : 'Delete'}
                </button>
              </>
            )}
          </div>
        </div>

        {isEditing ? (
          <form className="chore-form" onSubmit={handleUpdate}>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description (Optional)</label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="frequency">How often?</label>
              <select
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value as 'daily' | 'weekly' | 'monthly')}
                required
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-button"
                onClick={() => setIsEditing(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="submit-button"
                disabled={updateChore.isPending}
              >
                {updateChore.isPending ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        ) : (
          <div className="chore-details">
            <h1 className="chore-title">{chore.title}</h1>

            {chore.description && (
              <p className="chore-description">{chore.description}</p>
            )}

            <div className="chore-meta">
              <div className="meta-item">
                <span className="meta-label">Frequency:</span>
                <span className="meta-value">{chore.frequency}</span>
              </div>

              <div className="meta-item">
                <span className="meta-label">Created:</span>
                <span className="meta-value">{format(new Date(chore.createdAt), 'MMM d, yyyy')}</span>
              </div>

              {latestInstance && (
                <div className="meta-item">
                  <span className="meta-label">Next Due:</span>
                  <span className="meta-value">{format(new Date(latestInstance.dueDate), 'MMM d, yyyy')}</span>
                </div>
              )}

              <div className="meta-item">
                <span className="meta-label">Completion Rate:</span>
                <span className="meta-value">{completionPercentage}%</span>
              </div>
            </div>

            {latestInstance && !latestInstance.completedAt && (
              <div className="chore-actions">
                <button
                  className="complete-button"
                  onClick={() => handleComplete(latestInstance.id, latestInstance.dueDate)}
                  disabled={completeChore.isPending}
                >
                  {completeChore.isPending ? 'Completing...' : 'Mark as Complete'}
                </button>
              </div>
            )}
          </div>
        )}

        <div className="history-section">
          <h2>History</h2>

          <div className="completion-chart">
            <div className="chart-label">Overall Completion</div>
            <div className="progress-container">
              <div className="progress-bar">
                <div className="progress" style={{ width: `${completionPercentage}%` }}></div>
              </div>
              <div className="progress-percentage">{completionPercentage}%</div>
            </div>
          </div>

          {instances?.length ? (
            <div className="history-list">
              {instances.map(instance => {
                const isCompleted = instance.completedAt;
                const isPastDue = !isCompleted && isBefore(new Date(instance.dueDate), new Date()) &&
                  new Date(instance.dueDate).toDateString() !== new Date().toDateString();

                return (
                  <div key={instance.id} className={`history-item ${isPastDue ? 'past-due' : ''} ${isCompleted ? 'completed' : ''}`}>
                    <div className="history-date">
                      <div className="date-label">Due:</div>
                      <div className="date-value">{format(new Date(instance.dueDate), 'MMM d, yyyy')}</div>
                    </div>

                    <div className="history-status">
                      {isCompleted ? (
                        <>
                          <div className="status-label completed">Completed</div>
                          <div className="completion-date">
                            {format(new Date(instance.completedAt!), 'MMM d, yyyy')}
                          </div>
                        </>
                      ) : (
                        <div className={`status-label ${isPastDue ? 'past-due' : 'pending'}`}>
                          {isPastDue ? 'Missed' : 'Pending'}
                        </div>
                      )}
                    </div>

                    {!isCompleted && !isPastDue && (
                      <button
                        className="complete-instance-button"
                        onClick={() => handleComplete(instance.id, instance.dueDate)}
                        disabled={completeChore.isPending}
                      >
                        Complete
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p>No history available yet.</p>
          )}
        </div>
      </div>
    </AppLayout>
  );
}
export default ChoreDetails;