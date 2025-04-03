import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import FriendRequests from "./components/FriendRequests";
import FoodSwipe from "./components/FoodSwipe";
import Login from "./components/Login";
import FriendsList from "./components/FriendsList";  // Import the FriendsList component

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/friend-requests" element={<FriendRequests />} />
        <Route path="/swipe" element={<FoodSwipe />} />
        <Route path="/friends" element={<FriendsList />} />  {/* Add the FriendsList route */}
      </Routes>
    </Router>
  );
};

export default App;
