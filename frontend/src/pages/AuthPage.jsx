import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

export default function AuthPage() {
  const [isRegister, setIsRegister] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const { login, register } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (isRegister) {
        await register(name, email, password);
      } else {
        await login(email, password);
      }
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed');
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '50px auto', padding: '24px', border: '1px solid #e2e8f0', borderRadius: '12px', fontFamily: 'sans-serif' }}>
      <h2>{isRegister ? 'Create an Account' : 'Log In'}</h2>

      {error && <p style={{ color: '#ef4444', fontSize: '14px' }}>{error}</p>}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '20px' }}>
        {isRegister && (
          <input
            type="text"
            placeholder="Full Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
          />
        )}
        <input
          type="email"
          placeholder="Email Address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #ccc' }}
        />
        <button
          type="submit"
          style={{ padding: '12px', backgroundColor: '#2563eb', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer' }}
        >
          {isRegister ? 'Register' : 'Log In'}
        </button>
      </form>

      <p style={{ marginTop: '16px', fontSize: '14px', textAlign: 'center' }}>
        {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
        <span
          onClick={() => setIsRegister(!isRegister)}
          style={{ color: '#2563eb', cursor: 'pointer', fontWeight: 'bold' }}
        >
          {isRegister ? 'Log In' : 'Register'}
        </span>
      </p>
    </div>
  );
}