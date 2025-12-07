import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { useEffect } from "react";

import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";

// Pages
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Profile from "./pages/Profile";
import WatchParties from "./pages/WatchParties";
import CreateParty from "./pages/CreateParty";
import JoinParty from "./pages/JoinParty";
import PartyRoom from "./pages/PartyRoom";
import FeedbackPage from "./pages/Feedback";


export default function App() {

  useEffect(() => {
    // Wake the backend automatically
    const wakeUp = async () => {
      try {
        await fetch(`${import.meta.env.VITE_API_URL}/health`);
      } catch (err) {
        console.log("Wake-up failed (expected if backend still sleeping)");
      }
    };

    wakeUp();
  }, []);

  return (
    <BrowserRouter>
      {/* Global Navbar */}
      <Navbar />

      {/* Toast Notifications */}
      <Toaster
        position="top-center"
        toastOptions={{
          style: {
            background: "rgba(20, 20, 30, 0.8)",
            border: "1px solid rgba(255,255,255,0.2)",
            backdropFilter: "blur(10px)",
            color: "#fff",
            borderRadius: "12px",
          },
        }}
      />

      {/* Routes */}
      <Routes>
        <Route path="/" element={<Home />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        <Route
          path="/feedback"
          element={
            <ProtectedRoute>
              <FeedbackPage />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parties"
          element={
            <ProtectedRoute>
              <WatchParties />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parties/create"
          element={
            <ProtectedRoute>
              <CreateParty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/parties/join"
          element={
            <ProtectedRoute>
              <JoinParty />
            </ProtectedRoute>
          }
        />

        <Route
          path="/party/:id"
          element={
            <ProtectedRoute>
              <PartyRoom />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}
