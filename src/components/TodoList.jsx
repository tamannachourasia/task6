// src/components/TodoList.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, updateDoc, getDocs } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { onAuthStateChanged } from "firebase/auth";
import { useNavigate } from "react-router-dom";

const priorities = ["Low", "Medium", "High"];

const TodoList = () => {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newTasks, setNewTasks] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchLists(currentUser.uid);
        fetchTasks(currentUser.uid);
      } else {
        setUser(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchLists = (userId) => {
    const q = query(collection(db, "lists"), where("userId", "==", userId));
    onSnapshot(q, (querySnapshot) => {
      setLists(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  const fetchTasks = (userId) => {
    const q = query(collection(db, "tasks"), where("userId", "==", userId));
    onSnapshot(q, (querySnapshot) => {
      setTasks(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
  };

  const addList = async () => {
    if (newListName.trim()) {
      await addDoc(collection(db, "lists"), { name: newListName, userId: user.uid });
      setNewListName("");
    }
  };

  const logOut = async () => {
    try {
      await auth.signOut();
      alert("You have been logged out");
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const addTask = async (listId) => {
    const newTask = newTasks[listId];
    if (newTask && newTask.title.trim()) {
      await addDoc(collection(db, "tasks"), { ...newTask, userId: user.uid, listId });
      setNewTasks({ ...newTasks, [listId]: { title: "", description: "", dueDate: "", priority: "" } });
    }
  };

  const deleteTask = async (taskId) => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  const deleteList = async (listId) => {
    try {
      // Delete all tasks associated with the list
      const q = query(collection(db, "tasks"), where("listId", "==", listId));
      const querySnapshot = await getDocs(q);
      const batch = db.batch();
      querySnapshot.forEach((doc) => {
        batch.delete(doc.ref);
      });
      await batch.commit();

      // Delete the list
      await deleteDoc(doc(db, "lists", listId));
    } catch (error) {
      console.error("Error deleting list:", error.message);
    }
  };

  const onDragEnd = async (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    if (source.droppableId === destination.droppableId && source.index === destination.index) {
      return;
    }

    const draggedTask = tasks.find(task => task.id === draggableId);
    let updatedTasks = tasks;

    const [sourceListId, sourcePriority] = source.droppableId.split("-");
    const [destinationListId, destinationPriority] = destination.droppableId.split("-");

    if (sourceListId === destinationListId && sourcePriority === destinationPriority) {
      return;
    }

    draggedTask.listId = destinationListId;
    draggedTask.priority = destinationPriority;

    updatedTasks = tasks.map(task => task.id === draggableId ? draggedTask : task);

    await updateDoc(doc(db, "tasks", draggableId), { listId: destinationListId, priority: destinationPriority });

    setTasks(updatedTasks);
  };

  const handleNewTaskChange = (listId, field, value) => {
    const updatedNewTasks = { ...newTasks };
    if (!updatedNewTasks[listId]) {
      updatedNewTasks[listId] = { title: "", description: "", dueDate: "", priority: "" };
    }
    updatedNewTasks[listId][field] = value;
    setNewTasks(updatedNewTasks);
  };

  return (
    <div className="flex w-full justify-center">
      <div className="bg-zinc-800 rounded-lg">
        <h2 className="text-2xl mb-4">To-Do Lists</h2>
        <input
          className="my-4 text-zinc-900 mx-6 py-1 rounded-md px-2"
          type="text"
          value={newListName}
          onChange={(e) => setNewListName(e.target.value)}
          placeholder="New List Name"
        />
        <button onClick={addList}>Add List</button>
        <button className="translate-x-8 bg-red-900" onClick={logOut}>Logout</button>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="flex w-[200vh] flex-wrap">
            {lists.map(list => (
              <div key={list.id} className="bg-zinc-600 p-4 w-[95vh] rounded-lg m-2">
                <h3 className="text-xl mb-2">{list.name}</h3>
                <button onClick={() => deleteList(list.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete List</button>
                <input
                  className="my-4 mx-6 text-zinc-900 py-1 rounded-md px-2"
                  type="text"
                  value={newTasks[list.id]?.title || ""}
                  onChange={(e) => handleNewTaskChange(list.id, "title", e.target.value)}
                  placeholder="Task Title"
                />
                <input
                  className="my-2 mx-6 text-zinc-900 py-1 rounded-md px-2"
                  type="text"
                  value={newTasks[list.id]?.description || ""}
                  onChange={(e) => handleNewTaskChange(list.id, "description", e.target.value)}
                  placeholder="Task Description"
                />
                <input
                  className="my-2 mx-6 text-zinc-900 py-1 rounded-md px-2"
                  type="date"
                  value={newTasks[list.id]?.dueDate || ""}
                  onChange={(e) => handleNewTaskChange(list.id, "dueDate", e.target.value)}
                />
                <select
                  className="my-2 mx-6 text-zinc-900 py-1 rounded-md px-2"
                  value={newTasks[list.id]?.priority || ""}
                  onChange={(e) => handleNewTaskChange(list.id, "priority", e.target.value)}
                >
                  <option value="">-Select-</option>
                  <option value="Low">Low</option>
                  <option value="Medium">Medium</option>
                  <option value="High">High</option>
                </select>
                <button onClick={() => addTask(list.id)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Add Task</button>
                <div className="flex w-[100vh]">
                  {priorities.map(priority => (
                    <Droppable key={`${list.id}-${priority}`} droppableId={`${list.id}-${priority}`}>
                      {(provided, snapshot) => (
                        <div
                          className={`bg-gray-900 p-4 rounded-lg m-2 droppable ${snapshot.isDraggingOver ? "is-dragging-over" : ""}`}
                          ref={provided.innerRef}
                          {...provided.droppableProps}
                        >
                          <h3 className="text-xl mb-2">{priority} Priority</h3>
                          {tasks
                            .filter(task => task.listId === list.id && task.priority === priority)
                            .map((task, index) => (
                              <Draggable key={task.id} draggableId={task.id} index={index}>
                                {(provided, snapshot) => (
                                  <div
                                    className={`bg-gray-500 p-4 rounded-lg mt-2 draggable ${snapshot.isDragging ? "is-dragging" : ""}`}
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                  >
                                    <h4>{task.title}</h4>
                                    <p>{task.description}</p>
                                    <p>Due: {task.dueDate}</p>
                                    <p>Priority: {task.priority}</p>
                                    <button onClick={() => deleteTask(task.id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Delete Task</button>
                                  </div>
                                )}
                              </Draggable>
                            ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DragDropContext>
      </div>
    </div>
  );
};

export default TodoList;
