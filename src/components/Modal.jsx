// Modal.js
import React from 'react';
import './Modal.css'; // Assuming you have a separate CSS file for modal styling

function Modal({ children, onClose }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export default Modal;
