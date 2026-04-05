import React, { useState, useEffect } from 'react';
import './PublicPage.css';

function PublicPage({ onShowAuth }) {
  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [language, setLanguage] = useState('en');

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const closeMobileMenu = () => {
    setMobileMenuOpen(false);
  };

  const changeLanguage = (lang) => {
    setLanguage(lang);
  };

  return (
    <div className="public-page">
      {/* Navigation */}
      <nav className="public-nav">
        <div className="nav-container">
          <div className="nav-brand">
            <i className="fi fi-rr-shield-check"></i>
            <h1>Tabulator System</h1>
          </div>
          
          {/* Mobile Menu Toggle */}
          <button 
            className="mobile-menu-toggle" 
            onClick={toggleMobileMenu}
            aria-label="Toggle menu"
          >
            <i className={mobileMenuOpen ? "fi fi-rr-cross" : "fi fi-rr-menu-burger"}></i>
          </button>

          {/* Desktop Menu */}
          <div className="nav-menu">
            <button 
              className={`nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('home');
                closeMobileMenu();
              }}
            >
              <i className="fi fi-rr-home"></i>
              Home
            </button>
            
            <button className="login-btn" onClick={() => {
              onShowAuth();
              closeMobileMenu();
            }}>
              <i className="fi fi-rr-sign-in"></i>
              Login
            </button>
          </div>

          {/* Mobile Menu */}
          <div className={`mobile-menu ${mobileMenuOpen ? 'open' : ''}`}>
            <button 
              className={`mobile-nav-link ${activeSection === 'home' ? 'active' : ''}`}
              onClick={() => {
                setActiveSection('home');
                closeMobileMenu();
              }}
            >
              <i className="fi fi-rr-home"></i>
              Home
            </button>
            
            {/* Mobile Language Selector */}
            <div className="mobile-language-selector">
              <select 
                value={language} 
                onChange={(e) => changeLanguage(e.target.value)}
                className="mobile-language-dropdown"
              >
                <option value="en">English</option>
                <option value="tl">Tagalog</option>
              </select>
            </div>
            
            <button className="mobile-login-btn" onClick={() => {
              onShowAuth();
              closeMobileMenu();
            }}>
              <i className="fi fi-rr-sign-in"></i>
              Login
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="public-main">
        {activeSection === 'home' ? (
          <HomeSection setActiveSection={setActiveSection} />
        ) : (
          <AboutSection />
        )}
      </main>

      {/* Footer */}
      <footer className="public-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <i className="fi fi-rr-shield-check"></i>
            <h3>Tabulator System</h3>
          </div>
          <div className="footer-info">
            <p>Developed by team CLT</p>
            <p>&copy; 2026 Tabulator System. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

function HomeSection({ setActiveSection }) {
  const [contestants, setContestants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch active contestants
  useEffect(() => {
    const fetchContestants = async () => {
      try {
        const response = await fetch('http://localhost/Tabolator_Casestudy/backend/api/contestants');
        const data = await response.json();
        
        if (data.success && data.data) {
          // Filter only active contestants and sort by name
          const activeContestants = data.data
            .filter(contestant => contestant.status === 'Active')
            .sort((a, b) => a.name.localeCompare(b.name));
          setContestants(activeContestants);
        }
      } catch (error) {
        console.error('Error fetching contestants:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchContestants();
  }, []);

  return (
    <section className="home-section">
      {/* Active Contestants Section */}
      <div className="contestants-section">
        <div className="contestants-header">
          <h2>
            <i className="fi fi-rr-users"></i>
            Active Contestants
          </h2>
          <div className="contestant-count">
            {contestants.length} contestant{contestants.length !== 1 ? 's' : ''} competing
          </div>
        </div>
        
        {loading ? (
          <div className="loading-message">
            <i className="fi fi-rr-spinner"></i>
            Loading contestants...
          </div>
        ) : contestants.length > 0 ? (
          <div className="contestants-grid">
            {contestants.map((contestant, index) => (
              <div key={contestant.id} className="contestant-card">
                <div className="contestant-number">
                  #{index + 1}
                </div>
                <div className="contestant-info">
                  <h3>{contestant.name}</h3>
                  <span className="status-badge active">Active</span>
                </div>
                <div className="contestant-icon">
                  <i className="fi fi-rr-star"></i>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="no-contestants">
            <i className="fi fi-rr-info-circle"></i>
            <p>No active contestants at the moment</p>
            <p>Check back later to see participating contestants</p>
          </div>
        )}
      </div>

      <div className="features-grid">
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fi fi-rr-shield-check"></i>
          </div>
          <h3>Secure Authentication</h3>
          <p>Protected login system for judges and administrators</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fi fi-rr-list-check"></i>
          </div>
          <h3>Customizable Criteria</h3>
          <p>Flexible scoring criteria and weighting system</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fi fi-rr-bar-chart-2"></i>
          </div>
          <h3>Analytics Dashboard</h3>
          <p>Comprehensive statistics and performance insights</p>
        </div>
        <div className="feature-item">
          <div className="feature-icon">
            <i className="fi fi-rr-mobile"></i>
          </div>
          <h3>Responsive Design</h3>
          <p>Works seamlessly on all devices and screen sizes</p>
        </div>
      </div>
    </section>
  );
}

function AboutSection() {
  return (
    <section className="about-section">
      <div className="about-container">
        <div className="about-header">
          <h1>About Tabulator System</h1>
          <p>Revolutionizing competition management through technology</p>
        </div>

        <div className="about-content">
          <div className="about-text">
            <h2>Our Mission</h2>
            <p>
              Tabulator System is designed to provide a fair, transparent, and efficient platform 
              for managing competitions of all types. Whether it's talent shows, beauty pageants, 
              or academic competitions, our system ensures that every score is accurately recorded 
              and every participant receives fair evaluation.
            </p>

            <h2>Key Features</h2>
            <ul className="feature-list">
              <li>
                <i className="fi fi-rr-check"></i>
                <span>Secure judge authentication with PIN-based access</span>
              </li>
              <li>
                <i className="fi fi-rr-check"></i>
                <span>Customizable scoring criteria with percentage-based weighting</span>
              </li>
              <li>
                <i className="fi fi-rr-check"></i>
                <span>Real-time score calculation and ranking system</span>
              </li>
              <li>
                <i className="fi fi-rr-check"></i>
                <span>Comprehensive dashboard for judges and administrators</span>
              </li>
              <li>
                <i className="fi fi-rr-check"></i>
                <span>Responsive design for mobile and desktop access</span>
              </li>
            </ul>

            <h2>Technology Stack</h2>
            <div className="tech-stack">
              <div className="tech-item">
                <i className="fi fi-rr-code"></i>
                <span>React.js Frontend</span>
              </div>
              <div className="tech-item">
                <i className="fi fi-rr-database"></i>
                <span>MySQL Database</span>
              </div>
              <div className="tech-item">
                <i className="fi fi-rr-server"></i>
                <span>PHP Backend API</span>
              </div>
              <div className="tech-item">
                <i className="fi fi-rr-palette"></i>
                <span>Modern CSS Design</span>
              </div>
            </div>
          </div>

          <div className="about-visual">
            <div className="stats-card">
              <h3>System Statistics</h3>
              <div className="stat-item">
                <div className="stat-number">100%</div>
                <div className="stat-label">Accurate Scoring</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">24/7</div>
                <div className="stat-label">Availability</div>
              </div>
              <div className="stat-item">
                <div className="stat-number">∞</div>
                <div className="stat-label">Scalability</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default PublicPage;
