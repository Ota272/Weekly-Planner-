import { useTasks } from '../context/TasksContext.jsx'
import { getWeekDates, isToday, getDayName } from '../utils/dateUtils.js'

const categoryMap = {
  work: { class: 'priority-work', tag: 'tag-work', label: 'Работа' },
  personal: { class: 'priority-personal', tag: 'tag-personal', label: 'Личное' },
  urgent: { class: 'priority-urgent', tag: 'tag-urgent', label: 'Срочно' },
  meeting: { class: 'priority-meeting', tag: 'tag-meeting', label: 'Встреча' },
  health: { class: 'priority-health', tag: 'tag-health', label: 'Здоровье' },
}

export default function WeekView({ onTaskClick, onAddTask }) {
  const { tasks, weekOffset } = useTasks()
  const weekDates = getWeekDates(weekOffset)

  return (
    <div className="week-view">
      <div className="week-grid">
        {weekDates.map((date, dayIndex) => {
          const dateStr = date.toISOString().slice(0, 10)
          const dayTasks = tasks
            .filter(t => t.date === dateStr)
            .sort((a, b) => a.time.localeCompare(b.time))

          return (
            <div
              key={dayIndex}
              className={`day-column ${isToday(date) ? 'today' : ''}`}
            >
              <div className="day-header">
                <div>
                  <div className="day-name">{getDayName(dayIndex)}</div>
                  <div className="day-number">{date.getDate()}</div>
                </div>
                <button className="day-add-btn" onClick={() => onAddTask(dayIndex)}>
                  + Добавить
                </button>
              </div>
              <div className="day-tasks">
                {dayTasks.map(task => {
                  const cat = categoryMap[task.category] || categoryMap.work
                  return (
                    <div
                      key={task.id}
                      className={`task-card ${cat.class}`}
                      onClick={() => onTaskClick(task)}
                    >
                      <div className="task-card-time">{task.time}</div>
                      <div className="task-card-title">{task.title}</div>
                      <span className={`task-card-tag ${cat.tag}`}>{cat.label}</span>
                    </div>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
