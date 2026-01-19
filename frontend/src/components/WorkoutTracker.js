import React, { useState, useEffect } from 'react';
import { auth } from '../firebase.js';
import { getIdToken } from 'firebase/auth';
import { useParams } from 'react-router-dom';

const WorkoutTracker = () => {
  const { sessionId } = useParams();
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    distance: 0,
    speed: 0,
    bpm: 0,
    calories: 0,
    time: 0
  });
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState(null);
  const [positions, setPositions] = useState([]);
  const [watchId, setWatchId] = useState(null);

  if (!auth) {
    return <div style={{ padding: '20px', color: 'red' }}>Erreur: Firebase non configuré.</div>;
  }

  useEffect(() => {
    const fetchSession = async () => {
      setLoading(true);
      try {
        const response = await fetch(`http://localhost:5000/api/sessions/${sessionId}`);
        const data = await response.json();
        setSession(data);
      } catch (error) {
        console.error('Erreur lors du chargement de la séance:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchSession();
  }, [sessionId]);

  const startTracking = () => {
    setIsTracking(true);
    setStartTime(Date.now());
    if (navigator.geolocation) {
      const id = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude, speed } = position.coords;
          setPositions(prev => [...prev, { lat: latitude, lng: longitude, time: Date.now() }]);
          if (speed) setMetrics(prev => ({ ...prev, speed: speed * 3.6 })); // m/s to km/h
        },
        (error) => console.error(error),
        { enableHighAccuracy: true }
      );
      setWatchId(id);
    }
  };

  const stopTracking = async () => {
    setIsTracking(false);
    if (watchId) navigator.geolocation.clearWatch(watchId);
    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000 / 60; // minutes
    const distance = calculateDistance(positions);
    const user = auth.currentUser;
    const token = await getIdToken(user);
    await fetch('http://localhost:5000/api/workouts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({
        sessionId,
        metrics: { ...metrics, distance, time: duration }
      })
    });
    alert('Entraînement sauvegardé !');
  };

  const calculateDistance = (positions) => {
    let totalDistance = 0;
    for (let i = 1; i < positions.length; i++) {
      const prev = positions[i-1];
      const curr = positions[i];
      const dist = getDistanceFromLatLonInKm(prev.lat, prev.lng, curr.lat, curr.lng);
      totalDistance += dist;
    }
    return totalDistance;
  };

  const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the earth in km
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg) => deg * (Math.PI/180);

  const handleMetricChange = (e) => {
    const { name, value } = e.target;
    setMetrics(prev => ({ ...prev, [name]: Number(value) }));
  };

  if (loading) return <div>Chargement...</div>;
  if (!session) return <div>Session non trouvée</div>;

  return (
    <div style={{ padding: '20px' }}>
      <h2>{session.title}</h2>
      <p>Sport: {session.sport}</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <label>Distance (km): <input type="number" name="distance" value={metrics.distance} onChange={handleMetricChange} /></label>
        <label>Vitesse (km/h): <input type="number" name="speed" value={metrics.speed} onChange={handleMetricChange} /></label>
        <label>BPM: <input type="number" name="bpm" value={metrics.bpm} onChange={handleMetricChange} /></label>
        <label>Calories: <input type="number" name="calories" value={metrics.calories} onChange={handleMetricChange} /></label>
      </div>
      {!isTracking ? (
        <button onClick={startTracking} style={{ marginTop: '20px' }}>Commencer l'entraînement</button>
      ) : (
        <button onClick={stopTracking} style={{ marginTop: '20px' }}>Arrêter l'entraînement</button>
      )}
    </div>
  );
};

export default WorkoutTracker;