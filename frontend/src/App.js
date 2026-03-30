import React, { useState, useEffect } from 'react';
import UserService from './services/UserService';
import UserList from './components/UserList';
import UserForm from './components/UserForm';
import './App.css';

function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [modalMessage, setModalMessage] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await UserService.getAllUsers();
      if (response.success) {
        setUsers(response.data);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Error connecting to server');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (userData) => {
    try {
      const response = await UserService.createUser(userData);
      if (response.success) {
        setModalMessage(response.message);
        setShowSuccessModal(true);
        fetchUsers();
        return true;
      } else {
        setModalMessage(response.message);
        setShowErrorModal(true);
        return false;
      }
    } catch (err) {
      setModalMessage('Error creating user');
      setShowErrorModal(true);
      return false;
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const response = await UserService.updateUser(userId, userData);
      if (response.success) {
        fetchUsers();
        return true;
      }
      return false;
    } catch (err) {
      setError('Error updating user');
      return false;
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      const response = await UserService.deleteUser(userId);
      if (response.success) {
        fetchUsers();
        return true;
      }
      return false;
    } catch (err) {
      setError('Error deleting user');
      return false;
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>User Management</h1>
      </header>
      <main className="App-main">
        {error && <div className="error-message">{error}</div>}
        
        <div className="content-wrapper">
          <div className="form-section">
            <UserForm 
              onSubmit={handleCreateUser}
              buttonText="Add User"
            />
          </div>
          
          <div className="list-section">
            {loading ? (
              <div className="loading">Loading users...</div>
            ) : (
              <UserList 
                users={users}
                onUpdate={handleUpdateUser}
                onDelete={handleDeleteUser}
              />
            )}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Success</h5>
                <button type="button" className="close" onClick={() => setShowSuccessModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalMessage}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-primary" onClick={() => setShowSuccessModal(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Error Modal */}
      {showErrorModal && (
        <div className="modal fade show" style={{display: 'block', backgroundColor: 'rgba(0,0,0,0.5)'}} tabIndex="-1" role="dialog">
          <div className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Error</h5>
                <button type="button" className="close" onClick={() => setShowErrorModal(false)}>
                  <span>&times;</span>
                </button>
              </div>
              <div className="modal-body">
                {modalMessage}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowErrorModal(false)}>
                  OK
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;