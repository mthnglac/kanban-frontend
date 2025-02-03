import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { BACKEND_BASE_URL } from "../utils/utils";

// Async thunk for fetching all flows
export const fetchFlows = createAsyncThunk(
    "flow/fetchFlows",
    async (boardId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/flows?boardId=${boardId}`);
            if (!response.ok) {
                return rejectWithValue("Failed to fetch flows");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for creating a new flow
export const createFlow = createAsyncThunk(
    "flow/createFlow",
    async ({ title, description, boardNodeId }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/flow`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, description, boardNodeId }),
            });

            if (!response.ok) {
                return rejectWithValue("Failed to create flow");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for deleting a flow
export const deleteFlow = createAsyncThunk(
    "flow/deleteFlow",
    async (flowId, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/flow/${flowId}`, {
                method: "DELETE",
            });
            if (!response.ok) {
                return rejectWithValue("Failed to delete flow");
            }
            return flowId;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

// Async thunk for updating a flow
export const updateFlow = createAsyncThunk(
    "flow/updateFlow",
    async ({ id, title, description, order }, { rejectWithValue }) => {
        try {
            const response = await fetch(`${BACKEND_BASE_URL}/flow/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ title, description, order }),
            });
            if (!response.ok) {
                return rejectWithValue("Failed to update flow");
            }
            const data = await response.json();
            return data;
        } catch (error) {
            return rejectWithValue(error.message);
        }
    }
);

const flowSlice = createSlice({
    name: "flow",
    initialState: {
        flows: [],
        loading: false,
        error: null,
    },
    reducers: {
       updateFlowsLocally: (state, action) => {
            state.flows = action.payload;
        },
    },
    extraReducers: (builder) => {
        builder
            .addCase(fetchFlows.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(fetchFlows.fulfilled, (state, action) => {
                state.loading = false;
                state.flows = action.payload;
            })
            .addCase(fetchFlows.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(createFlow.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(createFlow.fulfilled, (state, action) => {
                state.loading = false;
                state.flows.push(action.payload);
            })
            .addCase(createFlow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(deleteFlow.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(deleteFlow.fulfilled, (state, action) => {
                state.loading = false;
                state.flows = state.flows.filter((flow) => flow.id !== action.payload);
            })
            .addCase(deleteFlow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
            .addCase(updateFlow.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(updateFlow.fulfilled, (state, action) => {
                state.loading = false;
                state.flows = state.flows.map(flow =>
                    flow.id === action.payload.id ? action.payload : flow
                );
            })
            .addCase(updateFlow.rejected, (state, action) => {
                state.loading = false;
                state.error = action.payload;
            })
    },
});

export const { updateFlowsLocally } = flowSlice.actions;
export default flowSlice.reducer;