import { create } from 'zustand';

const useAuthStore = create((set) => ({
//state
  user: null,
  token: null,
  isAuthenticated: false,

  // Action login
  login: (user, token) => {
    localStorage.setItem('token', token);
    set({
      user: user,
      token: token,
      isAuthenticated: true,
    });
  },

  // Action logout
  logout: () => {
    localStorage.removeItem('token');
    set({
      user: null,
      token: null,
      isAuthenticated: false,
    });
  },

  // Action initAuth
  initAuth: () => {
    const token = localStorage.getItem('token');
    if (token) {
      set({
        token: token,
        isAuthenticated: true,
      });
    }
  },

}));

export default useAuthStore;