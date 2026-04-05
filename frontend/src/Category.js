import React, { useState } from 'react';
import { handleEditCategory, handleUpdateCategory } from './dataManagement';
import alertManager from './utils/alertManager';

const Category = ({ 
  categories, 
  setCategories,
  categoryInput, 
  setCategoryInput, 
  handleAddCategory, 
  handleDeleteCategory,
  criteria = [] 
}) => {
  const [editingId, setEditingId] = useState(null);

  const handleEditClick = (category) => {
    setEditingId(category.id);
    handleEditCategory(category, setCategoryInput);
  };

  const handleUpdateCategoryClick = async () => {
    if (!editingId) return;
    
    await handleUpdateCategory(editingId, categoryInput, categories, setCategories, setCategoryInput);
    setEditingId(null); // Clear edit mode
  };

  const handleSubmitClick = () => {
    if (!categoryInput?.trim()) {
      alertManager.warning('Validation Error', 'Please enter a category name');
      return;
    }

    if (editingId) {
      handleUpdateCategoryClick();
    } else {
      handleAddCategory(categoryInput, categories, setCategories, setCategoryInput);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (!categoryInput?.trim()) {
        alertManager.warning('Validation Error', 'Please enter a category name');
        return;
      }

      if (editingId) {
        handleUpdateCategoryClick();
      } else {
        handleAddCategory(categoryInput, categories, setCategories, setCategoryInput);
      }
    }
  };

  const handleDeleteClick = (category) => {
    alertManager.confirm(
      'Delete Category',
      `Are you sure you want to delete category "${category.name}"? This action cannot be undone.`,
      async () => {
        try {
          await handleDeleteCategory(category.id, categories, setCategories);
          alertManager.success('Category Deleted', `Category "${category.name}" has been deleted successfully.`);
        } catch (error) {
          alertManager.error('Deletion Failed', `Failed to delete category: ${error.message}`);
        }
      }
    );
  };
  return (
    <section className="section">
      <h2>Adding Category</h2>
      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>No.</th>
              <th>Name</th>
              <th>Criteria Count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {categories.map((category, index) => {
              // Count criteria for this category
              const criteriaCount = criteria.filter(crit => crit.category_id === category.id || crit.category_name === category.name).length;
              
              return (
                <tr key={category.id}>
                  <td>{index + 1}</td>
                  <td>{category.name}</td>
                  <td>
                    <span className="criteria-count">
                      {criteriaCount} {criteriaCount === 1 ? 'criteria' : 'criterias'}
                    </span>
                  </td>
                  <td>
                    <button 
                      className="action-btn edit-btn" 
                      title="Edit"
                      onClick={() => handleEditClick(category)}
                    >
                      <i className="fi fi-rr-edit"></i>
                    </button>
                    <button 
                      className="action-btn delete-btn" 
                      onClick={() => handleDeleteClick(category)} 
                      title="Delete"
                    >
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="input-group" style={{display: 'flex', flexDirection: 'row', gap: '10px', alignItems: 'center', width: '100%'}}>
        <input
          type="text"
          placeholder="Enter category name"
          value={categoryInput}
          onChange={(e) => setCategoryInput(e.target.value)}
          onKeyPress={handleKeyPress}
          style={{flex: 1, margin: 0}}
        />
        <button 
          className="submit-btn" 
          onClick={handleSubmitClick}
          style={{margin: 0, whiteSpace: 'nowrap'}}
        >
          {editingId ? 'Update' : 'Submit'}
        </button>
      </div>
    </section>
  );
};

export default Category;