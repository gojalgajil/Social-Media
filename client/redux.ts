import { configureStore } from '@reduxjs/toolkit';
import userReducer from './src/stores/userSlice';
import repliesReducer from './src/stores/repliesSlice';
import threadsReducer from './src/stores/threadsSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    replies: repliesReducer,
    threads: threadsReducer,
  },
});
