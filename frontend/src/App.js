import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "./components/ui/sonner";
import Layout from "./components/Layout";
import Configuration from "./pages/Configuration";
import TeamRegistration from "./pages/TeamRegistration";
import PlayerAuction from "./pages/PlayerAuction";
import Dashboard from "./pages/Dashboard";
import "@/App.css";

function App() {
  return (
    <div className="app-container">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Navigate to="/config" replace />} />
            <Route path="config" element={<Configuration />} />
            <Route path="teams" element={<TeamRegistration />} />
            <Route path="auction" element={<PlayerAuction />} />
            <Route path="dashboard" element={<Dashboard />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster position="top-right" richColors />
    </div>
  );
}

export default App;
