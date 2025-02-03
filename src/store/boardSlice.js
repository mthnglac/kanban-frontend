import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_BASE_URL } from "../utils/utils";

export const fetchBoard = createAsyncThunk(
  "board/fetchBoard",
  async (boardId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/board/${boardId}`);
      if (!response.ok) {
        return rejectWithValue("Failed to fetch board");
      }
      const data = await response.json();
      return data;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

const boardSlice = createSlice({
  name: "board",
  initialState: {
    board: null,
    loading: false,
    error: null,
    boardId: 1,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBoard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBoard.fulfilled, (state, action) => {
        state.loading = false;
        state.board = action.payload;
      })
      .addCase(fetchBoard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export default boardSlice.reducer;
