import { useEffect } from "react";
import { getDatabase, ref, onDisconnect, set, serverTimestamp } from "firebase/database";
import { getAuth } from "firebase/auth";

const PresenceHandler = () => {
  useEffect(() => {
    const auth = getAuth();
    const user = auth.currentUser;

    if (!user) return; // Not logged in

    const db = getDatabase();
    const userStatusRef = ref(db, `/onlineUsers/${user.uid}`);

    const setOnline = async () => {
      try {
        // Mark user as online
        await set(userStatusRef, {
          online: true,
          lastSeen: serverTimestamp(),
          displayName: user.displayName || "",
          email: user.email || "",
          uid: user.uid
        });

        // Set what happens when they disconnect
        onDisconnect(userStatusRef).set({
          online: false,
          lastSeen: serverTimestamp(),
          displayName: user.displayName || "",
          email: user.email || "",
          uid: user.uid
        });
      } catch (error) {
        console.error("Error setting online status: ", error);
      }
    };

    setOnline();
  }, []);

  return null;
};

export default PresenceHandler;
