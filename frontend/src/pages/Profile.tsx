import { useAuth } from '../context/AuthContext';
import { useLogout } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout';

const Profile =() => {
  const { user } = useAuth();
  const logout = useLogout();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout.mutateAsync();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  if (!user) {
    return (
      <AppLayout>
        <div className="profile-page">
          <h1>Profile</h1>
          <p>Loading profile...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="profile-page">
        <div className="page-header">
          <h1>Profile</h1>
        </div>

        <div className="profile-card">
          <div className="avatar">
            {user.name.charAt(0).toUpperCase()}
          </div>

          <div className="profile-details">
            <h2 className="user-name">{user.name}</h2>
            <p className="user-email">{user.email}</p>
            <p className="user-since">Member since {new Date(user.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <div className="profile-actions">
          <button
            className="logout-button"
            onClick={handleLogout}
            disabled={logout.isPending}
          >
            {logout.isPending ? 'Logging out...' : 'Logout'}
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
export default Profile