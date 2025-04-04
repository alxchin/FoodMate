import React, { useState } from "react";
import { auth, db } from "../firebase"; // Ensure correct path
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getDatabase, ref, set } from "firebase/database"; // Import for Realtime Database
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [loading, setLoading] = useState(false); // For loading state during login
  const navigate = useNavigate();

  // Function to set online status in Realtime Database
  const setOnlineStatus = (userId, status) => {
    const db = getDatabase();
    const userStatusRef = ref(db, "onlineUsers/" + userId); // Path in Realtime Database
    set(userStatusRef, {
      online: status,
      lastOnline: Date.now(), // Optional: You can store the last online time
    });
  };

  const handleLogin = async () => {
    setLoading(true); // Set loading state to true when login starts
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const userRef = doc(db, "users", user.uid); // Set UID as doc ID
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Save user if they don't exist
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || "Anonymous",
            email: user.email,
            profilePicture: user.photoURL || "",
          });
        }

        // Set the user's online status to true
        setOnlineStatus(user.uid, true);

        // Navigate to the home page or wherever you want
        navigate("/friends");
      }
    } catch (error) {
      console.error("Login error:", error);
    } finally {
      setLoading(false); // Set loading to false after login attempt
    }
  };

  return (
    <div>
      <h1>Welcome to FoodMate</h1>
      <button onClick={handleLogin} disabled={loading}>
        {loading ? "Logging in..." : "Sign in with Google"}
      </button>
    </div>
  );
};

export default Login;
