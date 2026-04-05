import React, { useState } from 'react';
import { refreshCriteria } from './dataManagement';
import alertManager from './utils/alertManager';

const Criteria = ({ 
  categories, 
  criteria, 
  selectedCategory, 
  setSelectedCategory, 
  criteriaInput, 
  setCriteriaInput, 
  setCriteria,
  handleAddCriteria, 
  handleEditCriteria, 
  handleDeleteCriteria 
}) => {
  const [editingId, setEditingId] = useState(null);

  const handleRefresh = async () => {
    await refreshCriteria(setCriteria);
  };

  const handleEditClick = (criterion) => {
    setEditingId(criterion.id);
    handleEditCriteria(criterion, categories, setSelectedCategory, setCriteriaInput);
  };

  const handleUpdateCriteria = async () => {
    if (!editingId) return;

    // Validate inputs
    if (!criteriaInput.name?.trim()) {
      alertManager.warning('Validation Error', 'Please enter a criteria name');
      return;
    }
  
    if (!criteriaInput.percentage || criteriaInput.percentage <= 0) {
      alertManager.warning('Validation Error', 'Please enter a valid percentage greater than 0');
      return;
    }
  
    if (!criteriaInput.min || criteriaInput.min < 0) {
      alertManager.warning('Validation Error', 'Please enter a valid minimum score (0 or greater)');
      return;
    }
  
    if (!criteriaInput.max || criteriaInput.max <= 0) {
      alertManager.warning('Validation Error', 'Please enter a valid maximum score greater than 0');
      return;
    }
  
    if (parseFloat(criteriaInput.min) >= parseFloat(criteriaInput.max)) {
      alertManager.warning('Validation Error', 'Maximum score must be greater than minimum score');
      return;
    }
  
    if (!selectedCategory) {
      alertManager.warning('Validation Error', 'Please select a category');
      return;
    }

    const selectedCat = categories.find(cat => cat.name === selectedCategory);
    if (!selectedCat) {
      alertManager.error('Error', 'Selected category not found. Please try again.');
      return;
    }
  
    try {
      // Update existing criterion
      const response = await fetch('http://localhost/Tabolator_Casestudy/backend/api/criteria', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: editingId, // Add the ID
          category_id: selectedCat.id,
          name: criteriaInput.name.trim(),
          percentage: parseFloat(criteriaInput.percentage),
          min_score: parseFloat(criteriaInput.min),
          max_score: parseFloat(criteriaInput.max)
        })
      });

      const result = await response.json();
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update criterion');
      }
      
      // Clear editing state and input fields
      setEditingId(null);
      setCriteriaInput({ name: '', percentage: '', min: '', max: '' });
      
      // Refresh criteria data
      await refreshCriteria(setCriteria);
      
      alertManager.success('Success', 'Criteria updated successfully!');
    } catch (error) {
      console.error('❌ Update Error:', error);
      alertManager.error('Update Error', 'Failed to update criteria: ' + error.message);
    }
  };

  return (
    <section className="section">
      <div className="section-header">
        <h2>Adding Criteria</h2>
        <button className="refresh-btn" onClick={handleRefresh} title="Refresh Data">
          <i className="fi fi-rr-refresh"></i>
          Refresh
        </button>
      </div>
      <div className="category-selector">
        <label>Category: </label>
        <select 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="category-select"
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.id} value={category.name}>
              {category.name}
            </option>
          ))}
        </select>
      </div>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>%</th>
              <th>min</th>
              <th>max</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {criteria.filter(crit => crit.category_name === selectedCategory).map((criterion) => (
              <tr key={criterion.id}>
                <td>{criterion.name}</td>
                <td>{criterion.percentage}%</td>
                <td>{criterion.min_score || criterion.min}</td>
                <td>{criterion.max_score || criterion.max}</td>
                <td>
                  <button 
                    className="action-btn edit-btn" 
                    title="Edit"
                    onClick={() => handleEditClick(criterion)}
                  >
                    <i className="fi fi-rr-edit"></i>
                  </button>
                  <button 
                    className="action-btn delete-btn" 
                    onClick={() => handleDeleteCriteria(criterion.id, criteria, setCriteria)} 
                    title="Delete"
                  >
                    <i className="fi fi-rr-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="input-group single-row">
        <input
          type="text"
          placeholder="Name"
          value={criteriaInput.name}
          onChange={(e) => setCriteriaInput({...criteriaInput, name: e.target.value})}
        />
        <input
          type="number"
          placeholder="%"
          value={criteriaInput.percentage}
          onChange={(e) => setCriteriaInput({...criteriaInput, percentage: e.target.value})}
        />
        <input
          type="number"
          placeholder="Min"
          value={criteriaInput.min}
          onChange={(e) => setCriteriaInput({...criteriaInput, min: e.target.value})}
        />
        <input
          type="number"
          placeholder="Max"
          value={criteriaInput.max}
          onChange={(e) => setCriteriaInput({...criteriaInput, max: e.target.value})}
        />
        <button 
          className="submit-btn" 
          onClick={() => {
            if (editingId) {
              handleUpdateCriteria();
            } else {
              handleAddCriteria(
                criteriaInput,           // Input values
                selectedCategory,        // Selected category name
                categories,              // Categories array
                criteria,                // Existing criteria array
                setCriteria,             // State setter for criteria
                setCriteriaInput         // State setter for input
              );
            }
          }}
        >
          {editingId ? 'Update' : 'Submit'}
        </button>
      </div>
    </section>
  );
};

export default Criteria;
