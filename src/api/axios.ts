import axios from 'axios';

export const api = axios.create({
  baseURL: 'https://ticonnecte.com.br/ranking_api/api/public/', 
});
