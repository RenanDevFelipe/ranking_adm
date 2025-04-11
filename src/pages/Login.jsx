import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../utils/auth';
import EmailInput from '../components/inputs/EmailInput';
import PasswordInput from '../components/inputs/PassWordInput';

export default function Login() {
  const [username, setUsername] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    login(username);
    navigate('/home');
  };

  return (
    <div style={{ textAlign: 'center', marginTop: 50 }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <EmailInput value={form.email} onChange={handleChange} />
        <PasswordInput value={form.password} onChange={handleChange} />
        <button type="submit">Entrar</button>
      </form>
    </div>
  );
}
