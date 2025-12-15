// src/App.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage.jsx";
import ChatPage from "./pages/ChatPage.jsx";
import "./App.css";

function ProtectedRoute({ children }) {
  const token = localStorage.getItem("token");
  if (!token) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
}

export default App;
