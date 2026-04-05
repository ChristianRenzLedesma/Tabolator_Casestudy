// Alert Manager Utility
// Centralized alert management for the application

class AlertManager {
  constructor() {
    this.modals = [];
    this.toasts = [];
    this.modalId = 0;
    this.toastId = 0;
  }

  // Generate unique ID
  generateId(prefix) {
    return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Show modal alert
  showModal(options) {
    const modal = {
      id: this.generateId('modal'),
      isOpen: true,
      ...options
    };
    
    this.modals.push(modal);
    return modal.id;
  }

  // Show toast notification
  showToast(options) {
    const toast = {
      id: this.generateId('toast'),
      ...options
    };
    
    this.toasts.push(toast);
    return toast.id;
  }

  // Close modal
  closeModal(id) {
    const index = this.modals.findIndex(modal => modal.id === id);
    if (index !== -1) {
      this.modals[index].isOpen = false;
      setTimeout(() => {
        this.modals.splice(index, 1);
      }, 300);
    }
  }

  // Close toast
  closeToast(id) {
    const index = this.toasts.findIndex(toast => toast.id === id);
    if (index !== -1) {
      this.toasts.splice(index, 1);
    }
  }

  // Convenience methods
  success(title, message, options = {}) {
    return this.showToast({
      type: 'success',
      title: title || 'Success',
      message,
      duration: 3000,
      ...options
    });
  }

  error(title, message, options = {}) {
    return this.showToast({
      type: 'error',
      title: title || 'Error',
      message,
      duration: 5000,
      ...options
    });
  }

  warning(title, message, options = {}) {
    return this.showToast({
      type: 'warning',
      title: title || 'Warning',
      message,
      duration: 4000,
      ...options
    });
  }

  info(title, message, options = {}) {
    return this.showToast({
      type: 'info',
      title: title || 'Info',
      message,
      duration: 3000,
      ...options
    });
  }

  // Modal convenience methods
  confirm(title, message, onConfirm, options = {}) {
    return this.showModal({
      type: 'confirm',
      title: title || 'Confirm Action',
      message,
      confirmText: 'Confirm',
      cancelText: 'Cancel',
      showCancel: true,
      onConfirm,
      ...options
    });
  }

  alert(title, message, options = {}) {
    return this.showModal({
      type: 'info',
      title: title || 'Alert',
      message,
      confirmText: 'OK',
      showCancel: false,
      ...options
    });
  }

  // Get current modals and toasts
  getModals() {
    return this.modals;
  }

  getToasts() {
    return this.toasts;
  }

  // Clear all
  clearAll() {
    this.modals = [];
    this.toasts = [];
  }
}

// Create singleton instance
const alertManager = new AlertManager();

export default alertManager;
