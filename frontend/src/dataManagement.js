// Data Management Functions for Tabolator App
// This file contains all CRUD operations and data management logic

import alertManager from './utils/alertManager';
import { retryPOST, retryPUT, retryDELETE, retryGET } from './utils/retryHelper';

// ================================
// REAL-TIME DATA FETCHING
// ================================

// Generic function to fetch data from API
export const fetchData = async (endpoint) => {
  try {
    const data = await retryGET(`http://localhost/Tabolator_Casestudy/backend/api/${endpoint}`);
    return data.success ? data.data : [];
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return [];
  }
};

// Refresh all data
export const refreshAllData = async (setCategories, setCriteria, setJudges, setContestants) => {
  try {
    const [categoriesData, criteriaData, judgesData, contestantsData] = await Promise.all([
      fetchData('categories'),
      fetchData('criteria'),
      fetchData('judges'),
      fetchData('contestants')
    ]);
    
    setCategories(categoriesData);
    setCriteria(criteriaData);
    setJudges(judgesData);
    setContestants(contestantsData);
    
    console.log('✅ All data refreshed successfully');
  } catch (error) {
    console.error('❌ Error refreshing data:', error);
  }
};

// Refresh criteria only
export const refreshCriteria = async (setCriteria) => {
  try {
    const criteriaData = await fetchData('criteria');
    setCriteria(criteriaData);
    console.log('✅ Criteria refreshed successfully');
  } catch (error) {
    console.error('❌ Error refreshing criteria:', error);
  }
};

// ================================
// CATEGORY MANAGEMENT
// ================================

export const handleAddCategory = async (categoryInput, categories, setCategories, setCategoryInput) => {
  if (categoryInput.trim()) {
    const newCategory = {
      id: Date.now(),
      name: categoryInput,
      created_at: new Date().toISOString()
    };
    
    // Update local state first for better UX
    setCategories([...categories, newCategory]);
    setCategoryInput('');
    
    // Add to backend with retry
    try {
      await retryPOST('http://localhost/Tabolator_Casestudy/backend/api/categories', { name: categoryInput });
    } catch (error) {
      console.error('Failed to add category:', error);
      // Revert local state if backend fails
      setCategories(categories);
      setCategoryInput(categoryInput);
      throw error;
    }
  }
};

export const handleEditCategory = (category, setCategoryInput) => {
  // Pre-fill input field with selected category name
  setCategoryInput(category.name);
};

export const handleUpdateCategory = async (categoryId, categoryInput, categories, setCategories, setCategoryInput) => {
  if (!categoryInput?.trim()) {
    alertManager.warning('Validation Error', 'Please enter a category name');
    return;
  }

  try {
    // Update existing category
    const response = await fetch('http://localhost/Tabolator_Casestudy/backend/api/categories', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: categoryId, // Add ID in request body
        name: categoryInput.trim()
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update category');
    }
    
    // Update local state
    setCategories(categories.map(c => 
      c.id === categoryId ? { ...c, name: categoryInput.trim() } : c
    ));
    
    // Clear input and edit mode
    setCategoryInput('');
    
    alertManager.success('Success', 'Category updated successfully!');
  } catch (error) {
    console.error('❌ Update Error:', error);
    alertManager.error('Update Error', 'Failed to update category: ' + error.message);
  }
};

export const handleDeleteCategory = (id, categories, setCategories) => {
  // Update local state first
  setCategories(categories.filter(cat => cat.id !== id));
  
  // Delete from backend with retry
  retryDELETE(`http://localhost/Tabolator_Casestudy/backend/api/categories?id=${id}`)
    .catch(error => {
      console.error('Failed to delete category:', error);
      // Revert local state if backend fails
      setCategories(categories);
    });
};

// ================================
// CRITERIA MANAGEMENT
// ================================

