import api from '../api/axios.ts';


export const colaboradorService = {
  async colaborador(data) {
    try {
      const response = await api.post('Colaborador/GetAll', data);
      return response.data;
    } catch (error) {
      throw error;
    }
  }
};