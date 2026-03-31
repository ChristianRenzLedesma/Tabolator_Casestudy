import React, { useState, useEffect } from 'react';
import './Dashboard.css';

const Dashboard = () => {
  const [overallStats, setOverallStats] = useState({
    totalContestants: 0,
    activeContestants: 0,
    eliminatedContestants: 0,
    disqualifiedContestants: 0,
    totalJudges: 0,
    activeJudges: 0,
    totalCategories: 0,
    totalCriteria: 0,
    averageScore: '0.0'
  });

  const [recentContestants, setRecentContestants] = useState([]);
  const [recentJudges, setRecentJudges] = useState([]);
  const [topScores, setTopScores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'eliminated', 'disqualified'

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      console.log('Fetching dashboard data...');
      
      // Fetch all data from backend APIs
      const [contestantsResponse, judgesResponse, categoriesResponse, criteriaResponse] = await Promise.all([
        fetch('http://localhost/Tabolator_Casestudy/backend/api/contestants'),
        fetch('http://localhost/Tabolator_Casestudy/backend/api/judges'),
        fetch('http://localhost/Tabolator_Casestudy/backend/api/categories'),
        fetch('http://localhost/Tabolator_Casestudy/backend/api/criteria')
      ]);

      console.log('API Responses:', {
        contestants: contestantsResponse.status,
        judges: judgesResponse.status,
        categories: categoriesResponse.status,
        criteria: criteriaResponse.status
      });

      const contestantsData = await contestantsResponse.json();
      const judgesData = await judgesResponse.json();
      const categoriesData = await categoriesResponse.json();
      const criteriaData = await criteriaResponse.json();

      console.log('Fetched data:', {
        contestants: contestantsData.data?.length || 0,
        judges: judgesData.data?.length || 0,
        categories: categoriesData.data?.length || 0,
        criteria: criteriaData.data?.length || 0
      });

      // Calculate real statistics
      const activeContestants = contestantsData.data?.filter(c => c.status === 'Active') || [];
      const eliminatedContestants = contestantsData.data?.filter(c => c.status === 'Eliminated') || [];
      const disqualifiedContestants = contestantsData.data?.filter(c => c.status === 'Disqualified') || [];
      const activeJudges = judgesData.data?.filter(j => j.is_active !== 0) || [];
      
      // Calculate average score from contestants with final_score
      const scoredContestants = contestantsData.data?.filter(c => c.final_score && c.final_score > 0) || [];
      const averageScore = scoredContestants.length > 0 
        ? (scoredContestants.reduce((sum, c) => sum + parseFloat(c.final_score), 0) / scoredContestants.length).toFixed(1)
        : '0.0';

      // Calculate top scores from real data
      const scoredContestantsWithScores = contestantsData.data?.filter(c => c.final_score && c.final_score > 0) || [];
      const topContestants = scoredContestantsWithScores
        .sort((a, b) => parseFloat(b.final_score) - parseFloat(a.final_score))
        .slice(0, 5)
        .map((c, index) => ({
          name: c.name,
          score: parseFloat(c.final_score).toFixed(1),
          rank: index + 1
        }));

      setOverallStats({
        totalContestants: contestantsData.data?.length || 0,
        activeContestants: activeContestants.length,
        eliminatedContestants: eliminatedContestants.length,
        disqualifiedContestants: disqualifiedContestants.length,
        totalJudges: judgesData.data?.length || 0,
        activeJudges: activeJudges.length,
        totalCategories: categoriesData.data?.length || 0,
        totalCriteria: criteriaData.data?.length || 0,
        averageScore: averageScore,
        upcomingEvents: 1 // This would come from events API when implemented
      });

      // Set recent data (last 5, sorted by creation date)
      const recentContestantsSorted = (contestantsData.data || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);
      
      const recentJudgesSorted = (judgesData.data || [])
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
        .slice(0, 5);

      // Apply status filter to recent contestants
      const filteredContestants = statusFilter === 'all' 
        ? recentContestantsSorted
        : recentContestantsSorted.filter(c => c.status.toLowerCase() === statusFilter);

      setRecentContestants(filteredContestants);
      setRecentJudges(recentJudgesSorted);
      setTopScores(topContestants);
      
    } catch (error) {
      console.error('Dashboard data fetch error:', error);
      alert('Failed to fetch data from backend. Please check if backend is running.');
      
      // Set empty data on error
      setOverallStats({
        totalContestants: 0,
        activeContestants: 0,
        eliminatedContestants: 0,
        disqualifiedContestants: 0,
        totalJudges: 0,
        activeJudges: 0,
        totalCategories: 0,
        totalCriteria: 0,
        averageScore: '0.0'
      });
      setRecentContestants([]);
      setRecentJudges([]);
      setTopScores([]);
    } finally {
      setLoading(false);
    }
  };

  const calculateAverageScore = (contestants) => {
    const scoredContestants = contestants.filter(c => c.final_score && c.final_score > 0);
    if (scoredContestants.length === 0) return 0;
    
    const total = scoredContestants.reduce((sum, c) => sum + parseFloat(c.final_score), 0);
    return (total / scoredContestants.length).toFixed(1);
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
        <p>Loading dashboard...</p>
      </div>
    );
  }

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
            <button className="refresh-btn" onClick={fetchDashboardData}>
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
                <button className="action-btn-small" onClick={() => window.location.href = '#contestants'}>
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
                <button className="action-btn-small" onClick={() => window.location.href = '#judges'}>
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
                <button className="action-btn-small" onClick={() => window.location.href = '#scoring'}>
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
    </div>
  );
};

export default Dashboard;
