import React from "react";
import "../styles/InviteModal.css";

const InviteModal = ({ isOpen, onClose, onAccept, onDecline, inviterEmail }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>You've been invited to eat!</h2>
        <p>Do you want to accept the invitation from <strong>{inviterEmail}</strong>?</p>
        <div>
          <button onClick={onAccept}>Accept</button>
          <button onClick={onDecline}>Decline</button>
        </div>
        <button className="close" onClick={onClose}>
          Close
        </button>
      </div>
    </div>
  );
};

export default InviteModal;
