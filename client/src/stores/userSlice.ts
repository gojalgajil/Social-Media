import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface User {
  id: number;
  username: string;
  full_name: string;
  email: string;
  photo_profile: string | null;
  header: string | null;
  bio: string | null;
}

interface UserState {
  user: User | null;
  currentUser: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

const tokenFromStorage = localStorage.getItem("token");

const initialState: UserState = {
  user: null,
  currentUser: null,
  token: tokenFromStorage || null,
  isAuthenticated: tokenFromStorage ? true : false,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: User; token?: string }>
    ) => {
      state.user = action.payload.user;
      state.currentUser = action.payload.user;

      // only update token if given
      if (action.payload.token) {
        state.token = action.payload.token;
        localStorage.setItem("token", action.payload.token);
      }

      state.isAuthenticated = true;
    },

    logout: (state) => {
      state.user = null;
      state.currentUser = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("token");
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
