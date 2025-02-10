import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/signin', {
        email,
        password,
      });
      if (response.data.token) {
        localStorage.setItem('token', response.data.token); // Store token in localStorage
        navigate('/'); // Redirect to the main app
      }
    } catch (err) {
      setError('Invalid email or password');
    }
  };

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Login</h1>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <div style={{ marginBottom: '10px' }}>
          <label>Email:</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        <div style={{ marginBottom: '10px' }}>
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            style={{ marginLeft: '10px', padding: '5px' }}
          />
        </div>
        <button type="submit" style={{ padding: '5px 10px' }}>Login</button>
        <button 
          type="button" 
          style={{ padding: '5px 10px', backgroundColor: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' }} 
          onClick={() => navigate('/register')}
        >
          Register
        </button>
      </form>
    </div>
  );
}

export default Login;