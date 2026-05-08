import { useState } from 'react'
import { useTasks } from '../context/TasksContext.jsx'
import { getWeekDates } from '../utils/dateUtils.js'

const categories = [
  { value: 'work', label: 'Работа' },
  { value: 'personal', label: 'Личное' },
  { value: 'meeting', label: 'Встреча' },
  { value: 'health', label: 'Здоровье' },
  { value: 'urgent', label: 'Срочно' },
]

export default function NewTaskModal({ dayIndex, onClose }) {
  const { addTask, weekOffset } = useTasks()

  const weekDates = getWeekDates(weekOffset)
  const defaultDate = dayIndex != null
    ? weekDates[dayIndex].toISOString().slice(0, 10)
    : new Date().toISOString().slice(0, 10)

  const [title, setTitle] = useState('')
  const [time, setTime] = useState('09:00')
  const [date, setDate] = useState(defaultDate)
  const [category, setCategory] = useState('work')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!title.trim()) return
    addTask({ title: title.trim(), time, date, category })
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="new-task-modal" onClick={e => e.stopPropagation()}>
        <h2>Новая задача</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Название</label>
            <input
              type="text"
              className="form-input"
              placeholder="Введите название задачи..."
              value={title}
              onChange={e => setTitle(e.target.value)}
              autoFocus
            />
          </div>
          <div className="form-row">
            <div className="form-group" style={{ flex: 1 }}>
              <label>Время</label>
              <input
                type="time"
                className="form-input"
                value={time}
                onChange={e => setTime(e.target.value)}
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Дата</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={e => setDate(e.target.value)}
              />
            </div>
          </div>
          <div className="form-group">
            <label>Категория</label>
            <select className="form-select" value={category} onChange={e => setCategory(e.target.value)}>
              {categories.map(c => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
          </div>
          <div className="form-actions">
            <button type="button" className="btn-cancel" onClick={onClose}>Отмена</button>
            <button type="submit" className="btn-submit">Создать</button>
          </div>
        </form>
      </div>
    </div>
  )
}
