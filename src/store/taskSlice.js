import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_BASE_URL } from "../utils/utils";

export const fetchTasks = createAsyncThunk(
  "task/fetchTasks",
  async (flowId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/tasks?id=${flowId}`);
      if (!response.ok) {
        return rejectWithValue("Failed to fetch tasks");
      }
      const data = await response.json();
      const sortedData = [...data].sort((a,b) => a.order- b.order)
      return sortedData;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const createTask = createAsyncThunk(
  "task/createTask",
  async ({ title, description, flowNodeId }, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ title, description, flowNodeId }),
      });

      if (!response.ok) {
        return rejectWithValue("Failed to create task");
      }
      const data = await response.json();
      return data;
    } catch (error) {
        return rejectWithValue(error.message);
    }
  }
);


export const deleteTask = createAsyncThunk(
  "task/deleteTask",
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await fetch(`${BACKEND_BASE_URL}/task/${taskId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        return rejectWithValue("Failed to delete task");
      }
      return taskId;
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

// Async thunk for updating a task
export const updateTask = createAsyncThunk(
    "task/updateTask",
    async ({ id, title, description, order }, { rejectWithValue }) => {
      try {
        const response = await fetch(`${BACKEND_BASE_URL}/task/${id}`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ title, description, order }),
        });
        if (!response.ok) {
          return rejectWithValue("Failed to update task");
        }
        const data = await response.json();
        return data;
      } catch (error) {
        return rejectWithValue(error.message);
      }
    }
  );

const taskSlice = createSlice({
  name: "task",
  initialState: {
    tasks: [],
    loading: false,
    error: null,
  },
   reducers: {
   },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTasks.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = action.payload;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks.push(action.payload);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(deleteTask.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteTask.fulfilled, (state, action) => {
          state.loading = false;
          state.tasks = state.tasks.filter(task => task.id !== action.payload);
      })
      .addCase(deleteTask.rejected, (state, action) => {
          state.loading = false;
          state.error = action.payload;
      })
      .addCase(updateTask.pending, (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase(updateTask.fulfilled, (state, action) => {
        state.loading = false;
        state.tasks = state.tasks.map(task =>
            task.id === action.payload.id ? action.payload : task
          );
    })
    .addCase(updateTask.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
  },
});

export default taskSlice.reducer;