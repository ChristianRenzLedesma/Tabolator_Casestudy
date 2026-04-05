import React, { useState } from 'react';
import Contestant from './Contestant';
import alertManager from './utils/alertManager';
import { handleEditContestant, handleUpdateContestant } from './dataManagement';

const Contestants = ({ 
  contestants, 
  contestantInput, 
  setContestantInput, 
  handleAddContestant, 
  handleDeleteContestant,
  handleEliminateContestant,
  handleDisqualifyContestant,
  handleEditContestant,
  setContestants
}) => {
  const [editingId, setEditingId] = useState(null);

  const handleEditClick = (contestant) => {
    console.log('Editing contestant:', contestant);
    setEditingId(contestant.id);
    handleEditContestant(contestant, setContestantInput);
    console.log('Set editing ID to:', contestant.id);
  };

  const handleUpdateContestantClick = async () => {
    console.log('Update clicked, editingId:', editingId);
    console.log('Current contestantInput:', contestantInput);
    
    if (!editingId) return;
    
    await handleUpdateContestant(editingId, contestantInput, contestants, setContestants, setContestantInput);
    setEditingId(null); // Clear edit mode
    console.log('Update completed, cleared editing mode');
  };
  return (
    <section className="section">
      <h2>Adding Contestants</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {contestants.map((contestant, index) => (
              <Contestant
                key={contestant.id}
                contestant={contestant}
                index={index}
                handleDeleteContestant={handleDeleteContestant}
                handleEliminateContestant={handleEliminateContestant}
                handleDisqualifyContestant={handleDisqualifyContestant}
                handleEditContestant={handleEditClick}
                contestants={contestants}
                setContestants={setContestants}
              />
            ))}
          </tbody>
        </table>
      </div>
      <div className="input-group" style={{display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', width: '100%'}}>
        <input
          type="text"
          placeholder="Enter contestant name"
          value={contestantInput}
          onChange={(e) => setContestantInput(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              if (editingId) {
                handleUpdateContestantClick();
              } else {
                handleAddContestant(contestantInput, contestants, setContestants, setContestantInput);
              }
            }
          }}
          style={{flex: 1, margin: 0}}
        />
        <button 
          className="submit-btn" 
          onClick={() => {
            if (editingId) {
              handleUpdateContestantClick();
            } else {
              handleAddContestant(contestantInput, contestants, setContestants, setContestantInput);
            }
          }}
          style={{margin: 0, whiteSpace: 'nowrap'}}
        >
          {editingId ? 'Update' : 'Submit'}
        </button>
      </div>
      <div className="notes">
        <p>Note: Arrange order of contestants</p>
        <p>Note: Eliminates Contestant</p>
        <p>Note: Disqualifies Contestant</p>
      </div>
    </section>
  );
};

export default Contestants;