import { Navigate, Route, Routes } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Devices from "./pages/Devices.jsx";
import DeviceDetail from "./pages/DeviceDetail.jsx";
import Alerts from "./pages/Alerts.jsx";
import Placeholder from "./pages/Placeholder.jsx";

function Protected({ children }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="splash">Yükleniyor…</div>;
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route element={<Protected><Layout /></Protected>}>
        <Route index element={<Dashboard />} />
        <Route path="devices" element={<Devices />} />
        <Route path="devices/:id" element={<DeviceDetail />} />
        <Route path="alerts" element={<Alerts />} />
        <Route path="topology" element={<Placeholder title="Topoloji" />} />
        <Route path="reports" element={<Placeholder title="Raporlar" />} />
        <Route path="automation" element={<Placeholder title="Otomasyon" />} />
        <Route path="settings" element={<Placeholder title="Ayarlar" />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
