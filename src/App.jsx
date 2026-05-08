import { useState } from 'react'
import Sidebar from './components/Sidebar.jsx'
import TopBar from './components/TopBar.jsx'
import WeekView from './components/WeekView.jsx'
import TaskListView from './components/TaskListView.jsx'
import DrawingView from './components/DrawingView.jsx'
import CalendarView from './components/CalendarView.jsx'
import TaskDetailModal from './components/TaskDetailModal.jsx'
import NewTaskModal from './components/NewTaskModal.jsx'
import { TasksProvider, useTasks } from './context/TasksContext.jsx'

function AppInner() {
  const [activeView, setActiveView] = useState('week')
  const [selectedTask, setSelectedTask] = useState(null)
  const [showNewTask, setShowNewTask] = useState(false)
  const [newTaskDay, setNewTaskDay] = useState(null)
  const { weekOffset, setWeekOffset } = useTasks()

  const handleOpenNewTask = (dayIndex) => {
    setNewTaskDay(dayIndex !== undefined ? dayIndex : null)
    setShowNewTask(true)
  }

  return (
    <div className="app-layout">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <div className="main-content">
        <TopBar
          activeView={activeView}
          weekOffset={weekOffset}
          setWeekOffset={setWeekOffset}
          onNewTask={() => handleOpenNewTask()}
        />
        {activeView === 'week' && (
          <WeekView
            onTaskClick={setSelectedTask}
            onAddTask={handleOpenNewTask}
          />
        )}
        {activeView === 'tasks' && (
          <TaskListView onTaskClick={setSelectedTask} />
        )}
        {activeView === 'drawing' && <DrawingView />}
        {activeView === 'calendar' && <CalendarView />}
      </div>

      {selectedTask && (
        <TaskDetailModal
          task={selectedTask}
          onClose={() => setSelectedTask(null)}
        />
      )}
      {showNewTask && (
        <NewTaskModal
          dayIndex={newTaskDay}
          onClose={() => setShowNewTask(false)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <TasksProvider>
      <AppInner />
    </TasksProvider>
  )
}
