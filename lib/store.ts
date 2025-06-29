import { configureStore, createSlice, PayloadAction } from '@reduxjs/toolkit';

interface AuthState {
  isAuthenticated: boolean;
}

const loadAuthState = (): AuthState => {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('auth');
    if (stored) return JSON.parse(stored);
  }
  return { isAuthenticated: false };
};

const initialState: AuthState = loadAuthState();

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    login(state) {
      state.isAuthenticated = true;
    },
    logout(state) {
      state.isAuthenticated = false;
    },
  },
});

export const { login, logout } = authSlice.actions;

export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
  },
});

store.subscribe(() => {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth', JSON.stringify(store.getState().auth));
  }
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 