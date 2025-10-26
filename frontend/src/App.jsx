import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';

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
      </Routes>
    </BrowserRouter>
  );
}

export default App;
