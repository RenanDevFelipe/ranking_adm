import React, { useState } from 'react';
import EmailInput from '../components/inputs/EmailInput';
import PasswordInput from '../components/inputs/PassWordInput';
import imgLogin from '../utils/img/Marketing-rafiki.png';
import './styles.css';


const Login = () => {
  const [form, setForm] = useState({ email: '', password: '' });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(form); // Aqui você conecta com a API
  };

  return (
    <div className='div-form-login-body'>
      <div className='div-first-part-login'>
        <span>
          <h1>Faça login <br /> para entrar no nosso Ranking</h1>
          <img src={imgLogin} alt="" />
        </span>
      </div>
      <div className='div-form-login'>
        <h1>Login</h1>
        <form onSubmit={handleSubmit}>
          <EmailInput value={form.email} onChange={handleChange} />
          <PasswordInput value={form.password} onChange={handleChange} />
          <button type="submit" id='login-submit'>Entrar</button>
        </form>
      </div>
    </div>
  );
};

export default Login;
