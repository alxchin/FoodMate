import React from "react";
import "../styles/InviteModal.css"

const InviteModal = ({ isOpen, onClose, onAccept, onDecline, friendEmail }) => {
  if (!isOpen) return null; // If modal isn't open, don't render it.

  return (
    <div className="modal-overlay">
      <div className="modal">
        <h2>You've been invited to eat!</h2>
        <p>Do you want to accept the invitation from {friendEmail}?</p>
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
