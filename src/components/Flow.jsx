import React, { useState, useEffect, useRef } from "react";
import { Droppable } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchTasks,
  createTask,
  deleteTask,
} from "../store/taskSlice";
import Task from "./Task";
import { updateFlow, deleteFlow } from "../store/flowSlice";
import { FaPencilAlt } from "react-icons/fa";

const Flow = ({ flow }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(flow.title);
  const [isCreateTaskMode, setIsCreateTaskMode] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState("");
  const [newTaskDescription, setNewTaskDescription] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false); // State for controlling the menu
  const menuRef = useRef(null);

  const { tasks, loading, error } = useSelector((state) => state.task);
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchTasks(flow.id));
  }, [dispatch, flow.id]);

  const handleOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleCreateTaskMode = () => {
    setIsCreateTaskMode(true);
  };

  const handleCancelCreateTask = () => {
    setIsCreateTaskMode(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const handleCreateTask = async () => {
    dispatch(
      createTask({
        title: newTaskTitle,
        description: newTaskDescription,
        flowNodeId: flow.id,
      })
    );
    setIsCreateTaskMode(false);
    setNewTaskTitle("");
    setNewTaskDescription("");
  };

  const handleEditColumn = () => {
    setIsEditMode(true);
    handleCloseMenu();
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedTitle(flow.title);
  };

  const handleSaveEdit = async () => {
    dispatch(
      updateFlow({
        id: flow.id,
        title: editedTitle,
        description: flow.description,
        order: flow.order,
      })
    );
    setIsEditMode(false);
    handleCloseMenu();
  };

  const handleDeleteFlow = async () => {
    if (window.confirm("Are you sure you want to delete this column?")) {
      dispatch(deleteFlow(flow.id));
    }
    handleCloseMenu();
  };
  // Close the menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [menuRef]);

  return (
    <div
      style={{
        border: "1px solid #ccc",
        padding: "10px",
        margin: "10px",
        minWidth: "300px",
        backgroundColor: "#f0f0f0",
        borderRadius: "5px",
      }}
    >
      {!(loading || error) && (
        <>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {isEditMode ? (
              <div style={{ display: "flex", alignItems: "center" }}>
                <input
                  style={{
                    margin: "5px",
                    padding: "5px",
                    borderRadius: "5px",
                    border: "1px solid #ccc",
                  }}
                  required
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <button
                  style={{
                    margin: "5px",
                    padding: "5px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    border: "1px solid #ccc",
                  }}
                  onClick={handleSaveEdit}
                  disabled={!editedTitle}
                >
                  Save
                </button>
                <button
                  style={{
                    margin: "5px",
                    padding: "5px",
                    borderRadius: "5px",
                    cursor: "pointer",
                    border: "1px solid #ccc",
                  }}
                  onClick={handleCancelEdit}
                >
                  Cancel
                </button>
              </div>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: "5px" }}
              >
                <h2 style={{ margin: "5px" }}>{flow.title}</h2>
                <FaPencilAlt
                  style={{ cursor: "pointer", padding: "5px" }}
                  onClick={handleEditColumn}
                />
              </div>
            )}

            <div style={{ position: "relative" }} ref={menuRef}>
              <button style={{ cursor: "pointer" }} onClick={handleOpenMenu}>
                ...
              </button>
              {isMenuOpen && (
                <div
                  style={{
                    position: "absolute",
                    top: "100%",
                    right: 0,
                    border: "1px solid #ccc",
                    backgroundColor: "white",
                    padding: "5px",
                  }}
                >
                  <button
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      cursor: "pointer",
                      padding: "5px",
                      margin: "2px",
                    }}
                    onClick={handleDeleteFlow}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <Droppable droppableId={String(flow.id)}>
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                style={{ minHeight: "50px", padding: "10px" }}
              >
                {loading ? (
                  <div>Loading...</div>
                ) : error ? (
                  <div>Error: {error}</div>
                ) : (
                  [...tasks]
                    .filter((task) => task.flowNodeId === flow.id)
                    .map((task, index) => (
                      <Task key={task.id} task={task} index={index} />
                    ))
                )}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
          {isCreateTaskMode ? (
            <div>
              <input
                style={{
                  margin: "5px",
                  padding: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
                required
                type="text"
                placeholder="Task Title"
                value={newTaskTitle}
                onChange={(e) => setNewTaskTitle(e.target.value)}
              />
              <input
                style={{
                  margin: "5px",
                  padding: "5px",
                  borderRadius: "5px",
                  border: "1px solid #ccc",
                }}
                required
                type="text"
                placeholder="Task Description"
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
              />
              <button
                style={{
                  margin: "5px",
                  padding: "5px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                }}
                onClick={handleCreateTask}
                disabled={!newTaskTitle && !newTaskDescription}
              >
                Create
              </button>
              <button
                style={{
                  margin: "5px",
                  padding: "5px",
                  borderRadius: "5px",
                  cursor: "pointer",
                  border: "1px solid #ccc",
                }}
                onClick={handleCancelCreateTask}
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              style={{
                margin: "5px",
                padding: "5px",
                borderRadius: "5px",
                cursor: "pointer",
                border: "1px solid #ccc",
              }}
              onClick={handleCreateTaskMode}
            >
              + Create Task
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default Flow;
