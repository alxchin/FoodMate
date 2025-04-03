import React, { useState, useEffect } from "react";
import { db } from "../firebase";  // Import the firebase db
import { collection, query, where, getDocs, updateDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const FriendRequests = () => {
  const [requests, setRequests] = useState([]);
  const [user] = useAuthState(auth);  // Get the current user

  useEffect(() => {
    if (!user) return;

    const fetchRequests = async () => {
      const q = query(
        collection(db, "friend_requests"),
        where("receiverId", "==", user.uid),
        where("status", "==", "pending")
      );

      const querySnapshot = await getDocs(q);
      const requestsData = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(requestsData);
    };

    fetchRequests();
  }, [user]);

  const handleAccept = async (requestId, requesterId) => {
    try {
      // Update friend request status to "accepted"
      const requestRef = doc(db, "friend_requests", requestId);
      await updateDoc(requestRef, {
        status: "accepted",
      });

      // Add both users to each other's friends list
      const userRef = doc(db, "users", user.uid);
      const requesterRef = doc(db, "users", requesterId);

      // Fetch current user data and requester data using getDoc (not getDocs)
      const userSnap = await getDoc(userRef);  // Correct method for single document
      const requesterSnap = await getDoc(requesterRef);  // Correct method for single document

      if (userSnap.exists() && requesterSnap.exists()) {
        const userData = userSnap.data();
        const requesterData = requesterSnap.data();

        // Add the requester to the current user's friends list
        const updatedUserFriends = [...(userData.friends || []), requesterId];
        await updateDoc(userRef, {
          friends: updatedUserFriends,
        });

        // Add the current user to the requester's friends list
        const updatedRequesterFriends = [...(requesterData.friends || []), user.uid];
        await updateDoc(requesterRef, {
          friends: updatedRequesterFriends,
        });

        console.log("Friend request accepted!");

        // Optionally, update the UI after the request is accepted
        setRequests((prevRequests) =>
          prevRequests.filter((request) => request.id !== requestId)
        );  // Remove the accepted request from the state
      }
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  const handleReject = async (requestId) => {
    try {
      // Update friend request status to "rejected"
      const requestRef = doc(db, "friend_requests", requestId);
      await updateDoc(requestRef, {
        status: "rejected",
      });

      console.log("Friend request rejected!");
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  return (
    <div>
      <h2>Friend Requests</h2>
      {requests.length > 0 ? (
        <ul>
          {requests.map((request) => (
            <li key={request.id}>
              <p>{request.senderName} wants to be your friend</p>
              <button onClick={() => handleAccept(request.id, request.senderId)}>
                Accept
              </button>
              <button onClick={() => handleReject(request.id)}>
                Reject
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No pending friend requests.</p>
      )}
    </div>
  );
};

export default FriendRequests;
