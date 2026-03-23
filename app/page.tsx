"use client";

import { useState, useEffect } from "react";
import { Plus, Trash2, CheckCircle2, Circle, Loader2, ListTodo } from "lucide-react";

interface Task {
  id: string;
  title: string;
  completed: boolean;
  createdAt: string;
}

export default function Home() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const res = await fetch("/api/tasks");
      const data = await res.json();
      setTasks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch tasks:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const addTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    setIsAdding(true);
    try {
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      });
      const task = await res.json();
      setTasks([task, ...tasks]);
      setNewTitle("");
    } catch (error) {
      console.error("Failed to add task:", error);
    } finally {
      setIsAdding(false);
    }
  };

  const toggleTask = async (task: Task) => {
    try {
      const updated = { ...task, completed: !task.completed };
      setTasks(tasks.map((t) => (t.id === task.id ? updated : t)));

      await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ completed: !task.completed }),
      });
    } catch (error) {
      console.error("Failed to update task:", error);
      fetchTasks(); // Rollback
    }
  };

  const deleteTask = async (id: string) => {
    try {
      setTasks(tasks.filter((t) => t.id !== id));
      await fetch(`/api/tasks/${id}`, { method: "DELETE" });
    } catch (error) {
      console.error("Failed to delete task:", error);
      fetchTasks(); // Rollback
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 sm:p-8">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-xl shadow-slate-200 overflow-hidden animate-fade-in">
        <div className="bg-indigo-600 p-8 text-white">
          <div className="flex items-center gap-3 mb-2">
            <ListTodo className="h-8 w-8" />
            <h1 className="text-3xl font-bold tracking-tight">TaskFlow</h1>
          </div>
          <p className="text-indigo-100 opacity-90">Manage your daily tasks efficiently.</p>
        </div>

        <div className="p-8">
          <form onSubmit={addTask} className="flex gap-3 mb-8">
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="What needs to be done?"
              className="flex-1 px-5 py-3 rounded-2xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all placeholder:text-slate-400"
            />
            <button
              disabled={isAdding || !newTitle.trim()}
              className="bg-indigo-600 text-white p-3 rounded-2xl hover:bg-indigo-700 active:scale-95 disabled:opacity-50 disabled:active:scale-100 transition-all shadow-lg shadow-indigo-100 flex items-center justify-center min-w-[3.5rem]"
            >
              {isAdding ? (
                <Loader2 className="h-6 w-6 animate-spin" />
              ) : (
                <Plus className="h-6 w-6" />
              )}
            </button>
          </form>

          <div className="space-y-3">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-4">
                <Loader2 className="h-10 w-10 animate-spin" />
                <p>Loading your tasks...</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="text-center py-12 text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                <p>No tasks yet. Add one above!</p>
              </div>
            ) : (
              <>
                {tasks.map((task: Task) => (
                  <div
                    key={task.id}
                    className="group flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl hover:border-indigo-100 hover:shadow-md hover:shadow-indigo-50/50 transition-all hover:-translate-y-0.5 animate-fade-in"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <button
                        onClick={() => toggleTask(task)}
                        className={`transition-colors ${
                          task.completed ? "text-green-500" : "text-slate-300 hover:text-indigo-400"
                        }`}
                      >
                        {task.completed ? (
                          <CheckCircle2 className="h-6 w-6" />
                        ) : (
                          <Circle className="h-6 w-6" />
                        )}
                      </button>
                      <span
                        className={`text-lg font-medium transition-all ${
                          task.completed ? "text-slate-400 line-through" : "text-slate-700"
                        }`}
                      >
                        {task.title}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteTask(task.id)}
                      className="opacity-0 group-hover:opacity-100 p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </>
            )}
          </div>
        </div>
        
        <div className="bg-slate-50 p-6 text-center text-sm text-slate-500 border-t border-slate-100">
          {tasks.length > 0 && (
            <p>
              {tasks.filter(t => t.completed).length} of {tasks.length} tasks completed
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
