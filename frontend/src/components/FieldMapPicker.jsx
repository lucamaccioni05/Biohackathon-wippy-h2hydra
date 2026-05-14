import { useEffect, useMemo, useRef, useState } from 'react'
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet'
import L from 'leaflet'
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png'
import markerIcon from 'leaflet/dist/images/marker-icon.png'
import markerShadow from 'leaflet/dist/images/marker-shadow.png'
import './FieldMapPicker.css'

const defaultPosition = [-34.6037, -58.3816]

const customMarkerIcon = new L.Icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
})

function ClickHandler({ onSelect }) {
  useMapEvents({
    click(event) {
      const { lat, lng } = event.latlng
      onSelect({ lat, lng })
    },
  })

  return null
}

function MapController({ coordinates }) {
  const map = useMap()

  useEffect(() => {
    if (coordinates) {
      map.setView([coordinates.lat, coordinates.lng], map.getZoom(), { animate: true })
    }
  }, [coordinates, map])

  return null
}

function MapContent({ coordinates, onChange }) {
  const center = useMemo(() => {
    if (coordinates) {
      return [coordinates.lat, coordinates.lng]
    }
    return defaultPosition
  }, [coordinates])

  return (
    <MapContainer center={center} zoom={13} className="field-map" scrollWheelZoom>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <MapController coordinates={coordinates} />
      <ClickHandler onSelect={onChange} />
      {coordinates && (
        <Marker
          position={[coordinates.lat, coordinates.lng]}
          icon={customMarkerIcon}
          draggable
          eventHandlers={{
            dragend: (event) => {
              const { lat, lng } = event.target.getLatLng()
              onChange({ lat, lng })
            },
          }}
        />
      )}
    </MapContainer>
  )
}

function FieldMapPicker({ coordinates, onChange }) {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState([])
  const [isSearching, setIsSearching] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const searchTimeoutRef = useRef(null)

  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [])

  const handleSearch = async (query) => {
    setSearchQuery(query)

    if (!query.trim()) {
      setSearchResults([])
      return
    }

    setIsSearching(true)

    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    searchTimeoutRef.current = setTimeout(async () => {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5&countrycodes=ar`
        )
        const data = await response.json()
        setSearchResults(data)
      } catch (error) {
        console.error('Error searching location:', error)
      } finally {
        setIsSearching(false)
      }
    }, 500)
  }

  const handleSelectSearchResult = (result) => {
    const coords = {
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
    }
    onChange(coords)
    setSearchQuery('')
    setSearchResults([])
  }

  const searchControls = (
    <div className="search-container">
      <div className="search-utility-column">
        <span className="search-icon" aria-hidden="true">🔍</span>
        <button
          type="button"
          className="expand-button"
          onClick={() => setIsExpanded((current) => !current)}
          title={isExpanded ? 'Reducir mapa' : 'Ampliar mapa'}
        >
          {isExpanded ? 'Reducir' : 'Ampliar'}
        </button>
      </div>
      <div className="search-input-wrapper">
        <input
          type="text"
          className="search-input"
          placeholder="Buscar ubicación exacta..."
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
        />
        {isSearching && <span className="search-status">Buscando...</span>}
      </div>
    </div>
  )

  const searchPanel = (
    <div className="search-panel">
      {searchControls}
      {searchResults.length > 0 && (
        <div className="search-results">
          {searchResults.map((result) => (
            <div
              key={result.osm_id}
              className="search-result-item"
              onClick={() => handleSelectSearchResult(result)}
            >
              <div className="result-name">{result.name}</div>
              <div className="result-address">{result.display_name}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  return (
    <div className="field-map-picker">
      {searchPanel}

      {!isExpanded && (
        <div className="field-map-wrapper">
          <MapContent coordinates={coordinates} onChange={onChange} />
          {coordinates && (
            <div className="coordinates-display">
              {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
            </div>
          )}
        </div>
      )}

      {isExpanded && (
        <div
          className="map-modal-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Mapa ampliado"
          onClick={() => setIsExpanded(false)}
        >
          <div className="map-modal" onClick={(event) => event.stopPropagation()}>
            <div className="map-modal-header">
              <div>
                <h4>Ubicación en OpenStreetMap</h4>
                <p>Marcá el punto exacto con más espacio de trabajo.</p>
              </div>
              <button
                type="button"
                className="close-button"
                onClick={() => setIsExpanded(false)}
                aria-label="Cerrar mapa ampliado"
              >
                ×
              </button>
            </div>
            <div className="map-modal-body">
              {searchPanel}
              <MapContent coordinates={coordinates} onChange={onChange} />
              {coordinates && (
                <div className="coordinates-display coordinates-display-modal">
                  {coordinates.lat.toFixed(6)}, {coordinates.lng.toFixed(6)}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default FieldMapPicker