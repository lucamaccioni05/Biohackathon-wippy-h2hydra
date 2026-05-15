import { useState, useEffect } from 'react'
import axios from 'axios'
import FieldList from './components/FieldList'
import FieldForm from './components/FieldForm'
import Calendar from './components/Calendar'
import Simulator from './components/Simulator'
import './App.css'

function App() {
  const [fields, setFields] = useState([])
  const [selectedField, setSelectedField] = useState(null)
  const [showForm, setShowForm] = useState(false)
  const [editingField, setEditingField] = useState(null)
  const [activeTab, setActiveTab] = useState('fields')

  useEffect(() => {
    fetchFields()
  }, [])

  const fetchFields = async () => {
    try {
      const response = await axios.get('/api/fields')
      setFields(response.data)
    } catch (error) {
      console.error('Error fetching fields:', error)
    }
  }

  const handleSaveField = async (fieldData) => {
    try {
      if (editingField) {
        const response = await axios.put(`/api/fields/${editingField.id}`, fieldData)
        setSelectedField(response.data)
      } else {
        await axios.post('/api/fields', fieldData)
      }
      fetchFields()
      setShowForm(false)
      setEditingField(null)
    } catch (error) {
      console.error('Error saving field:', error)
    }
  }

  const handleEditField = (field) => {
    setEditingField(field)
    setShowForm(true)
  }

  const handleCancelForm = () => {
    setEditingField(null)
    setShowForm(false)
  }

  const handleSelectField = (field) => {
    setSelectedField(field)
  }

  const handleDeleteField = async (fieldId) => {
    try {
      await axios.delete(`/api/fields/${fieldId}`)
      fetchFields()
      if (selectedField?.id === fieldId) {
        setSelectedField(null)
      }
    } catch (error) {
      console.error('Error deleting field:', error)
    }
  }

  return (
    <div className="app-container">
      <header className="app-header">
        <div className="header-title">
          <h1>Wippy - Gestor de Campos</h1>
          <p>Gestiona tus campos y visualiza el calendario de optimalidad de aplicación de urea</p>
        </div>
        <div className="header-nav">
          <button 
            className={`nav-btn ${activeTab === 'fields' ? 'active' : ''}`}
            onClick={() => setActiveTab('fields')}
          >
            Mis Campos
          </button>
          <button 
            className={`nav-btn ${activeTab === 'simulator' ? 'active' : ''}`}
            onClick={() => setActiveTab('simulator')}
          >
            Simulador
          </button>
        </div>
      </header>

      <div className="app-content">
        {activeTab === 'simulator' ? (
          <Simulator />
        ) : (
          <>
            <div className="left-panel">
          <div className="panel-header">
            <h2>Mis Campos</h2>
            <button 
              className="btn btn-primary"
              onClick={() => {
                if (showForm) {
                  handleCancelForm()
                } else {
                  setEditingField(null)
                  setShowForm(true)
                }
              }}
            >
              {showForm ? 'Cerrar' : 'Agregar Campo'}
            </button>
          </div>

          {showForm && (
            <FieldForm
              key={editingField?.id || 'new-field'}
              initialField={editingField}
              onSubmit={handleSaveField}
              onCancel={handleCancelForm}
            />
          )}

          <FieldList 
            fields={fields}
            selectedField={selectedField}
            onSelectField={handleSelectField}
            onEditField={handleEditField}
            onDeleteField={handleDeleteField}
          />
        </div>

        <div className="right-panel">
          {selectedField ? (
            <Calendar field={selectedField} />
          ) : (
            <div className="no-selection">
              <p>Selecciona un campo para ver el calendario</p>
            </div>
          )}
        </div>
          </>
        )}
      </div>
    </div>
  )
}

export default App
