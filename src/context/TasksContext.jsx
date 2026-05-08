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

const defaultTasks = [
  { id: '1', title: 'Утренняя пробежка', time: '08:00', date: getDateStr(getMondayOffset()), category: 'health', subtasks: [
    { id: 's1', text: 'Разминка 5 минут', done: false },
    { id: 's2', text: 'Бег 3 км', done: false },
    { id: 's3', text: 'Растяжка', done: false },
  ]},
  { id: '2', title: 'Планирование дня', time: '09:30', date: getDateStr(getMondayOffset()), category: 'personal', subtasks: [] },
  { id: '3', title: 'Работа над проектом', time: '11:00', date: getDateStr(getMondayOffset()), category: 'work', subtasks: [
    { id: 's4', text: 'Ревью кода', done: false },
    { id: 's5', text: 'Исправить баги', done: false },
    { id: 's6', text: 'Написать тесты', done: false },
  ]},
  { id: '4', title: 'Встреча с командой', time: '14:00', date: getDateStr(getMondayOffset()), category: 'meeting', subtasks: [] },
  { id: '5', title: 'Спортзал', time: '16:00', date: getDateStr(getMondayOffset()), category: 'health', subtasks: [] },
  { id: '6', title: 'Медитация', time: '08:00', date: getDateStr(getMondayOffset() + 1), category: 'health', subtasks: [] },
  { id: '7', title: 'Управление проблемой', time: '09:00', date: getDateStr(getMondayOffset() + 1), category: 'work', subtasks: [] },
  { id: '8', title: 'Обзор с партнёром', time: '10:00', date: getDateStr(getMondayOffset() + 1), category: 'meeting', subtasks: [] },
  { id: '9', title: 'Работа над проектом', time: '12:00', date: getDateStr(getMondayOffset() + 1), category: 'work', subtasks: [] },
  { id: '10', title: 'Планирование спринта', time: '09:00', date: getDateStr(getMondayOffset() + 2), category: 'work', subtasks: [] },
  { id: '11', title: 'Встреча с клиентами', time: '13:00', date: getDateStr(getMondayOffset() + 2), category: 'meeting', subtasks: [] },
  { id: '12', title: 'Работа над проектом', time: '15:00', date: getDateStr(getMondayOffset() + 2), category: 'work', subtasks: [] },
  { id: '13', title: 'Утренняя зарядка', time: '08:00', date: getDateStr(getMondayOffset() + 3), category: 'health', subtasks: [] },
  { id: '14', title: 'Командная встреча', time: '09:30', date: getDateStr(getMondayOffset() + 3), category: 'meeting', subtasks: [] },
  { id: '15', title: 'Завершение отчёта', time: '11:00', date: getDateStr(getMondayOffset() + 3), category: 'work', subtasks: [] },
  { id: '16', title: 'Медитация', time: '08:00', date: getDateStr(getMondayOffset() + 4), category: 'health', subtasks: [] },
  { id: '17', title: 'Прогулка на свежем', time: '10:00', date: getDateStr(getMondayOffset() + 4), category: 'personal', subtasks: [] },
  { id: '18', title: 'Творческий проект', time: '13:00', date: getDateStr(getMondayOffset() + 4), category: 'personal', subtasks: [] },
  { id: '19', title: 'Поход в горы', time: '09:00', date: getDateStr(getMondayOffset() + 5), category: 'personal', subtasks: [] },
  { id: '20', title: 'Просмотр фильма', time: '14:00', date: getDateStr(getMondayOffset() + 5), category: 'personal', subtasks: [] },
  { id: '21', title: 'Встреча с друзьями', time: '16:00', date: getDateStr(getMondayOffset() + 6), category: 'personal', subtasks: [] },
]

function loadTasks() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) return JSON.parse(stored)
  } catch (e) { /* ignore */ }
  return defaultTasks
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
