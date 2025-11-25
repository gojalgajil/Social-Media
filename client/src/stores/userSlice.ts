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
  user: Partial<User> | null;        // ← diperbaiki
  currentUser: Partial<User> | null; // ← diperbaiki
  token: string | null;
  isAuthenticated: boolean;
}

const tokenFromStorage = localStorage.getItem("token");

const initialState: UserState = {
  user: null,
  currentUser: null,
  token: tokenFromStorage || null,
  isAuthenticated: !!tokenFromStorage,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: Partial<User>; token?: string }>
    ) => {
      state.user = {
        ...state.user,
        ...action.payload.user,
      };

      state.currentUser = {
        ...state.currentUser,
        ...action.payload.user,
      };

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
