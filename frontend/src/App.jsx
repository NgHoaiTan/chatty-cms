import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import EditUser from './pages/EditUser';
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
          path="/users/:id/edit" 
          element={checkAuth() ? <EditUser /> : <Navigate to="/login" replace />} 
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
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </BrowserRouter>
  );
}

export default App;
