import { useState, useEffect } from 'react'
import axios from 'axios'
import './Calendar.css'

function Calendar({ field }) {
  const todayObj = new Date()
  const todayStr = `${todayObj.getFullYear()}-${String(todayObj.getMonth() + 1).padStart(2, '0')}-${String(todayObj.getDate()).padStart(2, '0')}`

  const [forecastData, setForecastData] = useState([])
  const [currentScore, setCurrentScore] = useState(null)
  const [applicationsHistory, setApplicationsHistory] = useState([])
  const [selectedDateStr, setSelectedDateStr] = useState(todayStr)
  const [loadingScore, setLoadingScore] = useState(false)
  const [scoreError, setScoreError] = useState(null)
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    if (field?.id) {
      fetchData()
    }
  }, [field])

  const fetchData = async () => {
    setLoadingScore(true)
    setScoreError(null)
    try {
      const [forecastRes, currentRes, appsRes] = await Promise.all([
        axios.get(`/api/fields/${field.id}/forecast`),
        axios.get(`/api/fields/${field.id}/current-score`),
        axios.get(`/api/fields/${field.id}/applications`)
      ])
      setForecastData(forecastRes.data || [])
      setCurrentScore(currentRes.data)
      setApplicationsHistory(appsRes.data || [])
    } catch (err) {
      console.error("Error fetching data:", err)
      setScoreError("No se pudieron cargar todos los datos de clima.")
    } finally {
      setLoadingScore(false)
    }
  }

  const registerApplication = async () => {
    if (!selectedScore) return
    setIsRegistering(true)
    try {
      const payload = {
        date: selectedDateStr,
        temperature: selectedScore.temperature,
        humidity: selectedScore.humidity,
        wind_speed: selectedScore.wind_speed,
        rainfall: selectedScore.rainfall,
        viability: selectedScore.viability,
        status: selectedScore.status,
        optimality_class: selectedScore.optimality_class,
        volatilization_risk: selectedScore.volatilization_risk,
        leaching_risk: selectedScore.leaching_risk
      }
      await axios.post(`/api/fields/${field.id}/applications`, payload)
      // Recargar solo el historial
      const appsRes = await axios.get(`/api/fields/${field.id}/applications`)
      setApplicationsHistory(appsRes.data || [])
      alert("¡Aplicación registrada exitosamente!")
    } catch (err) {
      console.error("Error registrando la aplicación:", err)
      alert("Hubo un error al registrar la aplicación.")
    } finally {
      setIsRegistering(false)
    }
  }

  const getOptimalityColor = (dateStr) => {
    if (dateStr === todayStr && currentScore) {
      return currentScore.optimality_class || 'optimal'
    }
    
    const forecastDay = forecastData.find(d => d.date === dateStr)
    if (forecastDay) {
      return forecastDay.optimality_class || 'optimal'
    }
    
    return 'no-data'
  }

  const getColorLabel = (color) => {
    const labels = {
      optimal: 'Optimo para aplicar',
      moderate: 'Moderado',
      suboptimal: 'No optimo',
      'no-data': 'Sin pronóstico'
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

  // Seleccionar el score del día cliqueado (si es hoy -> currentScore, sino forecastData)
  const selectedScore = selectedDateStr === todayStr
    ? (currentScore || forecastData.find(d => d.date === selectedDateStr))
    : forecastData.find(d => d.date === selectedDateStr)

  // Parsear la fecha seleccionada para mostrar en el título
  const parsedSelectedDate = new Date(`${selectedDateStr}T12:00:00`)

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h2>{field.name}</h2>
      </div>

      <p className="field-location-calendar">{field.location}</p>
      <p className="calendar-range">Ventana activa: {formatDate(today)} a {formatDate(endDate)}</p>

      {/* Tarjeta Premium del Día Seleccionado */}
      <div className="current-day-premium-card">
        <div className="card-header-live">
          <div className="title-with-indicator">
            {selectedDateStr === todayStr && <span className="live-indicator"></span>}
            <h3>Evaluación - {selectedDateStr === todayStr ? 'Día Actual' : formatDate(parsedSelectedDate)}</h3>
          </div>
          <span className="station-badge">Estación: {selectedScore ? selectedScore.station_name : 'Cargando...'}</span>
        </div>

        {loadingScore ? (
          <div className="score-loading-state">
            <div className="spinner"></div>
            <p>Conectando con estaciones y evaluando modelo agronómico...</p>
          </div>
        ) : scoreError ? (
          <div className="score-error-state">
            <p>{scoreError}</p>
            <button className="btn-retry" onClick={fetchData}>Reintentar</button>
          </div>
        ) : selectedScore ? (
          <div className={`score-content-wrapper ${selectedScore.optimality_class}`}>
            <div className="score-main-display">
              <div className="viability-circle">
                <span className="viability-value">{Math.round(selectedScore.viability)}%</span>
                <span className="viability-label">Viabilidad</span>
              </div>
              <div className="status-details">
                <h4 className="status-title">{getColorLabel(selectedScore.optimality_class)}</h4>
                <p className="status-message">
                  {selectedScore.status === 'OK' 
                    ? 'Condiciones propicias para la absorción de nitrógeno con pérdidas mínimas.' 
                    : selectedScore.status}
                </p>
                {selectedScore.is_fallback && (
                  <span className="fallback-warning" title="El servicio externo tardó en responder. Mostrando modelo agronómico estándar.">
                    ⚠️ Usando valores de respaldo
                  </span>
                )}
                
                {selectedScore.best_hour !== undefined && (
                  <div className="best-hour-container">
                    {selectedScore.best_viability > 0 && selectedScore.best_hour ? (
                      <span className="best-hour-text">
                        🕒 Hora recomendada: <strong>{selectedScore.best_hour} hs</strong> <em>({Math.round(selectedScore.best_viability)}%)</em>
                      </span>
                    ) : (
                      <span className="best-hour-none">
                        🚫 No hay un horario óptimo para este día.
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="weather-live-metrics">
              <div className="metric-box">
                <span className="metric-icon">🌡️</span>
                <span className="metric-val">{selectedScore.temperature}°C</span>
                <span className="metric-name">{selectedDateStr === todayStr ? 'Temp' : 'Temp Máx'}</span>
              </div>
              <div className="metric-box">
                <span className="metric-icon">💧</span>
                <span className="metric-val">{selectedScore.humidity}%</span>
                <span className="metric-name">{selectedDateStr === todayStr ? 'Humedad' : 'Hum Máx'}</span>
              </div>
              <div className="metric-box">
                <span className="metric-icon">💨</span>
                <span className="metric-val">{selectedScore.wind_speed} km/h</span>
                <span className="metric-name">{selectedDateStr === todayStr ? 'Viento' : 'Viento Máx'}</span>
              </div>
              <div className="metric-box">
                <span className="metric-icon">🌧️</span>
                <span className="metric-val">{selectedScore.rainfall} mm</span>
                <span className="metric-name">Lluvia</span>
              </div>
            </div>
            
            <div className="risk-bars-container">
              <div className="risk-item">
                <div className="risk-label-row">
                  <span>Riesgo Volatilización</span>
                  <span>{selectedScore.volatilization_risk.toFixed(1)}</span>
                </div>
                <div className="risk-track">
                  <div className="risk-fill vol" style={{ width: `${Math.min(100, selectedScore.volatilization_risk * 3.5)}%` }}></div>
                </div>
              </div>
              <div className="risk-item">
                <div className="risk-label-row">
                  <span>Riesgo Lavado (Leaching)</span>
                  <span>{selectedScore.leaching_risk.toFixed(1)}</span>
                </div>
                <div className="risk-track">
                  <div className="risk-fill leach" style={{ width: `${Math.min(100, selectedScore.leaching_risk * 20)}%` }}></div>
                </div>
              </div>
            </div>

            <div className="action-row">
              <button 
                className="btn-register-app" 
                onClick={registerApplication}
                disabled={isRegistering}
              >
                {isRegistering ? 'Registrando...' : '✓ Registrar Aplicación'}
              </button>
            </div>
          </div>
        ) : null}
      </div>

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
        <div className="legend-item">
          <div className="legend-color no-data"></div>
          <span>Sin pronóstico</span>
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

          const year = dateObj.getFullYear()
          const month = dateObj.getMonth() + 1
          const day = dateObj.getDate()
          const dateStr = `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`

          const optimality = getOptimalityColor(dateStr)
          const dayNumber = dateObj.getDate()
          const monthShort = dateObj.toLocaleDateString('es-AR', { month: 'short' })

          const isCurrentDay = dateStr === todayStr
          const isSelectedDay = dateStr === selectedDateStr

          return (
            <div
              key={dateObj.toISOString()}
              className={`day-card ${optimality} ${isCurrentDay ? 'current-day-highlight' : ''} ${isSelectedDay ? 'selected-day' : ''}`}
              title={`${formatDate(dateObj)} - ${getColorLabel(optimality)}${isCurrentDay ? ' (Hoy)' : ''}`}
              onClick={() => {
                if (optimality !== 'no-data') setSelectedDateStr(dateStr)
              }}
              style={{ cursor: optimality !== 'no-data' ? 'pointer' : 'default' }}
            >
              <span className="day-number">{dayNumber}</span>
              <span className="day-month">{monthShort}</span>
              {isCurrentDay && <span className="today-badge">HOY</span>}
            </div>
          )
        })}
      </div>

      {/* Sección de Historial de Aplicaciones */}
      <div className="applications-history-section">
        <h3>Historial de Aplicaciones</h3>
        {applicationsHistory.length === 0 ? (
          <p className="no-history-msg">Aún no hay aplicaciones registradas para este campo.</p>
        ) : (
          <div className="history-cards-container">
            {applicationsHistory.map((app) => (
              <div key={app.id} className="history-card">
                <div className={`history-status-strip ${app.optimality_class}`}></div>
                <div className="history-card-content">
                  <div className="history-header">
                    <h4>Aplicación del {formatDate(new Date(`${app.date}T12:00:00`))}</h4>
                    <span className="history-timestamp">
                      Registrado el {new Date(app.recorded_at).toLocaleString('es-AR')}
                    </span>
                  </div>
                  <div className="history-metrics">
                    <span>🌡️ {app.temperature}°C</span>
                    <span>💧 {app.humidity}%</span>
                    <span>💨 {app.wind_speed}km/h</span>
                    <span>🌧️ {app.rainfall}mm</span>
                  </div>
                  <div className="history-viability">
                    Viabilidad del día: <strong>{Math.round(app.viability)}%</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  )
}

export default Calendar

