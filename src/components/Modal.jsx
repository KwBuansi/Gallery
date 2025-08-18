import React from 'react';
import "./Modal.css";

export const Modal = ( { onSubmit, onCancel, onClose, children } ) => {
  return (
    <div className="modal-container">
        <div className="modal">
                <div className="modal-header">
                    <p className="close" onClick={() => onCancel()}>&times;</p>
                </div>
            <div className="modal-content">
                {children}
            </div>
            <div className="modal-footer">
                <button className="border hover:cursor-pointer px-4 py-3 mt-4" onClick={() => onSubmit(true)}>Proceed</button>
                <button className="border hover:cursor-pointer px-4 py-3 mt-4 text-red-700" onClick={() => onCancel()}>Cancel</button>
            </div>
        </div>
    </div>
  )
}

export default Modal