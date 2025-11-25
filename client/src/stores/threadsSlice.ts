import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Thread {
  id: number;
  content: string;
  image?: string;
  number_of_replies?: number;
  created_at: string;
  likesCount?: number;
  isLiked?: boolean;
  full_name?: string;
  username?: string;
  avatar?: string;
}

interface ThreadsState {
  threads: Thread[];
  loading: boolean;
  error: string | null;
}

const initialState: ThreadsState = {
  threads: [],
  loading: false,
  error: null,
};

// Async thunk untuk fetch threads
export const fetchThreads = createAsyncThunk(
  'threads/fetchAll',
  async () => {
    try {
      const response = await fetch('http://localhost:3002/api/threads', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch threads');
      }

      const data = await response.json();
      return data.data || [];
    } catch (error) {
      console.error('Error in fetchThreads:', error);
      throw error;
    }
  }
);

// Async thunk untuk fetch single thread by id
export const fetchSingleThread = createAsyncThunk(
  'threads/fetchSingle',
  async (id: number) => {
    try {
      const response = await fetch(`http://localhost:3002/api/threads/${id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch thread with id ${id}`);
      }

      const data = await response.json();
      return data.data;
    } catch (error) {
      console.error('Error in fetchSingleThread:', error);
      throw error;
    }
  }
);

// Async thunk untuk toggle like thread
export const toggleThreadLike = createAsyncThunk(
  'threads/toggleLike',
  async ({ threadId, currentIsLiked }: { threadId: number; currentIsLiked: boolean }) => {
    try {
      const response = await fetch(`http://localhost:3002/api/threads/${threadId}/like`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error('Failed to toggle like');
      }

      return { threadId };
    } catch (error) {
      console.error('Error in toggleThreadLike:', error);
      throw error;
    }
  }
);

const threadsSlice = createSlice({
  name: 'threads',
  initialState,
  reducers: {
    addThread: (state, action: PayloadAction<Thread>) => {
      if (!state.threads.some(t => t.id === action.payload.id)) {
        state.threads.unshift(action.payload); // Add to beginning for reverse chronological order
      }
    },
    updateThread: (state, action: PayloadAction<Thread>) => {
      const index = state.threads.findIndex(thread => thread.id === action.payload.id);
      if (index !== -1) {
        state.threads[index] = {
          ...state.threads[index],
          ...action.payload,
        };
      }
    },
    updateThreadLikeStatus: (state, action: PayloadAction<{ id: number; isLiked: boolean; likesCount: number }>) => {
      const index = state.threads.findIndex(thread => thread.id === action.payload.id);
      if (index !== -1) {
        state.threads[index].isLiked = action.payload.isLiked;
        state.threads[index].likesCount = action.payload.likesCount;
      }
    },
    clearThreads: (state) => {
      state.threads = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchThreads
      .addCase(fetchThreads.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchThreads.fulfilled, (state, action) => {
        state.loading = false;
        state.threads = action.payload;
      })
      .addCase(fetchThreads.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch threads';
      })

      // toggleThreadLike - rely on optimistic updates and WebSocket for correct server state
      .addCase(toggleThreadLike.pending, (state) => {
        state.error = null;
      })
      // Remove fulfilled case to avoid double-toggling with optimistic updates
      .addCase(toggleThreadLike.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle like';
        // TODO: Revert optimistic update on error
      })
      .addCase(fetchSingleThread.fulfilled, (state, action) => {
        const fetchedThread = action.payload;
        if (!fetchedThread) return;
        const index = state.threads.findIndex(thread => thread.id === fetchedThread.id);
        if (index !== -1) {
          state.threads[index] = {
            ...state.threads[index],
            ...fetchedThread,
          };
        } else {
          // Add new thread if not in state
          state.threads.unshift(fetchedThread);
        }
      });
  },
});

export const { addThread, updateThread, updateThreadLikeStatus, clearThreads } = threadsSlice.actions;

export const selectThreads = (state: { threads: ThreadsState }) => state.threads.threads;
export const getThreadById = (state: { threads: ThreadsState }, id: number) => state.threads.threads.find(thread => thread.id === id);

export default threadsSlice.reducer;
