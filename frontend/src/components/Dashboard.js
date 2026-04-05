import React, { useState } from 'react';
import './Dashboard.css';

const Dashboard = ({ contestants, judges, categories, criteria, scores, setActiveSection }) => {
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'eliminated', 'disqualified'
  const [showContestantsModal, setShowContestantsModal] = useState(false);
  const [showJudgesModal, setShowJudgesModal] = useState(false);
  const [showScoresModal, setShowScoresModal] = useState(false);

  // Calculate real statistics from props
  const activeContestants = contestants?.filter(c => c.status === 'Active') || [];
  const eliminatedContestants = contestants?.filter(c => c.status === 'Eliminated') || [];
  const disqualifiedContestants = contestants?.filter(c => c.status === 'Disqualified') || [];
  const activeJudges = judges?.filter(j => j.is_active !== 0) || [];
  
  // Calculate average score from contestants with final_score
  const scoredContestants = contestants?.filter(c => c.final_score && c.final_score > 0) || [];
  const averageScore = scoredContestants.length > 0 
    ? (scoredContestants.reduce((sum, c) => sum + parseFloat(c.final_score), 0) / scoredContestants.length).toFixed(1)
    : '0.0';

  const overallStats = {
    totalContestants: contestants?.length || 0,
    activeContestants: activeContestants.length,
    eliminatedContestants: eliminatedContestants.length,
    disqualifiedContestants: disqualifiedContestants.length,
    totalJudges: judges?.length || 0,
    activeJudges: activeJudges.length,
    totalCategories: categories?.length || 0,
    totalCriteria: criteria?.length || 0,
    averageScore: averageScore,
    upcomingEvents: 1 // This would come from events API when implemented
  };

  // Set recent data (last 5, sorted by creation date)
  const recentContestantsSorted = (contestants || [])
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  const recentJudgesSorted = (judges || [])
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 5);

  // Apply status filter to recent contestants
  const recentContestants = statusFilter === 'all' 
    ? recentContestantsSorted
    : recentContestantsSorted.filter(c => c.status.toLowerCase() === statusFilter);

  const recentJudges = recentJudgesSorted;

  // Calculate top scores from scores data
  const scoresArray = Array.isArray(scores) ? scores : [];
  const topScores = scoresArray
    .filter(score => score.total_score || score.score)
    .map((score, index) => ({
      ...score,
      rank: index + 1,
      score: parseFloat(score.total_score || score.score || 0)
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  return (
    <div className="dashboard">
      {/* Header */}
      <header className="dashboard-header">
        <div className="header-content">
          <div className="header-left">
            <h1 className="dashboard-title">
              <i className="fi fi-rr-dashboard"></i>
              Admin Dashboard
            </h1>
            <p className="dashboard-subtitle">Tabulator System Management</p>
          </div>
          <div className="header-right">
            <button className="refresh-btn">
              <i className="fi fi-rr-refresh"></i>
              <span>Refresh Data</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <div className="dashboard-grid">
        
        {/* Overall Statistics */}
        <section className="stats-section">
          <h2 className="section-title">
            <i className="fi fi-rr-chart-pie"></i>
            Overview Statistics
          </h2>
          <div className="stats-grid">
            <div className="stat-card primary">
              <div className="stat-icon">
                <i className="fi fi-rr-users"></i>
              </div>
              <div className="stat-info">
                <h3>{overallStats.totalContestants}</h3>
                <p>Total Contestants</p>
                <div className="stat-breakdown">
                  <span className="stat-item active">{overallStats.activeContestants} Active</span>
                  <span className="stat-item eliminated">{overallStats.eliminatedContestants} Eliminated</span>
                  <span className="stat-item disqualified">{overallStats.disqualifiedContestants} Disqualified</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card secondary">
              <div className="stat-icon">
                <i className="fi fi-rr-user"></i>
              </div>
              <div className="stat-info">
                <h3>{overallStats.totalJudges}</h3>
                <p>Total Judges</p>
                <div className="stat-breakdown">
                  <span className="stat-item active">{overallStats.activeJudges} Active</span>
                </div>
              </div>
            </div>
            
            <div className="stat-card accent">
              <div className="stat-icon">
                <i className="fi fi-rr-folder"></i>
              </div>
              <div className="stat-info">
                <h3>{overallStats.totalCategories}</h3>
                <p>Categories</p>
                <div className="progress-bar">
                  <div className="progress-fill" style={{width: `${Math.min((overallStats.totalCategories / 4) * 100, 100)}%`}}></div>
                </div>
              </div>
            </div>
            
            <div className="stat-card success">
              <div className="stat-icon">
                <i className="fi fi-rr-star"></i>
              </div>
              <div className="stat-info">
                <h3>{overallStats.averageScore}</h3>
                <p>Average Score</p>
                <div className="score-indicator">
                  <div className="score-ring">
                    <div className="score-fill" style={{width: `${Math.min((overallStats.averageScore / 10) * 100, 100)}%`}}></div>
                  </div>
                  <span className="score-text">{overallStats.averageScore}/10</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Activity */}
        <div className="activity-section">
          
          {/* Recent Contestants */}
          <section className="recent-card">
            <div className="card-header">
              <h3>
                <i className="fi fi-rr-users"></i>
                Recent Contestants
              </h3>
              <div className="card-actions">
                <div className="filter-buttons">
                  <button 
                    className={`filter-btn ${statusFilter === 'all' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('all')}
                  >
                    All ({overallStats.totalContestants})
                  </button>
                  <button 
                    className={`filter-btn ${statusFilter === 'active' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('active')}
                  >
                    Active ({overallStats.activeContestants})
                  </button>
                  <button 
                    className={`filter-btn ${statusFilter === 'eliminated' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('eliminated')}
                  >
                    Eliminated ({overallStats.eliminatedContestants})
                  </button>
                  <button 
                    className={`filter-btn ${statusFilter === 'disqualified' ? 'active' : ''}`}
                    onClick={() => setStatusFilter('disqualified')}
                  >
                    Disqualified ({overallStats.disqualifiedContestants})
                  </button>
                </div>
                <button className="action-btn-small" onClick={() => setShowContestantsModal(true)}>
                  <i className="fi fi-rr-arrow-right"></i>
                  View All
                </button>
              </div>
            </div>
            <div className="card-content">
              {recentContestants.length > 0 ? (
                recentContestants.map((contestant, index) => (
                  <div key={contestant.id} className="recent-item">
                    <div className="item-avatar">
                      <div className="avatar-placeholder">
                        <i className="fi fi-rr-user"></i>
                      </div>
                    </div>
                    <div className="item-info">
                      <h4>{contestant.name}</h4>
                      <div className="item-meta">
                        <span className={`status ${contestant.status.toLowerCase()}`}>
                          {contestant.status}
                        </span>
                        <span className="item-date">
                          {new Date(contestant.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fi fi-rr-users"></i>
                  <p>No contestants found</p>
                </div>
              )}
            </div>
          </section>

          {/* Recent Judges */}
          <section className="recent-card">
            <div className="card-header">
              <h3>
                <i className="fi fi-rr-user"></i>
                Recent Judges
              </h3>
              <div className="card-actions">
                <button className="action-btn-small" onClick={() => setShowJudgesModal(true)}>
                  <i className="fi fi-rr-arrow-right"></i>
                  View All
                </button>
              </div>
            </div>
            <div className="card-content">
              {recentJudges.length > 0 ? (
                recentJudges.map((judge, index) => (
                  <div key={judge.id} className="recent-item">
                    <div className="item-avatar">
                      <div className="avatar-placeholder judge-avatar">
                        <i className="fi fi-rr-user"></i>
                      </div>
                    </div>
                    <div className="item-info">
                      <h4>{judge.name}</h4>
                      <div className="item-meta">
                        <span className="judge-pin">PIN: {judge.pin}</span>
                        <span className="active-badge">Active</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fi fi-rr-user"></i>
                  <p>No judges found</p>
                </div>
              )}
            </div>
          </section>

          {/* Top Scores */}
          <section className="scores-card">
            <div className="card-header">
              <h3>
                <i className="fi fi-rr-trophy"></i>
                Top Performers
              </h3>
              <div className="card-actions">
                <button className="action-btn-small" onClick={() => setShowScoresModal(true)}>
                  <i className="fi fi-rr-arrow-right"></i>
                  Full Rankings
                </button>
              </div>
            </div>
            <div className="card-content">
              {topScores.length > 0 ? (
                topScores.map((score, index) => (
                  <div key={index} className="score-item modern">
                    <div className="rank-badge modern">
                      #{score.rank}
                    </div>
                    <div className="score-info">
                      <h4>{score.name}</h4>
                      <div className="score-details">
                        <span className="score-value">{score.score}</span>
                        <span className="score-max">/10.0</span>
                      </div>
                      <div className="score-progress">
                        <div className="progress-bar-small">
                          <div className="progress-fill premium" style={{width: `${(score.score / 10) * 100}%`}}></div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="fi fi-rr-trophy"></i>
                  <p>No scores available</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="dashboard-footer">
        <div className="footer-content">
          <div className="footer-left">
            <span className="footer-text">
              <i className="fi fi-rr-info"></i>
              Last updated: {new Date().toLocaleString()}
            </span>
          </div>
          <div className="footer-right">
            <button className="export-btn">
              <i className="fi fi-rr-download"></i>
              Export Report
            </button>
          </div>
        </div>
      </footer>

      {/* Contestants Modal */}
      {showContestantsModal && (
        <div className="modal-overlay" onClick={() => setShowContestantsModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fi fi-rr-users"></i>
                All Contestants
              </h3>
              <button className="close-btn" onClick={() => setShowContestantsModal(false)}>
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
                        <th>Final Score</th>
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
                          <td>{contestant.final_score || 'N/A'}</td>
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

      {/* Judges Modal */}
      {showJudgesModal && (
        <div className="modal-overlay" onClick={() => setShowJudgesModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fi fi-rr-users"></i>
                All Judges
              </h3>
              <button className="close-btn" onClick={() => setShowJudgesModal(false)}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-table-container">
                {judges && judges.length > 0 ? (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>No.</th>
                        <th>Name</th>
                        <th>PIN</th>
                        <th>Status</th>
                        <th>Date Added</th>
                      </tr>
                    </thead>
                    <tbody>
                      {judges.map((judge, index) => (
                        <tr key={judge.id}>
                          <td>{index + 1}</td>
                          <td>{judge.name}</td>
                          <td>
                            <span className="pin-badge">{judge.pin}</span>
                          </td>
                          <td>
                            <span className={`status-badge ${judge.is_active !== 0 ? 'active' : 'inactive'}`}>
                              {judge.is_active !== 0 ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>{new Date(judge.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <i className="fi fi-rr-users"></i>
                    <p>No judges found</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Scores Modal */}
      {showScoresModal && (
        <div className="modal-overlay" onClick={() => setShowScoresModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>
                <i className="fi fi-rr-trophy"></i>
                Full Rankings
              </h3>
              <button className="close-btn" onClick={() => setShowScoresModal(false)}>
                <i className="fi fi-rr-cross"></i>
              </button>
            </div>
            <div className="modal-content">
              <div className="modal-table-container">
                {topScores && topScores.length > 0 ? (
                  <table className="modal-table">
                    <thead>
                      <tr>
                        <th>Rank</th>
                        <th>Contestant</th>
                        <th>Category</th>
                        <th>Total Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topScores.map((score, index) => (
                        <tr key={index}>
                          <td>{index + 1}</td>
                          <td>{score.contestant_name}</td>
                          <td>{score.category_name}</td>
                          <td>{score.total_score}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <div className="empty-state">
                    <i className="fi fi-rr-trophy"></i>
                    <p>No scores available</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
