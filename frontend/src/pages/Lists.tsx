import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useLists, useSharedLists } from '../hooks/useLists';
import AppLayout from '../components/layout/AppLayout';

const Lists = () => {
  const [view, setView] = useState<'my' | 'shared'>('my');
  const { data: myLists, isLoading: myListsLoading } = useLists();
  const { data: sharedLists, isLoading: sharedListsLoading } = useSharedLists();

  const lists = view === 'my' ? myLists : sharedLists;
  const isLoading = view === 'my' ? myListsLoading : sharedListsLoading;

  return (
    <AppLayout>
      <div className="lists-page">
        <div className="page-header">
          <h1>Lists</h1>
          <Link to="/lists/new" className="header-action-button">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            New
          </Link>
        </div>

        <div className="view-tabs">
          <button
            className={`view-tab ${view === 'my' ? 'active' : ''}`}
            onClick={() => setView('my')}
          >
            My Lists
          </button>
          <button
            className={`view-tab ${view === 'shared' ? 'active' : ''}`}
            onClick={() => setView('shared')}
          >
            Shared With Me
          </button>
        </div>

        {isLoading ? (
          <p>Loading lists...</p>
        ) : lists && lists.length > 0 ? (
          <div className="lists-grid">
            {lists.map(list => {
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

                    {view === 'shared' && list.user && (
                      <div className="list-owner">
                        Shared by {list.user.name}
                      </div>
                    )}
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
          <div className="empty-state">
            {view === 'my' ? (
              <>
                <p>You don't have any lists yet.</p>
                <Link to="/lists/new" className="empty-action-button">Create a new list</Link>
              </>
            ) : (
              <p>No lists have been shared with you yet.</p>
            )}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
export default Lists;