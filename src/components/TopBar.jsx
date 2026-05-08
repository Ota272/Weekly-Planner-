import { getWeekDates } from '../utils/dateUtils.js'

export default function TopBar({ activeView, weekOffset, setWeekOffset, onNewTask }) {
  const weekDates = getWeekDates(weekOffset)
  const startDate = weekDates[0]
  const endDate = weekDates[6]

  const formatDate = (d) => `${d.getDate()}`
  const monthNames = ['января','февраля','марта','апреля','мая','июня','июля','августа','сентября','октября','ноября','декабря']

  const dateRange = `${formatDate(startDate)} — ${formatDate(endDate)} ${monthNames[endDate.getMonth()]} ${endDate.getFullYear()}`

  const viewLabels = {
    week: 'Неделя',
    tasks: 'Задачи',
    drawing: 'Рисование',
    calendar: 'Календарь',
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-view-toggle">
          <button className="topbar-view-btn active">
            {viewLabels[activeView] || 'Неделя'}
          </button>
          <button className="topbar-view-btn" onClick={() => setWeekOffset(0)}>
            Сегодня
          </button>
        </div>

        {(activeView === 'week' || activeView === 'calendar') && (
          <div className="topbar-date-nav">
            <button onClick={() => setWeekOffset(weekOffset - 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
            </button>
            <span className="topbar-date-text">{dateRange}</span>
            <button onClick={() => setWeekOffset(weekOffset + 1)}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6"/></svg>
            </button>
          </div>
        )}
      </div>

      <div className="topbar-right">
        <button className="btn-filter">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
          Фильтры
        </button>
        <button className="btn-new-task" onClick={onNewTask}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Новая задача
        </button>
        <div className="topbar-avatar">П</div>
      </div>
    </div>
  )
}
