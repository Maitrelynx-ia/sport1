import React, { useEffect, useState } from 'react';
import { auth } from '../firebase.js';
import { getIdToken } from 'firebase/auth';
import { Link } from 'react-router-dom';

const SessionList = () => {
  const [sessions, setSessions] = useState([]);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = auth.onAuthStateChanged(setUser);
    return unsubscribe;
  }, []);

  if (!auth) {
    return <div style={{ padding: '20px', color: 'red' }}>Erreur: Firebase non configuré.</div>;
  }

  useEffect(() => {
    const fetchSessions = async () => {
      setLoading(true);
      try {
        const response = await fetch('http://localhost:5000/api/sessions');
        const data = await response.json();
        setSessions(data);
      } catch (error) {
        console.error('Erreur lors du chargement des séances:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSessions();
  }, []);

  const canJoin = (session) => {
    if (session.isPublic) return true;
    if (session.isRestricted && user && session.allowedUsers.includes(user.email)) return true;
    return false;
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Séances d'entraînement</h2>
      {user && <Link to="/create" style={{ marginBottom: '20px', display: 'inline-block' }}>Créer une séance</Link>}
      {loading ? <p>Chargement...</p> : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {sessions.map(session => (
            <li key={session.id} style={{ border: '1px solid #ccc', padding: '10px', marginBottom: '10px' }}>
              <h3>{session.title}</h3>
              <p>Sport: {session.sport}</p>
              <p>Durée: {session.duration} min</p>
              {session.isPaid && <p>Prix: {session.price} €</p>}
              {canJoin(session) && <Link to={`/workout/${session.id}`}>Rejoindre</Link>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SessionList;