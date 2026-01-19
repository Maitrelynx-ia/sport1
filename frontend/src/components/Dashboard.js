import React, { useEffect, useState } from 'react';
import { auth } from '../firebase.js';
import { getIdToken } from 'firebase/auth';

const Dashboard = () => {
  const [sessions, setSessions] = useState([]);
  const [workouts, setWorkouts] = useState([]);

  if (!auth) {
    return <div style={{ padding: '20px', color: 'red' }}>Erreur: Firebase non configuré.</div>;
  }

  useEffect(() => {
    const fetchData = async () => {
      const user = auth.currentUser;
      if (user) {
        const token = await getIdToken(user);
        const sessionRes = await fetch('http://localhost:5000/api/my-sessions', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const sessionData = await sessionRes.json();
        setSessions(sessionData);

        const workoutRes = await fetch('http://localhost:5000/api/workouts', {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const workoutData = await workoutRes.json();
        setWorkouts(workoutData);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Mon Tableau de Bord</h2>
      <h3>Mes Séances</h3>
      <ul>
        {sessions.map(session => (
          <li key={session.id}>{session.title} - {session.sport}</li>
        ))}
      </ul>
      <h3>Mes Entraînements</h3>
      <ul>
        {workouts.map(workout => (
          <li key={workout.id}>
            Session: {workout.sessionId}, Distance: {workout.metrics.distance} km, BPM: {workout.metrics.bpm}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;