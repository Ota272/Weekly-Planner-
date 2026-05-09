import { createContext, useContext, useState, useEffect } from 'react'

const TasksContext = createContext()
const STORAGE_KEY = 'planner-tasks-v2'

function getDateStr(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

function getMondayOffset() {
  const d = new Date()
  const day = d.getDay()
  return day === 0 ? -6 : -(day - 1)
}

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) { /* ignore */ }
  return []
}

export function TasksProvider({ children }) {
  const [tasks, setTasks] = useState(loadTasks)
  const [weekOffset, setWeekOffset] = useState(0)

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks))
  }, [tasks])

  const addTask = (task) => {
    setTasks(prev => [...prev, { ...task, id: Date.now().toString(), subtasks: [] }])
  }

  const updateTask = (id, updates) => {
    setTasks(prev => prev.map(t => t.id === id ? { ...t, ...updates } : t))
  }

  const deleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id))
  }

  const toggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: t.subtasks.map(s =>
          s.id === subtaskId ? { ...s, done: !s.done } : s
        )
      }
    }))
  }

  const addSubtask = (taskId, text) => {
    setTasks(prev => prev.map(t => {
      if (t.id !== taskId) return t
      return {
        ...t,
        subtasks: [...t.subtasks, { id: Date.now().toString(), text, done: false }]
      }
    }))
  }

  const getTaskById = (id) => tasks.find(t => t.id === id)

  return (
    <TasksContext.Provider value={{
      tasks, addTask, updateTask, deleteTask,
      toggleSubtask, addSubtask, getTaskById,
      weekOffset, setWeekOffset
    }}>
      {children}
    </TasksContext.Provider>
  )
}

export function useTasks() {
  return useContext(TasksContext)
}
