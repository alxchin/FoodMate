import React, { useEffect, useState } from "react";
import { db, auth } from "../firebase";
import { collection, query, where, onSnapshot, updateDoc, doc } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";
import InviteModal from "./InviteModal";

const InviteListener = () => {
  const [user] = useAuthState(auth);
  const [session, setSession] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "eatSession"),
      where("inviteeEmail", "==", user.email),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        setSession({ id: docSnap.id, ...data });
        setShowModal(true);
      });
    });

    return () => unsubscribe();
  }, [user]);

  const handleAccept = async () => {
    if (!session) return;
    const sessionRef = doc(db, "eatSession", session.id);
    await updateDoc(sessionRef, { status: "accepted" });
    setShowModal(false);
    navigate(`/eats/${session.id}`);
  };

  const handleDecline = async () => {
    if (!session) return;
    const sessionRef = doc(db, "eatSession", session.id);
    await updateDoc(sessionRef, { status: "declined" });
    setShowModal(false);
  };

  return (
    <InviteModal
      isOpen={showModal}
      onClose={() => setShowModal(false)}
      onAccept={handleAccept}
      onDecline={handleDecline}
      inviterEmail={session?.inviterEmail}
    />
  );
};

export default InviteListener;
