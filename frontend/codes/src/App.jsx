import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Registration from './pages/Registration';
import Feed from './pages/Feed';

function PrivateRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
  const token = localStorage.getItem('token');
  return token ? <Navigate to="/feed" replace /> : children;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
        <Route path="/register" element={<GuestRoute><Registration /></GuestRoute>} />
        <Route path="/feed" element={<PrivateRoute><Feed /></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
