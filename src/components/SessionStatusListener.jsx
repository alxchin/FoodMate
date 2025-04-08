import { useEffect } from "react";
import { db, auth } from "../firebase";
import {
  collection,
  query,
  where,
  onSnapshot,
} from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { useNavigate } from "react-router-dom";

const SessionStatusListener = () => {
  const [user] = useAuthState(auth);
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, "eatSession"),
      where("inviterEmail", "==", user.email)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        const docData = change.doc.data();

        if (
          docData.status === "accepted" &&
          change.type === "modified"
        ) {
          navigate(`/eats/${change.doc.id}`);
        }
      });
    });

    return () => unsubscribe();
  }, [user]);

  return null;
};

export default SessionStatusListener;
