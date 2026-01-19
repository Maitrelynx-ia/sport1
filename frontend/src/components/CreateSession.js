import React, { useState } from 'react';
import { auth } from '../firebase.js';
import { getIdToken } from 'firebase/auth';

const sports = [
  'Running', 'Cycling', 'Swimming', 'Weightlifting', 'Yoga', 'Basketball', 'Soccer', 'Tennis', 'Boxing', 'Martial Arts', 'Other'
];

const CreateSession = () => {
  const [title, setTitle] = useState('');
  const [sport, setSport] = useState('');
  const [duration, setDuration] = useState(0);
  const [isPublic, setIsPublic] = useState(true);
  const [isPaid, setIsPaid] = useState(false);
  const [price, setPrice] = useState(0);
  const [isRestricted, setIsRestricted] = useState(false);
  const [allowedUsers, setAllowedUsers] = useState('');
  const [loading, setLoading] = useState(false);

  if (!auth) {
    return <div style={{ padding: '20px', color: 'red' }}>Erreur: Firebase non configuré.</div>;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = auth.currentUser;
      if (!user) {
        alert('Vous devez être connecté pour créer une séance.');
        return;
      }
      const token = await getIdToken(user);
      const response = await fetch('http://localhost:5000/api/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title,
          sport,
          duration,
          isPublic,
          isPaid,
          price,
          isRestricted,
          allowedUsers: allowedUsers.split(',').map(email => email.trim())
        })
      });
      if (response.ok) {
        alert('Séance créée avec succès !');
        // Reset form
        setTitle('');
        setSport('');
        setDuration(0);
        setIsPublic(true);
        setIsPaid(false);
        setPrice(0);
        setIsRestricted(false);
        setAllowedUsers('');
      } else {
        alert('Erreur lors de la création');
      }
    } catch (error) {
      console.error("Erreur : ", error);
      alert('Erreur réseau');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Créer une séance d'entraînement</h2>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <input type="text" placeholder="Titre" value={title} onChange={(e) => setTitle(e.target.value)} required />
        <select value={sport} onChange={(e) => setSport(e.target.value)} required>
          <option value="">Choisir un sport</option>
          {sports.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="number" placeholder="Durée (min)" value={duration} onChange={(e) => setDuration(Number(e.target.value))} required />
        <label>
          <input type="checkbox" checked={isPublic} onChange={(e) => setIsPublic(e.target.checked)} />
          Séance publique
        </label>
        <label>
          <input type="checkbox" checked={isPaid} onChange={(e) => setIsPaid(e.target.checked)} />
          Séance payante
        </label>
        {isPaid && (
          <input type="number" placeholder="Prix (€)" value={price} onChange={(e) => setPrice(Number(e.target.value))} required />
        )}
        <label>
          <input type="checkbox" checked={isRestricted} onChange={(e) => setIsRestricted(e.target.checked)} />
          Séance restreinte
        </label>
        {isRestricted && (
          <input type="text" placeholder="Emails autorisés (séparés par des virgules)" value={allowedUsers} onChange={(e) => setAllowedUsers(e.target.value)} required />
        )}
        <button type="submit" disabled={loading}>{loading ? 'Création...' : 'Créer la séance'}</button>
      </form>
    </div>
  );
};

export default CreateSession;
