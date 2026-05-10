import { useRef, useState, useEffect, useCallback } from 'react'

const COLORS = ['#1a1a2e', '#4f6ef7', '#ff3b30', '#34c759', '#ff9500', '#af52de', '#ffcc00']

export default function DrawingView() {
  const canvasRef = useRef(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [tool, setTool] = useState('pen')
  const [color, setColor] = useState(COLORS[0])
  const [lineWidth, setLineWidth] = useState(3)
  const lastPoint = useRef(null)

  const getCtx = () => canvasRef.current?.getContext('2d')

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    
    canvas.width = canvas.parentElement.clientWidth
    canvas.height = canvas.parentElement.clientHeight

    const savedData = localStorage.getItem('planner-drawing')
    if (savedData) {
      const img = new Image()
      img.onload = () => {
        const ctx = getCtx()
        ctx.drawImage(img, 0, 0)
      }
      img.src = savedData
    }

    const resize = () => {
      const parent = canvas.parentElement
      const data = canvas.toDataURL()
      canvas.width = parent.clientWidth
      canvas.height = parent.clientHeight
      const img = new Image()
      img.onload = () => {
        const ctx = getCtx()
        ctx.drawImage(img, 0, 0)
      }
      img.src = data
    }
    
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect()
    const clientX = e.touches ? e.touches[0].clientX : e.clientX
    const clientY = e.touches ? e.touches[0].clientY : e.clientY
    return { x: clientX - rect.left, y: clientY - rect.top }
  }

  const startDraw = (e) => {
    e.preventDefault()
    setIsDrawing(true)
    const pos = getPos(e)
    lastPoint.current = pos
    const ctx = getCtx()
    ctx.beginPath()
    ctx.moveTo(pos.x, pos.y)
  }

  const draw = useCallback((e) => {
    if (!isDrawing) return
    e.preventDefault()
    const ctx = getCtx()
    const pos = getPos(e)

    if (tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'
      ctx.lineWidth = lineWidth * 4
    } else {
      ctx.globalCompositeOperation = 'source-over'
      ctx.strokeStyle = color
      ctx.lineWidth = lineWidth
    }
    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.lineTo(pos.x, pos.y)
    ctx.stroke()
    lastPoint.current = pos
  }, [isDrawing, tool, color, lineWidth])

  const saveCanvas = () => {
    const canvas = canvasRef.current
    if (canvas) {
      localStorage.setItem('planner-drawing', canvas.toDataURL())
    }
  }

  const endDraw = () => {
    if (isDrawing) {
      setIsDrawing(false)
      lastPoint.current = null
      saveCanvas()
    }
  }

  const clearCanvas = () => {
    const canvas = canvasRef.current
    const ctx = getCtx()
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    localStorage.removeItem('planner-drawing')
  }

  return (
    <div className="drawing-view">
      <div className="drawing-toolbar">
        <button
          className={`drawing-tool-btn ${tool === 'pen' ? 'active' : ''}`}
          onClick={() => setTool('pen')}
          title="Кисть"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19l7-7 3 3-7 7-3-3z"/><path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"/><path d="M2 2l7.586 7.586"/><circle cx="11" cy="11" r="2"/></svg>
        </button>
        <button
          className={`drawing-tool-btn ${tool === 'eraser' ? 'active' : ''}`}
          onClick={() => setTool('eraser')}
          title="Ластик"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 20H7L3 16a1 1 0 010-1.41l9.59-9.59a2 2 0 012.82 0L20.17 9.76a2 2 0 010 2.83L13 19.76"/></svg>
        </button>

        <div className="drawing-separator" />

        {COLORS.map(c => (
          <button
            key={c}
            className={`drawing-color-btn ${color === c ? 'active' : ''}`}
            style={{ background: c }}
            onClick={() => { setColor(c); setTool('pen') }}
          />
        ))}

        <div className="drawing-separator" />

        <input
          type="range"
          min="1"
          max="20"
          value={lineWidth}
          onChange={e => setLineWidth(Number(e.target.value))}
          className="drawing-size-slider"
        />

        <div className="drawing-separator" />

        <button className="drawing-tool-btn" onClick={clearCanvas} title="Очистить">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
        </button>
      </div>

      <div className="drawing-canvas-container">
        <canvas
          ref={canvasRef}
          onMouseDown={startDraw}
          onMouseMove={draw}
          onMouseUp={endDraw}
          onMouseLeave={endDraw}
          onTouchStart={startDraw}
          onTouchMove={draw}
          onTouchEnd={endDraw}
        />
      </div>
    </div>
  )
}
