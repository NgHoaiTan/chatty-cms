import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Posts from './pages/Posts';
import Analytics from './pages/Analytics';
import Settings from './pages/Settings';

function App() {
  // Helper function to check authentication
  const checkAuth = () => {
    try {
      return !!localStorage.getItem('adminToken');
    } catch (e) {
      return false;
    }
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route 
          path="/login" 
          element={checkAuth() ? <Navigate to="/dashboard" replace /> : <Login />} 
        />
        <Route 
          path="/dashboard" 
          element={checkAuth() ? <Dashboard /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/users" 
          element={checkAuth() ? <Users /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/posts" 
          element={checkAuth() ? <Posts /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/analytics" 
          element={checkAuth() ? <Analytics /> : <Navigate to="/login" replace />} 
        />
        <Route 
          path="/settings" 
          element={checkAuth() ? <Settings /> : <Navigate to="/login" replace />} 
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
