import React, { useState, useEffect } from 'react';

const NotificationToast = ({ 
  id, 
  title, 
  message, 
  type = 'info', 
  duration = 5000, 
  onClose,
  icon = null
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      if (onClose) onClose(id);
    }, 300);
  };

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return icon || 'fi fi-rr-check';
      case 'error':
        return icon || 'fi fi-rr-cross';
      case 'warning':
        return icon || 'fi fi-rr-exclamation';
      default:
        return icon || 'fi fi-rr-info';
    }
  };

  const iconClass = getTypeConfig();

  return (
    <div className={`notification-toast ${type} ${isVisible ? 'visible' : 'hiding'}`}>
      <div className="notification-icon">
        <i className={iconClass}></i>
      </div>
      <div className="notification-content">
        <div className="notification-title">{title}</div>
        <div className="notification-message">{message}</div>
      </div>
      <button className="notification-close" onClick={handleClose}>
        <i className="fi fi-rr-cross-small"></i>
      </button>
    </div>
  );
};

export default NotificationToast;
