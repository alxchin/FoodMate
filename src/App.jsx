import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import FoodSwipe from "./components/FoodSwipe";
import Login from "./components/Login";
import FriendsList from "./components/FriendsList";  // Import the FriendsList component
import PresenceHandler from './components/PresenceHandler';  // Import the PresenceHandler component
import Logout from "./components/Logout";  // Import Logout component

const App = () => {
  return (
    <Router>
      <PresenceHandler /> 
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/swipe" element={<FoodSwipe />} />
        <Route path="/friends" element={<FriendsList />} />
        <Route path="/logout" element={<Logout />} />  {/* Add the Logout route */}
      </Routes>
    </Router>
  );
};

export default App;
