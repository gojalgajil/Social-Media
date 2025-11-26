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
  user: Partial<User> | null;       // ← komponen kamu pakai ini
  token: string | null;
  isAuthenticated: boolean;
  currentUser: Partial<User> | null; // ← tetap ada, tapi tidak nested
  followingCount: number; // For real-time following count updates
}

const initialState: UserState = {
  user: null,
  token: null,
  isAuthenticated: false,
  currentUser: null,  // ← tidak nested lagi
  followingCount: 0,
};

const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    setUser: (
      state,
      action: PayloadAction<{ user: Partial<User>; token?: string }>
    ) => {
      // update state.user (dipakai komponenmu)
      state.user = {
        ...state.user,
        ...action.payload.user,
      };

      // sync ke currentUser biar konsisten
      state.currentUser = {
        ...state.currentUser,
        ...action.payload.user,
      };

      // token
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

    incrementFollowing: (state) => {
      // Update following count (when someone follows)
      // This is used for real-time UI updates
      // The actual data will sync on next app load
    },
  },
});

export const { setUser, logout } = userSlice.actions;
export default userSlice.reducer;
