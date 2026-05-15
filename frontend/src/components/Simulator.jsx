import { useState, useEffect } from 'react'
import axios from 'axios'
import './Simulator.css'

export default function Simulator() {
  const [params, setParams] = useState({
    temperature: 20,
    humidity: 50,
    wind_speed: 10,
    rainfall: 20
  })

  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    setLoading(true)
    const timer = setTimeout(() => {
      axios.post('/api/simulate', params)
        .then(res => {
          setResult(res.data)
          setLoading(false)
        })
        .catch(err => {
          console.error(err)
          setLoading(false)
        })
    }, 400) // Debounce 400ms
    
    return () => clearTimeout(timer)
  }, [params])

  const handleChange = (e) => {
    const { name, value } = e.target
    setParams(prev => ({ ...prev, [name]: Number(value) }))
  }

  const getColorLabel = (optClass) => {
    if (optClass === 'optimal') return '✅ Óptimo'
    if (optClass === 'moderate') return '⚠️ Moderado'
    return '⛔ Subóptimo / Bloqueado'
  }

  return (
    <div className="simulator-container">
      <div className="simulator-header">
        <h2>Simulador Agronómico</h2>
        <p>Ajusta las variables de entorno para ver cómo reacciona el modelo matemático en tiempo real.</p>
      </div>

      <div className="simulator-content">
        <div className="simulator-controls">
          <div className="slider-group">
            <label>
              🌡️ Temperatura: <strong>{params.temperature}°C</strong>
            </label>
            <input 
              type="range" name="temperature" 
              min="0" max="40" step="1" 
              value={params.temperature} onChange={handleChange} 
            />
            <div className="slider-limits"><span>0°C</span><span>40°C</span></div>
          </div>

          <div className="slider-group">
            <label>
              💧 Humedad: <strong>{params.humidity}%</strong>
            </label>
            <input 
              type="range" name="humidity" 
              min="0" max="100" step="5" 
              value={params.humidity} onChange={handleChange} 
            />
            <div className="slider-limits"><span>0%</span><span>100%</span></div>
          </div>

          <div className="slider-group">
            <label>
              💨 Viento: <strong>{params.wind_speed} km/h</strong>
            </label>
            <input 
              type="range" name="wind_speed" 
              min="0" max="50" step="1" 
              value={params.wind_speed} onChange={handleChange} 
            />
            <div className="slider-limits"><span>0 km/h</span><span>50 km/h</span></div>
          </div>

          <div className="slider-group">
            <label>
              🌧️ Lluvia: <strong>{params.rainfall} mm</strong>
            </label>
            <input 
              type="range" name="rainfall" 
              min="0" max="100" step="1" 
              value={params.rainfall} onChange={handleChange} 
            />
            <div className="slider-limits"><span>0 mm</span><span>100 mm</span></div>
          </div>
        </div>

        <div className="simulator-results">
          {loading && !result && <div className="sim-loading">Calculando...</div>}
          
          {result && (
            <div className={`sim-card ${result.optimality_class}`}>
              <div className="sim-score">
                <h3>{Math.round(result.viability)}%</h3>
                <span>Viabilidad</span>
              </div>
              <div className="sim-details">
                <h4 className="sim-status-title">{getColorLabel(result.optimality_class)}</h4>
                <p className="sim-status-msg">{result.status}</p>
                
                <div className="sim-risks">
                  <div className="risk-item">
                    <span>Riesgo Volatilización</span>
                    <div className="risk-bar-bg">
                      <div className="risk-bar vol-bar" style={{ width: `${Math.min(result.volatilization_risk * 2, 100)}%` }}></div>
                    </div>
                    <small>{result.volatilization_risk.toFixed(2)}</small>
                  </div>
                  <div className="risk-item">
                    <span>Riesgo Lavado (Leaching)</span>
                    <div className="risk-bar-bg">
                      <div className="risk-bar leach-bar" style={{ width: `${Math.min(result.leaching_risk * 10, 100)}%` }}></div>
                    </div>
                    <small>{result.leaching_risk.toFixed(2)}</small>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
