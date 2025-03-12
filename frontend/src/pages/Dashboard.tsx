import { useAuth } from '../context/AuthContext';
import { useChores } from '../hooks/useChores';
import { useLists } from '../hooks/useLists';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';
import { Chore } from '../types';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: chores, isLoading: choresLoading } = useChores();
  const { data: lists, isLoading: listsLoading } = useLists();

  // Group chores by frequency
  const groupedChores = chores?.reduce((acc: Record<string, Chore[]>, chore) => {
    if (!acc[chore.frequency]) {
      acc[chore.frequency] = [];
    }
    acc[chore.frequency].push(chore);
    return acc;
  }, {}) || {};

  // Count pending chores (instances with no completedAt date)
  const pendingChores = chores?.filter(chore =>
    chore.instances &&
    chore.instances.length > 0 &&
    !chore.instances[0].completedAt
  ) || [];

  // Get counts
  const totalPendingChores = pendingChores.length;
  const totalLists = lists?.length || 0;

  // Calculate progress for each chore frequency
  const choreProgress = {
    daily: calculateProgress(groupedChores['daily'] || []),
    weekly: calculateProgress(groupedChores['weekly'] || []),
    monthly: calculateProgress(groupedChores['monthly'] || [])
  };

  function calculateProgress(chores: Chore[]): number {
    if (chores.length === 0) return 0;

    const completedChores = chores.filter(chore =>
      chore.instances &&
      chore.instances.length > 0 &&
      chore.instances[0].completedAt
    ).length;

    return Math.round((completedChores / chores.length) * 100);
  }

  return (
    <AppLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="dashboard-summary">
          <div className="summary-card">
            <h3>Pending Tasks</h3>
            <div className="summary-number">{totalPendingChores}</div>
            <Link to="/chores" className="summary-link">View all</Link>
          </div>
          <div className="summary-card">
            <h3>Lists</h3>
            <div className="summary-number">{totalLists}</div>
            <Link to="/lists" className="summary-link">View all</Link>
          </div>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>My Chores</h2>
            <Link to="/chores" className="section-link">See all</Link>
          </div>

          {choresLoading ? (
            <p>Loading chores...</p>
          ) : (
            <div className="chores-summary">
              {Object.entries(groupedChores).length > 0 ? (
                <>
                  {Object.entries(groupedChores).map(([frequency, chores]) => (
                    chores.length > 0 && (
                      <div key={frequency} className="frequency-group">
                        <div className="frequency-header">
                          <h3 className="frequency-title">
                            {frequency.charAt(0).toUpperCase() + frequency.slice(1)}
                          </h3>
                          <div className="frequency-progress">
                            <div className="progress-bar">
                              <div
                                className="progress"
                                style={{ width: `${choreProgress[frequency as keyof typeof choreProgress]}%` }}
                              ></div>
                            </div>
                            <span className="progress-text">{choreProgress[frequency as keyof typeof choreProgress]}%</span>
                          </div>
                        </div>

                        <div className="chore-list">
                          {chores.slice(0, 2).map(chore => {
                            const instance = chore.instances && chore.instances[0];
                            const isCompleted = instance && instance.completedAt;

                            return (
                              <Link to={`/chores/${chore.id}`} key={chore.id} className={`chore-card ${isCompleted ? 'completed' : ''}`}>
                                <div className="chore-status">
                                  <div className={`status-indicator ${isCompleted ? 'done' : 'pending'}`}></div>
                                </div>
                                <div className="chore-content">
                                  <h4>{chore.title}</h4>
                                  {instance && (
                                    <div className="chore-due-date">
                                      {isCompleted ?
                                        `Completed: ${new Date(instance.completedAt!).toLocaleDateString()}` :
                                        `Due: ${new Date(instance.dueDate).toLocaleDateString()}`
                                      }
                                    </div>
                                  )}
                                </div>
                              </Link>
                            );
                          })}
                          {chores.length > 2 && (
                            <Link to="/chores" className="more-chores">
                              +{chores.length - 2} more
                            </Link>
                          )}
                        </div>
                      </div>
                    )
                  ))}
                </>
              ) : (
                <p className="empty-state">No chores yet. Create your first chore!</p>
              )}
            </div>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>My Lists</h2>
            <Link to="/lists" className="section-link">See all</Link>
          </div>

          {listsLoading ? (
            <p>Loading lists...</p>
          ) : lists && lists.length > 0 ? (
            <div className="lists-grid">
              {lists.slice(0, 2).map(list => {
                const completedItems = list.items ? list.items.filter(item => item.completed).length : 0;
                const totalItems = list.items ? list.items.length : 0;
                const progress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

                return (
                  <Link to={`/lists/${list.id}`} key={list.id} className="list-card">
                    <h3>{list.title}</h3>
                    <div className="list-meta">
                      <div className="items-count">
                        {completedItems} of {totalItems} items
                      </div>
                    </div>
                    <div className="progress-bar">
                      <div
                        className="progress"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : (
            <p className="empty-state">No lists yet. Create one!</p>
          )}
        </section>

        <div className="action-buttons">
          <Link to="/chores/new" className="action-button primary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New Chore
          </Link>
          <Link to="/lists/new" className="action-button secondary">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New List
          </Link>
        </div>
      </div>
    </AppLayout>
  );
}

export default Dashboard;