import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useChores, useCompleteChoreInstance } from '../hooks/useChores';
import AppLayout from '../components/layout/AppLayout';

const Chores = ()=> {
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

  const handleCompleteChore = async (_choreId: number, instanceId: number) => {
    try {
      await completeChore.mutateAsync(instanceId);
    } catch (error) {
      console.error('Failed to complete chore:', error);
    }
  };

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
                  <h2 className="group-title">{frequency.charAt(0).toUpperCase() + frequency.slice(1)}</h2>
                  <div className="chores-list">
                    {chores.map(chore => {
                      const latestInstance = chore.instances && chore.instances.length > 0
                        ? chore.instances[0]
                        : null;

                      return (
                        <div key={chore.id} className="chore-item">
                          <div className="chore-details">
                            <h3>{chore.title}</h3>
                            {latestInstance && (
                              <p className="chore-due-date">
                                Due: {new Date(latestInstance.dueDate).toLocaleDateString()}
                              </p>
                            )}
                          </div>
                          <div className="chore-actions">
                            {latestInstance && !latestInstance.completedAt && (
                              <button
                                className="complete-button"
                                onClick={() => handleCompleteChore(chore.id, latestInstance.id)}
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

export default Chores