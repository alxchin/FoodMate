import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import FoodSwipe from "./components/FoodSwipe";
import Login from "./components/Login";
import FriendsList from "./components/FriendsList";
import PresenceHandler from './components/PresenceHandler';
import Logout from "./components/Logout";
import ProtectedRoute from "./components/ProtectedRoute"; 
import Eats from "./components/Eats";


const App = () => {
  return (
    <Router>
      <PresenceHandler />
      <Routes>
        {/* Public route */}
        <Route path="/" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/swipe"
          element={
            <ProtectedRoute>
              <FoodSwipe />
            </ProtectedRoute>
          }
        />
        <Route
          path="/friends"
          element={
            <ProtectedRoute>
              <FriendsList />
            </ProtectedRoute>
          }
        />
        <Route
          path="/logout"
          element={
            <ProtectedRoute>
              <Logout />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eats"
          element={
            <ProtectedRoute>
              <Eats />
            </ProtectedRoute>
          }
        />
        <Route
          path="/eats/:sessionId"
          element={
            <ProtectedRoute>
              <FoodSwipe />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
