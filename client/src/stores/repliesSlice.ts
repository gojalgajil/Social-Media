import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';

interface Reply {
  id: number;
  content: string;
  image?: string;
  created_at: string;
  likesCount?: number;
  isLiked?: boolean;
  user?: {
    id: number;
    full_name: string;
    username: string;
    photo_profile?: string;
  };
}

interface RepliesState {
  replies: Reply[];
  loading: boolean;
  error: string | null;
}

const initialState: RepliesState = {
  replies: [],
  loading: false,
  error: null,
};

// Async thunk untuk fetch replies
export const fetchRepliesByThread = createAsyncThunk(
  'replies/fetchByThread',
  async (threadId: string) => {
    const response = await fetch(
      `http://localhost:3002/api/replies/thread/${threadId}`,
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch replies');
    }

    const data = await response.json();
    return data.data || [];
  }
);

// Async thunk untuk toggle like
export const toggleReplyLike = createAsyncThunk(
  'replies/toggleLike',
  async ({ replyId, currentIsLiked }: { replyId: number; currentIsLiked: boolean }) => {
    const response = await fetch(`http://localhost:3002/api/replies/${replyId}/like`, {
      method: "PUT",
      headers: {
        "Authorization": `Bearer ${localStorage.getItem("token")}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error('Failed to toggle like');
    }

    return { replyId };
  }
);

const repliesSlice = createSlice({
  name: 'replies',
  initialState,
  reducers: {
    setReplies: (state, action: PayloadAction<Reply[]>) => {
      state.replies = action.payload;
    },
    addReply: (state, action: PayloadAction<Reply>) => {
      state.replies.push(action.payload);
    },
    clearReplies: (state) => {
      state.replies = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // fetchByThread
      .addCase(fetchRepliesByThread.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchRepliesByThread.fulfilled, (state, action) => {
        state.loading = false;
        state.replies = action.payload;
      })
      .addCase(fetchRepliesByThread.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Failed to fetch replies';
      })

      // toggleLike
      .addCase(toggleReplyLike.pending, (state) => {
        state.error = null;
      })
      .addCase(toggleReplyLike.fulfilled, (state, action) => {
        // Note: We need to refetch after toggle to get accurate data
        // In a real app, you might refetch here or optimistically update
      })
      .addCase(toggleReplyLike.rejected, (state, action) => {
        state.error = action.error.message || 'Failed to toggle like';
      });
  },
});

export const { setReplies, addReply, clearReplies } = repliesSlice.actions;
export default repliesSlice.reducer;
