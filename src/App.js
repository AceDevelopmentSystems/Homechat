import React, { useState } from 'react';
import { register, login } from './api';
import CentralArea from './CentralArea';
import Chat from './Chat';
import AvatarCustomizer from './AvatarCustomizer';
import AdminReports from './AdminReports';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLogin, setIsLogin] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [avatarOptions, setAvatarOptions] = useState({ skin: '#ffdbac', shirt: '#8d5524', pants: '#2d2d2d' });
  const [avatarPosition, setAvatarPosition] = useState({ x: 0, z: 0 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (isLogin) {
        const res = await login(username, password);
        if (res.token) {
          setUser(res.user);
        } else {
          setError(res.message || 'Login failed');
        }
      } else {
        const res = await register(username, password);
        if (res.message === 'User created') {
          setIsLogin(true);
        } else {
          setError(res.message || 'Registration failed');
        }
      }
    } catch (err) {
      setError('Server error');
    }
  };

  const [showAdmin, setShowAdmin] = useState(false);

  if (showAdmin) {
    return <AdminReports />;
  }

  if (user) {
    return (
      <div style={{ maxWidth: 900, margin: '0 auto', padding: 16 }}>
        <h1 style={{ textAlign: 'center' }}>Welcome, {user.username}!</h1>
        <button style={{ float: 'right' }} onClick={() => setShowAdmin(true)}>Admin Reports</button>
        <AvatarCustomizer onChange={setAvatarOptions} />
        <CentralArea avatarOptions={avatarOptions} onMove={setAvatarPosition} />
        <VoiceChat username={user.username} avatarPosition={avatarPosition} />
        <Chat username={user.username} />
        {/* Controls and UI for mobile/desktop can be added here */}
      </div>
    );
  }

  return (
    <div>
      <h1>3D Social World</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">{isLogin ? 'Login' : 'Register'}</button>
      </form>
      <button onClick={() => { setIsLogin(!isLogin); setError(''); }}>
        {isLogin ? 'Need an account? Register' : 'Have an account? Login'}
      </button>
      {error && <div style={{ color: 'red' }}>{error}</div>}
    </div>
  );
}

// ...existing code...
export default App;
