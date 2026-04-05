import React, { useState, useEffect } from 'react';
import AlertModal from './AlertModal';
import NotificationToast from './NotificationToast';
import alertManager from '../utils/alertManager';

const AlertSystem = () => {
  const [modals, setModals] = useState([]);
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const updateAlerts = () => {
      setModals([...alertManager.getModals()]);
      setToasts([...alertManager.getToasts()]);
    };

    // Update every 100ms to catch changes
    const interval = setInterval(updateAlerts, 100);
    
    // Initial update
    updateAlerts();

    return () => clearInterval(interval);
  }, []);

  const handleModalClose = (modalId) => {
    alertManager.closeModal(modalId);
  };

  const handleToastClose = (toastId) => {
    alertManager.closeToast(toastId);
  };

  return (
    <>
      {/* Alert Modals */}
      {modals.map((modal) => (
        <AlertModal
          key={modal.id}
          isOpen={modal.isOpen}
          onClose={() => handleModalClose(modal.id)}
          title={modal.title}
          message={modal.message}
          type={modal.type}
          confirmText={modal.confirmText}
          cancelText={modal.cancelText}
          showCancel={modal.showCancel}
          onConfirm={modal.onConfirm}
          icon={modal.icon}
        />
      ))}

      {/* Notification Toasts */}
      <div className="notification-container">
        {toasts.map((toast) => (
          <NotificationToast
            key={toast.id}
            id={toast.id}
            title={toast.title}
            message={toast.message}
            type={toast.type}
            duration={toast.duration}
            onClose={handleToastClose}
            icon={toast.icon}
          />
        ))}
      </div>
    </>
  );
};

export default AlertSystem;
