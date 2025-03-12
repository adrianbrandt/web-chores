import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  useList,
  useDeleteList,
  useAddListItem,
  useToggleListItem,
  useDeleteListItem,
  useShareList
} from '../hooks/useLists';
import { useAuth } from '../context/AuthContext';
import AppLayout from '../components/layout/AppLayout';

const ListDetails =() => {
  const { id } = useParams();
  const listId = id ? parseInt(id) : 0;
  const navigate = useNavigate();
  const { user } = useAuth();

  const { data: list, isLoading, isError } = useList(listId);
  const deleteList = useDeleteList();
  const addListItem = useAddListItem();
  const toggleItem = useToggleListItem();
  const deleteItem = useDeleteListItem();
  const shareList = useShareList();

  const [newItemText, setNewItemText] = useState('');
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [shareEmail, setShareEmail] = useState('');
  const [shareError, setShareError] = useState('');

  useEffect(() => {
    if (list && user) {
      // Check if the user owns the list or it's shared with them
      const isOwner = list.createdBy === user.id;
      const isShared = list.shared?.some(share => share.userId === user.id);

      if (!isOwner && !isShared) {
        navigate('/lists');
      }
    }
  }, [list, user, navigate]);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="list-details-page">
          <h1>List Details</h1>
          <p>Loading list details...</p>
        </div>
      </AppLayout>
    );
  }

  if (isError || !list) {
    return (
      <AppLayout>
        <div className="list-details-page">
          <h1>List Details</h1>
          <p className="error-message">Error loading list details. The list may have been deleted.</p>
          <button
            className="back-button"
            onClick={() => navigate('/lists')}
          >
            Back to Lists
          </button>
        </div>
      </AppLayout>
    );
  }

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemText.trim()) return;

    try {
      await addListItem.mutateAsync({
        listId,
        data: { content: newItemText.trim() }
      });
      setNewItemText('');
    } catch (error) {
      console.error('Failed to add item:', error);
    }
  };

  const handleToggleItem = async (itemId: number) => {
    try {
      await toggleItem.mutateAsync(itemId);
    } catch (error) {
      console.error('Failed to toggle item:', error);
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    try {
      await deleteItem.mutateAsync(itemId);
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleDeleteList = async () => {
    if (confirm('Are you sure you want to delete this list? This action cannot be undone.')) {
      try {
        await deleteList.mutateAsync(listId);
        navigate('/lists');
      } catch (error) {
        console.error('Failed to delete list:', error);
      }
    }
  };

  const handleShareList = async (e: React.FormEvent) => {
    e.preventDefault();
    setShareError('');

    if (!shareEmail.trim()) return;

    try {
      await shareList.mutateAsync({
        listId,
        email: shareEmail.trim()
      });
      setShareEmail('');
      setIsShareModalOpen(false);
    } catch (error) {
      console.error('Failed to share list:', error);
      setShareError('Failed to share list. Please check the email and try again.');
    }
  };

  const completedItems = list.items?.filter(item => item.completed) || [];
  const incompleteItems = list.items?.filter(item => !item.completed) || [];

  // Check if user is the owner of the list
  const isOwner = user && list.createdBy === user.id;

  return (
    <AppLayout>
      <div className="list-details-page">
        <div className="page-header">
          <button
            className="back-button"
            onClick={() => navigate('/lists')}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Back
          </button>

          {isOwner && (
            <div className="header-actions">
              <button
                className="share-button"
                onClick={() => setIsShareModalOpen(true)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"></path>
                  <polyline points="16 6 12 2 8 6"></polyline>
                  <line x1="12" y1="2" x2="12" y2="15"></line>
                </svg>
                Share
              </button>
              <button
                className="delete-button"
                onClick={handleDeleteList}
                disabled={deleteList.isPending}
              >
                {deleteList.isPending ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          )}
        </div>

        <h1 className="list-title">{list.title}</h1>

        <form className="add-item-form" onSubmit={handleAddItem}>
          <input
            type="text"
            value={newItemText}
            onChange={(e) => setNewItemText(e.target.value)}
            placeholder="Add an item..."
            className="add-item-input"
          />
          <button
            type="submit"
            className="add-item-button"
            disabled={addListItem.isPending || !newItemText.trim()}
          >
            {addListItem.isPending ? 'Adding...' : 'Add'}
          </button>
        </form>

        <div className="list-items">
          {incompleteItems.length === 0 && completedItems.length === 0 ? (
            <p className="empty-list-message">This list is empty. Add some items above.</p>
          ) : (
            <>
              <div className="incomplete-items">
                {incompleteItems.map(item => (
                  <div key={item.id} className="list-item">
                    <div className="item-content">
                      <input
                        type="checkbox"
                        checked={item.completed}
                        onChange={() => handleToggleItem(item.id)}
                        className="item-checkbox"
                      />
                      <span className="item-text">{item.content}</span>
                    </div>
                    <button
                      className="delete-item-button"
                      onClick={() => handleDeleteItem(item.id)}
                      disabled={deleteItem.isPending}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>
                ))}
              </div>

              {completedItems.length > 0 && (
                <div className="completed-section">
                  <h3 className="completed-header">Completed ({completedItems.length})</h3>
                  <div className="completed-items">
                    {completedItems.map(item => (
                      <div key={item.id} className="list-item completed">
                        <div className="item-content">
                          <input
                            type="checkbox"
                            checked={item.completed}
                            onChange={() => handleToggleItem(item.id)}
                            className="item-checkbox"
                          />
                          <span className="item-text">{item.content}</span>
                        </div>
                        <button
                          className="delete-item-button"
                          onClick={() => handleDeleteItem(item.id)}
                          disabled={deleteItem.isPending}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                          </svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {isShareModalOpen && (
          <div className="modal-overlay">
            <div className="share-modal">
              <h2>Share List</h2>
              <p>Enter the email of the user you want to share this list with:</p>

              <form onSubmit={handleShareList}>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  placeholder="email@example.com"
                  required
                />

                {shareError && (
                  <div className="share-error">{shareError}</div>
                )}

                <div className="modal-actions">
                  <button
                    type="button"
                    className="cancel-button"
                    onClick={() => setIsShareModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="share-button"
                    disabled={shareList.isPending || !shareEmail.trim()}
                  >
                    {shareList.isPending ? 'Sharing...' : 'Share'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

export default ListDetails