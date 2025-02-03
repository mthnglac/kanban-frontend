import React, {useEffect, useState} from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchFlows, createFlow } from "../store/flowSlice";
import Flow from "./Flow";
import { fetchBoard } from "../store/boardSlice";
import { DragDropContext } from "@hello-pangea/dnd";
import { updateTask, fetchTasks } from "../store/taskSlice";

const Board = () => {
  const { boardId, board, loading: boardLoading, error: boardError } = useSelector((state) => state.board);
  const { flows, loading: flowLoading, error: flowError } = useSelector((state) => state.flow);
  const dispatch = useDispatch();
  const [isCreateColumnMode, setIsCreateColumnMode] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [newColumnDescription, setNewColumnDescription] = useState("");
 const { tasks } = useSelector((state) => state.task);

  useEffect(() => {
    dispatch(fetchBoard(boardId));
    dispatch(fetchFlows(boardId));
  }, [dispatch, boardId]);

  const handleCreateColumnMode = () => {
    setIsCreateColumnMode(true);
  }

  const handleCancelCreate = () => {
    setIsCreateColumnMode(false);
    setNewColumnTitle("");
    setNewColumnDescription("");
  }

  const handleCreateColumn = async () => {
    await dispatch(createFlow({ title: newColumnTitle, description: newColumnDescription, boardNodeId: boardId }));
    setIsCreateColumnMode(false);
    setNewColumnTitle("");
    setNewColumnDescription("");
  }

    const handleOnDragEnd = async (result) => {
        if (!result.destination) return;
          const { source, destination } = result;
        
        // If the task has been moved to another column
        if (source.droppableId !== destination.droppableId) {
          const sourceItems = [...tasks].filter(
              (task) => task.flowNodeId === Number(source.droppableId)
            );
            const destinationItems = [...tasks].filter(
                (task) => task.flowNodeId === Number(destination.droppableId)
            );

             const [reorderedItem] = sourceItems.splice(source.index, 1);
              destinationItems.splice(destination.index, 0, reorderedItem);


          const updatedSourceTasks = sourceItems.map((task, index) => ({ ...task, order: index }));
             const updatedDestinationTasks = destinationItems.map((task, index) => ({...task, order: index, flowNodeId: Number(destination.droppableId)}));


          updatedSourceTasks.forEach(async updatedTask => {
              if(tasks.find((t) => t.id === updatedTask.id).order !== updatedTask.order || tasks.find((t) => t.id === updatedTask.id).flowNodeId !== updatedTask.flowNodeId) {
                  await dispatch(updateTask(updatedTask));
                  dispatch(fetchTasks(Number(source.droppableId)));
                }
          });
           updatedDestinationTasks.forEach(async updatedTask => {
               if(tasks.find((t) => t.id === updatedTask.id).order !== updatedTask.order || tasks.find((t) => t.id === updatedTask.id).flowNodeId !== updatedTask.flowNodeId) {
                 await dispatch(updateTask(updatedTask));
                  dispatch(fetchTasks(Number(destination.droppableId)));
               }
         });
         }
         else
        {
           const items = [...tasks]
             .filter((task) => task.flowNodeId === Number(source.droppableId));
             const [reorderedItem] = items.splice(source.index, 1);
              items.splice(destination.index, 0, reorderedItem);

           const updatedTasks = items.map((task, index) => ({...task, order: index, flowNodeId: Number(source.droppableId)}));


             updatedTasks.forEach(async updatedTask => {
                 if(tasks.find((t) => t.id === updatedTask.id).order !== updatedTask.order) {
                      await dispatch(updateTask(updatedTask));
                       dispatch(fetchTasks(Number(source.droppableId)));
                   }
              });
         }
    };
  return (
        <div>
           {boardLoading ? (
               <div>Loading board...</div>
              ) : boardError ? (
                  <div>Error loading board: {boardError}</div>
              ) : board ? (
                  <div>
                   <h1>Board Id: {board.id}</h1>
                    <DragDropContext onDragEnd={handleOnDragEnd}>
                        <div style={{
                            display: "flex",
                            overflowX: "auto",
                            padding: "20px",
                            minHeight: '100vh',
                            }}
                        >
                            {flowLoading ? (
                                <div>Loading...</div>
                            ) : flowError ? (
                                <div>Error: {flowError}</div>
                            ) : (
                                 [...flows]
                                .sort((a, b) => a.order - b.order)
                                 .map((flow) => (
                                    <Flow key={flow.id} flow={flow} />
                                ))
                            )}

                            {isCreateColumnMode ? (
                                <div style={{
                                    border: '1px solid #ccc',
                                    padding: '10px',
                                    margin: '10px',
                                    minWidth: '60px',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '5px',
                                    display: "flex",
                                    flexDirection: "column",
                                    justifyContent: "flex-start"
                                    }}>
                                    <input
                                        type="text"
                                        placeholder="Column Title"
                                        value={newColumnTitle}
                                        onChange={(e) => setNewColumnTitle(e.target.value)}
                                    />
                                    <input
                                        type="text"
                                        placeholder="Column Description"
                                        value={newColumnDescription}
                                        onChange={(e) => setNewColumnDescription(e.target.value)}
                                    />
                                    <button onClick={handleCreateColumn}>Create</button>
                                    <button onClick={handleCancelCreate}>Cancel</button>
                                </div>
                            ) : (
                                    <div style={{
                                    border: '1px solid #ccc',
                                    display: "flex",
                                    alignItems: "center",
                                    justifyContent: "center",
                                    padding: '5px',
                                    margin: '10px',
                                    width: '30px',
                                    height: '30px',
                                    backgroundColor: '#f0f0f0',
                                    borderRadius: '5px',
                                    cursor: "pointer",
                                    alignSelf: "flex-start",
                                    fontSize: '1.5rem',
                                }}
                                    onClick={handleCreateColumnMode}>
                                    <h1 style={{margin:0}}>+</h1>
                                </div>
                            )}
                        </div>
                    </DragDropContext>
                    </div>
            ) : null}
        </div>
  );
};
export default Board;