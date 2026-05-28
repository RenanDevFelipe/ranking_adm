// Salva o usuario autenticado nas chaves ja usadas pelas telas existentes.
export const login = (userData) => {
  localStorage.setItem('access_token', userData.access_token);

  // A API nova usa id_user/id_ixc_user; telas antigas ainda leem user_id.
  localStorage.setItem('user_id', userData.id_ixc ?? userData.id_ixc_user ?? userData.id_user ?? '');
  localStorage.setItem('user_bd_id', userData.id_user ?? '');
  localStorage.setItem('user_email', userData.email ?? userData.email_user ?? '');
  localStorage.setItem('user_name', userData.nome ?? userData.nome_user ?? '');
  localStorage.setItem('user_role', userData.role ?? '');
  localStorage.setItem('user_setor', userData.setor ?? userData.setor_user ?? '');
  localStorage.setItem('auth_user', JSON.stringify(userData));
};

export const logout = () => {
  localStorage.removeItem('access_token');
  localStorage.removeItem('user_id');
  localStorage.removeItem('user_bd_id');
  localStorage.removeItem('user_email');
  localStorage.removeItem('user_name');
  localStorage.removeItem('auth_user');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_setor');
};

export const isLoggedIn = () => {
  return !!localStorage.getItem('access_token');
};

export const getUser = () => {
  const userData = localStorage.getItem('auth_user');
  return userData ? JSON.parse(userData) : null;
};

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

export const getUserRole = () => {
  return localStorage.getItem('user_role');
};
