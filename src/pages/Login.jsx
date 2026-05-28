import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../schemas/auth.ts';
import { authService } from '../services/authService.ts';
import EmailInput from '../components/inputs/EmailInput';
import PasswordInput from '../components/inputs/PassWordInput';
import imgLogin from '../utils/img/Marketing-rafiki.png';
import './styles.css';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';
import { login, logout } from '../utils/auth.js';
import { FaSun, FaMoon } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext.js';

const Login = () => {
  const navigate = useNavigate();
  const { darkMode, toggleDarkMode } = useTheme();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError
  } = useForm({
    resolver: zodResolver(loginSchema)
  });



  const onSubmit = async (data) => {
    try {
      const response = await authService.login(data);
      const user = response.user || {};

      // Mantem as chaves antigas porque as telas atuais ainda leem esses nomes.
      login({
        access_token: response.access_token,
        id_user: user.id_user,
        id_ixc_user: user.id_ixc_user,
        email_user: user.email_user,
        nome_user: user.nome_user,
        role: user.role,
        setor_user: user.setor_user
      });

      toast.success('Login realizado com sucesso!');
      navigate('/dashboard');

    } catch (error) {
      logout();

      let errorMessage = 'Email ou senha incorreto!';

      if (error.response?.data?.message || error.response?.data?.erro || error.response?.data?.error) {
        errorMessage = error.response.data.message || error.response.data.erro || error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      setError('root', {
        type: 'manual',
        message: errorMessage
      });

      console.error('Erro no login:', error);
    }
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
        <div className="theme-toggle-container">
          <button
            className="theme-toggle"
            onClick={toggleDarkMode}
            aria-label={darkMode ? 'Ativar light mode' : 'Ativar dark mode'}
          >
            {darkMode ? <FaMoon /> : <FaSun />}
            {darkMode ? 'Dark Mode' : 'Light Mode'}
          </button>
        </div>

        <h1>Login</h1>
        <form onSubmit={handleSubmit(onSubmit)}>
          <EmailInput
            {...register('email')}
            error={errors.email?.message}
          />
          <PasswordInput
            {...register('password')}
            error={errors.password?.message}
          />

          {errors.root && (
            <div className="error-message">
              {errors.root.message}
            </div>
          )}

          <button
            type="submit"
            id='login-submit'
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Carregando...' : 'Entrar'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
