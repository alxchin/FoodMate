import { db, auth } from "./firebase"; 
import { doc, setDoc, collection } from "firebase/firestore";

// Function to send a friend request
const sendFriendRequest = async (receiverId) => {
  const user = auth.currentUser;
  if (!user) return;

  const requestRef = doc(collection(db, "friend_requests"));
  await setDoc(requestRef, {
    requesterId: user.uid,
    receiverId: receiverId,
    status: "pending", // Initial status is "pending"
  });

  console.log("Friend request sent!");
};
