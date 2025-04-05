import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, getDocs, addDoc, onSnapshot, updateDoc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import InviteModal from "./InviteModal"; // Import InviteModal
import { useNavigate } from 'react-router-dom';

const Eats = () => {
  const [user] = useAuthState(auth);
  const [friends, setFriends] = useState([]);
  const [friendNames, setFriendNames] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control modal visibility
  const [invitedFriend, setInvitedFriend] = useState(""); // Track which friend invited the user
  const navigate = useNavigate();
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
      setFriends(data);
    } catch (err) {
      console.error("Error fetching friends:", err);
    }
  };

  // === FETCH FRIEND NAMES ===
  const fetchFriendNames = async () => {
    try {
      const emails = friends.map((f) => (f.user1Email === user.email ? f.user2Email : f.user1Email));
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

  // === SEND INVITE ===
  const sendInvite = async (friendEmail) => {
    try {
      // Create a new eatSession document to track the invite
      const eatSessionRef = collection(db, "eatSession");
      const newSession = await addDoc(eatSessionRef, {
        inviterEmail: user.email,
        inviteeEmail: friendEmail,
        status: "pending", // Pending status for the invite
        timestamp: new Date(),
      });

      console.log("Invitation sent. Session ID:", newSession.id);
    } catch (err) {
      console.error("Error sending invite:", err);
    }
  };

  // === LISTEN FOR INCOMING INVITE ===
  useEffect(() => {
    if (!user) return; // Exit if there's no user logged in

    const unsubscribe = onSnapshot(
      query(collection(db, "eatSession"), where("inviteeEmail", "==", user.email), where("status", "==", "pending")),
      (snapshot) => {
        if (!snapshot.empty) {
          snapshot.docs.forEach((doc) => {
            const data = doc.data();
            setInvitedFriend(data.inviterEmail); // Set the inviter email
            setIsModalOpen(true); // Open the modal
          });
        }
      }
    );

    return () => unsubscribe(); // Clean up the listener when the component unmounts
  }, [user]);

  // === HANDLE ACCEPT INVITE ===
  const handleAccept = async () => {
    try {
      const sessionRef = collection(db, "eatSession");
      const q = query(sessionRef, where("inviterEmail", "==", invitedFriend), where("inviteeEmail", "==", user.email));
      const snapshot = await getDocs(q);
  
      if (!snapshot.empty) {
        const sessionDoc = snapshot.docs[0];
  
        // Update the status to "accepted"
        await updateDoc(sessionDoc.ref, { status: "accepted" });
  
        // Navigate to the swipe page with the session ID
        const sessionId = sessionDoc.id;  // Get the document ID (sessionId)
        navigate(`/eats/${sessionId}`); // Navigate to the food swipe page
  
        setIsModalOpen(false); // Close modal after accepting
      } else {
        console.log("No session document found.");
      }
    } catch (err) {
      console.error("Error accepting invite:", err);
    }
  };

  // === HANDLE DECLINE INVITE ===
  const handleDecline = async () => {
    try {
      const sessionRef = collection(db, "eatSession");
      const q = query(sessionRef, where("inviterEmail", "==", invitedFriend), where("inviteeEmail", "==", user.email));
      const snapshot = await getDocs(q);
      const sessionDoc = snapshot.docs[0];

      if (sessionDoc) {
        await updateDoc(sessionDoc.ref, { status: "declined" });
        console.log("Invite declined.");
        setIsModalOpen(false); // Close modal after declining
      }
    } catch (err) {
      console.error("Error declining invite:", err);
    }
  };

  // Fetch friends once user is available
  useEffect(() => {
    if (user) {
      fetchFriends();
    }
  }, [user]);

  useEffect(() => {
    if (friends.length > 0) {
      fetchFriendNames();
    }
  }, [friends]);

  return (
    <div>
      <h2>Let's Eat!</h2>
      {friends.length ? (
        <ul>
          {friends.map((f, index) => {
            const email = f.user1Email === user.email ? f.user2Email : f.user1Email;
            return (
              <li key={index}>
                {friendNames[index] || "Unknown"} ({email})
                <button onClick={() => sendInvite(email)}>Invite to Eat</button>
              </li>
            );
          })}
        </ul>
      ) : (
        <p>No friends yet.</p>
      )}

      {/* Invite Modal */}
      <InviteModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAccept={handleAccept}
        onDecline={handleDecline}
        friendEmail={invitedFriend}
      />
    </div>
  );
};

export default Eats;
