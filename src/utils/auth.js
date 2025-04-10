export const login = (username) => {
    localStorage.setItem('auth_user', username);
  };
  
  export const logout = () => {
    localStorage.removeItem('auth_user');
  };
  
  export const isLoggedIn = () => {
    return !!localStorage.getItem('auth_user');
  };
  
  export const getUser = () => {
    return localStorage.getItem('auth_user');
  };
  