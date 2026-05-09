import { useState } from 'react'
import { useTasks } from '../context/TasksContext.jsx'
import { getMonthDays, monthNames, isToday, formatDateLocal } from '../utils/dateUtils.js'

const weekDays = ['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс']

const categoryColors = {
  work: { bg: '#e8edff', color: '#4f6ef7' },
  personal: { bg: '#e8faf0', color: '#34c759' },
  urgent: { bg: '#fff0ef', color: '#ff3b30' },
  meeting: { bg: '#fff5e6', color: '#ff9500' },
  health: { bg: '#f5e6ff', color: '#af52de' },
}

export default function CalendarView() {
  const { tasks } = useTasks()
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth())

  const days = getMonthDays(year, month)

  const prevMonth = () => {
    if (month === 0) { setMonth(11); setYear(year - 1) }
    else setMonth(month - 1)
  }
  const nextMonth = () => {
    if (month === 11) { setMonth(0); setYear(year + 1) }
    else setMonth(month + 1)
  }

  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <h2 className="calendar-title">{monthNames[month]} {year}</h2>
        <div className="calendar-nav">
          <button className="calendar-nav-btn" onClick={prevMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
          </button>
          <button className="calendar-nav-btn" onClick={nextMonth}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
          </button>
        </div>
      </div>

      <div className="calendar-grid">
        {weekDays.map(d => (
          <div key={d} className="calendar-weekday">{d}</div>
        ))}
        {days.map((day, i) => {
          const dateStr = formatDateLocal(day.date)
          const dayTasks = tasks.filter(t => t.date === dateStr).slice(0, 3)

          return (
            <div
              key={i}
              className={`calendar-day ${day.otherMonth ? 'other-month' : ''} ${isToday(day.date) ? 'today' : ''}`}
            >
              <div className="calendar-day-number">
                {isToday(day.date) ? <span>{day.date.getDate()}</span> : day.date.getDate()}
              </div>
              {!day.otherMonth && dayTasks.map(task => {
                const cat = categoryColors[task.category] || categoryColors.work
                return (
                  <div
                    key={task.id}
                    className="calendar-day-task"
                    style={{ background: cat.bg, color: cat.color }}
                  >
                    {task.title}
                  </div>
                )
              })}
            </div>
          )
        })}
      </div>
    </div>
  )
}
