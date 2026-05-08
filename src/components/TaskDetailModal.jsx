import { useState, useRef, useCallback, useEffect } from 'react'
import { useTasks } from '../context/TasksContext.jsx'

export default function TaskDetailModal({ task, onClose }) {
  const { toggleSubtask, addSubtask, deleteTask, getTaskById } = useTasks()
  const liveTask = getTaskById(task.id) || task
  const [newSubtask, setNewSubtask] = useState('')
  const [editingOnMap, setEditingOnMap] = useState(false)
  const [mapNewText, setMapNewText] = useState('')
  const mapInputRef = useRef(null)

  // Pan & zoom state
  const containerRef = useRef(null)
  const [pan, setPan] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [isPanning, setIsPanning] = useState(false)
  const panStart = useRef({ x: 0, y: 0, panX: 0, panY: 0 })

  const handleDelete = () => {
    deleteTask(liveTask.id)
    onClose()
  }

  // Pan handlers
  const onMouseDownMap = useCallback((e) => {
    if (e.target.closest('.mindmap-node') || e.target.closest('.map-add-area')) return
    e.preventDefault()
    setIsPanning(true)
    panStart.current = { x: e.clientX, y: e.clientY, panX: pan.x, panY: pan.y }
  }, [pan])

  const onMouseMoveMap = useCallback((e) => {
    if (!isPanning) return
    const dx = e.clientX - panStart.current.x
    const dy = e.clientY - panStart.current.y
    setPan({ x: panStart.current.panX + dx, y: panStart.current.panY + dy })
  }, [isPanning])

  const onMouseUpMap = useCallback(() => {
    setIsPanning(false)
  }, [])

  useEffect(() => {
    if (isPanning) {
      window.addEventListener('mousemove', onMouseMoveMap)
      window.addEventListener('mouseup', onMouseUpMap)
      return () => {
        window.removeEventListener('mousemove', onMouseMoveMap)
        window.removeEventListener('mouseup', onMouseUpMap)
      }
    }
  }, [isPanning, onMouseMoveMap, onMouseUpMap])

  // Zoom handler
  const onWheelMap = useCallback((e) => {
    e.preventDefault()
    const delta = e.deltaY > 0 ? -0.1 : 0.1
    setZoom(z => Math.max(0.3, Math.min(3, z + delta)))
  }, [])

  const handleAddOnMap = () => {
    if (!mapNewText.trim()) return
    addSubtask(liveTask.id, mapNewText.trim())
    setMapNewText('')
    setEditingOnMap(false)
  }

  const handleAddSubtaskList = () => {
    if (!newSubtask.trim()) return
    addSubtask(liveTask.id, newSubtask.trim())
    setNewSubtask('')
  }

  // Layout for mindmap nodes
  const subtasks = liveTask.subtasks || []
  const centerX = 400
  const centerY = 280
  const radius = 200
  const nodePositions = subtasks.map((_, i) => {
    const angle = (Math.PI * 2 * i) / Math.max(subtasks.length, 1) - Math.PI / 2
    return {
      x: centerX + Math.cos(angle) * radius,
      y: centerY + Math.sin(angle) * radius,
    }
  })

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="task-detail-modal" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="task-detail-header">
          <div>
            <h2 className="task-detail-title">{liveTask.title}</h2>
            <span style={{ fontSize: '13px', color: '#6b7280' }}>
              {liveTask.time} · {liveTask.date}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button className="task-detail-close" onClick={handleDelete} title="Удалить" style={{ color: '#ff3b30' }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
            </button>
            <button className="task-detail-close" onClick={onClose}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            </button>
          </div>
        </div>

        {/* Zoom controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
          <span style={{ fontSize: '12px', color: '#9ca3af' }}>Масштаб:</span>
          <button className="zoom-btn" onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}>−</button>
          <span style={{ fontSize: '12px', color: '#6b7280', minWidth: '40px', textAlign: 'center' }}>{Math.round(zoom * 100)}%</span>
          <button className="zoom-btn" onClick={() => setZoom(z => Math.min(3, z + 0.15))}>+</button>
          <button className="zoom-btn" onClick={() => { setZoom(1); setPan({ x: 0, y: 0 }) }} style={{ fontSize: '11px', padding: '4px 10px', width: 'auto' }}>Сброс</button>
          <div style={{ flex: 1 }} />
          <button
            className="btn-submit"
            style={{ fontSize: '12px', padding: '6px 14px' }}
            onClick={() => { setEditingOnMap(true); setTimeout(() => mapInputRef.current?.focus(), 50) }}
          >
            + Подзадача
          </button>
        </div>

        {/* Mindmap */}
        <div
          ref={containerRef}
          className="mindmap-container"
          onMouseDown={onMouseDownMap}
          onWheel={onWheelMap}
          style={{ cursor: isPanning ? 'grabbing' : 'grab' }}
        >
          <div
            className="mindmap-inner"
            style={{
              transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            {/* SVG lines */}
            <svg className="mindmap-svg" viewBox="0 0 800 560" preserveAspectRatio="xMidYMid meet">
              {nodePositions.map((pos, i) => (
                <path
                  key={i}
                  d={`M ${centerX} ${centerY} Q ${(centerX + pos.x) / 2} ${centerY}, ${(centerX + pos.x) / 2} ${(centerY + pos.y) / 2} T ${pos.x} ${pos.y}`}
                  stroke={subtasks[i].done ? '#34c759' : '#d1d5db'}
                  strokeWidth="2.5"
                  fill="none"
                />
              ))}
            </svg>

            {/* Central node */}
            <div
              className="mindmap-node central"
              style={{
                left: `${centerX}px`,
                top: `${centerY}px`,
                transform: 'translate(-50%, -50%)',
                maxWidth: '220px',
                whiteSpace: 'normal',
                textAlign: 'center',
              }}
            >
              {liveTask.title}
            </div>

            {/* Subtask nodes */}
            {subtasks.map((sub, i) => {
              const pos = nodePositions[i]
              return (
                <div
                  key={sub.id}
                  className={`mindmap-node child ${sub.done ? 'mindmap-done' : ''}`}
                  style={{
                    left: `${pos.x}px`,
                    top: `${pos.y}px`,
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '200px',
                    whiteSpace: 'normal',
                    textAlign: 'center',
                    cursor: 'pointer',
                  }}
                  onClick={(e) => { e.stopPropagation(); toggleSubtask(liveTask.id, sub.id) }}
                >
                  <span className="mindmap-check">{sub.done ? '✓' : '○'}</span>
                  {' '}{sub.text}
                </div>
              )
            })}

            {/* Inline add form on map */}
            {editingOnMap && (
              <div
                className="map-add-area"
                style={{
                  position: 'absolute',
                  left: `${centerX}px`,
                  top: `${centerY + 60}px`,
                  transform: 'translateX(-50%)',
                  zIndex: 10,
                }}
              >
                <div style={{ display: 'flex', gap: '6px', background: 'white', padding: '8px', borderRadius: '10px', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                  <input
                    ref={mapInputRef}
                    type="text"
                    className="form-input"
                    placeholder="Текст подзадачи..."
                    value={mapNewText}
                    onChange={e => setMapNewText(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddOnMap(); if (e.key === 'Escape') setEditingOnMap(false) }}
                    style={{ width: '200px', fontSize: '13px' }}
                  />
                  <button className="btn-submit" style={{ fontSize: '12px', padding: '6px 12px' }} onClick={handleAddOnMap}>✓</button>
                </div>
              </div>
            )}

            {subtasks.length === 0 && !editingOnMap && (
              <div style={{
                position: 'absolute',
                left: `${centerX}px`,
                top: `${centerY + 60}px`,
                transform: 'translateX(-50%)',
                fontSize: '13px',
                color: '#9ca3af',
                whiteSpace: 'nowrap',
              }}>
                Нажмите «+ Подзадача» чтобы добавить
              </div>
            )}
          </div>
        </div>

        {/* Subtask list below */}
        <div style={{ marginTop: '20px' }}>
          <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '10px', color: '#1a1a2e' }}>
            Список подзадач ({subtasks.filter(s => s.done).length}/{subtasks.length})
          </div>
          <div className="subtask-list">
            {subtasks.map(sub => (
              <div key={sub.id} className="subtask-item">
                <div
                  className={`subtask-checkbox ${sub.done ? 'checked' : ''}`}
                  onClick={() => toggleSubtask(liveTask.id, sub.id)}
                >
                  {sub.done && (
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                  )}
                </div>
                <span className={`subtask-text ${sub.done ? 'completed' : ''}`}>{sub.text}</span>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
            <input
              type="text"
              className="form-input"
              placeholder="Новая подзадача..."
              value={newSubtask}
              onChange={e => setNewSubtask(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleAddSubtaskList()}
            />
            <button className="btn-submit" onClick={handleAddSubtaskList}>Добавить</button>
          </div>
        </div>
      </div>
    </div>
  )
}