export const handleAddCriteria = async (
  criteriaInput, 
  selectedCategory, 
  categories, 
  criteria, 
  setCriteria, 
  setCriteriaInput
) => {
  console.log('handleAddCriteria called with:', {
    criteriaInput,
    selectedCategory,
    categories: categories.length,
    criteria: criteria.length
  });

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
  console.log('Selected category:', selectedCat);
  
  if (!selectedCat) {
    alertManager.error('Error', 'Selected category not found. Please try again.');
    return;
  }
  
  // Prepare data for API
  const apiData = {
    category_id: selectedCat.id,
    name: criteriaInput.name.trim(),
    percentage: parseFloat(criteriaInput.percentage),
    min_score: parseFloat(criteriaInput.min),
    max_score: parseFloat(criteriaInput.max)
  };
  
  console.log('Sending to API:', apiData);
  
  try {
    // Call API with retry
    await retryPOST('http://localhost/Tabolator_Casestudy/backend/api/criteria', apiData);
    
    // Clear input fields
    setCriteriaInput({ name: '', percentage: '', min: '', max: '' });
    
    // Refresh criteria data from server (real-time update)
    await refreshCriteria(setCriteria);
    
    console.log('✅ Criteria saved to database successfully');
    alertManager.success('Success', 'Criteria added successfully!');
  } catch (error) {
    console.error('❌ Network Error:', error);
    alertManager.error('Network Error', 'Failed to save criteria: ' + error.message);
  }
};

export const handleEditCriteria = (criterion, categories, setSelectedCategory, setCriteriaInput) => {
  // Pre-fill the input fields with the selected criterion
  setCriteriaInput({
    name: criterion.name,
    percentage: criterion.percentage,
    min: criterion.min_score,
    max: criterion.max_score
  });
  
  // Find and set the category
  const category = categories.find(cat => cat.id === criterion.category_id);
  if (category) {
    setSelectedCategory(category.name);
  }
};

export const handleDeleteCriteria = async (id, setCriteria) => {
  try {
    // Delete from backend with retry
    await retryDELETE(`http://localhost/Tabolator_Casestudy/backend/api/criteria?id=${id}`);
    
    // Refresh criteria data from server (real-time update)
    await refreshCriteria(setCriteria);
    
    console.log('✅ Criteria deleted successfully');
    alertManager.success('Success', 'Criteria deleted successfully!');
  } catch (error) {
    console.error('❌ Network Error:', error);
    alertManager.error('Network Error', 'Failed to delete criteria: ' + error.message);
  }
};

// ================================
// JUDGE MANAGEMENT
// ================================

export const handleEditJudge = (judge, setJudgeInput) => {
  // Pre-fill input field with selected judge name
  setJudgeInput(judge.name);
};

export const handleUpdateJudge = async (judgeId, judgeInput, judges, setJudges, setJudgeInput) => {
  if (!judgeInput?.trim()) {
    alertManager.warning('Validation Error', 'Please enter a judge name');
    return;
  }

  try {
    // Update existing judge
    const response = await fetch('http://localhost/Tabolator_Casestudy/backend/api/judges', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: judgeId, // Add ID in request body
        name: judgeInput.trim()
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update judge');
    }
    
    // Update local state
    setJudges(judges.map(j => 
      j.id === judgeId ? { ...j, name: judgeInput.trim() } : j
    ));
    
    // Clear input and edit mode
    setJudgeInput('');
    
    alertManager.success('Success', 'Judge updated successfully!');
  } catch (error) {
    console.error('❌ Update Error:', error);
    alertManager.error('Update Error', 'Failed to update judge: ' + error.message);
  }
};

