import './FieldList.css'

function FieldList({ fields, selectedField, onSelectField, onEditField, onDeleteField }) {
  return (
    <div className="field-list">
      {fields.length === 0 ? (
        <p className="empty-message">No hay campos registrados</p>
      ) : (
        <ul className="fields-ul">
          {fields.map(field => (
            <li 
              key={field.id}
              className={`field-item ${selectedField?.id === field.id ? 'active' : ''}`}
              onClick={() => onSelectField(field)}
            >
              <div className="field-info">
                <h3>{field.name}</h3>
                <p className="field-location">{field.location}</p>
                <p className="field-meta">Dueño: {field.owner || 'No definido'}</p>
                <p className="field-meta">Ingeniero: {field.engineer || 'No definido'}</p>
                <p className="field-meta">Urea: {field.urea_type || 'No definido'}</p>
                <p className="field-meta">Cultivo: {field.crop_type || 'No definido'}</p>
              </div>
              <div className="field-actions">
                <button
                  className="btn btn-secondary btn-small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onEditField(field)
                  }}
                >
                  Editar
                </button>
                <button 
                  className="btn btn-danger btn-small"
                  onClick={(e) => {
                    e.stopPropagation()
                    onDeleteField(field.id)
                  }}
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

export default FieldList
