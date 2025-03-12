import { useAuth } from '../context/AuthContext';
import { useChores } from '../hooks/useChores';
import { useLists } from '../hooks/useLists';
import { Link } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

const Dashboard = () => {
  const { user } = useAuth();
  const { data: chores, isLoading: choresLoading } = useChores();
  const { data: lists, isLoading: listsLoading } = useLists();

  // Filter for incomplete chores (no completedAt date)
  const incompleteChores = chores?.filter(chore =>
    chore.instances &&
    chore.instances.length > 0 &&
    !chore.instances[0].completedAt
  ) || [];

  // Get counts
  const totalChores = incompleteChores.length;
  const totalLists = lists?.length || 0;

  return (
    <AppLayout>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Welcome, {user?.name || 'User'}</h1>
          <p className="dashboard-date">{new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
        </div>

        <div className="dashboard-summary">
          <div className="summary-card">
            <h3>Tasks Due</h3>
            <div className="summary-number">{totalChores}</div>
            <Link to="/chores" className="summary-link">View all</Link>
          </div>
          <div className="summary-card">
            <h3>Shopping Lists</h3>
            <div className="summary-number">{totalLists}</div>
            <Link to="/lists" className="summary-link">View all</Link>
          </div>
        </div>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Today's Chores</h2>
            <Link to="/chores" className="section-link">See all</Link>
          </div>

          {choresLoading ? (
            <p>Loading chores...</p>
          ) : incompleteChores.length > 0 ? (
            <div className="chores-list">
              {incompleteChores.slice(0, 3).map(chore => (
                <Link to={`/chores/${chore.id}`} key={chore.id} className="chore-card">
                  <h3>{chore.title}</h3>
                  <div className="chore-frequency">{chore.frequency}</div>
                  {chore.instances && chore.instances[0] && (
                    <div className="chore-due-date">
                      Due: {new Date(chore.instances[0].dueDate).toLocaleDateString()}
                    </div>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">No chores due today! 🎉</p>
          )}
        </section>

        <section className="dashboard-section">
          <div className="section-header">
            <h2>Shopping Lists</h2>
            <Link to="/lists" className="section-link">See all</Link>
          </div>

          {listsLoading ? (
            <p>Loading lists...</p>
          ) : lists && lists.length > 0 ? (
            <div className="lists-grid">
              {lists.slice(0, 2).map(list => (
                <Link to={`/lists/${list.id}`} key={list.id} className="list-card">
                  <h3>{list.title}</h3>
                  <div className="list-items-count">
                    {list.items ? `${list.items.length} items` : '0 items'}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="empty-state">No shopping lists yet. Create one!</p>
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

export default Dashboard