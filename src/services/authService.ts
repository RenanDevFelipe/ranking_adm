import api from '../api/axios.ts';
import { LoginFormData } from '../schemas/auth';

export const authService = {
  async login(data: LoginFormData) {
    try {
      const response = await api.post('Account/login', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};