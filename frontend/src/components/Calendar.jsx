import './Calendar.css'

function Calendar({ field }) {
  const getOptimalityColor = (dateObj) => {
    const year = dateObj.getFullYear()
    const month = dateObj.getMonth() + 1
    const day = dateObj.getDate()
    const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    
    const hash = dateStr.split('').reduce((acc, char) => {
      return acc + char.charCodeAt(0)
    }, 0)
    
    const optimal = hash % 3
    
    if (optimal === 0) return 'optimal'
    if (optimal === 1) return 'moderate'
    return 'suboptimal'
  }

  const getColorLabel = (color) => {
    const labels = {
      optimal: 'Optimo para aplicar',
      moderate: 'Moderado',
      suboptimal: 'No optimo'
    }
    return labels[color] || ''
  }

  const formatDate = (dateObj) => {
    return dateObj.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    })
  }

  const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  // Obtener el primer día de la semana que contiene hoy
  const firstDayOfWeek = new Date(today)
  firstDayOfWeek.setDate(today.getDate() - today.getDay())

  const windowDays = Array.from({ length: 21 }, (_, index) => {
    const date = new Date(today)
    date.setDate(today.getDate() + index)
    return date
  })

  // Agregar días en blanco al inicio para alinear correctamente con la semana
  const emptyDaysAtStart = Array(today.getDay()).fill(null)
  const gridDays = [...emptyDaysAtStart, ...windowDays]

  const endDate = windowDays[windowDays.length - 1]

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>{field.name}</h2>
      </div>

      <p className="field-location-calendar">{field.location}</p>
      <p className="calendar-range">Ventana activa: {formatDate(today)} a {formatDate(endDate)}</p>

      <div className="calendar-legend">
        <div className="legend-item">
          <div className="legend-color optimal"></div>
          <span>Optimo para aplicar</span>
        </div>
        <div className="legend-item">
          <div className="legend-color moderate"></div>
          <span>Moderado</span>
        </div>
        <div className="legend-item">
          <div className="legend-color suboptimal"></div>
          <span>No optimo</span>
        </div>
      </div>

      <div className="weekdays-strip">
        {dayNames.map(day => (
          <div key={day} className="weekday">{day}</div>
        ))}
      </div>

      <div className="days-window-grid">
        {gridDays.map((dateObj, index) => {
          if (dateObj === null) {
            return <div key={`empty-${index}`} className="day-card empty"></div>
          }

          const optimality = getOptimalityColor(dateObj)
          const dayNumber = dateObj.getDate()
          const monthShort = dateObj.toLocaleDateString('es-AR', { month: 'short' })

          return (
            <div
              key={dateObj.toISOString()}
              className={`day-card ${optimality}`}
              title={`${formatDate(dateObj)} - ${getColorLabel(optimality)}`}
            >
              <span className="day-number">{dayNumber}</span>
              <span className="day-month">{monthShort}</span>
            </div>
          )
        })}
      </div>

      <p className="calendar-note">
        Nota: Vista de 3 semanas desde hoy. Los colores son estimados y se actualizaran con datos meteorologicos en proximas versiones.
      </p>
    </div>
  )
}

export default Calendar
