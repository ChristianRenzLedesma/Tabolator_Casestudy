import React, { useState } from 'react';
import alertManager from './utils/alertManager';
import { handleEditJudge, handleUpdateJudge } from './dataManagement';

const Judges = ({ 
  judges, 
  setJudges,
  judgeInput, 
  setJudgeInput,
  handleAddJudge, 
  handleDeleteJudge,
  handleEditJudge 
}) => {
  const [pinInput, setPinInput] = useState('');
  const [editingId, setEditingId] = useState(null);

  const handleEditClick = (judge) => {
    setEditingId(judge.id);
    handleEditJudge(judge, setJudgeInput);
  };

  const handleUpdateJudgeClick = async () => {
    if (!editingId) return;
    
    await handleUpdateJudge(editingId, judgeInput, judges, setJudges, setJudgeInput);
    setEditingId(null); // Clear edit mode
  };
  const [useAutoPin, setUseAutoPin] = useState(true);
  const [showPin, setShowPin] = useState(false);

  const generatePin = () => {
    return Math.floor(1000 + Math.random() * 9000).toString();
  };

  const handleGeneratePin = () => {
    const newPin = generatePin();
    setPinInput(newPin);
    setUseAutoPin(false);
  };

  const handleAddJudgeWithPin = () => {
    if (!judgeInput.trim()) {
      alertManager.warning('Validation Error', 'Please enter a judge name');
      return;
    }

    // Always use auto-generated PIN (pass null to trigger auto-generation)
    handleAddJudge(judgeInput.trim(), null);
    
    // Reset form
    setJudgeInput('');
  };
  const handleDeleteClick = (judge) => {
    alertManager.confirm(
      'Delete Judge',
      `Are you sure you want to delete judge "${judge.name}"? This action cannot be undone.`,
      async () => {
        try {
          await handleDeleteJudge(judge.id);
          alertManager.success('Judge Deleted', `Judge "${judge.name}" has been deleted successfully.`);
        } catch (error) {
          alertManager.error('Deletion Failed', `Failed to delete judge: ${error.message}`);
        }
      }
    );
  };

  return (
    <section className="section">
      <h2>Adding Judges</h2>

      {/* Judges Table Section */}
      <div className="table-container">
        <div className="table-header">
          <h3>
            <i className="fi fi-rr-users"></i>
            Registered Judges
          </h3>
          <span className="judge-count">{judges.length} judge{judges.length !== 1 ? 's' : ''} registered</span>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>PIN</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {judges.map((judge, index) => (
              <tr key={judge.id}>
                <td>{index + 1}</td>
                <td>{judge.name}</td>
                <td>{judge.pin}</td>
                <td>
                  <button 
                    className="action-btn edit-btn" 
                    title="Edit"
                    onClick={() => handleEditClick(judge)}
                  >
                    <i className="fi fi-rr-edit"></i>
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => handleDeleteClick(judge)} 
                    title="Delete"
                  >
                    <i className="fi fi-rr-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="input-group" style={{display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', width: '100%'}}>
          <div className="judge-input-row" style={{flex: 1, display: 'flex', flexDirection: 'column', margin: 0}}>
            <label htmlFor="judgeName">Judge Name</label>
            <input
              id="judgeName"
              type="text"
              placeholder="Enter judge name"
              value={judgeInput}
              onChange={(e) => setJudgeInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddJudgeWithPin()}
              style={{margin: 0}}
            />
          </div>
          
          <button 
            className="submit-btn" 
            onClick={() => {
              if (editingId) {
                handleUpdateJudgeClick();
              } else {
                handleAddJudgeWithPin();
              }
            }}
            style={{margin: 0, whiteSpace: 'nowrap', alignSelf: 'flex-end'}}
          >
            {editingId ? 'Update' : 'Add Judge'}
          </button>
        </div>
        <div className="form-notes">
          <p><i className="fi fi-rr-info-circle"></i> Arrange the order of judges as needed</p>
          <p><i className="fi fi-rr-info-circle"></i> PIN will be auto-generated for each judge</p>
        </div>
      </div>
    </section>
  );
};

export default Judges;
