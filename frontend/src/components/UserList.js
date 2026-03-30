import React, { useState } from 'react';
import './UserList.css';

const UserList = ({ users, onUpdate, onDelete }) => {
  const [editingUser, setEditingUser] = useState(null);
  const [editFormData, setEditFormData] = useState({ name: '', age: '' });

  const handleEdit = (user) => {
    setEditingUser(user.id);
    setEditFormData({ name: user.name, age: user.age });
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditFormData({ name: '', age: '' });
  };

  const handleSaveEdit = async (e) => {
    e.preventDefault();
    const success = await onUpdate(editingUser, editFormData);
    if (success) {
      handleCancelEdit();
    }
  };

  const handleDelete = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      await onDelete(userId);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  return (
    <div className="user-list">
      <h2>User List</h2>
      {users.length === 0 ? (
        <p className="no-users">No users found</p>
      ) : (
        <div className="users-grid">
          {users.map(user => (
            <div key={user.id} className="user-card">
              {editingUser === user.id ? (
                <form onSubmit={handleSaveEdit} className="edit-form">
                  <input
                    type="text"
                    name="name"
                    value={editFormData.name}
                    onChange={handleInputChange}
                    placeholder="Name"
                    required
                  />
                  <input
                    type="number"
                    name="age"
                    value={editFormData.age}
                    onChange={handleInputChange}
                    placeholder="Age"
                    min="1"
                    required
                  />
                  <div className="edit-actions">
                    <button type="submit" className="btn btn-save">Save</button>
                    <button type="button" onClick={handleCancelEdit} className="btn btn-cancel">Cancel</button>
                  </div>
                </form>
              ) : (
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p>Age: {user.age}</p>
                  <div className="user-actions">
                    <button 
                      onClick={() => handleEdit(user)} 
                      className="btn btn-edit"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => handleDelete(user.id)} 
                      className="btn btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserList;
