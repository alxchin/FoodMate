import React from "react";
import { auth } from "../firebase"; // Ensure correct path
import { signOut } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { setOfflineStatus } from "../firebase";  // Import setOfflineStatus

const Logout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      const user = auth.currentUser;
      if (user) {
        // Optionally, set the user's online status to false
        setOfflineStatus(user.uid);  // Make sure you have setOfflineStatus function in firebase.js
        await signOut(auth);  // Firebase logout
        console.log("User signed out");

        // Redirect to the login page after logout
        navigate("/");
      }
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <div>
      <h2>You have successfully logged out.</h2>
      <button onClick={handleLogout}>Log Out</button>
    </div>
  );
};

export default Logout;
