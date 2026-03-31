import React, { useState, useEffect } from 'react';
import './App.css';
import Dashboard from './components/Dashboard';

function App() {
  // Authentication state
  const [isAdmin, setIsAdmin] = useState(false);
  const [authPin, setAuthPin] = useState('');
  const [judgePin, setJudgePin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(true);
  const [showJudgeLogin, setShowJudgeLogin] = useState(false);
  const [currentJudge, setCurrentJudge] = useState(null);
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'tl'

  // Data state - loaded from backend
  const [categories, setCategories] = useState([]);
  const [categoryInput, setCategoryInput] = useState('');
  
  const [criteria, setCriteria] = useState([]);
  const [criteriaInput, setCriteriaInput] = useState({
    name: '',
    percentage: '',
    min: '',
    max: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('Talent');
  
  const [judges, setJudges] = useState([]);
  const [judgeInput, setJudgeInput] = useState('');
  
  const [contestants, setContestants] = useState([]);
  const [contestantInput, setContestantInput] = useState('');

  // Navigation state
  const [activeSection, setActiveSection] = useState('dashboard');

  // Scoring state
  const [showScoring, setShowScoring] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState(null);
  const [scoringData, setScoringData] = useState({});
  const [scores, setScores] = useState([]);
  const [scoringLoading, setScoringLoading] = useState(false);
  const [scoringError, setScoringError] = useState('');

  // Load initial data from backend
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        // Fetch all data from backend
        const [contestantsResponse, judgesResponse, categoriesResponse, criteriaResponse] = await Promise.all([
          fetch('http://localhost/Tabolator_Casestudy/backend/api/contestants'),
          fetch('http://localhost/Tabolator_Casestudy/backend/api/judges'),
          fetch('http://localhost/Tabolator_Casestudy/backend/api/categories'),
          fetch('http://localhost/Tabolator_Casestudy/backend/api/criteria')
        ]);

        const contestantsData = await contestantsResponse.json();
        const judgesData = await judgesResponse.json();
        const categoriesData = await categoriesResponse.json();
        const criteriaData = await criteriaResponse.json();

        // Set state with real data
        setCategories(categoriesData.data || []);
        setJudges(judgesData.data || []);
        setContestants(contestantsData.data || []);
        setCriteria(criteriaData.data || []);
        
      } catch (error) {
        console.error('Failed to load initial data:', error);
      }
    };

    loadInitialData();
  }, []);

  // Admin authentication
  const handleAdminAuth = () => {
    // Simple PIN authentication (in production, this should be secure)
    const adminPin = '1234'; // Change this in production
    if (authPin === adminPin) {
      setIsAdmin(true);
      setShowAuth(false);
    } else {
      alert('Invalid PIN. Please try again.');
    }
  };

  // Judge authentication
  const handleJudgeLogin = async (e) => {
    e.preventDefault();
    
    if (!judgePin.trim()) {
      setError(language === 'tl' ? 'Mangyaring kang PIN' : 'Please enter your PIN');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Call appropriate login API based on login type
      const response = await fetch('http://localhost/Tabolator_Casestudy/backend/api/judge-login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pin: judgePin }),
      });

      const data = await response.json();

      if (data.success) {
        // Login successful - call to appropriate handler
        setCurrentJudge(data.judge);
        setShowJudgeLogin(false);
        setShowAuth(false);
        setJudgePin('');
      } else {
        setError(language === 'tl' ? 'Maling PIN' : data.message || 'Invalid PIN');
      }
    } catch (err) {
      setError(language === 'tl' ? 'Network error. Subukan muli.' : 'Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowAuth(true);
    setCurrentJudge(null);
    setShowJudgeLogin(false);
    setAuthPin('');
  };

  const handleInfoModal = () => {
    setShowInfoModal(true);
  };

  const handleCloseModal = () => {
    setShowInfoModal(false);
  };

  const handleBackToAuth = () => {
    setShowAuth(true);
    setShowJudgeLogin(false);
    setCurrentJudge(null);
  };

  // Category functions
  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      const newCategory = {
        id: Date.now(),
        name: categoryInput
      };
      setCategories([...categories, newCategory]);
      setCategoryInput('');
      
      // Also add to backend
      fetch('http://localhost/Tabolator_Casestudy/backend/api/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: categoryInput })
      });
    }
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
    
    // Also delete from backend
    fetch(`http://localhost/Tabolator_Casestudy/backend/api/categories?id=${id}`, {
      method: 'DELETE'
    });
  };

  // Criteria functions
  const handleAddCriteria = () => {
    if (criteriaInput.name && criteriaInput.percentage && criteriaInput.min && criteriaInput.max) {
      const selectedCat = categories.find(cat => cat.name === selectedCategory);
      const newCriterion = {
        id: Date.now(),
        category_id: selectedCat?.id || 1,
        name: criteriaInput.name,
        percentage: criteriaInput.percentage,
        min_score: criteriaInput.min,
        max_score: criteriaInput.max
      };
      setCriteria([...criteria, newCriterion]);
      setCriteriaInput({ name: '', percentage: '', min: '', max: '' });
      
      // Also add to backend
      fetch('http://localhost/Tabolator_Casestudy/backend/api/criteria', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          category_id: selectedCat?.id || 1,
          name: criteriaInput.name,
          percentage: criteriaInput.percentage,
          min_score: criteriaInput.min,
          max_score: criteriaInput.max
        })
      });
    }
  };

  const handleDeleteCriteria = (id) => {
    setCriteria(criteria.filter(crit => crit.id !== id));
    
    // Also delete from backend
    fetch(`http://localhost/Tabolator_Casestudy/backend/api/criteria?id=${id}`, {
      method: 'DELETE'
    });
  };

  // Judges functions
  const handleAddJudge = () => {
    if (judgeInput.trim()) {
      const pin = Math.floor(1000 + Math.random() * 9000).toString();
      const newJudge = {
        id: Date.now(),
        name: judgeInput,
        pin: pin
      };
      setJudges([...judges, newJudge]);
      setJudgeInput('');
      
      // Also add to backend
      fetch('http://localhost/Tabolator_Casestudy/backend/api/judges', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: judgeInput })
      });
    }
  };

  const handleDeleteJudge = (id) => {
    setJudges(judges.filter(judge => judge.id !== id));
    
    // Also delete from backend
    fetch(`http://localhost/Tabolator_Casestudy/backend/api/judges?id=${id}`, {
      method: 'DELETE'
    });
  };

  // Contestants functions
  const handleAddContestant = () => {
    if (contestantInput.trim()) {
      const newContestant = {
        id: Date.now(),
        name: contestantInput,
        status: 'Active'
      };
      setContestants([...contestants, newContestant]);
      setContestantInput('');
      
      // Also add to backend
      fetch('http://localhost/Tabolator_Casestudy/backend/api/contestants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name: contestantInput })
      });
    }
  };

  const handleEliminateContestant = (id) => {
    setContestants(contestants.map(con => 
      con.id === id ? { ...con, status: 'Eliminated' } : con
    ));
    
    // Also update in backend
    fetch(`http://localhost/Tabolator_Casestudy/backend/api/contestants`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, status: 'Eliminated' })
    });
  };

  const handleDisqualifyContestant = (id) => {
    setContestants(contestants.map(con => 
      con.id === id ? { ...con, status: 'Disqualified' } : con
    ));
    
    // Also update in backend
    fetch(`http://localhost/Tabolator_Casestudy/backend/api/contestants`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: id, status: 'Disqualified' })
    });
  };

  // Scoring functions
  const handleStartScoring = (contestant) => {
    setSelectedContestant(contestant);
    setShowScoring(true);
    setScoringError('');
    
    // Initialize scoring data with existing scores
    const initialScoring = {};
    criteria.forEach(criterion => {
      initialScoring[criterion.id] = '';
    });
    setScoringData(initialScoring);
    
    // Load existing scores for this contestant and judge
    loadExistingScores(contestant.id);
  };

  const loadExistingScores = async (contestantId) => {
    try {
      const response = await fetch(`http://localhost/Tabolator_Casestudy/backend/api/scores?judge_id=${currentJudge.id}&contestant_id=${contestantId}`);
      const data = await response.json();
      
      if (data.success) {
        const existingScores = {};
        data.data.forEach(score => {
          existingScores[score.criterion_id] = score.score;
        });
        setScoringData(existingScores);
      }
    } catch (err) {
      console.error('Failed to load existing scores:', err);
    }
  };

  const handleScoreChange = (criterionId, value) => {
    // Validate score is within range
    const criterion = criteria.find(c => c.id === criterionId);
    if (criterion) {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= criterion.min && numValue <= criterion.max) {
        setScoringData(prev => ({
          ...prev,
          [criterionId]: numValue
        }));
      } else if (value === '') {
        setScoringData(prev => ({
          ...prev,
          [criterionId]: ''
        }));
      }
    }
  };

  const handleSubmitScores = async () => {
    setScoringLoading(true);
    setScoringError('');
    
    try {
      // Validate all required scores are filled
      const unfilledCriteria = criteria.filter(criterion => !scoringData[criterion.id]);
      if (unfilledCriteria.length > 0) {
        setScoringError(`Please provide scores for all criteria. Missing: ${unfilledCriteria.map(c => c.name).join(', ')}`);
        setScoringLoading(false);
        return;
      }

      // Submit each score
      const scorePromises = criteria.map(criterion => {
        return fetch('http://localhost/Tabolator_Casestudy/backend/api/scores', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            judge_id: currentJudge.id,
            contestant_id: selectedContestant.id,
            criterion_id: criterion.id,
            score: scoringData[criterion.id]
          })
        });
      });

      await Promise.all(scorePromises);
      
      alert('Scores submitted successfully!');
      setShowScoring(false);
      setSelectedContestant(null);
      setScoringData({});
      
    } catch (err) {
      setScoringError('Failed to submit scores. Please try again.');
      console.error('Score submission error:', err);
    } finally {
      setScoringLoading(false);
    }
  };

  const handleCloseScoring = () => {
    setShowScoring(false);
    setSelectedContestant(null);
    setScoringData({});
    setScoringError('');
  };

  const handleDeleteContestant = (id) => {
    setContestants(contestants.filter(con => con.id !== id));
    
    // Also delete from backend
    fetch(`http://localhost/Tabolator_Casestudy/backend/api/contestants?id=${id}`, {
      method: 'DELETE'
    });
  };

  return (
    <div className="App">
      {showAuth ? (
        // Authentication Screen - Choose Login Type
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header">
              <div className="header-icon clickable" onClick={handleInfoModal}>
                <i className="fi fi-rr-shield-check"></i>
              </div>
              <h1>Tabulator System</h1>
              <p>Choose your login type</p>
            </div>
            <div className="auth-options">
              <div className="auth-option" onClick={() => setShowJudgeLogin(false)}>
                <div className="option-icon">
                  <i className="fi fi-rr-shield-check"></i>
                </div>
                <div className="option-content">
                  <h3>Admin Access</h3>
                  <p>System administrator login</p>
                </div>
              </div>
              
              <div className="auth-option" onClick={() => setShowJudgeLogin(true)}>
                <div className="option-icon">
                  <i className="fi fi-rr-user"></i>
                </div>
                <div className="option-content">
                  <h3>Judge Login</h3>
                  <p>Enter your judge PIN</p>
                </div>
              </div>
            </div>

            {!showJudgeLogin ? (
              // Admin Login Form
              <div className="auth-form">
                <label htmlFor="adminPin">Enter Admin PIN:</label>
                <input
                  type="password"
                  id="adminPin"
                  value={authPin}
                  onChange={(e) => setAuthPin(e.target.value)}
                  placeholder="Enter 4-digit PIN"
                  maxLength="4"
                  onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
                />
                <button className="auth-submit-btn" onClick={handleAdminAuth}>
                  <i className="fi fi-rr-lock"></i>
                  Login as Admin
                </button>
              </div>
            ) : (
              // Judge Login Form - Same design as admin
              <div className="auth-form">
                <label htmlFor="judgePin">{language === 'tl' ? 'Enter Judge PIN:' : 'Enter Judge PIN:'}</label>
                <input
                  type="password"
                  id="judgePin"
                  value={judgePin}
                  onChange={(e) => setJudgePin(e.target.value)}
                  placeholder={language === 'tl' ? 'Enter 4-digit PIN' : 'Enter 4-digit PIN'}
                  maxLength="4"
                  onKeyPress={(e) => e.key === 'Enter' && handleJudgeLogin(e)}
                />
                <button className="auth-submit-btn" onClick={handleJudgeLogin}>
                  <i className="fi fi-rr-lock"></i>
                  {language === 'tl' ? 'Login as Judge' : 'Login as Judge'}
                </button>
                {error && <div className="error-message">{error}</div>}
              </div>
            )}
            
            <div className="auth-footer">
              <p>{language === 'tl' ? 'Default Admin PIN: 1234' : 'Default Admin PIN: 1234'}</p>
              <p className="security-note">{language === 'tl' ? '⚠️ Baguhin ito sa production' : '⚠️ Change this in production'}</p>
              <div className="demo-pins">
                <p><strong>{language === 'tl' ? 'Demo Judge PINs:' : 'Demo Judge PINs:'}</strong> 2847, 9156, 3729, 6481</p>
              </div>
            </div>
          </div>
        </div>
      ) : isAdmin ? (
        // Admin Dashboard
        <>
          <header className="App-header">
            <h1>Tabulator System</h1>
            <div className="header-controls">
              <nav className="nav-menu">
                <button 
                  className={`nav-btn ${activeSection === 'dashboard' ? 'active' : ''}`}
                  onClick={() => setActiveSection('dashboard')}
                >
                  <i className="fi fi-rr-dashboard"></i>
                  Dashboard
                </button>
                <button 
                  className={`nav-btn ${activeSection === 'category' ? 'active' : ''}`}
                  onClick={() => setActiveSection('category')}
                >
                  <i className="fi fi-rr-folder"></i>
                  Categories
                </button>
                <button 
                  className={`nav-btn ${activeSection === 'criteria' ? 'active' : ''}`}
                  onClick={() => setActiveSection('criteria')}
                >
                  <i className="fi fi-rr-chart-pie"></i>
                  Criteria
                </button>
                <button 
                  className={`nav-btn ${activeSection === 'judges' ? 'active' : ''}`}
                  onClick={() => setActiveSection('judges')}
                >
                  <i className="fi fi-rr-users"></i>
                  Judges
                </button>
                <button 
                  className={`nav-btn ${activeSection === 'contestants' ? 'active' : ''}`}
                  onClick={() => setActiveSection('contestants')}
                >
                  <i className="fi fi-rr-star"></i>
                  Contestants
                </button>
              </nav>
              <button className="logout-btn" onClick={handleLogout} title="Logout">
                <i className="fi fi-rr-sign-out"></i>
              </button>
            </div>
          </header>
          <main className="App-main">
            
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && <Dashboard />}

            {/* Adding Category Section */}
            {activeSection === 'category' && (
              <section className="section">
                <h2>Adding Category</h2>
                <div className="table-container">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category, index) => (
                        <tr key={category.id}>
                          <td>{index + 1}</td>
                          <td>{category.name}</td>
                          <td>
                            <button className="action-btn edit-btn" title="Edit">
                              <i className="fi fi-rr-edit"></i>
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteCategory(category.id)} title="Delete">
                              <i className="fi fi-rr-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter category name"
                    value={categoryInput}
                    onChange={(e) => setCategoryInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddCategory()}
                  />
                  <button className="submit-btn" onClick={handleAddCategory}>Submit</button>
                </div>
              </section>
            )}

            {/* Adding Criteria Section */}
            {activeSection === 'criteria' && (
              <section className="section">
                <h2>Adding Criteria</h2>
                <div className="category-selector">
                  <label>Category: </label>
                  <select 
                    value={selectedCategory} 
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="category-select"
                  >
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
                      {criteria.filter(crit => crit.category === selectedCategory).map((criterion) => (
                        <tr key={criterion.id}>
                          <td>{criterion.name}</td>
                          <td>{criterion.percentage}%</td>
                          <td>{criterion.min}</td>
                          <td>{criterion.max}</td>
                          <td>
                            <button className="action-btn edit-btn" title="Edit">
                              <i className="fi fi-rr-edit"></i>
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteCriteria(criterion.id)} title="Delete">
                              <i className="fi fi-rr-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="input-group">
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
                  <button className="submit-btn" onClick={handleAddCriteria}>Submit</button>
                </div>
              </section>
            )}

            {/* Adding Judges Section */}
            {activeSection === 'judges' && (
              <section className="section">
                <h2>Adding Judges</h2>
                <div className="table-container">
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
                            <button className="action-btn edit-btn" title="Edit">
                              <i className="fi fi-rr-edit"></i>
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteJudge(judge.id)} title="Delete">
                              <i className="fi fi-rr-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter judge name"
                    value={judgeInput}
                    onChange={(e) => setJudgeInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddJudge()}
                  />
                  <button className="submit-btn" onClick={handleAddJudge}>Submit</button>
                </div>
                <div className="notes">
                  <p>Note: Arrange the order of judges</p>
                  <p>Note: Generates a new 4-digit PIN</p>
                </div>
              </section>
            )}

            {/* Adding Contestants Section */}
            {activeSection === 'contestants' && (
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
                        <tr key={contestant.id}>
                          <td>{index + 1}</td>
                          <td>{contestant.name}</td>
                          <td className={`status ${contestant.status.toLowerCase()}`}>{contestant.status}</td>
                          <td>
                            <button className="action-btn edit-btn" title="Edit">
                              <i className="fi fi-rr-edit"></i>
                            </button>
                            <button className="action-btn eliminate-btn" onClick={() => handleEliminateContestant(contestant.id)} title="Eliminate">
                              <i className="fi fi-rr-cross-small"></i>
                            </button>
                            <button className="action-btn disqualify-btn" onClick={() => handleDisqualifyContestant(contestant.id)} title="Disqualify">
                              <i className="fi fi-rr-exclamation"></i>
                            </button>
                            <button className="action-btn delete-btn" onClick={() => handleDeleteContestant(contestant.id)} title="Delete">
                              <i className="fi fi-rr-trash"></i>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <div className="input-group">
                  <input
                    type="text"
                    placeholder="Enter contestant name"
                    value={contestantInput}
                    onChange={(e) => setContestantInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleAddContestant()}
                  />
                  <button className="submit-btn" onClick={handleAddContestant}>Submit</button>
                </div>
                <div className="notes">
                  <p>Note: Arrange the order of contestants</p>
                  <p>Note: Eliminates the Contestant</p>
                  <p>Note: Disqualifies the Contestant</p>
                </div>
              </section>
            )}

          </main>
        </>
      ) : (
        // Judge Dashboard
        <>
          <header className="App-header">
            <h1>Tabulator System</h1>
            <div className="header-controls">
              <div className="judge-info">
                <div className="judge-avatar">
                  <i className="fi fi-rr-user"></i>
                </div>
                <div className="judge-details">
                  <span className="judge-name">{currentJudge?.name}</span>
                  <span className="judge-role">Judge</span>
                </div>
              </div>
              <button className="logout-btn" onClick={handleLogout} title="Logout">
                <i className="fi fi-rr-sign-out"></i>
                Logout
              </button>
            </div>
          </header>
          <main className="App-main">
            <div className="judge-dashboard">
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fi fi-rr-users"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{contestants.filter(c => c.status === 'Active').length}</h3>
                    <p>Active Contestants</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fi fi-rr-chart-pie"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{criteria.length}</h3>
                    <p>Scoring Criteria</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fi fi-rr-trophy"></i>
                  </div>
                  <div className="stat-info">
                    <h3>{categories.length}</h3>
                    <p>Categories</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fi fi-rr-check"></i>
                  </div>
                  <div className="stat-info">
                    <h3>0</h3>
                    <p>Scores Submitted</p>
                  </div>
                </div>
              </div>

              <div className="welcome-section">
                <div className="welcome-content">
                  <h2>Welcome, {currentJudge?.name}</h2>
                  <p>You are logged in as a judge for the current competition</p>
                  <div className="judge-actions">
                    <button className="primary-action-btn" onClick={() => {
                    const activeContestants = contestants.filter(c => c.status === 'Active');
                    if (activeContestants.length === 0) {
                      alert('No active contestants available for scoring');
                    } else {
                      alert('Please select a contestant to score from the list below');
                    }
                  }}>
                    <i className="fi fi-rr-star"></i>
                    Start Scoring
                  </button>
                    <button className="secondary-action-btn" onClick={() => alert('Viewing scores...')}>
                      <i className="fi fi-rr-chart-pie"></i>
                      View Scores
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="content-sections">
                <div className="section-card">
                  <div className="section-header">
                    <h3>
                      <i className="fi fi-rr-users"></i>
                      Contestants
                    </h3>
                    <button className="view-all-btn" onClick={() => alert('Viewing all contestants...')}>
                      View All
                    </button>
                  </div>
                  <div className="section-content">
                    <div className="contestant-list">
                      {contestants.filter(c => c.status === 'Active').slice(0, 4).map((contestant, index) => (
                        <div key={contestant.id} className="contestant-item">
                          <div className="contestant-number">{index + 1}</div>
                          <div className="contestant-info">
                            <h4>{contestant.name}</h4>
                            <span className="status-badge active">Active</span>
                          </div>
                          <button className="score-btn" onClick={() => handleStartScoring(contestant)}>
                            <i className="fi fi-rr-edit"></i>
                          </button>
                        </div>
                      ))}
                    </div>
                    {contestants.filter(c => c.status === 'Active').length > 4 && (
                      <p className="more-text">
                        +{contestants.filter(c => c.status === 'Active').length - 4} more contestants
                      </p>
                    )}
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <h3>
                      <i className="fi fi-rr-chart-pie"></i>
                      Scoring Criteria
                    </h3>
                    <button className="view-all-btn" onClick={() => alert('Viewing all criteria...')}>
                      View All
                    </button>
                  </div>
                  <div className="section-content">
                    <div className="criteria-list">
                      {criteria.slice(0, 3).map((criterion) => (
                        <div key={criterion.id} className="criteria-item">
                          <div className="criteria-info">
                            <h4>{criterion.name}</h4>
                            <div className="criteria-details">
                              <span className="criteria-percentage">{criterion.percentage}%</span>
                              <span className="criteria-range">{criterion.min_score}-{criterion.max_score}</span>
                            </div>
                          </div>
                          <div className="criteria-category">
                            {categories.find(cat => cat.id === criterion.category_id)?.name || 'Unknown'}
                          </div>
                        </div>
                      ))}
                    </div>
                    {criteria.length > 3 && (
                      <p className="more-text">
                        +{criteria.length - 3} more criteria
                      </p>
                    )}
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <h3>
                      <i className="fi fi-rr-folder"></i>
                      Categories
                    </h3>
                    <button className="view-all-btn" onClick={() => alert('Viewing all categories...')}>
                      View All
                    </button>
                  </div>
                  <div className="section-content">
                    <div className="category-grid">
                      {categories.map((category) => (
                        <div key={category.id} className="category-item">
                          <div className="category-icon">
                            <i className="fi fi-rr-star"></i>
                          </div>
                          <div className="category-info">
                            <h4>{category.name}</h4>
                            <span className="category-count">
                              {criteria.filter(c => c.category_id === category.id).length} criteria
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="section-card">
                  <div className="section-header">
                    <h3>
                      <i className="fi fi-rr-clock"></i>
                      Recent Activity
                    </h3>
                    <button className="view-all-btn" onClick={() => alert('Viewing all activities...')}>
                      View All
                    </button>
                  </div>
                  <div className="section-content">
                    <div className="activity-list">
                      <div className="activity-item">
                        <div className="activity-icon success">
                          <i className="fi fi-rr-check"></i>
                        </div>
                        <div className="activity-info">
                          <p>Score submitted for Sarah Martinez</p>
                          <span className="activity-time">2 minutes ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon info">
                          <i className="fi fi-rr-star"></i>
                        </div>
                        <div className="activity-info">
                          <p>Talent round completed</p>
                          <span className="activity-time">15 minutes ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon warning">
                          <i className="fi fi-rr-exclamation"></i>
                        </div>
                        <div className="activity-info">
                          <p>Emily Rodriguez eliminated</p>
                          <span className="activity-time">1 hour ago</span>
                        </div>
                      </div>
                      <div className="activity-item">
                        <div className="activity-icon success">
                          <i className="fi fi-rr-users"></i>
                        </div>
                        <div className="activity-info">
                          <p>New contestant registered</p>
                          <span className="activity-time">2 hours ago</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="quick-actions-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button className="quick-action-btn" onClick={() => alert('Opening scoring panel...')}>
                    <i className="fi fi-rr-edit"></i>
                    <span>Score Contestant</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => alert('Viewing rankings...')}>
                    <i className="fi fi-rr-trophy"></i>
                    <span>View Rankings</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => alert('Exporting scores...')}>
                    <i className="fi fi-rr-file-export"></i>
                    <span>Export Scores</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => alert('Opening settings...')}>
                    <i className="fi fi-rr-settings"></i>
                    <span>Settings</span>
                  </button>
                </div>
              </div>
            </div>
          </main>
        </>
      )}
      
      {/* Scoring Modal */}
      {showScoring && selectedContestant && (
        <div className="scoring-overlay">
          <div className="scoring-modal">
            <div className="scoring-header">
              <h2>Score: {selectedContestant.name}</h2>
              <button className="close-btn" onClick={handleCloseScoring}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            
            <div className="scoring-content">
              {scoringError && (
                <div className="error-message scoring-error">
                  {scoringError}
                </div>
              )}
              
              {/* Total Percentage Display */}
              <div className="total-percentage-display">
                <div className="total-info">
                  <h4>Scoring Breakdown</h4>
                  <p>Total Weight: {criteria.reduce((sum, c) => sum + parseFloat(c.percentage), 0).toFixed(2)}%</p>
                </div>
                <div className="progress-bar">
                  <div 
                    className="progress-fill" 
                    style={{ width: `${Math.min(criteria.reduce((sum, c) => sum + parseFloat(c.percentage), 0), 100)}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="criteria-list">
                {criteria.map(criterion => (
                  <div key={criterion.id} className="scoring-criterion">
                    <div className="criterion-info">
                      <h4>{criterion.name}</h4>
                      <div className="criterion-details">
                        <span className="criterion-category">
                          {categories.find(cat => cat.id === criterion.category_id)?.name || 'Unknown'}
                        </span>
                        <span className="criterion-range">
                          {criterion.min} - {criterion.max}
                        </span>
                        <span className="criterion-percentage">
                          {criterion.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="score-input">
                      <input
                        type="number"
                        min={criterion.min}
                        max={criterion.max}
                        step="0.01"
                        value={scoringData[criterion.id] || ''}
                        onChange={(e) => handleScoreChange(criterion.id, e.target.value)}
                        placeholder={`Score (${criterion.min}-${criterion.max})`}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="scoring-footer">
              <button className="cancel-btn" onClick={handleCloseScoring}>
                Cancel
              </button>
              <button 
                className="submit-btn" 
                onClick={handleSubmitScores}
                disabled={scoringLoading}
              >
                {scoringLoading ? 'Submitting...' : 'Submit Scores'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;