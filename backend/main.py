from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import itertools

app = FastAPI(title="Wippy - Fields API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

class FieldCreate(BaseModel):
    name: str
    location: str
    latitude: float
    longitude: float
    owner: Optional[str] = None
    engineer: Optional[str] = None
    urea_type: Optional[str] = None
    crop_type: Optional[str] = None
    area_hectares: Optional[float] = None
    notes: Optional[str] = None


class FieldUpdate(BaseModel):
    name: str
    location: str
    latitude: float
    longitude: float
    owner: Optional[str] = None
    engineer: Optional[str] = None
    urea_type: Optional[str] = None
    crop_type: Optional[str] = None
    area_hectares: Optional[float] = None
    notes: Optional[str] = None

class Field(BaseModel):
    id: int
    name: str
    location: str
    latitude: float
    longitude: float
    owner: Optional[str] = None
    engineer: Optional[str] = None
    urea_type: Optional[str] = None
    crop_type: Optional[str] = None
    area_hectares: Optional[float] = None
    notes: Optional[str] = None

fields_db = {}
field_counter = itertools.count(1)

@app.get("/fields", response_model=List[Field])
def get_all_fields():
    return list(fields_db.values())

@app.post("/fields", response_model=Field, status_code=201)
def create_field(payload: FieldCreate):
    field_id = next(field_counter)
    new_field = Field(id=field_id, **payload.dict())
    fields_db[field_id] = new_field
    return new_field


@app.put("/fields/{field_id}", response_model=Field)
def update_field(field_id: int, payload: FieldUpdate):
    if field_id not in fields_db:
        raise HTTPException(status_code=404, detail="Campo no encontrado")

    updated_field = Field(id=field_id, **payload.dict())
    fields_db[field_id] = updated_field
    return updated_field

@app.get("/fields/{field_id}", response_model=Field)
def get_field(field_id: int):
    if field_id not in fields_db:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
    return fields_db[field_id]

@app.delete("/fields/{field_id}")
def delete_field(field_id: int):
    if field_id not in fields_db:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
    del fields_db[field_id]
    return {"message": "Campo eliminado"}

@app.get("/")
def root():
    return {"message": "Wippy API - Gestor de campos"}

