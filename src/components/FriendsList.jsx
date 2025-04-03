// FriendList.jsx
import React, { useState, useEffect } from "react";
import { db } from "../firebase";  // Import the firebase db
import { collection, query, where, getDocs, addDoc, updateDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebase";

const FriendList = () => {
  const [user] = useAuthState(auth);  // Get the current user
  const [emailToAdd, setEmailToAdd] = useState("");  // Store email input for adding friends
  const [incomingRequests, setIncomingRequests] = useState([]);  // Store incoming friend requests
  const [friends, setFriends] = useState([]);  // Store current friends
  const [friendNames, setFriendNames] = useState([]); // Store the names of the friends

  // Fetch incoming friend requests and current friends when the component loads
  useEffect(() => {
    if (!user) return;

    // Fetch incoming friend requests
    const fetchIncomingRequests = async () => {
      try {
        const requestsQuery = query(
          collection(db, "friend_requests"),
          where("receiverEmail", "==", user.email),
          where("status", "==", "pending")
        );
        const requestsSnapshot = await getDocs(requestsQuery);
        const requestsData = requestsSnapshot.docs.map((doc) => ({
          id: doc.id,  // Document ID
          ...doc.data(),
        }));
        setIncomingRequests(requestsData);
      } catch (error) {
        console.error("Error fetching friend requests:", error);
      }
    };

    // Fetch current friends
    const fetchFriends = async () => {
      try {
        const friendsQuery = query(
          collection(db, "friends"),
          where("user1Email", "==", user.email),
          where("status", "==", "accepted")
        );
        const friendsSnapshot = await getDocs(friendsQuery);
        const friendsData = friendsSnapshot.docs.map((doc) => doc.data());
        setFriends(friendsData);
      } catch (error) {
        console.error("Error fetching friends:", error);
      }
    };

    // Fetch names for each friend email
    const fetchFriendNames = async () => {
      try {
        const allFriendsEmails = [
          ...friends.map(friend => friend.user1Email === user.email ? friend.user2Email : friend.user1Email)
        ];
        const friendNames = await Promise.all(
          allFriendsEmails.map(async (email) => {
            const userQuery = query(collection(db, "users"), where("email", "==", email));
            const userSnapshot = await getDocs(userQuery);
            if (!userSnapshot.empty) {
              return userSnapshot.docs[0].data().name;
            }
            return null; // If no user is found
          })
        );
        setFriendNames(friendNames);
      } catch (error) {
        console.error("Error fetching friend names:", error);
      }
    };

    fetchIncomingRequests();
    fetchFriends();
    fetchFriendNames();
  }, [user, friends]);

  // Handle adding a new friend by email
  const handleAddFriend = async () => {
    if (!emailToAdd) return;

    try {
      // Find the user by email
      const userQuery = query(collection(db, "users"), where("email", "==", emailToAdd));
      const userSnapshot = await getDocs(userQuery);

      if (userSnapshot.empty) {
        alert("User not found.");
        return;
      }

      const receiver = userSnapshot.docs[0].data(); // Get the receiver's data

      // Create a friend request
      await addDoc(collection(db, "friend_requests"), {
        senderName: user.displayName,  // Use the sender's name (current user)
        senderEmail: user.email,       // Use the sender's email
        receiverName: receiver.name,   // Use the receiver's name
        receiverEmail: receiver.email, // Use the receiver's email
        status: "pending",
      });

      alert("Friend request sent!");
      setEmailToAdd("");  // Clear email input
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };

  // Handle accepting a friend request
  const handleAcceptRequest = async (requestId, senderEmail, receiverEmail) => {
    try {
      if (!requestId || !senderEmail || !receiverEmail) {
        console.error("Invalid requestId or senderEmail or receiverEmail", { requestId, senderEmail, receiverEmail });
        return;
      }

      // Update the friend request status to 'accepted'
      const requestRef = doc(db, "friend_requests", requestId);
      await updateDoc(requestRef, { status: "accepted" });

      // Add both users to each other's friends list
      await addDoc(collection(db, "friends"), {
        user1Email: senderEmail,
        user2Email: receiverEmail,
        status: "accepted",
        timestamp: new Date(),
      });
      await addDoc(collection(db, "friends"), {
        user1Email: receiverEmail,
        user2Email: senderEmail,
        status: "accepted",
        timestamp: new Date(),
      });

      alert("Friend request accepted!");
      // Re-fetch friends to update the list
      fetchFriends();  // This was missing before
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  // Handle rejecting a friend request
  const handleRejectRequest = async (requestId) => {
    try {
      // Update the friend request status to 'rejected'
      const requestRef = doc(db, "friend_requests", requestId);
      await updateDoc(requestRef, { status: "rejected" });

      alert("Friend request rejected!");
      // Re-fetch requests to update the list
      fetchIncomingRequests();
    } catch (error) {
      console.error("Error rejecting friend request:", error);
    }
  };

  return (
    <div>
      <h2>Friend List</h2>

      {/* Display current friends */}
      <h3>Your Friends:</h3>
      {friends.length > 0 ? (
        <ul>
          {friends.map((friend, index) => {
            // Get the friend's email (either user1Email or user2Email)
            const friendName = friendNames[index] || "Unknown Name";  // Get the corresponding name for the friend
            const friendEmail = friend.user1Email === user.email ? friend.user2Email : friend.user1Email;
           

            return (
              <li key={index}>
                {/* Display friend's name and email */}
                {friendName} ({friendEmail})
              </li>
            );
          })}
        </ul>
      ) : (
        <p>You have no friends yet.</p>
      )}

      {/* Display incoming friend requests */}
      <h3>Incoming Friend Requests:</h3>
      {incomingRequests.length > 0 ? (
        <ul>
          {incomingRequests.map((request) => (
            <li key={request.id}>
              {request.senderName} ({request.senderEmail}) wants to be your friend.
              <button onClick={() => handleAcceptRequest(request.id, request.senderEmail, request.receiverEmail)}>
                Accept
              </button>
              <button onClick={() => handleRejectRequest(request.id)}>
                Reject
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p>No incoming requests.</p>
      )}

      {/* Add Friend Section */}
      <h3>Add a Friend by Email:</h3>
      <input
        type="email"
        value={emailToAdd}
        onChange={(e) => setEmailToAdd(e.target.value)}
        placeholder="Enter friend's email"
      />
      <button onClick={handleAddFriend}>Send Friend Request</button>
    </div>
  );
};

export default FriendList;
