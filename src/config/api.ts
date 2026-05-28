// O React Scripts expoe apenas variaveis com prefixo REACT_APP_.
// Mantenha REACT_APP_API_BASE_URL no .env sem o sufixo /api/v1.
const rawApiBaseUrl = process.env.REACT_APP_API_BASE_URL || 'https://api-ranking.ticonnecte.com.br';

export const API_BASE_URL = `${rawApiBaseUrl.replace(/\/+$/, '')}/api/v1/`;
