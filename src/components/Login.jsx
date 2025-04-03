import React from "react";
import { auth, db } from "../firebase";  // Ensure correct path
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (user) {
        const userRef = doc(db, "users", user.uid); // Firestore: Set UID as doc ID
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          // Save user if they don't exist in Firestore
          await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName || "Anonymous",
            email: user.email,
            profilePicture: user.photoURL || "",
          });
        }

        navigate("/friends"); // Redirect to friends list page after login
      }
    } catch (error) {
      console.error("Login error:", error);
    }
  };

  return (
    <div>
      <h1>Welcome to FoodMate</h1>
      <button onClick={handleLogin}>Sign in with Google</button>
    </div>
  );
};

export default Login;
