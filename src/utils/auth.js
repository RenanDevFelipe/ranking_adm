// Armazena os dados do usuário após login bem-sucedido
export const login = (userData) => {
  localStorage.setItem('access_token', userData.access_token);
  localStorage.setItem('user_id', userData.id_ixc);
  localStorage.setItem('user_email', userData.email);
  localStorage.setItem('user_name', userData.nome);
  
  // Opcional: Armazenar o objeto completo como JSON
  localStorage.setItem('auth_user', JSON.stringify(userData));
};

// Remove todos os dados ao fazer logout
export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_name');
  localStorage.removeItem('auth_user');
};

// Verifica se o usuário está logado
export const isLoggedIn = () => {
  return !!localStorage.getItem('access_token');
};

// Retorna os dados completos do usuário
export const getUser = () => {
  const userData = localStorage.getItem('auth_user');
  return userData ? JSON.parse(userData) : null;
};

// Métodos adicionais para acessar dados específicos
export const getToken = () => {
  return localStorage.getItem('access_token');
};

export const getUserId = () => {
  return localStorage.getItem('user_id');
};

export const getUserEmail = () => {
  return localStorage.getItem('user_email');
};

export const getUserName = () => {
  return localStorage.getItem('user_name');
};