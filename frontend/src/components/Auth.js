import React, { useState, useEffect } from 'react';
import { auth } from '../firebase.js';
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [user, setUser] = useState(null);
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    if (!auth) return;
    const unsubscribe = onAuthStateChanged(auth, setUser);
    return unsubscribe;
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!auth) {
      alert('Firebase non configuré');
      return;
    }
    try {
      if (isLogin) {
        await signInWithEmailAndPassword(auth, email, password);
      } else {
        await createUserWithEmailAndPassword(auth, email, password);
      }
    } catch (error) {
      alert(error.message);
    }
  };

  const handleLogout = async () => {
    if (!auth) return;
    await signOut(auth);
  };

  if (!auth) {
    return <div style={{ padding: '20px', color: 'red' }}>Erreur: Firebase non configuré. Vérifiez les variables d'environnement.</div>;
  }

  if (user) {
    return (
      <div style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <p>Connecté en tant que {user.email}</p>
        <button onClick={handleLogout}>Déconnexion</button>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <h3>{isLogin ? 'Connexion' : 'Inscription'}</h3>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxWidth: '300px' }}>
        <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input type="password" placeholder="Mot de passe" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button type="submit">{isLogin ? 'Se connecter' : 'S\'inscrire'}</button>
      </form>
      <button onClick={() => setIsLogin(!isLogin)} style={{ marginTop: '10px' }}>
        {isLogin ? 'Pas de compte ? S\'inscrire' : 'Déjà un compte ? Se connecter'}
      </button>
    </div>
  );
};

export default Auth;