import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection, getDocs, Timestamp, addDoc, query, where, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { getDatabase, ref, set } from "firebase/database"; 

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyBtHf8WfvkxxYLa6knExd1A6X--fXSQOKY",
  authDomain: "foodmateca.firebaseapp.com",
  projectId: "foodmateca",
  storageBucket: "foodmateca.firebasestorage.app",
  messagingSenderId: "352875632069",
  appId: "1:352875632069:web:85f89065c9b38a4e9b67ac"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app)
const rtdb = getDatabase(app);

const getFoodItems = async () => {
    const foodItemsCollection = collection(db, 'foodItems');
    const foodItemsSnapshot = await getDocs(foodItemsCollection);
    const foodItemsList = foodItemsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));
    return foodItemsList;
  };


// Function to add a swipe to Firestore
const addSwipe = async (userId, foodId, swipe) => {
    try {
      await addDoc(collection(db, "user_swipes"), {
        userId: userId,      // Type: string (user's ID)
        foodId: foodId,      // Type: string (food item's ID)
        swipe: swipe,        // Type: string ("yes" or "no")
        timestamp: serverTimestamp(), // Type: timestamp
      });
      console.log("Swipe added successfully!");
    } catch (e) {
      console.error("Error adding swipe: ", e);
    }
  };

  // Function to send a friend request
// Function to send a friend request
export const addFriend = async (friendEmail) => {
  try {
    const user = auth.currentUser;
    if (!user) throw new Error("User not logged in");
    if (friendEmail === user.email) throw new Error("You can't add yourself!");

    // Find friend by email in "users" collection
    const friendQuery = query(collection(db, "users"), where("email", "==", friendEmail));
    const friendSnapshot = await getDocs(friendQuery);

    if (friendSnapshot.empty) {
      throw new Error("User not found");
    }

    const friendDoc = friendSnapshot.docs[0];
    const friendId = friendDoc.id;

    // Check if friendship already exists
    const existingFriendQuery = query(
      collection(db, "friends"),
      where("user1", "==", user.uid),
      where("user2", "==", friendId)
    );
    const existingFriendSnapshot = await getDocs(existingFriendQuery);

    if (!existingFriendSnapshot.empty) {
      throw new Error("Friend request already sent or user is already a friend.");
    }

    // Add friend request to Firestore
    await addDoc(collection(db, "friends"), {
      user1: user.uid,
      user2: friendId,
      status: "pending",
      timestamp: serverTimestamp()
    });

    console.log("Friend request sent!");
  } catch (error) {
    console.error("Error adding friend:", error.message);
  }
};
  
  // Function to get the user's friends list
  export const getFriends = async () => {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("User not logged in");
  
      const friendsQuery = query(
        collection(db, "friends"),
        where("status", "==", "accepted"),
        where("user1", "==", user.uid)
      );
  
      const friendsSnapshot = await getDocs(friendsQuery);
      const friendsList = friendsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
  
      return friendsList;
    } catch (error) {
      console.error("Error fetching friends:", error);
      return [];
    }
  };
  
  // Function to remove a friend
  export const removeFriend = async (friendId) => {
    try {
      const friendRef = doc(db, "friends", friendId);
      await deleteDoc(friendRef);
      console.log("Friend removed successfully");
    } catch (error) {
      console.error("Error removing friend:", error);
    }
  };


  export const setOnlineStatus = (userId) => {
    const db = getDatabase();
    const userRef = ref(db, "onlineUsers/" + userId);
    set(userRef, {
      online: true,
    });
  };
  
  // Function to set user as offline
  export const setOfflineStatus = (userId) => {
    const db = getDatabase();
    const userRef = ref(db, "onlineUsers/" + userId);
    set(userRef, {
      online: false,
    });
  };

  export const sendEatInvite = async (senderUid, receiverUid) => {
    try {
      // Create a new invite in the database, likely a collection named "invites"
      await addDoc(collection(db, "invites"), {
        senderUid,
        receiverUid,
        status: "pending", // Set the status to pending for now
        timestamp: new Date(),
      });
      console.log("Eat invite sent successfully");
    } catch (error) {
      console.error("Error sending invite:", error);
    }
  };
  
  export const acceptInvite = async (sessionId) => {
    await updateDoc(doc(db, 'eatSessions', sessionId), {
      status: 'accepted'
    });
  };
  
  export const declineInvite = async (sessionId) => {
    await updateDoc(doc(db, 'eatSessions', sessionId), {
      status: 'declined'
    });
  };

  // Exporting Firebase config, auth, db, and addSwipe function
  export { auth, db, rtdb, addSwipe, getFoodItems };