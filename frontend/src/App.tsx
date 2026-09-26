import { BrowserRouter, Routes, Route } from "react-router-dom";

import MainLayout from "./components/layout/MainLayout";
import ProtectedRoute from "./components/auth/ProtectedRoute";

import Dashboard from "./pages/Dashboard";
import Upload from "./pages/Upload";
import History from "./pages/History";
import Profile from "./pages/Profile";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ScanDetails from "./pages/ScanDetails";
import AdminSecurity from "./pages/AdminSecurity";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          element={
            <ProtectedRoute>
              <MainLayout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<Dashboard />} />
          <Route path="/upload" element={<Upload />} />
          <Route path="/history" element={<History />} />
          <Route path="/profile" element={<Profile />} />

          <Route
            path="/scan/:scanId"
            element={<ScanDetails />}
          />

          <Route
            path="/admin/security"
            element={<AdminSecurity />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}