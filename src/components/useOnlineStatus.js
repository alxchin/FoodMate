import { useEffect } from "react";
import { getDatabase, ref, set, onDisconnect } from "firebase/database";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";  // Ensure this is imported from your Firebase config

const useOnlineStatus = () => {
  const [user] = useAuthState(auth); // Firebase authentication hook

  useEffect(() => {
    if (user) {
      const db = getDatabase();
      const userStatusDatabaseRef = ref(db, 'onlineUsers/' + user.uid); // Use UID as the reference key
      const userStatus = {
        online: true,
        last_changed: new Date().toISOString(),
      };

      // Set user's status to online in Realtime Database
      set(userStatusDatabaseRef, userStatus);

      // Handle disconnection: Set status to false when the user disconnects
      onDisconnect(userStatusDatabaseRef).set({
        online: false,
        last_changed: new Date().toISOString(),
      });

      // Clean up on component unmount
      return () => {
        set(userStatusDatabaseRef, {
          online: false,
          last_changed: new Date().toISOString(),
        });
      };
    }
  }, [user]); // Run this whenever the `user` state changes
};

export default useOnlineStatus;
