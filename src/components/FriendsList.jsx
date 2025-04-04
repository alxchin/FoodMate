import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc, updateDoc, doc, getDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { getDatabase, ref, get } from "firebase/database";
import { getAuth } from "firebase/auth";  // Separate import for auth
import useOnlineStatus from "./useOnlineStatus";



const FriendList = () => {
  const [user] = useAuthState(auth);
  const [emailToAdd, setEmailToAdd] = useState("");
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [friendNames, setFriendNames] = useState([]);
  const [onlineStatus, setOnlineStatus] = useState({});
  useOnlineStatus(); 

  // === FETCH INCOMING REQUESTS ===
  const fetchIncomingRequests = async () => {
    try {
      const requestsQuery = query(
        collection(db, "friend_requests"),
        where("receiverEmail", "==", user.email),
        where("status", "==", "pending")
      );
      const snapshot = await getDocs(requestsQuery);
      const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setIncomingRequests(data);
    } catch (err) {
      console.error("Error fetching requests:", err);
    }
  };

  // === FETCH FRIENDS ===
  const fetchFriends = async () => {
    try {
      const friendsQuery = query(
        collection(db, "friends"),
        where("user1Email", "==", user.email),
        where("status", "==", "accepted")
      );
      const snapshot = await getDocs(friendsQuery);
      const data = snapshot.docs.map((doc) => doc.data());
      console.log("Fetched friends:", data);
      setFriends(data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };
  

  // === FETCH FRIEND NAMES ===
  const fetchFriendNames = async () => {
    try {
      const emails = friends.map(f => f.user1Email === user.email ? f.user2Email : f.user1Email);
      const names = await Promise.all(
        emails.map(async (email) => {
          const q = query(collection(db, "users"), where("email", "==", email));
          const snap = await getDocs(q);
          return !snap.empty ? snap.docs[0].data().name : "Unknown";
        })
      );
      setFriendNames(names);
    } catch (err) {
      console.error("Error fetching friend names:", err);
    }
  };

  // === FETCH ONLINE STATUS ===
  const fetchOnlineStatus = async () => {
    if (!friends || friends.length === 0) {
      console.log("No friends to check online status for.");
      return;
    }
  
    const db = getDatabase(); // Ensure you're using the correct db instance for Realtime Database
    const onlineUsersRef = ref(db, "onlineUsers");
  
    try {
      const snapshot = await get(onlineUsersRef);
      if (snapshot.exists()) {
        const onlineUsers = snapshot.val();
        const status = {};
  
        // Check each friend's online status by their UID
        friends.forEach((f) => {
          const email = f.user1Email === user.email ? f.user2Email : f.user1Email;
          const userId = f.user1Email === user.email ? f.user2Uid : f.user1Uid; // Correct UID logic
          console.log(userId)
          const friendStatus = onlineUsers[userId]; // Fetch the online status using UID
          status[email] = friendStatus ? friendStatus.online : false; // Default to false if no data
        });
  
        console.log(status);
        setOnlineStatus(status); // Update the online status state
      } else {
        console.log("No online users data available");
      }
    } catch (err) {
      console.error("Error fetching online status:", err);
    }
  };
  useEffect(() => {
    if (user) {
      fetchIncomingRequests();
      fetchFriends(); // Ensure friends are fetched first
    }
  }, [user]);
  
  useEffect(() => {
    if (friends.length > 0) {
      fetchFriendNames();
      fetchOnlineStatus(); // Call after friends data is available
    }
  }, [friends]);

  // === ADD FRIEND ===
  const handleAddFriend = async () => {
    if (!emailToAdd) return;
    try {
      const q = query(collection(db, "users"), where("email", "==", emailToAdd));
      const snap = await getDocs(q);
      if (snap.empty) return alert("User not found.");
      const receiver = snap.docs[0].data();

      await addDoc(collection(db, "friend_requests"), {
        senderName: user.displayName,
        senderEmail: user.email,
        receiverName: receiver.name,
        receiverEmail: receiver.email,
        status: "pending",
      });

      alert("Friend request sent!");
      setEmailToAdd("");
    } catch (err) {
      console.error("Add friend error:", err);
    }
  };

  // === ACCEPT REQUEST ===
  const handleAcceptRequest = async (id, senderEmail, receiverEmail) => {
    try {
      // Search for sender and receiver by email
      const senderQuery = query(collection(db, "users"), where("email", "==", senderEmail));
      const receiverQuery = query(collection(db, "users"), where("email", "==", receiverEmail));
  
      const senderSnap = await getDocs(senderQuery);
      const receiverSnap = await getDocs(receiverQuery);
  
      if (!senderSnap.empty && !receiverSnap.empty) {
        const senderUid = senderSnap.docs[0].data().uid;
        const receiverUid = receiverSnap.docs[0].data().uid;
  
        if (!senderUid || !receiverUid) {
          return alert("One or both users have no UID.");
        }
  
        // Update the friend request to accepted
        await updateDoc(doc(db, "friend_requests", id), { status: "accepted" });
  
        // Add both friends to the `friends` collection, including their UIDs
        await addDoc(collection(db, "friends"), {
          user1Email: senderEmail,
          user2Email: receiverEmail,
          user1Uid: senderUid, // Save the UID of the sender
          user2Uid: receiverUid, // Save the UID of the receiver
          status: "accepted",
          timestamp: new Date(),
        });
  
        await addDoc(collection(db, "friends"), {
          user1Email: receiverEmail,
          user2Email: senderEmail,
          user1Uid: receiverUid, // Save the UID of the receiver
          user2Uid: senderUid, // Save the UID of the sender
          status: "accepted",
          timestamp: new Date(),
        });
  
        alert("Friend request accepted!");
        fetchFriends();
        fetchIncomingRequests();
      } else {
        alert("One or both users not found.");
      }
    } catch (err) {
      console.error("Accept error:", err);
    }
  };

  // === REJECT REQUEST ===
  const handleRejectRequest = async (id) => {
    try {
      await updateDoc(doc(db, "friend_requests", id), { status: "rejected" });
      alert("Friend request rejected.");
      fetchIncomingRequests();
    } catch (err) {
      console.error("Reject error:", err);
    }
  };

  return (
    <div>
      <h2>Friend List</h2>

      {/* Add Friend Section */}
      <h3>Add a Friend by Email:</h3>
      <input
        type="email"
        value={emailToAdd}
        onChange={(e) => setEmailToAdd(e.target.value)}
        placeholder="Enter friend's email"
      />
      <button onClick={handleAddFriend}>Send Friend Request</button>

      {/* Friend List */}
      <h3>Your Friends:</h3>
      {friends.length ? (
        <ul>
          {friends.map((f, index) => {
            const email = f.user1Email === user.email ? f.user2Email : f.user1Email;
            const online = onlineStatus[email] ? "🟢" : "🔴"; // Green circle for online, red for offline
            return (
              <li key={index}>
                {friendNames[index] || "Unknown"} ({email}) - {online}
              </li>
            );
          })}
        </ul>
      ) : <p>You have no friends yet.</p>}

      {/* Incoming Requests */}
      <h3>Incoming Friend Requests:</h3>
      {incomingRequests.length ? (
        <ul>
          {incomingRequests.map((r) => (
            <li key={r.id}>
              {r.senderName} ({r.senderEmail}) wants to be your friend.
              <button onClick={() => handleAcceptRequest(r.id, r.senderEmail, r.receiverEmail)}>Accept</button>
              <button onClick={() => handleRejectRequest(r.id)}>Reject</button>
            </li>
          ))}
        </ul>
      ) : <p>No incoming requests.</p>}
    </div>
  );
};

export default FriendList;
