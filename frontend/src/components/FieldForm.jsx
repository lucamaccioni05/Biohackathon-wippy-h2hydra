import { useEffect, useState } from 'react'
import axios from 'axios'
import FieldMapPicker from './FieldMapPicker'
import './FieldForm.css'

const emptyFormState = {
  name: '',
  location: '',
  owner: '',
  engineer: '',
  ureaType: '',
  customUreaType: '',
  cropType: '',
  areaHectares: '',
  notes: '',
  stationCode: '',
  latitude: null,
  longitude: null,
}

function FieldForm({ initialField = null, onSubmit, onCancel }) {
  const [stationsList, setStationsList] = useState([])
  const [formData, setFormData] = useState({
    ...emptyFormState,
  })

  useEffect(() => {
    const fetchStations = async () => {
      try {
        const response = await axios.get('/api/stations')
        setStationsList(response.data)
      } catch (error) {
        console.error('Error fetching stations:', error)
      }
    }
    fetchStations()
  }, [])

  useEffect(() => {
    if (!initialField) {
      setFormData(emptyFormState)
      return
    }

    setFormData({
      name: initialField.name || '',
      location: initialField.location || '',
      owner: initialField.owner || '',
      engineer: initialField.engineer || '',
      ureaType: initialField.urea_type || '',
      customUreaType: '',
      cropType: initialField.crop_type || '',
      areaHectares: initialField.area_hectares ?? '',
      notes: initialField.notes || '',
      stationCode: initialField.station_code || '',
      latitude: initialField.latitude ?? null,
      longitude: initialField.longitude ?? null,
    })
  }, [initialField])

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!formData.name.trim() || !formData.location.trim()) return
    if (formData.latitude === null || formData.longitude === null) return

    const resolvedUreaType = formData.ureaType === 'Otro'
      ? formData.customUreaType.trim()
      : formData.ureaType

    onSubmit({
      name: formData.name.trim(),
      location: formData.location.trim(),
      owner: formData.owner.trim() || null,
      engineer: formData.engineer.trim() || null,
      urea_type: resolvedUreaType || null,
      crop_type: formData.cropType.trim() || null,
      area_hectares: formData.areaHectares ? Number(formData.areaHectares) : null,
      notes: formData.notes.trim() || null,
      station_code: formData.stationCode ? Number(formData.stationCode) : null,
      latitude: formData.latitude,
      longitude: formData.longitude,
    })

    setFormData(emptyFormState)
  }

  const handleCoordinatesChange = ({ lat, lng }) => {
    setFormData(prev => ({
      ...prev,
      latitude: Number(lat.toFixed(6)),
      longitude: Number(lng.toFixed(6)),
    }))
  }

  const canSubmit = (
    formData.name.trim() &&
    formData.location.trim() &&
    formData.latitude !== null &&
    formData.longitude !== null
  )

  return (
    <form className="field-form" onSubmit={handleSubmit}>
      <div className="form-title-row">
        <h3>{initialField ? 'Editar campo' : 'Nuevo campo'}</h3>
        {initialField && onCancel && (
          <button type="button" className="btn btn-secondary btn-form-cancel" onClick={onCancel}>
            Cancelar edición
          </button>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="name">Nombre del campo</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          placeholder="Ej: Campo San Javier Norte"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="location">Ubicación</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          placeholder="Ej: Provincia, Localidad"
          required
        />
      </div>

      <div className="form-group">
        <label htmlFor="owner">Dueño</label>
        <input
          type="text"
          id="owner"
          name="owner"
          value={formData.owner}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="engineer">Ingeniero responsable</label>
        <input
          type="text"
          id="engineer"
          name="engineer"
          value={formData.engineer}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="ureaType">Tipo de urea</label>
        <select
          id="ureaType"
          name="ureaType"
          value={formData.ureaType}
          onChange={handleChange}
        >
          <option value="">Seleccionar...</option>
          <option value="Urea común">Urea granulada</option>
          <option value="Urea con encapsulamiento">Urea con encapsulamiento</option>
          <option value="Otro">Otro</option>
        </select>
      </div>

      {formData.ureaType === 'Otro' && (
        <div className="form-group">
          <label htmlFor="customUreaType">Especificar tipo de urea</label>
          <input
            type="text"
            id="customUreaType"
            name="customUreaType"
            value={formData.customUreaType}
            onChange={handleChange}
            placeholder="Ej: Liquida"
            required
          />
        </div>
      )}

      <div className="form-group">
        <label htmlFor="cropType">Cultivo principal</label>
        <input
          type="text"
          id="cropType"
          name="cropType"
          value={formData.cropType}
          onChange={handleChange}
          placeholder="Ej: Maiz"
        />
      </div>

      <div className="form-group">
        <label htmlFor="areaHectares">Superficie (ha)</label>
        <input
          type="number"
          id="areaHectares"
          name="areaHectares"
          min="0"
          step="0.01"
          value={formData.areaHectares}
          onChange={handleChange}
        />
      </div>

      <div className="form-group">
        <label htmlFor="notes">Otros datos interesantes</label>
        <textarea
          id="notes"
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          placeholder="Ej: acceso por ruta 9, zona con drenaje variable..."
          rows={3}
        />
      </div>

      <div className="form-group">
        <label htmlFor="stationCode">Estación Meteorológica (BCCBA) más cercana</label>
        <select
          id="stationCode"
          name="stationCode"
          value={formData.stationCode}
          onChange={handleChange}
        >
          <option value="">Seleccionar estación...</option>
          {stationsList.map((station) => (
            <option key={station.code} value={station.code}>
              {station.title}
            </option>
          ))}
        </select>
        <p className="map-help" style={{ marginTop: '0.25rem' }}>
          Usaremos esta estación para obtener datos actuales. El pronóstico de 7 días usará sus coordenadas.
        </p>
      </div>

      <div className="form-group">
        <label>Ubicar el campo en OpenStreetMap</label>
        <p className="map-help">Buscá la ubicación exacta o expandí el mapa para marcar el punto con más comodidad.</p>
        <FieldMapPicker
          coordinates={formData.latitude !== null && formData.longitude !== null
            ? { lat: formData.latitude, lng: formData.longitude }
            : null}
          onChange={handleCoordinatesChange}
        />
        <p className="coords-readout">
          {formData.latitude !== null && formData.longitude !== null
            ? `Lat: ${formData.latitude}, Lng: ${formData.longitude}`
            : 'Todavia no seleccionaste la ubicacion en el mapa'}
        </p>
      </div>

      <button type="submit" className="btn btn-primary form-submit" disabled={!canSubmit}>
        {initialField ? 'Guardar cambios' : 'Crear Campo'}
      </button>
    </form>
  )
}

export default FieldForm
