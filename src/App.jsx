import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import RouteList from './pages/user/RouteList';
import RouteDetail from './pages/user/RouteDetail';
import NavigatePage from './pages/user/Navigate';
import AdminLogin from './pages/admin/AdminLogin';
import AdminRoutes from './pages/admin/AdminRoutes';
import EditRoute from './pages/admin/EditRoute';
import EditWaypoints from './pages/admin/EditWaypoints';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Gebruiker */}
        <Route path="/" element={<Navigate to="/routes" replace />} />
        <Route path="/routes" element={<RouteList />} />
        <Route path="/route/:id" element={<RouteDetail />} />
        <Route path="/navigate/:id" element={<NavigatePage />} />

        {/* Admin */}
        <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin/routes"
          element={
            <ProtectedRoute>
              <AdminRoutes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/route/nieuw"
          element={
            <ProtectedRoute>
              <EditRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/route/:id"
          element={
            <ProtectedRoute>
              <EditRoute />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/waypoints/:id"
          element={
            <ProtectedRoute>
              <EditWaypoints />
            </ProtectedRoute>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/routes" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
