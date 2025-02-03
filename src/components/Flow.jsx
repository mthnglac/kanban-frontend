import React, { useState, useEffect, useRef } from "react";
import { Droppable, DragDropContext } from "@hello-pangea/dnd";
import { useDispatch, useSelector } from "react-redux";
import { fetchTasks, createTask, deleteTask, updateTask } from "../store/taskSlice";
import Task from "./Task";
import { updateFlow, deleteFlow } from "../store/flowSlice";
import { FaPencilAlt } from "react-icons/fa";

const Flow = ({ flow }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const [editedTitle, setEditedTitle] = useState(flow.title);
  const [editedDescription, setEditedDescription] = useState(flow.description);
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
        await dispatch(createTask({ title: newTaskTitle, description: newTaskDescription, flowNodeId: flow.id }));
       setIsCreateTaskMode(false);
       setNewTaskTitle("");
       setNewTaskDescription("");
    }


    const handleDeleteTask = async (taskId) => {
      if(window.confirm("Are you sure you want to delete this task?"))
      {
       await dispatch(deleteTask(taskId));
      }
    }

    const handleEditColumn = () => {
      setIsEditMode(true);
      handleCloseMenu();
    };

    const handleCancelEdit = () => {
      setIsEditMode(false);
      setEditedTitle(flow.title);
    };

    const handleSaveEdit = async () => {
      await dispatch(
        updateFlow({
          id: flow.id,
          title: editedTitle,
          description: flow.description,
            order: flow.order
         })
      );
      setIsEditMode(false);
       handleCloseMenu();
    };

    const handleDeleteFlow = async () => {
      if(window.confirm("Are you sure you want to delete this column?")) {
         await dispatch(deleteFlow(flow.id));
      }
      handleCloseMenu();
    }
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

    const handleOnDragEnd = async (result) => {
        if (!result.destination) return;
        const { source, destination } = result;

         const items = [...tasks].filter((task) => task.flowNodeId === flow.id);

      // If the task has been moved to another column
      if (source.droppableId !== destination.droppableId) {
          console.log("Moved to another column");
        }
        // Reorder tasks within the same column
       else {
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);
        
         const updatedTasks = items.map((task, index) => ({...task, order: index}));

          updatedTasks.forEach(async updatedTask => {
              if(tasks.find((t) => t.id === updatedTask.id).order !== updatedTask.order) {
                 dispatch(updateTask(updatedTask));
                    dispatch(fetchTasks(flow.id));
                  }
            });
        }
    };

      const handleKeyDown = (event) => {
            if (event.key === 'Enter') {
                handleSaveEdit();
            }
        };
    return (
        <div style={{ border: '1px solid #ccc', padding: '10px', margin: '10px', minWidth: '200px', backgroundColor: '#f0f0f0', borderRadius: '5px' }}>
        {!(loading || error) && (
        <>
         <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            {isEditMode ? (
                <div style={{display: "flex", alignItems: "center"}}>
                    <input
                        style={{margin: "5px", padding: "5px", borderRadius: "5px", border: '1px solid #ccc'}}
                        type="text"
                        value={editedTitle}
                        onChange={(e) => setEditedTitle(e.target.value)}
                         onKeyDown={handleKeyDown}
                    />
                    <button style={{margin: "5px", padding: "5px", borderRadius: "5px", cursor:"pointer", border: '1px solid #ccc'}} onClick={handleSaveEdit}>Save</button>
                    <button style={{margin: "5px", padding: "5px", borderRadius: "5px", cursor:"pointer", border: '1px solid #ccc'}} onClick={handleCancelEdit}>Cancel</button>
                 </div>

             ) : (
                <div style={{display:'flex', alignItems: 'center', gap: '5px'}}>
                     <h2 style={{ margin: '0'}}>{flow.title}</h2>
                     <FaPencilAlt style={{cursor:"pointer"}} onClick={handleEditColumn} />
                 </div>
            )}
          
            <div style={{ position: 'relative' }} ref={menuRef}>
                <button style={{cursor:"pointer"}} onClick={handleOpenMenu}>...</button>
                  {isMenuOpen && (
                  <div
                      style={{
                         position: "absolute",
                          top: "100%",
                          right: 0,
                          border: '1px solid #ccc',
                          backgroundColor: "white",
                          padding: "5px",
                      }}>
                    <button style={{ display: 'block', width: '100%', textAlign: 'left', cursor:"pointer", padding: "5px", margin: '2px'}} onClick={handleDeleteFlow}>Delete</button>
                   </div>
              )}
            </div>
        </div>
          <DragDropContext onDragEnd={handleOnDragEnd}>
          <Droppable droppableId={String(flow.id)}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  style={{ minHeight: '50px', padding: '10px' }}
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
             </DragDropContext>
           {isCreateTaskMode ? (
                 <div>
                    <input
                        style={{margin: "5px", padding: "5px", borderRadius: "5px", border: '1px solid #ccc'}}
                        type="text"
                        placeholder="Task Title"
                        value={newTaskTitle}
                        onChange={(e) => setNewTaskTitle(e.target.value)}
                    />
                     <input
                        style={{margin: "5px", padding: "5px", borderRadius: "5px", border: '1px solid #ccc'}}
                        type="text"
                        placeholder="Task Description"
                        value={newTaskDescription}
                        onChange={(e) => setNewTaskDescription(e.target.value)}
                    />
                    <button style={{margin: "5px", padding: "5px", borderRadius: "5px", cursor:"pointer", border: '1px solid #ccc'}} onClick={handleCreateTask}>Create</button>
                    <button style={{margin: "5px", padding: "5px", borderRadius: "5px", cursor:"pointer", border: '1px solid #ccc'}} onClick={handleCancelCreateTask}>Cancel</button>
                </div>
            ) : (
                <button style={{margin: "5px", padding: "5px", borderRadius: "5px", cursor:"pointer", border: '1px solid #ccc'}} onClick={handleCreateTaskMode}>+ Create Task</button>
           )}
          </>
          )}
      </div>
    );
  };

  export default Flow;