import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  // Category state
  const [categories, setCategories] = useState([
    { id: 1, name: 'Talent' },
    { id: 2, name: 'Beauty' },
    { id: 3, name: 'Intelligence' },
    { id: 4, name: 'Poise' }
  ]);
  const [categoryInput, setCategoryInput] = useState('');
  
  // Criteria state
  const [criteria, setCriteria] = useState([
    { id: 1, category: 'Talent', name: 'Performance Quality', percentage: '40', min: '1', max: '10' },
    { id: 2, category: 'Talent', name: 'Originality', percentage: '30', min: '1', max: '10' },
    { id: 3, category: 'Talent', name: 'Stage Presence', percentage: '30', min: '1', max: '10' },
    { id: 4, category: 'Beauty', name: 'Facial Features', percentage: '35', min: '1', max: '10' },
    { id: 5, category: 'Beauty', name: 'Skin Complexion', percentage: '30', min: '1', max: '10' },
    { id: 6, category: 'Beauty', name: 'Body Proportion', percentage: '35', min: '1', max: '10' }
  ]);
  const [criteriaInput, setCriteriaInput] = useState({
    name: '',
    percentage: '',
    min: '',
    max: ''
  });
  const [selectedCategory, setSelectedCategory] = useState('Talent');
  
  // Judges state
  const [judges, setJudges] = useState([
    { id: 1, name: 'Dr. Maria Santos', pin: '2847' },
    { id: 2, name: 'Prof. John Reyes', pin: '9156' },
    { id: 3, name: 'Ms. Anna Cruz', pin: '3729' },
    { id: 4, name: 'Mr. David Lee', pin: '6481' }
  ]);
  const [judgeInput, setJudgeInput] = useState('');
  
  // Contestants state
  const [contestants, setContestants] = useState([
    { id: 1, name: 'Sarah Martinez', status: 'Active' },
    { id: 2, name: 'Jessica Chen', status: 'Active' },
    { id: 3, name: 'Emily Rodriguez', status: 'Eliminated' },
    { id: 4, name: 'Amanda Thompson', status: 'Active' },
    { id: 5, name: 'Rachel Kim', status: 'Disqualified' },
    { id: 6, name: 'Michelle Garcia', status: 'Active' }
  ]);
  const [contestantInput, setContestantInput] = useState('');

  // Navigation state
  const [activeSection, setActiveSection] = useState('category');

  // Category functions
  const handleAddCategory = () => {
    if (categoryInput.trim()) {
      const newCategory = {
        id: Date.now(),
        name: categoryInput
      };
      setCategories([...categories, newCategory]);
      setCategoryInput('');
    }
  };

  const handleDeleteCategory = (id) => {
    setCategories(categories.filter(cat => cat.id !== id));
  };

  // Criteria functions
  const handleAddCriteria = () => {
    if (criteriaInput.name && criteriaInput.percentage && criteriaInput.min && criteriaInput.max) {
      const newCriteria = {
        id: Date.now(),
        category: selectedCategory,
        ...criteriaInput
      };
      setCriteria([...criteria, newCriteria]);
      setCriteriaInput({ name: '', percentage: '', min: '', max: '' });
    }
  };

  const handleDeleteCriteria = (id) => {
    setCriteria(criteria.filter(crit => crit.id !== id));
  };

  // Judges functions
  const handleAddJudge = () => {
    if (judgeInput.trim()) {
      const newJudge = {
        id: Date.now(),
        name: judgeInput,
        pin: Math.floor(1000 + Math.random() * 9000).toString()
      };
      setJudges([...judges, newJudge]);
      setJudgeInput('');
    }
  };

  const handleDeleteJudge = (id) => {
    setJudges(judges.filter(judge => judge.id !== id));
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
    }
  };

  const handleDeleteContestant = (id) => {
    setContestants(contestants.filter(con => con.id !== id));
  };

  const handleEliminateContestant = (id) => {
    setContestants(contestants.map(con => 
      con.id === id ? { ...con, status: 'Eliminated' } : con
    ));
  };

  const handleDisqualifyContestant = (id) => {
    setContestants(contestants.map(con => 
      con.id === id ? { ...con, status: 'Disqualified' } : con
    ));
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Tabulator System</h1>
        <nav className="nav-menu">
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
      </header>
      <main className="App-main">
        
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
    </div>
  );
}

export default App;