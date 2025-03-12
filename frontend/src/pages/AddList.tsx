import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateList, useAddListItem } from '../hooks/useLists';
import AppLayout from '../components/layout/AppLayout';

const AddList = () => {
  const [title, setTitle] = useState('');
  const [initialItems, setInitialItems] = useState<string[]>([]);
  const [currentItem, setCurrentItem] = useState('');
  const createList = useCreateList();
  const addItem = useAddListItem();
  const navigate = useNavigate();

  const handleAddItem = () => {
    if (currentItem.trim()) {
      setInitialItems([...initialItems, currentItem.trim()]);
      setCurrentItem('');
    }
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...initialItems];
    newItems.splice(index, 1);
    setInitialItems(newItems);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddItem();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      // Create the list first
      const newList = await createList.mutateAsync({ title });

      // Then add initial items if there are any
      if (initialItems.length > 0) {
        for (const item of initialItems) {
          await addItem.mutateAsync({
            listId: newList.id,
            data: { content: item }
          });
        }
      }

      navigate(`/lists/${newList.id}`);
    } catch (error) {
      console.error('Failed to create list:', error);
    }
  };

  return (
    <AppLayout>
      <div className="add-list-page">
        <div className="page-header">
          <h1>Create New List</h1>
        </div>

        <form className="list-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">List Name</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="e.g., Grocery List, Hardware Store"
            />
          </div>

          <div className="form-group">
            <label>Add Initial Items (Optional)</label>
            <div className="add-initial-items">
              <div className="input-with-button">
                <input
                  type="text"
                  value={currentItem}
                  onChange={(e) => setCurrentItem(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Add an item"
                />
                <button
                  type="button"
                  onClick={handleAddItem}
                  disabled={!currentItem.trim()}
                >
                  Add
                </button>
              </div>

              {initialItems.length > 0 && (
                <ul className="initial-items-list">
                  {initialItems.map((item, index) => (
                    <li key={index} className="initial-item">
                      <span>{item}</span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="remove-item"
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => navigate('/lists')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={createList.isPending || !title.trim()}
            >
              {createList.isPending ? 'Creating...' : 'Create List'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}

export default AddList;