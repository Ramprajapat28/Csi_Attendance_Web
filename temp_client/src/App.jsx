import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';

import Login from './pages/Login.jsx';
import RegisterOrg from './pages/RegisterOrg.jsx';
import RegisterUser from './pages/RegisterUser.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Scan from './pages/Scan.jsx';
import Records from './pages/Records.jsx';
import Profile from './pages/Profile.jsx';
import NotFound from './pages/NotFound.jsx';

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="mx-auto max-w-5xl p-4 md:p-8">
        <Routes>
          {/* Public */}
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register-org" element={<RegisterOrg />} />
          <Route path="/register-user" element={<RegisterUser />} />

          {/* Protected */}
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/scan" element={<Scan />} />
            <Route path="/records" element={<Records />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
    </div>
  );
}