export const handleAddJudge = async (judgeInput, judges, setJudges, setJudgeInput, customPin = null) => {
  if (!judgeInput.trim()) {
    alertManager.warning('Validation Error', 'Please enter a judge name');
    return;
  }

  try {
    // Use custom PIN if provided, otherwise generate one
    const pin = customPin || Math.floor(1000 + Math.random() * 9000).toString();
    
    // Add to backend with retry
    const response = await retryPOST('http://localhost/Tabolator_Casestudy/backend/api/judges', {
      name: judgeInput.trim(),
      pin: pin
    });
    

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      // Update local state with backend response
      const dbJudge = data.data || {
        id: Date.now(),
        name: judgeInput.trim(),
        pin: pin
      };
      
      setJudges([...judges, dbJudge]);
      setJudgeInput('');
      
      const pinMessage = customPin ? `with PIN: ${pin}` : `with auto-generated PIN: ${pin}`;
      alertManager.success('Judge Added', `Judge "${judgeInput}" has been added successfully ${pinMessage}`);
    } else {
      console.error('❌ API Error:', data.message);
      alertManager.error('Failed to Add Judge', 'Failed to save judge: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    alertManager.error('Network Error', 'Failed to add judge: ' + error.message);
  }
};

export const handleDeleteJudge = async (id, judges, setJudges) => {
  try {
    // Delete from backend first
    const response = await fetch(`http://localhost/Tabolator_Casestudy/backend/api/judges?id=${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      // Update local state after successful backend deletion
      setJudges(judges.filter(judge => judge.id !== id));
      console.log('✅ Judge deleted successfully');
    } else {
      console.error('❌ API Error:', data.message);
      throw new Error(data.message || 'Failed to delete judge');
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    throw error; // Re-throw to let the component handle the error
  }
};

// ================================
// CONTESTANT MANAGEMENT
// ================================

export const handleAddContestant = async (contestantInput, contestants, setContestants, setContestantInput) => {
  if (!contestantInput.trim()) {
    alertManager.warning('Validation Error', 'Please enter a contestant name');
    return;
  }

  try {
    // Add to backend first
    const response = await fetch('http://localhost/Tabolator_Casestudy/backend/api/contestants', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: contestantInput.trim(),
        status: 'Active'
      })
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      // Update local state with backend response
      const dbContestant = data.data || {
        id: Date.now(),
        name: contestantInput.trim(),
        status: 'Active',
        created_at: new Date().toISOString()
      };
      
      setContestants([...contestants, dbContestant]);
      setContestantInput('');
      
      alertManager.success('Contestant Added', `Contestant "${contestantInput}" has been added successfully with status: Active`);
    } else {
      console.error('❌ API Error:', data.message);
      alertManager.error('Failed to Add Contestant', 'Failed to save contestant: ' + (data.message || 'Unknown error'));
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    alertManager.error('Network Error', 'Failed to add contestant: ' + error.message);
  }
};

export const handleDeleteContestant = async (id, contestants, setContestants) => {
  try {
    // Delete from backend first
    const response = await fetch(`http://localhost/Tabolator_Casestudy/backend/api/contestants?id=${id}`, {
      method: 'DELETE'
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    if (data.success) {
      // Update local state after successful backend deletion
      setContestants(contestants.filter(contestant => contestant.id !== id));
      console.log('✅ Contestant deleted successfully');
    } else {
      console.error('❌ API Error:', data.message);
      throw new Error(data.message || 'Failed to delete contestant');
    }
  } catch (error) {
    console.error('❌ Network Error:', error);
    throw error; // Re-throw to let the component handle the error
  }
};

export const handleEliminateContestant = (id, contestants, setContestants) => {
  setContestants(contestants.map(contestant => 
    contestant.id === id ? { ...contestant, status: 'Eliminated' } : contestant
  ));
  
  // Also update in backend
  fetch(`http://localhost/Tabolator_Casestudy/backend/api/contestants/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'Eliminated'
    })
  });
};

export const handleEditContestant = (contestant, setContestantInput) => {
  // Pre-fill input field with selected contestant name
  setContestantInput(contestant.name);
};

export const handleUpdateContestant = async (contestantId, contestantInput, contestants, setContestants, setContestantInput) => {
  if (!contestantInput?.trim()) {
    alertManager.warning('Validation Error', 'Please enter a contestant name');
    return;
  }

  try {
    // Update existing contestant
    const response = await fetch('http://localhost/Tabolator_Casestudy/backend/api/contestants', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        id: contestantId, // Add ID in request body
        name: contestantInput.trim()
      })
    });

    const result = await response.json();
    
    if (!result.success) {
      throw new Error(result.message || 'Failed to update contestant');
    }
    
    // Update local state
    setContestants(contestants.map(c => 
      c.id === contestantId ? { ...c, name: contestantInput.trim() } : c
    ));
    
    // Clear input and edit mode
    setContestantInput('');
    
    alertManager.success('Success', 'Contestant updated successfully!');
  } catch (error) {
    console.error('❌ Update Error:', error);
    alertManager.error('Update Error', 'Failed to update contestant: ' + error.message);
  }
};

export const handleDisqualifyContestant = (id, contestants, setContestants) => {
  setContestants(contestants.map(contestant => 
    contestant.id === id ? { ...contestant, status: 'Disqualified' } : contestant
  ));
  
  // Also update in backend
  fetch(`http://localhost/Tabolator_Casestudy/backend/api/contestants/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      status: 'Disqualified'
    })
  });
};
