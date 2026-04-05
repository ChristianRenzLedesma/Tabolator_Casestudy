import React from 'react';
import './Sidebar.css';

const Sidebar = ({ 
  activeSection, 
  setActiveSection, 
  isAdmin, 
  currentJudge, 
  handleLogout 
}) => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h1>Tabulator System</h1>
        {isAdmin && (
          <div className="admin-badge">
            <i className="fi fi-rr-shield-check"></i>
            Admin
          </div>
        )}
        {currentJudge && (
          <div className="judge-info">
            <div className="judge-avatar">
              <i className="fi fi-rr-user"></i>
            </div>
            <div className="judge-details">
              <span className="judge-name">{currentJudge?.name}</span>
              <span className="judge-role">Judge</span>
            </div>
          </div>
        )}
      </div>

      <nav className="sidebar-nav">
        {isAdmin ? (
          // Admin Navigation
          <>
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
              <i className="fi fi-rr-users-alt"></i>
              Contestants
            </button>
          </>
        ) : (
          // Judge Navigation
          <>
            <button 
              className={`nav-btn ${activeSection === 'scoring' ? 'active' : ''}`}
              onClick={() => setActiveSection('scoring')}
            >
              <i className="fi fi-rr-star"></i>
              Scoring
            </button>
            <button 
              className={`nav-btn ${activeSection === 'results' ? 'active' : ''}`}
              onClick={() => setActiveSection('results')}
            >
              <i className="fi fi-rr-trophy"></i>
              Results
            </button>
          </>
        )}
      </nav>

      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <i className="fi fi-rr-sign-out"></i>
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
