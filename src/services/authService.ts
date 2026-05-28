import api from '../api/axios.ts';
import { LoginFormData } from '../schemas/auth';

const extractLoginData = (responseData: any) => {
  if (!responseData?.success || !responseData?.data?.access_token) {
    throw new Error(responseData?.message || responseData?.erro || 'Email ou senha incorreto!');
  }

  return responseData.data;
};

export const authService = {
  async login(data: LoginFormData) {
    // O formulario usa nomes simples; a API nova espera email_user/senha_user.
    const response = await api.post('auth/login', {
      email_user: data.email,
      senha_user: data.password
    });

    return extractLoginData(response.data);
  },

  async logout() {
    const response = await api.post('auth/logout');
    return response.data;
  },

  async me() {
    const response = await api.get('auth/me');
    return response.data?.data?.user;
  }
};
