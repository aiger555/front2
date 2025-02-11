import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:8080/auth/signup', {
        email,
        password,
      });
      if (response.data.statusCode === 200) {
        setSuccess('Registration successful! Redirecting...');
        setTimeout(() => {
          navigate('/'); // Redirect to the main app after successful registration
        }, 2000);
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div style={styles.container}>
      <a href="/" style={styles.logo}>
        <img src="/alatooo.png" alt="Logo" style={styles.logoImage} />
      </a>
      <div style={styles.loginBox}>
        <h1 style={styles.title}>Register</h1>
        {error && <p style={styles.error}>{error}</p>}
        {success && <p style={styles.success}>{success}</p>}
        <form onSubmit={handleRegister}>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password:</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={styles.input}
            />
          </div>
          <button type="submit" style={styles.button}>Register</button>
          <button 
            type="button" 
            style={styles.registerButton} 
            onClick={() => navigate('/login')}
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
const styles = {
  logo: {
    position: 'absolute',
    top: '20px',
    left: '50%',
    transform: 'translateX(-50%)',
  },
  logoImage: {
    marginTop: '50px',
    width: '120px',
    height: 'auto',
  },
  loginBox: {
    backgroundColor: 'white',
    padding: '50px',
    borderRadius: '12px',
    boxShadow: '0px 8px 20px rgba(0, 0, 0, 0.15)',
    textAlign: 'center',
    width: '400px',
  },
  title: {
    marginBottom: '20px',
    fontSize: '26px',
    fontWeight: 'bold',
    color: '#333',
  },
  error: {
    color: 'red',
    marginBottom: '10px',
    fontSize: '14px',
  },
  success: {
    color: 'green',
    marginBottom: '10px',
    fontSize: '14px',
  },
  inputGroup: {
    marginBottom: '20px',
    textAlign: 'left',
  },
  label: {
    fontSize: '16px',
    fontWeight: 'bold',
    color: '#555',
  },
  input: {
    width: '100%',
    padding: '12px',
    fontSize: '16px',
    borderRadius: '6px',
    border: '1px solid #ccc',
    marginTop: '5px',
    transition: 'border 0.3s ease',
  },
  button: {
    padding: '12px',
    fontSize: '18px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: '#5C4033',
    color: 'white',
    cursor: 'pointer',
    width: '100%',
    marginTop: '15px',
    transition: 'background 0.3s ease',
  },
  registerButton: {
    padding: '12px',
    fontSize: '18px',
    borderRadius: '6px',
    border: 'none',
    backgroundColor: 'rgb(192, 110, 72)',
    color: 'white',
    cursor: 'pointer',
    width: '100%',
    marginTop: '10px',
    transition: 'background 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#0056b3',
  },
  registerButtonHover: {
    backgroundColor: '#218838',
  },
};

export default Register;