import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateChore } from '../hooks/useChores';
import AppLayout from '../components/layout/AppLayout';

const AddChore = ()=> {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState<'daily' | 'weekly' | 'monthly'>('daily');
  const createChore = useCreateChore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createChore.mutateAsync({
        title,
        description,
        frequency
      });
      navigate('/chores');
    } catch (error) {
      console.error('Failed to create chore:', error);
    }
  };

  return (
    <AppLayout>
      <div className="add-chore-page">
        <div className="page-header">
          <h1>Add New Chore</h1>
        </div>

        <form className="chore-form" onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What needs to be done?"
            />
          </div>

          <div className="form-group">
            <label htmlFor="description">Description (Optional)</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add details about this task"
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
              onClick={() => navigate('/chores')}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="submit-button"
              disabled={createChore.isPending}
            >
              {createChore.isPending ? 'Creating...' : 'Create Chore'}
            </button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
export default AddChore