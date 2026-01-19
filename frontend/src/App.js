import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import CreateSession from './components/CreateSession';
import SessionList from './components/SessionList';
import WorkoutTracker from './components/WorkoutTracker';
import Auth from './components/Auth';
import Dashboard from './components/Dashboard';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>Sports Training App</h1>
          <nav>
            <Link to="/">Accueil</Link>
            <Link to="/create">Créer Séance</Link>
            <Link to="/dashboard">Tableau de Bord</Link>
          </nav>
          <Auth />
        </header>
        <main>
          <Routes>
            <Route path="/" element={<SessionList />} />
            <Route path="/create" element={<CreateSession />} />
            <Route path="/workout/:sessionId" element={<WorkoutTracker />} />
            <Route path="/dashboard" element={<Dashboard />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;