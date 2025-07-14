import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { signIn } from '../../api/api';
import { AuthContext } from '../../context/AuthContext';

export default function SignIn() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await signIn(username, password);
      if (res.username) {
        login(res);
        navigate('/');
      } else if (res.message) {
        setError(res.message);
      } else {
        setError('Ошибка входа');
      }
    } catch {
      setError('Ошибка сети');
    }
  };

  return (
    <div className="auth-container">
      <h2>Вход</h2>
      <form onSubmit={handleSubmit}>
        <input placeholder="Username" value={username} onChange={e => setUsername(e.target.value)} required />
        <input type="password" placeholder="Пароль" value={password} onChange={e => setPassword(e.target.value)} required />
        <button type="submit">Войти</button>
      </form>
      {error && <p className="error">{error}</p>}
      <p>Нет аккаунта? <Link to="/signup">Зарегистрироваться</Link></p>
    </div>
  );
}