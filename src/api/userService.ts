import { api } from './axios';
import { User } from '../interfaces/User';

export const getUsers = async (): Promise<User[]> => {
  const response = await api.get('/users'); // vai acessar https://ticonnecte.com.br/api/users
  return response.data;
};
