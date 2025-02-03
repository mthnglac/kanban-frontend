import { configureStore } from "@reduxjs/toolkit";
import boardReducer from "./boardSlice";
import flowReducer from "./flowSlice";
import taskReducer from "./taskSlice";

const store = configureStore({
  reducer: {
    board: boardReducer,
    flow: flowReducer,
    task: taskReducer,
  },
});

export default store;
