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
  }
);

// Async thunk untuk toggle like thread
export const toggleThreadLike = createAsyncThunk(
  'threads/toggleLike',
  async ({ threadId, currentIsLiked }: { threadId: number; currentIsLiked: boolean }) => {
    const response = await fetch(`http://localhost:3002/api/threads/${threadId}/like`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    return { threadId };
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
        state.threads[index] = action.payload;
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

      // toggleThreadLike
      .addCase(toggleThreadLike.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleThreadLike.fulfilled, (state, action) => {
        // Note: In a real-time app, this would typically be handled by socket events
        // For now, we can refetch but ideally we'd get real-time updates
      })
      .addCase(toggleThreadLike.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle like';
      });
  },
});

export const { addThread, updateThread, clearThreads } = threadsSlice.actions;
export default threadsSlice.reducer;
