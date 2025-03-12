import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth, AuthProvider } from './context/AuthContext';

// Pages
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Chores from './pages/Chores';
import AddChore from './pages/AddChore';
import ChoreDetails from './pages/ChoreDetails';
import Lists from './pages/Lists';
import AddList from './pages/AddList';
import ListDetails from './pages/ListDetails';
import Profile from './pages/Profile';
import { JSX } from 'react';

// Private route component
function RequireAuth({ children }: { children: JSX.Element }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  if (!isAuthenticated) {
    // Redirect to login page if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Auth routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Protected routes */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />

          {/* Chore routes */}
          <Route
            path="/chores"
            element={
              <RequireAuth>
                <Chores />
              </RequireAuth>
            }
          />
          <Route
            path="/chores/new"
            element={
              <RequireAuth>
                <AddChore />
              </RequireAuth>
            }
          />
          <Route
            path="/chores/:id"
            element={
              <RequireAuth>
                <ChoreDetails />
              </RequireAuth>
            }
          />

          {/* List routes */}
          <Route
            path="/lists"
            element={
              <RequireAuth>
                <Lists />
              </RequireAuth>
            }
          />
          <Route
            path="/lists/new"
            element={
              <RequireAuth>
                <AddList />
              </RequireAuth>
            }
          />
          <Route
            path="/lists/:id"
            element={
              <RequireAuth>
                <ListDetails />
              </RequireAuth>
            }
          />

          {/* Profile route */}
          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          {/* Redirect root to dashboard if authenticated, otherwise to login */}
          <Route
            path="/"
            element={<Navigate to="/dashboard" replace />}
          />

          {/* Catch-all route for 404 */}
          <Route
            path="*"
            element={<Navigate to="/dashboard" replace />}
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;