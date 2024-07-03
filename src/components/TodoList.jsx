// src/components/TodoList.jsx
import React, { useState, useEffect } from "react";
import { db, auth } from "../firebase";
import { collection, addDoc, deleteDoc, doc, query, where, onSnapshot, updateDoc } from "firebase/firestore";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import { onAuthStateChanged } from "firebase/auth";

const TodoList = () => {
  const [user, setUser] = useState(null);
  const [lists, setLists] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [newListName, setNewListName] = useState("");
  const [newTask, setNewTask] = useState({ title: "", description: "", dueDate: "", priority: "", listId: "" });

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
      // Optionally, redirect or perform additional tasks after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  };

  const addTask = async () => {
    if (newTask.title.trim() && newTask.listId) {
      await addDoc(collection(db, "tasks"), { ...newTask, userId: user.uid });
      setNewTask({ title: "", description: "", dueDate: "", priority: "", listId: "" });
    }
  };

  const deleteTask = async (taskId) => {
    await deleteDoc(doc(db, "tasks", taskId));
  };

  const onDragEnd = (result) => {
    const { destination, source, draggableId } = result;

    if (!destination) return;

    const updatedTasks = Array.from(tasks);
    const [movedTask] = updatedTasks.splice(source.index, 1);
    movedTask.listId = destination.droppableId;
    updatedTasks.splice(destination.index, 0, movedTask);

    setTasks(updatedTasks);
    updateDoc(doc(db, "tasks", draggableId), { listId: destination.droppableId });
  };

  return (
    <div>
      <h2 className="mt-10 text-2xl">To-Do Lists</h2>
      <input
        className="my-4 text-zinc-900 mx-6 py-1 rounded-md px-2"
        type="text"
        value={newListName}
        onChange={(e) => setNewListName(e.target.value)}
        placeholder="New List Name"
      />
      <button onClick={addList}>Add List</button>
      <button onClick={logOut}>Logout</button>

      <DragDropContext onDragEnd={onDragEnd}>
        {lists.map(list => (
          <Droppable key={list.id} droppableId={list.id}>
            {(provided) => (
              <div className="w-[55vw] bg-zinc-800" ref={provided.innerRef} {...provided.droppableProps}>
                <h3 className="pl-10 text-xl">{list.name}</h3>
                <input
                  className="my-4 text-zinc-900 mx-6 py-1 rounded-md px-2"
                  type="text"
                  required
                  value={newTask.title}
                  onChange={(e) => setNewTask({ ...newTask, title: e.target.value, listId: list.id })}
                  placeholder="Task Title"
                />
                <input
                  className="my-4 text-zinc-900 mx-6 py-1 rounded-md px-2"
                  type="text"
                  required
                  value={newTask.description}
                  onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                  placeholder="Task Description"
                />
                <input
                  className="my-4 text-zinc-900 mx-6 py-1 rounded-md px-2"
                  type="date"
                  required
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({ ...newTask, dueDate: e.target.value })}
                />
                <input
                  className="my-4 text-zinc-900 mx-6 py-1 rounded-md px-2"
                  type="text"
                  required
                  value={newTask.priority}
                  onChange={(e) => setNewTask({ ...newTask, priority: e.target.value })}
                  placeholder="Task Priority"
                />
                <button onClick={addTask}>Add Task</button>
                {tasks
                  .filter(task => task.listId === list.id)
                  .map((task, index) => (
                    <Draggable key={task.id} draggableId={task.id} index={index}>
                      {(provided) => (
                        
                        <div className=" flex items-center gap-1 flex-col mt-2 p-[2vh] ml-[30vh] bg-zinc-600 w-[20vw] rounded-md" ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                          <h4>{task.title}</h4>
                          <p>{task.description}</p>
                          <p>Due: {task.dueDate}</p>
                          <p>Priority: {task.priority}</p>
                          <button  onClick={() => deleteTask(task.id)}>Delete Task</button>
                        </div>
                       
                      )}
                    </Draggable>
                  ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        ))}
      </DragDropContext>
    </div>
  );
};

export default TodoList;
