import React, { useState, useRef, useEffect } from "react";
import { Draggable } from "@hello-pangea/dnd";
import { useDispatch } from "react-redux";
import { deleteTask, updateTask } from "../store/taskSlice";

const Task = ({ task, index }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(task.title);
  const [editedOrder, setEditedOrder] = useState(task.order);

  const menuRef = useRef(null);
  const dispatch = useDispatch();

  const handleOpenMenu = () => {
    setIsMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setIsMenuOpen(false);
  };

  const handleDeleteTask = async () => {
    if (window.confirm("Are you sure you want to delete this task?")) {
      await dispatch(deleteTask(task.id));
    }
    handleCloseMenu();
  };

  const handleEditTask = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditedTitle(task.title);
    setEditedOrder(task.order);
  };

  const handleSaveEdit = async () => {
    await dispatch(
      updateTask({
        id: task.id,
        title: editedTitle,
        order: Number(editedOrder),
      })
    );
    setIsEditMode(false);
  };
  const calculateTimeAgo = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInSeconds = Math.round((now - date) / 1000);

    if (diffInSeconds < 60) {
      return `created ${diffInSeconds} seconds ago`;
    }
    const diffInMinutes = Math.round(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `created ${diffInMinutes} mins ago`;
    }
    const diffInHours = Math.round(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `created ${diffInHours} hours ago`;
    }
    const diffInDays = Math.round(diffInHours / 24);
    return `created ${diffInDays} days ago`;
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
    <Draggable draggableId={String(task.id)} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          style={{
            border: "1px solid #ccc",
            padding: "8px",
            margin: "4px",
            backgroundColor: snapshot.isDragging ? "lightblue" : "white",
            boxShadow: snapshot.isDragging ? "2px 2px 5px #888888" : "none",
            opacity: snapshot.isDragging ? 0.8 : 1,
            transition:
              "background-color 0.3s ease, box-shadow 0.3s ease, opacity 0.3s ease",
            ...provided.draggableProps.style,
            transform: snapshot.isDragging
              ? provided.draggableProps.style.transform
              : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            {isEditMode ? (
              <div style={{ flex: 1 }}>
                <input
                  type="text"
                  value={editedTitle}
                  onChange={(e) => setEditedTitle(e.target.value)}
                />
                <input
                  type="number"
                  value={editedOrder}
                  onChange={(e) => setEditedOrder(e.target.value)}
                />
                <button onClick={handleSaveEdit}>Save</button>
                <button onClick={handleCancelEdit}>Cancel</button>
              </div>
            ) : (
              <div style={{ flex: 1 }} onClick={handleEditTask}>
                <h4 style={{ margin: "0" }}>{task.title}</h4>
                <div
                  style={{
                    backgroundColor: "#f0f0f0",
                    height: "5px",
                    borderRadius: "3px",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#4caf50",
                      height: "100%",
                      width: `${task.progress}%`,
                      borderRadius: "3px",
                    }}
                  />
                </div>
                <p
                  style={{
                    margin: "0",
                    fontStyle: "italic",
                    fontSize: "0.8rem",
                    textAlign: "right",
                  }}
                >
                  {calculateTimeAgo(task.createdAt)}
                </p>
              </div>
            )}

            <div style={{ position: "relative" }} ref={menuRef}>
              <button onClick={handleOpenMenu}>...</button>
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
                    }}
                    onClick={handleEditTask}
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDeleteTask}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                    }}
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Draggable>
  );
};

export default Task;
