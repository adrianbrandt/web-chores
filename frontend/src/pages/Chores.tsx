import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useChores, useCompleteChoreInstance } from '../hooks/useChores';
import AppLayout from '../components/layout/AppLayout';
import { format, isBefore } from 'date-fns';

const Chores = () => {
  const [filter, setFilter] = useState<'all' | 'incomplete' | 'completed'>('incomplete');
  const { data: chores, isLoading, isError } = useChores();
  const completeChore = useCompleteChoreInstance();

  if (isLoading) {
    return (
      <AppLayout>
        <div className="chores-page">
          <h1>Chores</h1>
          <p>Loading chores...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError) {
    return (
      <AppLayout>
        <div className="chores-page">
          <h1>Chores</h1>
          <p className="error-message">Error loading chores. Please try again later.</p>
        </div>
      </AppLayout>
    );
  }

  // Prepare chores data
  const choresList = chores || [];

  // Filter chores based on selected filter
  const filteredChores = choresList.filter(chore => {
    if (filter === 'all') return true;

    const latestInstance = chore.instances && chore.instances.length > 0
      ? chore.instances[0]
      : null;

    if (filter === 'completed') {
      return latestInstance && latestInstance.completedAt;
    }

    if (filter === 'incomplete') {
      return latestInstance && !latestInstance.completedAt;
    }

    return true;
  });

  // Group chores by frequency
  const groupedChores = {
    daily: filteredChores.filter(chore => chore.frequency === 'daily'),
    weekly: filteredChores.filter(chore => chore.frequency === 'weekly'),
    monthly: filteredChores.filter(chore => chore.frequency === 'monthly')
  };

  const handleCompleteChore = async (_choreId: number, instanceId: number, dueDate: string) => {
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

  // Calculate completion stats for each frequency
  const calculateCompletionStats = (chores: any[]) => {
    const total = chores.length;
    if (total === 0) return { completed: 0, percentage: 0 };

    const completed = chores.filter(chore =>
      chore.instances &&
      chore.instances.length > 0 &&
      chore.instances[0].completedAt
    ).length;

    return {
      completed,
      percentage: Math.round((completed / total) * 100)
    };
  };

  const dailyStats = calculateCompletionStats(groupedChores.daily);
  const weeklyStats = calculateCompletionStats(groupedChores.weekly);
  const monthlyStats = calculateCompletionStats(groupedChores.monthly);

  return (
    <AppLayout>
      <div className="chores-page">
        <div className="page-header">
          <h1>Chores</h1>
          <Link to="/chores/new" className="header-action-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New
          </Link>
        </div>

        <div className="filter-tabs">
          <button
            className={`filter-tab ${filter === 'incomplete' ? 'active' : ''}`}
            onClick={() => setFilter('incomplete')}
          >
            Incomplete
          </button>
          <button
            className={`filter-tab ${filter === 'completed' ? 'active' : ''}`}
            onClick={() => setFilter('completed')}
          >
            Completed
          </button>
          <button
            className={`filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
        </div>

        {filteredChores.length === 0 ? (
          <div className="empty-state">
            <p>No chores found.</p>
            <Link to="/chores/new" className="empty-action-button">Create a new chore</Link>
          </div>
        ) : (
          <div className="chores-container">
            {Object.entries(groupedChores).map(([frequency, chores]) => (
              chores.length > 0 && (
                <div key={frequency} className="chore-group">
                  <div className="group-header">
                    <h2 className="group-title">{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</h2>
                    <div className="group-stats">
                      <div className="stats-text">
                        {frequency === 'daily' && `${dailyStats.completed}/${chores.length} (${dailyStats.percentage}%)`}
                        {frequency === 'weekly' && `${weeklyStats.completed}/${chores.length} (${weeklyStats.percentage}%)`}
                        {frequency === 'monthly' && `${monthlyStats.completed}/${chores.length} (${monthlyStats.percentage}%)`}
                      </div>
                      <div className="progress-bar">
                        <div
                          className="progress"
                          style={{
                            width: `${frequency === 'daily' ? dailyStats.percentage :
                              frequency === 'weekly' ? weeklyStats.percentage :
                                monthlyStats.percentage}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  </div>
                  <div className="chores-list">
                    {chores.map(chore => {
                      const latestInstance = chore.instances && chore.instances.length > 0
                        ? chore.instances[0]
                        : null;

                      const isCompleted = latestInstance && latestInstance.completedAt;
                      const dueDate = latestInstance ? new Date(latestInstance.dueDate) : new Date();
                      const today = new Date();
                      const isPastDue = isBefore(dueDate, today) && !isCompleted && dueDate.toDateString() !== today.toDateString();

                      return (
                        <div key={chore.id} className={`chore-item ${isCompleted ? 'completed' : ''} ${isPastDue ? 'past-due' : ''}`}>
                          <div className="chore-details">
                            <h3>{chore.title}</h3>
                            {latestInstance && (
                              <p className="chore-due-date">
                                {isCompleted ?
                                  `Completed: ${format(new Date(latestInstance.completedAt!), 'MMM d, yyyy')}` :
                                  `Due: ${format(dueDate, 'MMM d, yyyy')}`
                                }
                              </p>
                            )}
                            {isPastDue && (
                              <p className="past-due-label">Past due</p>
                            )}
                          </div>
                          <div className="chore-actions">
                            {latestInstance && !isCompleted && (
                              <button
                                className="complete-button"
                                onClick={() => handleCompleteChore(chore.id, latestInstance.id, latestInstance.dueDate)}
                                disabled={completeChore.isPending}
                              >
                                Complete
                              </button>
                            )}
                            <Link to={`/chores/${chore.id}`} className="details-link">
                              Details
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default Chores;