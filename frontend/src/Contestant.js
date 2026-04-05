import React from 'react';
import alertManager from './utils/alertManager';

const Contestant = ({ 
  contestant, 
  index, 
  handleDeleteContestant,
  handleEliminateContestant,
  handleDisqualifyContestant,
  handleEditContestant,
  contestants,
  setContestants
}) => {
  const handleEditClick = () => {
    handleEditContestant(contestant);
  };

  const handleDeleteClick = () => {
    alertManager.confirm(
      'Delete Contestant',
      `Are you sure you want to delete contestant "${contestant.name}"? This action cannot be undone.`,
      async () => {
        try {
          await handleDeleteContestant(contestant.id, contestants, setContestants);
          alertManager.success('Contestant Deleted', `Contestant "${contestant.name}" has been deleted successfully.`);
        } catch (error) {
          alertManager.error('Deletion Failed', `Failed to delete contestant: ${error.message}`);
        }
      }
    );
  };

  const handleEliminateClick = () => {
    alertManager.confirm(
      'Eliminate Contestant',
      `Are you sure you want to eliminate contestant "${contestant.name}"?`,
      async () => {
        try {
          await handleEliminateContestant(contestant.id, contestants, setContestants);
          alertManager.success('Contestant Eliminated', `Contestant "${contestant.name}" has been eliminated.`);
        } catch (error) {
          alertManager.error('Elimination Failed', `Failed to eliminate contestant: ${error.message}`);
        }
      }
    );
  };

  const handleDisqualifyClick = () => {
    alertManager.confirm(
      'Disqualify Contestant',
      `Are you sure you want to disqualify contestant "${contestant.name}"?`,
      async () => {
        try {
          await handleDisqualifyContestant(contestant.id, contestants, setContestants);
          alertManager.success('Contestant Disqualified', `Contestant "${contestant.name}" has been disqualified.`);
        } catch (error) {
          alertManager.error('Disqualification Failed', `Failed to disqualify contestant: ${error.message}`);
        }
      }
    );
  };

  return (
    <tr key={contestant.id}>
      <td>{index + 1}</td>
      <td>{contestant.name}</td>
      <td className={`status ${contestant.status ? contestant.status.toLowerCase() : 'unknown'}`}>
        {contestant.status || 'Unknown'}
      </td>
      <td>
        <button 
          className="action-btn edit-btn" 
          onClick={handleEditClick}
          title="Edit"
        >
          <i className="fi fi-rr-edit"></i>
        </button>
        <button 
          className="action-btn eliminate-btn" 
          onClick={handleEliminateClick} 
          title="Eliminate"
        >
          <i className="fi fi-rr-cross-small"></i>
        </button>
        <button 
          className="action-btn disqualify-btn" 
          onClick={handleDisqualifyClick} 
          title="Disqualify"
        >
          <i className="fi fi-rr-exclamation"></i>
        </button>
        <button 
          className="action-btn delete-btn" 
          onClick={handleDeleteClick} 
          title="Delete"
        >
          <i className="fi fi-rr-trash"></i>
        </button>
      </td>
    </tr>
  );
};

export default Contestant;
