import React, { useState, useEffect } from 'react';
import './App.css';
import './animations.css';
import { retryPOST, retryPUT, retryDELETE, retryGET } from './utils/retryHelper';
import { 
  handleAddCategory, 
  handleDeleteCategory,
  handleEditCategory,
  handleAddCriteria,
  handleEditCriteria,
  handleDeleteCriteria,
  handleAddJudge,
  handleDeleteJudge,
  handleEditJudge,
  handleAddContestant,
  handleDeleteContestant,
  handleEditContestant,
  handleEliminateContestant,
  handleDisqualifyContestant,
  refreshAllData,
  refreshCriteria,
} from './dataManagement';
import Dashboard from './components/Dashboard';
import PublicPage from './PublicPage';
import Category from './Category';
import Criteria from './Criteria';
import Judges from './Judges';
import Contestants from './Contestants';
import Contestant from './Contestant';
import Sidebar from './Sidebar';
import AlertSystem from './components/AlertSystem';
import alertManager from './utils/alertManager';

function App() {
  // Authentication state
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = localStorage.getItem('isAdmin');
    return saved ? JSON.parse(saved) : false;
  });
  const [authPin, setAuthPin] = useState('');
  const [judgePin, setJudgePin] = useState('');
  const [showJudgePin, setShowJudgePin] = useState(false);
  const [showAdminPin, setShowAdminPin] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAuth, setShowAuth] = useState(() => {
    const saved = localStorage.getItem('showAuth');
    return saved ? JSON.parse(saved) : false;
  });
  const [showPublicPage, setShowPublicPage] = useState(() => {
    const saved = localStorage.getItem('showPublicPage');
    return saved ? JSON.parse(saved) : true;
  });
  const [showJudgeLogin, setShowJudgeLogin] = useState(false);
  const [currentJudge, setCurrentJudge] = useState(() => {
    const saved = localStorage.getItem('currentJudge');
    return saved ? JSON.parse(saved) : null;
  });
  const [showInfoModal, setShowInfoModal] = useState(false);
  const [language, setLanguage] = useState('en'); // 'en' or 'tl'

  // Scoring state
  const [showScoringModal, setShowScoringModal] = useState(false);
  const [selectedContestant, setSelectedContestant] = useState(null);
  const [selectedScoringCategory, setSelectedScoringCategory] = useState('');
  const [scoringCriteria, setScoringCriteria] = useState([]);
  const [scores, setScores] = useState({});
  const [submittedScores, setSubmittedScores] = useState([]);
  const [scoringData, setScoringData] = useState({});
  const [scoringLoading, setScoringLoading] = useState(false);
  const [scoringError, setScoringError] = useState('');
  const [recentActivities, setRecentActivities] = useState([]);

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

  // Dashboard scores data
  const [dashboardScores, setDashboardScores] = useState([]);

  // Navigation state
  const [activeSection, setActiveSection] = useState(() => {
    const saved = localStorage.getItem('activeSection');
    return saved || 'dashboard';
  });

  // Save activeSection to localStorage
  useEffect(() => {
    localStorage.setItem('activeSection', activeSection);
  }, [activeSection]);

  // Notification state
  const [notification, setNotification] = useState(null);
  const [showContestantSelection, setShowContestantSelection] = useState(false);
  const [showJudgeContestantsModal, setShowJudgeContestantsModal] = useState(false);
  const [showJudgeCriteriaModal, setShowJudgeCriteriaModal] = useState(false);
  const [showJudgeCategoriesModal, setShowJudgeCategoriesModal] = useState(false);
  const [showJudgeRankingsModal, setShowJudgeRankingsModal] = useState(false);
  const [fullRankings, setFullRankings] = useState([]);
  const [showContestantScoresModal, setShowContestantScoresModal] = useState(false);
  const [contestantScores, setContestantScores] = useState([]);
  const [selectedContestantForScores, setSelectedContestantForScores] = useState(null);

  // Show notification function (using new alert system)
  const showNotification = (message, type = 'info', title = null) => {
    alertManager[type](title || type.charAt(0).toUpperCase() + type.slice(1), message);
  };

  // Load recent activities
  const loadRecentActivities = async () => {
    try {
      console.log('Loading recent activities for judge:', currentJudge?.id);
      
      // Get scores submitted by current judge with retry
      const scoresData = await retryGET(`http://localhost/Tabolator_Casestudy/backend/api/scores?judge_id=${currentJudge?.id}`);
      console.log('Scores data received:', scoresData);
      
      // Get all contestants for activity context with retry
      const contestantsData = await retryGET('http://localhost/Tabolator_Casestudy/backend/api/contestants');
      console.log('Contestants data received:', contestantsData);
      
      const activities = [];
      
      // Process scores into activities
      if (scoresData.success && scoresData.data) {
        console.log('Processing scores:', scoresData.data.length, 'scores');
        scoresData.data.forEach(score => {
          const contestant = contestantsData.data?.find(c => c.id === score.contestant_id);
          if (contestant) {
            console.log('Found contestant for score:', contestant.name, 'ID:', score.contestant_id);
            
            // Get the criterion for this score
            const criterion = criteria.find(c => c.id === score.criterion_id);
            const criterionName = criterion ? criterion.name : 'Unknown';
            const scoreValue = score.score || '0';
            
            console.log('Score details:', {
              contestant: contestant.name,
              criterion: criterionName,
              score: scoreValue,
              timestamp: score.created_at || score.timestamp
            });
            
            activities.push({
              id: score.id,
              type: 'score_submitted',
              message: `Score submitted for ${contestant.name}`,
              details: `${criterionName}: ${scoreValue}%`,
              timestamp: score.created_at || score.timestamp,
              date: new Date(score.created_at || score.timestamp).toLocaleDateString(),
              time: new Date(score.created_at || score.timestamp).toLocaleTimeString(),
              icon: 'fi-rr-check',
              color: 'success'
            });
          } else {
            console.log('No contestant found for score ID:', score.contestant_id);
          }
        });
        console.log('Activities created:', activities.length, 'activities');
      } else {
        console.log('No scores data received');
      }
      
      // Add contestant status changes
      if (contestantsData.success && contestantsData.data) {
        console.log('Processing contestant status changes...');
        contestantsData.data.forEach(contestant => {
          if (contestant.status === 'Eliminated' && contestant.updated_at) {
            activities.push({
              id: `elim_${contestant.id}`,
              type: 'eliminated',
              message: `${contestant.name} eliminated`,
              details: 'Status changed to Eliminated',
              timestamp: contestant.updated_at,
              icon: 'fi-rr-exclamation',
              color: 'warning'
            });
          } else if (contestant.status === 'Disqualified' && contestant.updated_at) {
            activities.push({
              id: `disq_${contestant.id}`,
              type: 'disqualified',
              message: `${contestant.name} disqualified`,
              details: 'Status changed to Disqualified',
              timestamp: contestant.updated_at,
              icon: 'fi-rr-cross-circle',
              color: 'error'
            });
          }
        });
      } else {
        console.log('No contestants data received');
      }
      
      // Sort by timestamp (most recent first) and take latest 5
      const sortedActivities = activities
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 5);
      
      console.log('Final activities to display:', sortedActivities);
      setRecentActivities(sortedActivities);
    } catch (error) {
      console.error('Failed to load recent activities:', error);
      // Set empty array on error
      setRecentActivities([]);
    }
  };

  // Load dashboard scores data
  const loadDashboardScores = async () => {
    try {
      console.log('Loading dashboard scores...');
      const scoresData = await retryGET('http://localhost/Tabolator_Casestudy/backend/api/scores');
      console.log('Dashboard scores API response:', scoresData);
      
      if (scoresData.success && scoresData.data) {
        const processedScores = scoresData.data.map(score => ({
          id: score.id,
          contestant_name: score.contestant_name || 'Unknown',
          category_name: score.category || 'Unknown', // API returns 'category' from criteria.category_name
          total_score: parseFloat(score.score) || 0,
          judge_name: score.judge_name || 'Unknown', // Now includes judge name from LEFT JOIN
          created_at: score.created_at || score.timestamp
        }));
        console.log('Processed dashboard scores:', processedScores.length, 'scores');
        setDashboardScores(processedScores);
      } else {
        console.log('No dashboard scores data received');
        setDashboardScores([]);
      }
    } catch (error) {
      console.error('Failed to load dashboard scores:', error);
      setDashboardScores([]);
    }
  };

  // Load initial data from backend
  useEffect(() => {
    const loadInitialData = async () => {
      await refreshAllData(setCategories, setCriteria, setJudges, setContestants);
      await loadDashboardScores();
    };

    loadInitialData();
  }, []);

  // Auto-refresh criteria when switching to criteria section
  useEffect(() => {
    if (activeSection === 'criteria') {
      refreshCriteria(setCriteria);
    }
  }, [activeSection]);

  // Load recent activities when judge is logged in
  useEffect(() => {
    if (currentJudge && currentJudge.id) {
      loadRecentActivities();
    }
  }, [currentJudge]);

  // Load detailed scores for specific contestant
  const loadContestantScores = async (contestantId) => {
    try {
      console.log('Loading scores for contestant:', contestantId);
      
      // Get all scores for specific contestant
      const scoresData = await retryGET(`http://localhost/Tabolator_Casestudy/backend/api/scores?contestant_id=${contestantId}&include=contestant,category,criteria,judge`);
      console.log('Contestant scores API response:', scoresData);
      
      if (scoresData.success && scoresData.data) {
        const scores = scoresData.data.map(score => ({
          rank: score.rank || 'N/A',
          contestant_id: score.contestant_id,
          contestant_name: score.contestant_name || 'Unknown',
          category_id: score.category_id,
          category_name: score.category_name || 'Unknown',
          criterion_id: score.criterion_id,
          criterion_name: score.criterion_name || 'Unknown',
          score: parseFloat(score.score) || 0,
          judge_name: score.judge_name || 'Unknown',
          created_at: score.created_at || score.timestamp
        }));
        
        console.log('Processed contestant scores:', scores.length, 'scores');
        setContestantScores(scores);
      } else {
        console.log('No scores data received for contestant');
        setContestantScores([]);
      }
    } catch (error) {
      console.error('Failed to load contestant scores:', error);
      setContestantScores([]);
    }
  };

  // Load full rankings for judge dashboard
  const loadFullRankings = async () => {
    try {
      console.log('Loading full rankings for judge:', currentJudge?.id);
      
      // Get all scores with contestant and category information
      const scoresData = await retryGET(`http://localhost/Tabolator_Casestudy/backend/api/scores?include=contestant,category,criteria,judge`);
      console.log('Full rankings API response:', scoresData);
      console.log('Full rankings success status:', scoresData?.success);
      console.log('Full rankings data length:', scoresData?.data?.length);
      
      if (scoresData.success && scoresData.data) {
        // Process the data to create comprehensive rankings
        const rankings = scoresData.data.map((score, index) => ({
          rank: index + 1,
          contestant_id: score.contestant_id,
          contestant_name: score.contestant_name || 'Unknown',
          category_id: score.category_id,
          category_name: score.category_name || 'Unknown',
          criterion_id: score.criterion_id,
          criterion_name: score.criterion_name || 'Unknown',
          score: parseFloat(score.score) || 0,
          judge_name: score.judge_name || 'Unknown',
          created_at: score.created_at || score.timestamp
        }));
        
        console.log('Processed rankings:', rankings.length, 'rankings');
        console.log('Sample ranking:', rankings[0]);
        setFullRankings(rankings);
      } else {
        console.log('No rankings data received or API error');
        setFullRankings([]);
      }
    } catch (error) {
      console.error('Failed to load full rankings:', error);
      setFullRankings([]);
    }
  };

  useEffect(() => {
    if (currentJudge && currentJudge.id) {
      loadFullRankings();
    }
  }, [currentJudge]);

  useEffect(() => {
    if (currentJudge && submittedScores.length > 0) {
      loadRecentActivities();
    }
  }, [submittedScores]);

  // Restore authentication state from localStorage on component mount
  useEffect(() => {
    const savedIsAdmin = localStorage.getItem('isAdmin');
    if (savedIsAdmin) {
      setIsAdmin(JSON.parse(savedIsAdmin));
    }
    
    const savedShowAuth = localStorage.getItem('showAuth');
    if (savedShowAuth) {
      setShowAuth(JSON.parse(savedShowAuth));
    }
    
    const savedShowPublicPage = localStorage.getItem('showPublicPage');
    if (savedShowPublicPage) {
      setShowPublicPage(JSON.parse(savedShowPublicPage));
    }
    
    const savedCurrentJudge = localStorage.getItem('currentJudge');
    if (savedCurrentJudge) {
      setCurrentJudge(JSON.parse(savedCurrentJudge));
    }
  }, []);

  // Save authentication state to localStorage
  useEffect(() => {
    localStorage.setItem('isAdmin', JSON.stringify(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    localStorage.setItem('showAuth', JSON.stringify(showAuth));
  }, [showAuth]);

  useEffect(() => {
    localStorage.setItem('showPublicPage', JSON.stringify(showPublicPage));
  }, [showPublicPage]);

  useEffect(() => {
    localStorage.setItem('currentJudge', JSON.stringify(currentJudge));
  }, [currentJudge]);

  // Format timestamp to relative time
  const formatRelativeTime = (timestamp) => {
    const now = new Date();
    const time = new Date(timestamp);
    const diffMs = now - time;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  // ================================
  // AUTHENTICATION FUNCTIONS
  // ================================

  // Admin authentication
  const handleAdminAuth = () => {
    // Simple PIN authentication (in production, this should be secure)
    const adminPin = '1234'; // Change this in production
    if (authPin === adminPin) {
      setIsAdmin(true);
      setShowAuth(false);
      alertManager.success('Login Successful', 'Welcome back, Admin!');
    } else {
      alertManager.error('Authentication Failed', 'Invalid PIN. Please try again.');
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
      // Call appropriate login API with retry
      const data = await retryPOST('http://localhost/Tabolator_Casestudy/backend/api/judge-login', {
        pin: judgePin.trim()
      });

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

  // ================================
  // UI HELPER FUNCTIONS
  // ================================

  const handleInfoModal = () => {
    setShowInfoModal(true);
  };

  const handleCloseModal = () => {
    setShowInfoModal(false);
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setShowAuth(true);
    setShowPublicPage(false);
    setCurrentJudge(null);
    // Clear localStorage
    localStorage.removeItem('isAdmin');
    localStorage.removeItem('showAuth');
    localStorage.removeItem('showPublicPage');
    localStorage.removeItem('currentJudge');
  };

  // ================================
  // SCORING FUNCTIONS
  // ================================

  // Scoring functions
  const handleStartScoring = (contestant) => {
    setSelectedContestant(contestant);
    setSelectedScoringCategory(''); // Reset category selection
    setScoringCriteria([]); // Clear previous criteria
    setScores({}); // Clear previous scores
    setShowScoringModal(true);
  };

  // Handle category selection in scoring
  const handleCategorySelection = (categoryName) => {
    setSelectedScoringCategory(categoryName);
    
    // Filter criteria for selected category
    const categoryCriteria = criteria.filter(c => c.category_name === categoryName);
    
    if (categoryCriteria.length === 0) {
      alertManager.warning('No Criteria', `No scoring criteria available for ${categoryName}. Please add criteria in the admin panel first.`);
      return;
    }
    
    // Load scoring criteria with fallback values
    const criteriaList = categoryCriteria.map(c => ({
      id: c.id,
      name: c.name,
      percentage: parseFloat(c.percentage) || 0,
      min: parseFloat(c.min_score) || 0,
      max: parseFloat(c.max_score) || 100,
      score: ''
    }));
    
    console.log('Processed criteria list:', criteriaList);
    setScoringCriteria(criteriaList);
    
    // Initialize scores object
    const initialScores = {};
    criteriaList.forEach(c => {
      initialScores[c.id] = '';
    });
    setScores(initialScores);
  };

  const handleScoreChange = (criteriaId, value) => {
    // Validate score is within range
    const criteriaItem = scoringCriteria.find(c => c.id === criteriaId);
    if (criteriaItem) {
      // Allow empty value or valid number within range
      if (value === '') {
        setScores(prev => ({
          ...prev,
          [criteriaId]: ''
        }));
        return;
      }
      
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= criteriaItem.min && numValue <= criteriaItem.max) {
        setScores(prev => ({
          ...prev,
          [criteriaId]: value
        }));
      }
    }
  };

  const calculateTotalScore = () => {
    let total = 0;
    scoringCriteria.forEach(criteria => {
      const score = parseFloat(scores[criteria.id]) || 0;
      const weightedScore = (score / criteria.max) * criteria.percentage;
      total += weightedScore;
    });
    return total.toFixed(2);
  };

  const handleSubmitScores = async () => {
    // Validate all scores are filled
    const allScoresFilled = scoringCriteria.every(c => scores[c.id] !== '');
    
    if (!allScoresFilled) {
      alertManager.warning('Incomplete Scores', 'Please fill in all scores before submitting');
      return;
    }
    
    try {
      // Submit each score individually with retry logic
      const scorePromises = Object.entries(scores).map(async ([criterionId, scoreValue]) => {
        const scoreData = {
          judge_id: currentJudge.id,
          contestant_id: selectedContestant.id,
          criterion_id: parseInt(criterionId),
          score: parseFloat(scoreValue)
        };
        
        // Use retryPOST for each score submission
        return await retryPOST('http://localhost/Tabolator_Casestudy/backend/api/scores', scoreData);
      });
      
      // Wait for all scores to be submitted
      const results = await Promise.all(scorePromises);
      
      // Check if all submissions were successful
      const failedSubmissions = results.filter(result => !result.success);
      if (failedSubmissions.length > 0) {
        throw new Error(failedSubmissions[0].message || 'Some scores failed to submit');
      }
      
      // Calculate total score for display
      const totalScore = calculateTotalScore();
      
      alertManager.success('Scores Submitted', `Scores for ${selectedContestant.name} in ${selectedScoringCategory} submitted successfully! Total Score: ${totalScore}%`);
      
      // Update submitted scores for tracking
      setSubmittedScores(prev => [...prev, {
        judgeId: currentJudge.id,
        contestantId: selectedContestant.id,
        categoryId: categories.find(c => c.name === selectedScoringCategory)?.id,
        categoryName: selectedScoringCategory,
        scores: scores,
        totalScore: totalScore,
        timestamp: new Date().toISOString()
      }]);
      
      // Close modal and reset state
      setShowScoringModal(false);
      setSelectedContestant(null);
      setSelectedScoringCategory('');
      setScoringCriteria([]);
      setScores({});
      
    } catch (error) {
      console.error('Error submitting scores:', error);
      alertManager.error('Submission Failed', `Failed to submit scores: ${error.message}`);
    }
  };

  const handleCloseScoring = () => {
    setShowScoringModal(false);
    setSelectedContestant(null);
    setSelectedScoringCategory('');
    setScoringCriteria([]);
    setScores({});
  };

  const handleBackToAuth = () => {
    setShowAuth(true);
    setShowJudgeLogin(false);
    setCurrentJudge(null);
  };

  const handleBackToLanding = () => {
    setShowPublicPage(true);
    setShowAuth(false);
    setShowJudgeLogin(false);
    setCurrentJudge(null);
    setAuthPin('');
    setJudgePin('');
  };

  // Category functions

  const handleShowAuth = () => {
    setShowPublicPage(false);
    setShowAuth(true);
  };

  return (
    <div className="App">
      {showPublicPage ? (
        <PublicPage onShowAuth={handleShowAuth} />
      ) : showAuth ? (
        // Authentication Screen - Choose Login Type
        <div className="auth-container">
          <div className="auth-card">
            <div className="auth-header" style={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}>
              
              <div>
                <a href="#" onClick={handleBackToLanding} className="back-link">
                  {language === 'tl' ? 'BACK TO HOME' : 'BACK TO HOME'}
                </a>
              </div>
              <h1 style={{textAlign: 'center', margin: 0, fontSize: '1.5rem'}}>Tabulator System</h1>
              <div className="header-icon clickable" onClick={handleInfoModal}>
                <i className="fi fi-rr-shield-check"></i>
              </div>
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
                <div className="pin-input-container">
                  <input
                    type={showAdminPin ? "text" : "password"}
                    id="adminPin"
                    value={authPin}
                    onChange={(e) => setAuthPin(e.target.value)}
                    placeholder="Enter 4-digit PIN"
                    maxLength="4"
                    onKeyPress={(e) => e.key === 'Enter' && handleAdminAuth()}
                  />
                  <button 
                    type="button"
                    className="show-pin-btn"
                    onClick={() => setShowAdminPin(!showAdminPin)}
                    title={showAdminPin ? "Hide PIN" : "Show PIN"}
                  >
                    <i className={showAdminPin ? "fi fi-rr-eye-slash" : "fi fi-rr-eye"}></i>
                  </button>
                </div>
                <button className="auth-submit-btn" onClick={handleAdminAuth}>
                  <i className="fi fi-rr-lock"></i>
                  Login as Admin
                </button>
              </div>
            ) : (
              // Judge Login Form - Same design as admin
              <div className="auth-form">
                <label htmlFor="judgePin">{language === 'tl' ? 'Enter Judge PIN:' : 'Enter Judge PIN:'}</label>
                <div className="pin-input-container">
                  <input
                    type={showJudgePin ? "text" : "password"}
                    id="judgePin"
                    value={judgePin}
                    onChange={(e) => setJudgePin(e.target.value)}
                    placeholder={language === 'tl' ? 'Enter 4-digit PIN' : 'Enter 4-digit PIN'}
                    maxLength="4"
                    onKeyPress={(e) => e.key === 'Enter' && handleJudgeLogin(e)}
                  />
                  <button 
                    type="button"
                    className="show-pin-btn"
                    onClick={() => setShowJudgePin(!showJudgePin)}
                    title={showJudgePin ? (language === 'tl' ? 'Itago ang PIN' : 'Hide PIN') : (language === 'tl' ? 'Ipakita ang PIN' : 'Show PIN')}
                  >
                    <i className={showJudgePin ? "fi fi-rr-eye-slash" : "fi fi-rr-eye"}></i>
                  </button>
                </div>
                <button className="auth-submit-btn" onClick={handleJudgeLogin}>
                  <i className="fi fi-rr-lock"></i>
                  {language === 'tl' ? 'Login as Judge' : 'Login as Judge'}
                </button>
                {error && <div className="error-message">{error}</div>}
              </div>
            )}
            
            {/* <div className="auth-footer">
              <p>{language === 'tl' ? 'Default Admin PIN: 1234' : 'Default Admin PIN: 1234'}</p>
              <p className="security-note">{language === 'tl' ? '⚠️ Baguhin ito sa production' : '⚠️ Change this in production'}</p>
              <div className="demo-pins">
                <p><strong>{language === 'tl' ? 'Demo Judge PINs:' : 'Demo Judge PINs:'}</strong> 2847, 9156, 3729, 6481</p>
              </div>
            </div> */}

            
          </div>
        </div>
      ) : isAdmin ? (
        // Admin Dashboard
        <>
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isAdmin={isAdmin}
            currentJudge={currentJudge}
            handleLogout={handleLogout}
          />
          <main className="App-main">
            
            {/* Dashboard Section */}
            {activeSection === 'dashboard' && (
              <Dashboard 
                contestants={contestants}
                judges={judges}
                categories={categories}
                criteria={criteria}
                scores={dashboardScores}
                setActiveSection={setActiveSection}
              />
            )}

            {/* Adding Category Section */}
            {activeSection === 'category' && (
              <Category
                categories={categories}
                setCategories={setCategories}
                categoryInput={categoryInput}
                setCategoryInput={setCategoryInput}
                handleAddCategory={() => handleAddCategory(categoryInput, categories, setCategories, setCategoryInput)}
                handleDeleteCategory={(id) => handleDeleteCategory(id, categories, setCategories)}
                criteria={criteria} // Pass criteria for counting
              />
            )}

            {/* Adding Criteria Section */}
            {activeSection === 'criteria' && (
              <Criteria
                categories={categories}
                criteria={criteria}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                criteriaInput={criteriaInput}
                setCriteriaInput={setCriteriaInput}
                setCriteria={setCriteria}
                handleAddCriteria={async () => {
                  await handleAddCriteria(
                    criteriaInput,
                    selectedCategory,
                    categories,
                    criteria,
                    setCriteria,
                    setCriteriaInput
                  );
                }}
                handleEditCriteria={handleEditCriteria}
                handleDeleteCriteria={async (id) => {
                  await handleDeleteCriteria(id, setCriteria);
                }}
              />
            )}

            {/* Adding Judges Section */}
            {activeSection === 'judges' && (
              <Judges
                judges={judges}
                setJudges={setJudges}
                judgeInput={judgeInput}
                setJudgeInput={setJudgeInput}
                handleAddJudge={async (judgeName, customPin) => {
                  await handleAddJudge(judgeName, judges, setJudges, setJudgeInput, customPin);
                }}
                handleDeleteJudge={async (id) => {
                  await handleDeleteJudge(id, judges, setJudges);
                }}
                handleEditJudge={(judge) => {
                  handleEditJudge(judge, setJudgeInput);
                }}
              />
            )}

            {/* Adding Contestants Section */}
            {activeSection === 'contestants' && (
              <Contestants
                contestants={contestants}
                contestantInput={contestantInput}
                setContestantInput={setContestantInput}
                setContestants={setContestants}
                handleAddContestant={async () => {
                  await handleAddContestant(contestantInput, contestants, setContestants, setContestantInput);
                }}
                handleDeleteContestant={async (id) => {
                  await handleDeleteContestant(id, contestants, setContestants);
                }}
                handleEliminateContestant={async (id) => {
                  await handleEliminateContestant(id, contestants, setContestants);
                }}
                handleDisqualifyContestant={async (id) => {
                  await handleDisqualifyContestant(id, contestants, setContestants);
                }}
                handleEditContestant={(contestant) => {
                  handleEditContestant(contestant, setContestantInput);
                }}
              />
            )}

          </main>
        </>
      ) : (
        // Judge Dashboard
        <>
          <Sidebar 
            activeSection={activeSection}
            setActiveSection={setActiveSection}
            isAdmin={isAdmin}
            currentJudge={currentJudge}
            handleLogout={handleLogout}
          />
          <main className="App-main">
            <div className="judge-dashboard">
              <div className="container-fluid">
                {/* Welcome Header */}
                <div className="row mb-4">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <div className="d-flex align-items-center justify-content-between">
                          <div>
                            <h2 className="mb-1">Welcome, {currentJudge?.name}</h2>
                            <p className="text-muted mb-0">You are logged in as a judge for the current competition</p>
                          </div>
                          <div className="text-end">
                            <span className="badge bg-success fs-6">
                              <i className="bi bi-shield-check me-1"></i>
                              Judge
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Stats Cards */}
                <div className="row mb-4">
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="bg-primary bg-opacity-10 rounded-circle p-3">
                              <i className="bi bi-people-fill text-primary fs-4"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h3 className="mb-1">{contestants.length}</h3>
                            <p className="text-muted mb-0">Contestants</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="bg-info bg-opacity-10 rounded-circle p-3">
                              <i className="bi bi-list-check text-info fs-4"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h3 className="mb-1">{criteria.length}</h3>
                            <p className="text-muted mb-0">Criteria</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="bg-warning bg-opacity-10 rounded-circle p-3">
                              <i className="bi bi-trophy-fill text-warning fs-4"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h3 className="mb-1">{categories.length}</h3>
                            <p className="text-muted mb-0">Categories</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-3 mb-3">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body">
                        <div className="d-flex align-items-center">
                          <div className="flex-shrink-0">
                            <div className="bg-success bg-opacity-10 rounded-circle p-3">
                              <i className="bi bi-check-circle-fill text-success fs-4"></i>
                            </div>
                          </div>
                          <div className="flex-grow-1 ms-3">
                            <h3 className="mb-1">0</h3>
                            <p className="text-muted mb-0">Scores Submitted</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="row">
                  <div className="col-12">
                    <div className="card border-0 shadow-sm">
                      <div className="card-body">
                        <h4 className="card-title mb-3">Quick Actions</h4>
                        <div className="d-flex gap-3 flex-wrap">
                          <button 
                            className="btn btn-primary btn-lg"
                            onClick={() => {
                              const activeContestants = contestants.filter(c => c.status === 'Active');
                              if (activeContestants.length === 0) {
                                showNotification('No active contestants available for scoring', 'warning');
                              } else {
                                setShowContestantSelection(true);
                              }
                            }}
                          >
                            <i className="bi bi-star-fill me-2"></i>
                            Start Scoring
                          </button>
                          <button 
                            className="btn btn-outline-secondary btn-lg"
                            onClick={() => alert('Viewing scores...')}
                          >
                            <i className="bi bi-graph-up me-2"></i>
                            View Scores
                          </button>
                        </div>
                      </div>
                    </div>
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
                    <button className="btn btn-primary" onClick={() => setShowJudgeContestantsModal(true)}>
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
                    <button className="btn btn-primary" onClick={() => setShowJudgeCriteriaModal(true)}>
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
                    <button className="btn btn-primary" onClick={() => setShowJudgeCategoriesModal(true)}>
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
                    <button className="view-all-btn" onClick={() => loadRecentActivities()}>
                      <i className="fi fi-rr-refresh"></i>
                      Refresh
                    </button>
                  </div>
                  <div className="section-content">
                    <div className="activity-list">
                      {recentActivities.length === 0 ? (
                        <div className="no-activities">
                          <div className="empty-activities-icon">
                            <i className="fi fi-rr-clock"></i>
                          </div>
                          <p>No recent activities</p>
                          <span>Your scoring activities and contestant status changes will appear here</span>
                        </div>
                      ) : (
                        recentActivities.map((activity) => (
                          <div key={activity.id} className="activity-item">
                            <div className={`activity-icon ${activity.color}`}>
                              <i className={activity.icon}></i>
                            </div>
                            <div className="activity-info">
                              <p>{activity.message}</p>
                              {activity.details && <span className="activity-details">{activity.details}</span>}
                              <span className="activity-time">
                                {activity.type === 'score_submitted' ? activity.date : formatRelativeTime(activity.timestamp)}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="quick-actions-section">
                <h3>Quick Actions</h3>
                <div className="quick-actions-grid">
                  <button className="quick-action-btn" onClick={() => setShowJudgeContestantsModal(true)}>
                    <i className="fi fi-rr-edit"></i>
                    <span>Score Contestant</span>
                  </button>
                  <button className="quick-action-btn" onClick={() => setShowJudgeRankingsModal(true)}>
                    <i className="fi fi-rr-trophy"></i>
                    <span>Full Rankings</span>
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
      
      {/* Judge Contestants Modal */}
      {showJudgeContestantsModal && (
        <div className="modal-overlay" onClick={() => setShowJudgeContestantsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fi fi-rr-users"></i>
                All Contestants
              </h3>
              <button className="close-btn" onClick={() => setShowJudgeContestantsModal(false)}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-table-container">
                {contestants && contestants.length > 0 ? (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Status</th>
                        <th>Date Added</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestants.map((contestant, index) => (
                        <tr key={contestant.id}>
                          <td>{index + 1}</td>
                          <td>{contestant.name}</td>
                          <td>
                            <span className={`status-badge ${contestant.status.toLowerCase()}`}>
                              {contestant.status}
                            </span>
                          </td>
                          <td>{new Date(contestant.created_at).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => {
                                setShowJudgeContestantsModal(false);
                                handleStartScoring(contestant);
                              }}
                              disabled={contestant.status !== 'Active'}
                            >
                              <i className="fi fi-rr-edit"></i>
                              Score
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <i className="fi fi-rr-users"></i>
                    <p>No contestants found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Judge Criteria Modal */}
      {showJudgeCriteriaModal && (
        <div className="modal-overlay" onClick={() => setShowJudgeCriteriaModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fi fi-rr-chart-pie"></i>
                All Scoring Criteria
              </h3>
              <button className="close-btn" onClick={() => setShowJudgeCriteriaModal(false)}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-table-container">
                {criteria && criteria.length > 0 ? (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Category</th>
                        <th>Percentage</th>
                        <th>Score Range</th>
                        <th>Description</th>
                      </tr>
                    </thead>
                    <tbody>
                      {criteria.map((criterion, index) => (
                        <tr key={criterion.id}>
                          <td>{index + 1}</td>
                          <td>{criterion.name}</td>
                          <td>
                            <span className="category-badge">
                              {categories.find(cat => cat.id === criterion.category_id)?.name || criterion.category_name || 'Unknown'}
                            </span>
                          </td>
                          <td>
                            <span className="percentage-badge">{criterion.percentage}%</span>
                          </td>
                          <td>
                            <span className="range-badge">
                              {criterion.min_score || criterion.min} - {criterion.max_score || criterion.max}
                            </span>
                          </td>
                          <td>{criterion.description || 'No description available'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <i className="fi fi-rr-chart-pie"></i>
                    <p>No criteria found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Judge Categories Modal */}
      {showJudgeCategoriesModal && (
        <div className="modal-overlay" onClick={() => setShowJudgeCategoriesModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fi fi-rr-folder"></i>
                All Categories
              </h3>
              <button className="close-btn" onClick={() => setShowJudgeCategoriesModal(false)}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-table-container">
                {categories && categories.length > 0 ? (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>Criteria Count</th>
                        <th>Description</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map((category, index) => (
                        <tr key={category.id}>
                          <td>{index + 1}</td>
                          <td>{category.name}</td>
                          <td>
                            <span className="criteria-count-badge">
                              {criteria.filter(c => c.category_id === category.id).length} criteria
                            </span>
                          </td>
                          <td>{category.description || 'No description available'}</td>
                          <td>
                            <span className="status-badge active">Active</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <i className="fi fi-rr-folder"></i>
                    <p>No categories found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Judge Full Rankings Modal */}
      {showJudgeRankingsModal && (
        <div className="modal-overlay" onClick={() => setShowJudgeRankingsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fi fi-rr-trophy"></i>
                Full Rankings
              </h3>
              <button className="close-btn" onClick={() => setShowJudgeRankingsModal(false)}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-table-container">
                {fullRankings && fullRankings.length > 0 ? (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Contestant</th>
                        <th>Category</th>
                        <th>Criterion</th>
                        <th>Score</th>
                        <th>Judge</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fullRankings.map((ranking, index) => (
                        <tr key={`${ranking.contestant_id}_${ranking.category_id}_${ranking.criterion_id}`}>
                          <td>{index + 1}</td>
                          <td>{ranking.contestant_name || 'N/A'}</td>
                          <td>{ranking.category_name || 'N/A'}</td>
                          <td>{ranking.criterion_name || 'N/A'}</td>
                          <td>
                            <span className="score-badge">{ranking.score}%</span>
                          </td>
                          <td>{ranking.judge_name || 'N/A'}</td>
                          <td>{new Date(ranking.created_at || ranking.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <i className="fi fi-rr-trophy"></i>
                    <p>No rankings found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Judge Contestant Scores Modal */}
      {showContestantScoresModal && (
        <div className="modal-overlay" onClick={() => setShowContestantScoresModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fi fi-rr-user"></i>
                {selectedContestantForScores ? `${selectedContestantForScores.name}'s Scores` : 'Contestant Scores'}
              </h3>
              <button className="close-btn" onClick={() => setShowContestantScoresModal(false)}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="contestant-info">
                {selectedContestantForScores && (
                  <div className="contestant-details">
                    <h4>{selectedContestantForScores.name}</h4>
                    <span className="status-badge active">Active</span>
                  </div>
                )}
              </div>
              <div className="modal-table-container">
                {contestantScores && contestantScores.length > 0 ? (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Category</th>
                        <th>Criterion</th>
                        <th>Score</th>
                        <th>Judge</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {contestantScores.map((score, index) => (
                        <tr key={`${score.contestant_id}_${score.category_id}_${score.criterion_id}`}>
                          <td>{score.rank || index + 1}</td>
                          <td>{score.contestant_name || 'N/A'}</td>
                          <td>{score.category_name || 'N/A'}</td>
                          <td>{score.criterion_name || 'N/A'}</td>
                          <td>
                            <span className="score-badge">{score.score}%</span>
                          </td>
                          <td>{score.judge_name || 'N/A'}</td>
                          <td>{new Date(score.created_at || score.timestamp).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <i className="fi fi-rr-user"></i>
                    <p>No scores found</p>
                    <p>Select a contestant to view their scores</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Scoring Modal */}
      {showScoringModal && selectedContestant && (
        <div className="scoring-overlay">
          <div className="scoring-modal">
            <div className="scoring-header">
              <h2>Score: {selectedContestant.name}</h2>
              <button className="close-btn" onClick={handleCloseScoring}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            
            <div className="scoring-content">
              {!selectedScoringCategory ? (
                // Category Selection Step
                <div className="category-selection-step">
                  <div className="step-header">
                    <i className="fi fi-rr-folder"></i>
                    <h3>Select Category to Score</h3>
                    <p>Choose which category you want to score for {selectedContestant.name}</p>
                  </div>
                  <div className="category-grid">
                    {categories.map(category => {
                      const categoryCriteriaCount = criteria.filter(c => c.category_name === category.name).length;
                      return (
                        <button
                          key={category.id}
                          className={`category-card ${categoryCriteriaCount === 0 ? 'disabled' : ''}`}
                          onClick={() => handleCategorySelection(category.name)}
                          disabled={categoryCriteriaCount === 0}
                          title={categoryCriteriaCount === 0 ? 'No criteria available for this category' : `Score ${category.name}`}
                        >
                          <div className="category-icon">
                            <i className="fi fi-rr-star"></i>
                          </div>
                          <div className="category-info">
                            <h4>{category.name}</h4>
                            <span className="criteria-count">
                              {categoryCriteriaCount} criteria available
                            </span>
                          </div>
                          {categoryCriteriaCount === 0 && (
                            <div className="disabled-overlay">
                              <i className="fi fi-rr-lock"></i>
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : scoringCriteria.length === 0 ? (
                <div className="no-criteria-message">
                  <i className="fi fi-rr-exclamation"></i>
                  <p>No scoring criteria available for {selectedScoringCategory}. Please add criteria in the admin panel first.</p>
                  <button 
                    className="back-to-category-btn"
                    onClick={() => setSelectedScoringCategory('')}
                  >
                    <i className="fi fi-rr-arrow-left"></i>
                    Back to Category Selection
                  </button>
                </div>
              ) : (
                // Scoring Form Step
                <>
                  <div className="selected-category-header">
                    <div className="category-info">
                      <i className="fi fi-rr-folder"></i>
                      <span>Category: <strong>{selectedScoringCategory}</strong></span>
                    </div>
                    <button 
                      className="change-category-btn"
                      onClick={() => setSelectedScoringCategory('')}
                    >
                      <i className="fi fi-rr-exchange"></i>
                      Change Category
                    </button>
                  </div>
                  
                  <div className="scoring-form">
                    {scoringCriteria.map(criteria => (
                      <div key={criteria.id} className="criteria-input-group">
                        <div className="criteria-info">
                          <label className="criteria-label">
                            {criteria.name}
                          </label>
                          <div className="criteria-details">
                            <span className="criteria-range">Range: {criteria.min} - {criteria.max}</span>
                            <span className="criteria-weight">Weight: {criteria.percentage}%</span>
                          </div>
                        </div>
                        <div className="score-input-container">
                          <input
                            type="number"
                            min={criteria.min}
                            max={criteria.max}
                            step="0.1"
                            value={scores[criteria.id] || ''}
                            onChange={(e) => handleScoreChange(criteria.id, e.target.value)}
                            placeholder={`Enter score (${criteria.min}-${criteria.max})`}
                            className="score-input"
                          />
                          <div className="score-display">
                            {scores[criteria.id] && (
                              <span className="weighted-score">
                                Weighted: {((parseFloat(scores[criteria.id]) / criteria.max) * criteria.percentage).toFixed(2)}%
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="scoring-summary">
                    <div className="total-score-display">
                      <h3>Total Score: {calculateTotalScore()}%</h3>
                    </div>
                    
                    <div className="scoring-actions">
                      <button className="cancel-btn" onClick={handleCloseScoring}>
                        <i className="fi fi-rr-cross"></i>
                        Cancel
                      </button>
                      <button 
                        className="submit-score-btn" 
                        onClick={handleSubmitScores}
                        disabled={!scoringCriteria.every(c => scores[c.id] !== '')}
                      >
                        <i className="fi fi-rr-check"></i>
                        Submit Scores
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Contestant Selection Modal */}
      {showContestantSelection && (
        <div className="scoring-overlay">
          <div className="contestant-selection-modal">
            <div className="selection-header">
              <h2>Select Contestant to Score</h2>
              <button className="close-btn" onClick={() => setShowContestantSelection(false)}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            
            <div className="selection-content">
              <div className="contestant-grid">
                {contestants.filter(c => c.status === 'Active').map((contestant) => (
                  <div 
                    key={contestant.id} 
                    className="contestant-card"
                    onClick={() => {
                      handleStartScoring(contestant);
                      setShowContestantSelection(false);
                    }}
                  >
                    <div className="contestant-avatar">
                      <i className="fi fi-rr-user"></i>
                    </div>
                    <div className="contestant-details">
                      <h4>{contestant.name}</h4>
                      <span className="contestant-number">#{contestant.id}</span>
                    </div>
                    <div className="contestant-action">
                      <i className="fi fi-rr-arrow-right"></i>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Global Alert System */}
      <AlertSystem />
      
    </div>
  );
}

export default App;