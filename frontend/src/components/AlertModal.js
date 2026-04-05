import React from 'react';

const AlertModal = ({ 
  isOpen, 
  onClose, 
  title, 
  message, 
  type = 'info', 
  confirmText = 'OK', 
  cancelText = 'Cancel',
  onConfirm,
  showCancel = false,
  icon = null
}) => {
  if (!isOpen) return null;

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          bgColor: 'linear-gradient(135deg, #27ae60, #2ecc71)',
          icon: icon || 'fi fi-rr-check-circle',
          borderColor: '#27ae60'
        };
      case 'error':
        return {
          bgColor: 'linear-gradient(135deg, #e74c3c, #c0392b)',
          icon: icon || 'fi fi-rr-cross-circle',
          borderColor: '#e74c3c'
        };
      case 'warning':
        return {
          bgColor: 'linear-gradient(135deg, #f39c12, #e67e22)',
          icon: icon || 'fi fi-rr-exclamation-triangle',
          borderColor: '#f39c12'
        };
      case 'confirm':
        return {
          bgColor: 'linear-gradient(135deg, #3498db, #2980b9)',
          icon: icon || 'fi fi-rr-help-circle',
          borderColor: '#3498db'
        };
      default:
        return {
          bgColor: 'linear-gradient(135deg, #3498db, #2980b9)',
          icon: icon || 'fi fi-rr-info-circle',
          borderColor: '#3498db'
        };
    }
  };

  const config = getTypeConfig();

  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="alert-overlay">
      <div className="alert-modal">
        <div className="alert-header" style={{ background: config.bgColor, borderColor: config.borderColor }}>
          <div className="alert-icon">
            <i className={config.icon}></i>
          </div>
          <h3 className="alert-title">{title}</h3>
          <button className="alert-close-btn" onClick={onClose}>
            <i className="fi fi-rr-cross"></i>
          </button>
        </div>
        
        <div className="alert-body">
          <p className="alert-message">{message}</p>
        </div>
        
        <div className="alert-footer">
          {showCancel && (
            <button className="alert-btn alert-btn-cancel" onClick={onClose}>
              <i className="fi fi-rr-cross-small"></i>
              {cancelText}
            </button>
          )}
          <button 
            className={`alert-btn alert-btn-${type}`} 
            onClick={handleConfirm}
          >
            <i className={config.icon}></i>
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AlertModal;
