import { useState } from 'react'
import { useTasks } from '../context/TasksContext.jsx'
import { formatDateLocal } from '../utils/dateUtils.js'

const categoryMap = {
  work: { tag: 'tag-work', label: 'Работа', color: '#4f6ef7' },
  personal: { tag: 'tag-personal', label: 'Личное', color: '#34c759' },
  urgent: { tag: 'tag-urgent', label: 'Срочно', color: '#ff3b30' },
  meeting: { tag: 'tag-meeting', label: 'Встреча', color: '#ff9500' },
  health: { tag: 'tag-health', label: 'Здоровье', color: '#af52de' },
}

export default function TaskListView({ onTaskClick }) {
  const { tasks, addTask } = useTasks()
  const [newTaskText, setNewTaskText] = useState('')

  const todayStr = formatDateLocal(new Date())
  const tomorrowDate = new Date()
  tomorrowDate.setDate(tomorrowDate.getDate() + 1)
  const tomorrowStr = formatDateLocal(tomorrowDate)

  const todayTasks = tasks.filter(t => t.date === todayStr)
  const tomorrowTasks = tasks.filter(t => t.date === tomorrowStr)
  const laterTasks = tasks.filter(t => t.date > tomorrowStr)

  const handleAddQuick = () => {
    if (!newTaskText.trim()) return
    addTask({ title: newTaskText.trim(), time: '12:00', date: todayStr, category: 'personal' })
    setNewTaskText('')
  }

  const renderGroup = (title, groupTasks) => (
    <div className="tasklist-group">
      <div className="tasklist-group-title">{title}</div>
      {groupTasks.map(task => {
        const cat = categoryMap[task.category] || categoryMap.work
        return (
          <div key={task.id} className="tasklist-item" onClick={() => onTaskClick(task)}>
            <div className="tasklist-item-color" style={{ background: cat.color }} />
            <div className="tasklist-item-title">{task.title}</div>
            <span className={`tasklist-item-tag ${cat.tag}`}>{cat.label}</span>
            <span className="tasklist-item-time">{task.time}</span>
          </div>
        )
      })}
    </div>
  )

  return (
    <div className="tasklist-view">
      <div className="tasklist-header">
        <h2 className="tasklist-title">Мои задачи</h2>
      </div>
      {renderGroup('Сегодня', todayTasks)}
      {renderGroup('Завтра', tomorrowTasks)}
      {renderGroup('Позже', laterTasks)}
      <div className="tasklist-add" onClick={() => document.getElementById('quick-add-input')?.focus()}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        <input
          id="quick-add-input"
          type="text"
          placeholder="Новая задача..."
          value={newTaskText}
          onChange={e => setNewTaskText(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleAddQuick()}
          className="form-input"
          style={{ border: 'none', background: 'transparent', padding: 0, flex: 1 }}
        />
      </div>
    </div>
  )
}
