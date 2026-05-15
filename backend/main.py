from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from fastapi.middleware.cors import CORSMiddleware
import itertools
import datetime
import requests
import pandas as pd
from scraping import extraer_clima_formato_omixon
from antigravity_urea import PhysicalAsset, StandardUreaModel, OptimizationEngine

BCCBA_STATIONS = [
    { "code": 34086, "title": "Alcira Gigena  34086", "latitude": "-32.7535000000", "longitude": "-64.3411000000" },
    { "code": 94073, "title": "Alejo Ledesma  94073", "latitude": "-33.6081000000", "longitude": "-62.6285000000" },
    { "code": 94025, "title": "Alta Gracia  94025", "latitude": "-31.6920000000", "longitude": "-64.4293000000" },
    { "code": 34089, "title": "Alto Alegre 34089", "latitude": "-32.3371000000", "longitude": "-62.8817000000" },
    { "code": 30031, "title": "Altos de Chipión  30031", "latitude": "-31.0145460000", "longitude": "-62.3735930000" },
    { "code": 94056, "title": "Altos de Chipión  94056", "latitude": "-30.9455000000", "longitude": "-62.3209000000" },
    { "code": 94038, "title": "Ambul ZR  94038", "latitude": "-31.4822000000", "longitude": "-65.1281000000" },
    { "code": 94052, "title": "Arias  94052", "latitude": "-33.6212000000", "longitude": "-62.4128000000" },
    { "code": 94003, "title": "Arroyito 94003", "latitude": "-31.3911000000", "longitude": "-63.0014000000" },
    { "code": 94094, "title": "Arroyo Algodón 94094", "latitude": "-32.2244100000", "longitude": "-63.1740500000" },
    { "code": 94088, "title": "Arroyo Cabral  94088", "latitude": "-32.4908000000", "longitude": "-63.3947000000" },
    { "code": 94083, "title": "Ballesteros  94083", "latitude": "-32.5395000000", "longitude": "-62.9747000000" },
    { "code": 34008, "title": "Bengolea - 34008", "latitude": "-33.0106000000", "longitude": "-63.6772000000" },
    { "code": 94042, "title": "Buchardo  94042", "latitude": "-34.7167000000", "longitude": "-63.4876000000" },
    { "code": 34103, "title": "Calchín  34103", "latitude": "-31.6285000000", "longitude": "-63.1868000000" },
    { "code": 94033, "title": "Canals  94033", "latitude": "-33.5761000000", "longitude": "-62.8888000000" },
    { "code": 94019, "title": "Candelaria  94019", "latitude": "-30.8601000000", "longitude": "-63.7011000000" },
    { "code": 94018, "title": "Capilla de Siton  94018", "latitude": "-30.5224000000", "longitude": "-63.6292000000" },
    { "code": 94007, "title": "Chajan 94007", "latitude": "-33.6631000000", "longitude": "-65.0897000000" },
    { "code": 94053, "title": "Colonia 10 de Julio  94053", "latitude": "-30.5490000000", "longitude": "-62.1391000000" },
    { "code": 30040, "title": "Colonia Marina - 30040", "latitude": "-31.2778000000", "longitude": "-62.3809000000" },
    { "code": 94090, "title": "Colonia Marina - 94090", "latitude": "-31.1603000000", "longitude": "-62.4181000000" },
    { "code": 94101, "title": "Colonia Prosperidad - 94101", "latitude": "-31.5787000000", "longitude": "-62.5219000000" },
    { "code": 34111, "title": "Coronel Moldes  34111", "latitude": "-33.6255000000", "longitude": "-64.6239000000" },
    { "code": 94062, "title": "Corral de Bustos  94062", "latitude": "-33.2578000000", "longitude": "-62.1171000000" },
    { "code": 94017, "title": "Corral del Bajo       94017", "latitude": "-32.0810000000", "longitude": "-62.7975000000" },
    { "code": 34079, "title": "Corralito - 34079", "latitude": "-32.0418000000", "longitude": "-64.1802000000" },
    { "code": 94022, "title": "Cosme Sur  94022", "latitude": "-31.7503000000", "longitude": "-64.1564000000" },
    { "code": 94069, "title": "Cruz Alta  94069", "latitude": "-33.0153000000", "longitude": "-61.8664000000" },
    { "code": 34011, "title": "Córdoba - 34011", "latitude": "-31.4145000000", "longitude": "-64.1738000000" },
    { "code": 94015, "title": "El Crispín 94015", "latitude": "-31.0549000000", "longitude": "-63.4999000000" },
    { "code": 94072, "title": "El Florentino  94072", "latitude": "-32.1089000000", "longitude": "-62.3331000000" },
    { "code": 94084, "title": "Etruria  94084", "latitude": "-32.9399000000", "longitude": "-63.2355000000" },
    { "code": 34112, "title": "General Baldissera  34112", "latitude": "-33.0626000000", "longitude": "-62.3446000000" },
    { "code": 94041, "title": "General Deheza  94041", "latitude": "-32.8154000000", "longitude": "-63.6846000000" },
    { "code": 94051, "title": "General Levalle  94051", "latitude": "-34.0147000000", "longitude": "-63.9384000000" },
    { "code": 94097, "title": "General Roca  94097", "latitude": "-32.7686000000", "longitude": "-61.9196000000" },
    { "code": 94023, "title": "Gral Paz Sur - 94023", "latitude": "-31.1706000000", "longitude": "-64.1613000000" },
    { "code": 30032, "title": "Hernando  30032", "latitude": "-32.3550500000", "longitude": "-63.7233700000" },
    { "code": 34109, "title": "Hernando  34109", "latitude": "-32.4553000000", "longitude": "-63.7000000000" },
    { "code": 34030, "title": "Huanchilla - 34030", "latitude": "-33.5604000000", "longitude": "-63.6578000000" },
    { "code": 94047, "title": "Huinca Renancó ZR  94047", "latitude": "-34.7072000000", "longitude": "-64.3766000000" },
    { "code": 94082, "title": "Inriville  94082", "latitude": "-32.9400000000", "longitude": "-62.2450000000" },
    { "code": 94036, "title": "Isla Verde  94036", "latitude": "-33.3050000000", "longitude": "-62.4330000000" },
    { "code": 94002, "title": "James Craik 94002", "latitude": "-32.0571000000", "longitude": "-63.4583000000" },
    { "code": 34117, "title": "Jesús María  34117", "latitude": "-30.9822000000", "longitude": "-64.0441000000" },
    { "code": 34045, "title": "Jovita - 34045", "latitude": "-34.5296000000", "longitude": "-63.9858000000" },
    { "code": 34071, "title": "La Carlota - 34071", "latitude": "-33.3950000000", "longitude": "-63.2892000000" },
    { "code": 94058, "title": "La Carolina de Potosí  94058", "latitude": "-33.2166000000", "longitude": "-64.6650000000" },
    { "code": 94001, "title": "La Cautiva  94001", "latitude": "-33.8639000000", "longitude": "-64.0860000000" },
    { "code": 94093, "title": "La Cesira  94093", "latitude": "-34.0265000000", "longitude": "-63.0177000000" },
    { "code": 94078, "title": "La Cruz  94078", "latitude": "-32.3189000000", "longitude": "-64.4915000000" },
    { "code": 94055, "title": "La Francia  94055", "latitude": "-31.4483000000", "longitude": "-62.6817000000" },
    { "code": 94085, "title": "Laboulaye  94085", "latitude": "-34.1165000000", "longitude": "-63.4095000000" },
    { "code": 94091, "title": "Las Arrias  94091", "latitude": "-30.3053000000", "longitude": "-63.5480000000" },
    { "code": 94096, "title": "Las Averías ZR - 94096", "latitude": "-31.0306000000", "longitude": "-62.9875000000" },
    { "code": 94012, "title": "Las Gamas 94012", "latitude": "-32.4817000000", "longitude": "-64.1032000000" },
    { "code": 94075, "title": "Las Gramillas  94075", "latitude": "-31.0912000000", "longitude": "-63.1880000000" },
    { "code": 34115, "title": "Las Junturas  34115", "latitude": "-31.8315000000", "longitude": "-63.4327000000" },
    { "code": 34028, "title": "Las Varillas - 34028", "latitude": "-31.7736000000", "longitude": "-62.7331000000" },
    { "code": 94080, "title": "Leones  94080", "latitude": "-32.6465000000", "longitude": "-62.3154000000" },
    { "code": 34006, "title": "Los Cerrillos  34006", "latitude": "-31.9683000000", "longitude": "-65.4906000000" },
    { "code": 94016, "title": "Los Cóndores 94016", "latitude": "-32.3293000000", "longitude": "-64.2901000000" },
    { "code": 94100, "title": "Los Jagueles 94100", "latitude": "-33.3691000000", "longitude": "-64.5828000000" },
    { "code": 34106, "title": "Melo  34106", "latitude": "-34.3401000000", "longitude": "-63.4750000000" },
    { "code": 94037, "title": "Monte Buey  94037", "latitude": "-32.9286000000", "longitude": "-62.5061000000" },
    { "code": 34104, "title": "Monte Cristo ZR  34104", "latitude": "-31.3404000000", "longitude": "-63.8293000000" },
    { "code": 34116, "title": "Monte Maíz  34116", "latitude": "-33.2032000000", "longitude": "-62.6544000000" },
    { "code": 94050, "title": "Morteros  94050", "latitude": "-30.6808000000", "longitude": "-62.0266000000" },
    { "code": 94102, "title": "Muleto_94102", "latitude": "0.0000000000", "longitude": "0.0000000000" },
    { "code": 94066, "title": "Nicolás Bruzzone  94066", "latitude": "-34.4031000000", "longitude": "-64.2432400000" },
    { "code": 34074, "title": "Noetinger - 34074", "latitude": "-32.3703000000", "longitude": "-62.2572000000" },
    { "code": 94006, "title": "Nueva Andalucía - 94006", "latitude": "-31.1902000000", "longitude": "-63.7435000000" },
    { "code": 94049, "title": "Obispo Trejo  94049", "latitude": "-30.7830000000", "longitude": "-63.4314000000" },
    { "code": 34021, "title": "Olaeta - 34021", "latitude": "-33.0183000000", "longitude": "-63.9584000000" },
    { "code": 30035, "title": "Oncativo  30035", "latitude": "-31.8862810000", "longitude": "-63.6500200000" },
    { "code": 34110, "title": "Ordoñez  34110", "latitude": "-32.7977000000", "longitude": "-62.8416000000" },
    { "code": 94020, "title": "Pascanas  94020", "latitude": "-33.1263000000", "longitude": "-63.0516000000" },
    { "code": 34063, "title": "Pasco  34063", "latitude": "-32.7550000000", "longitude": "-63.3353000000" },
    { "code": 94029, "title": "Pavin  94029", "latitude": "-33.7363000000", "longitude": "-63.7447000000" },
    { "code": 94095, "title": "Pegasano ZR  94095", "latitude": "-34.6028000000", "longitude": "-64.5621000000" },
    { "code": 94009, "title": "Pilar 94009", "latitude": "-31.6736000000", "longitude": "-63.8564000000" },
    { "code": 94043, "title": "Pincen  94043", "latitude": "-34.8186000000", "longitude": "-63.9111000000" },
    { "code": 34031, "title": "Pueblo Italiano  34031", "latitude": "-33.8450000000", "longitude": "-62.8461000000" },
    { "code": 94067, "title": "Rayo Cortado ZR  94067", "latitude": "-30.0347000000", "longitude": "-63.7544000000" },
    { "code": 94060, "title": "Río Cuarto  94060", "latitude": "-33.0884000000", "longitude": "-64.4917000000" },
    { "code": 30036, "title": "Río Primero 30036", "latitude": "-31.3067000000", "longitude": "-63.6834000000" },
    { "code": 94039, "title": "San Antonio de Litin  94039", "latitude": "-32.2083000000", "longitude": "-62.6398000000" },
    { "code": 94070, "title": "San Francisco  94070", "latitude": "-31.4170500000", "longitude": "-62.1590520000" },
    { "code": 94087, "title": "San José de la Dormida  94087", "latitude": "-30.2887000000", "longitude": "-63.9272000000" },
    { "code": 94064, "title": "San Pedro  94064", "latitude": "-29.6943000000", "longitude": "-63.5601000000" },
    { "code": 94004, "title": "Santa Eufemia 94004", "latitude": "-33.2333000000", "longitude": "-63.2936000000" },
    { "code": 34027, "title": "Santiago Temple - 34027", "latitude": "-31.3651000000", "longitude": "-63.4889000000" },
    { "code": 30046, "title": "Sebastian Elcano  30046", "latitude": "-30.1409300000", "longitude": "-63.7342000000" },
    { "code": 34107, "title": "Sebastián Elcano  34107", "latitude": "-30.1669000000", "longitude": "-63.5633000000" },
    { "code": 94081, "title": "Serrano  94081", "latitude": "-34.4790000000", "longitude": "-63.5158000000" },
    { "code": 94099, "title": "Simbolar - 94099", "latitude": "-30.5187000000", "longitude": "-63.9649000000" },
    { "code": 94010, "title": "Tancacha 94010", "latitude": "-32.2647000000", "longitude": "-63.9551000000" },
    { "code": 94059, "title": "Toledo ZR - 94059", "latitude": "-31.4807000000", "longitude": "-64.0042000000" },
    { "code": 94040, "title": "Ucacha ZR  94040", "latitude": "-32.9254000000", "longitude": "-63.4504000000" },
    { "code": 34013, "title": "Va. San Esteban 34013", "latitude": "-31.5426000000", "longitude": "-62.8546000000" },
    { "code": 94092, "title": "Viamonte  94092", "latitude": "-33.7401000000", "longitude": "-63.0918000000" },
    { "code": 34118, "title": "Vicuña Mackenna ZR  34118", "latitude": "-34.1287000000", "longitude": "-64.3287000000" },
    { "code": 94048, "title": "Vicuña Makenna  94048", "latitude": "-33.9339000000", "longitude": "-64.3718000000" },
    { "code": 34105, "title": "Villa Huidobro ZR  34105", "latitude": "-34.8053000000", "longitude": "-64.5058000000" },
    { "code": 94077, "title": "Villa María  94077", "latitude": "-32.4155000000", "longitude": "-63.1600000000" },
    { "code": 94061, "title": "Villa Sarmiento  94061", "latitude": "-34.1143000000", "longitude": "-64.8952000000" },
    { "code": 34046, "title": "Villa Valeria  34046", "latitude": "-34.3431000000", "longitude": "-64.8007000000" },
    { "code": 94044, "title": "Villa del Rosario  94044", "latitude": "-31.5467000000", "longitude": "-63.4672000000" },
    { "code": 34113, "title": "Villa del Totoral ZR  34113", "latitude": "-30.6594000000", "longitude": "-63.9557000000" },
    { "code": 30030, "title": "Vivero 30030", "latitude": "-34.1453000000", "longitude": "-62.8333000000" }
]

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
    station_code: Optional[int] = None


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
    station_code: Optional[int] = None

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
    station_code: Optional[int] = None

class ApplicationCreate(BaseModel):
    date: str
    temperature: float
    humidity: float
    wind_speed: float
    rainfall: float
    viability: float
    status: str
    optimality_class: str
    volatilization_risk: float
    leaching_risk: float

class ApplicationRecord(ApplicationCreate):
    id: int
    field_id: int
    recorded_at: str
default_field_id = 1
fields_db = {
    default_field_id: Field(
        id=default_field_id,
        name="Campo Demostrativo Córdoba",
        location="Los Cerrillos, Córdoba",
        latitude=-31.8,
        longitude=-64.5,
        owner="Bolsa de Cereales de Córdoba",
        crop_type="Trigo",
        area_hectares=150.0,
        notes="Estación meteorológica BCCBA vinculada para scoring de urea en vivo.",
        station_code=34117
    )
}
field_counter = itertools.count(2)

applications_db = {}
application_counter = itertools.count(1)

@app.get("/stations")
def get_stations():
    return BCCBA_STATIONS

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

@app.get("/fields/{field_id}/current-score")
def get_field_current_score(field_id: int):
    if field_id not in fields_db:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
    
    field_obj = fields_db[field_id]
    
    # 1. Scraping de datos meteorológicos
    is_fallback = False
    datos = {}
    
    station_code = field_obj.station_code if field_obj.station_code else 34117
    
    try:
        datos = extraer_clima_formato_omixon(station_code)
        if "error" in datos:
            is_fallback = True
    except Exception as e:
        is_fallback = True
        datos = {}
    
    # Valores extraídos o defaults/fallbacks si falla el OCR o falta un dato
    temp = datos.get("temperatura_actual")
    if temp is None:
        temp = 22.0
        is_fallback = True
        
    hum = datos.get("humedad_actual")
    if hum is None:
        hum = 60.0
        is_fallback = True
        
    wind = datos.get("velocidad_viento")
    if wind is None:
        wind = 12.0
        is_fallback = True
        
    rain = datos.get("nivel_lluvia")
    if rain is None:
        rain = 0.0
        is_fallback = True
        
    # 2. Inicializar PhysicalAsset y Modelo
    asset = PhysicalAsset()
    model = StandardUreaModel(asset)
    engine = OptimizationEngine(model)
    
    # Construir dataframe de un solo registro para el día actual
    date_str = datetime.datetime.now().strftime("%Y-%m-%d")
    df_current = pd.DataFrame([{
        "Temperature": temp,
        "Wind_Speed": wind,
        "Humidity": hum,
        "Rainfall_mm": rain,
        "Date": date_str
    }])
    
    results_df = engine.get_viability_index(df_current)
    row_result = results_df.iloc[0].to_dict()
    
    # Mapear estado a clase de optimalidad del frontend
    status_str = row_result["Status"]
    viability_val = row_result["Viability_%"]
    
    optimality_class = "optimal"
    if status_str.startswith("BLOCK:"):
        optimality_class = "suboptimal"
    elif viability_val < 50:
        optimality_class = "suboptimal"
    elif viability_val <= 75:
        optimality_class = "moderate"
        
    # 3. Obtener hora óptima desde Open-Meteo para el día de hoy
    best_hour = None
    best_viability = 0.0
    
    station = next((s for s in BCCBA_STATIONS if s["code"] == station_code), None)
    if station:
        lat = float(station["latitude"])
        lon = float(station["longitude"])
    else:
        lat = field_obj.latitude
        lon = field_obj.longitude
        
    url_om = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&forecast_days=1&timezone=America%2FArgentina%2FCordoba"
    try:
        response_om = requests.get(url_om, timeout=5)
        if response_om.status_code == 200:
            data_om = response_om.json()
            hourly_om = data_om.get("hourly", {})
            times_om = hourly_om.get("time", [])
            temps_om = hourly_om.get("temperature_2m", [])
            winds_om = hourly_om.get("wind_speed_10m", [])
            precips_om = hourly_om.get("precipitation", [])
            hums_om = hourly_om.get("relative_humidity_2m", [])
            
            all_hours_rows = []
            for i, t in enumerate(times_om):
                date_str_t = t.split("T")[0]
                hour_str = t.split("T")[1]
                all_hours_rows.append({
                    "Date": date_str_t,
                    "Hour": hour_str,
                    "Temperature": temps_om[i] if temps_om[i] is not None else 20.0,
                    "Wind_Speed": winds_om[i] if winds_om[i] is not None else 10.0,
                    "Rainfall_mm": precips_om[i] if precips_om[i] is not None else 0.0,
                    "Humidity": hums_om[i] if hums_om[i] is not None else 50.0
                })
            df_all = pd.DataFrame(all_hours_rows)
            res_all = engine.get_viability_index(df_all)
            res_all["Hour"] = df_all["Hour"]
            max_v = res_all["Viability_%"].max()
            if max_v > 0:
                best_row = res_all[res_all["Viability_%"] == max_v].iloc[0]
                best_hour = best_row["Hour"]
                best_viability = float(max_v)
    except Exception:
        pass
        
    return {
        "station_code": station_code,
        "station_name": str(datos.get("estacion") or f"Estación {station_code}"),
        "date": str(date_str),
        "temperature": float(temp),
        "humidity": float(hum),
        "wind_speed": float(wind),
        "rainfall": float(rain),
        "viability": float(viability_val),
        "status": str(status_str),
        "optimality_class": str(optimality_class),
        "volatilization_risk": float(row_result["Volatilization_Risk"]),
        "leaching_risk": float(row_result["Leaching_Risk"]),
        "is_fallback": bool(is_fallback),
        "best_hour": str(best_hour) if best_hour else None,
        "best_viability": float(best_viability)
    }
    # return {
    #     "station_code": 34117,
    #     "station_name": datos.get("estacion") or "Los Cerrillos",
    #     "date": date_str,
    #     "temperature": temp,
    #     "humidity": hum,
    #     "wind_speed": wind,
    #     "rainfall": rain,
    #     "viability": viability_val,
    #     "status": status_str,
    #     "optimality_class": optimality_class,
    #     "volatilization_risk": row_result["Volatilization_Risk"],
    #     "leaching_risk": row_result["Leaching_Risk"],
    #     "is_fallback": is_fallback
    # }

@app.get("/fields/{field_id}/forecast")
def get_field_forecast(field_id: int):
    if field_id not in fields_db:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
        
    field_obj = fields_db[field_id]
    
    station_code = field_obj.station_code if field_obj.station_code else 34117
    station = next((s for s in BCCBA_STATIONS if s["code"] == station_code), None)
    
    if station:
        lat = float(station["latitude"])
        lon = float(station["longitude"])
        station_name = station["title"]
    else:
        lat = field_obj.latitude
        lon = field_obj.longitude
        station_name = "Open-Meteo"
    
    url = f"https://api.open-meteo.com/v1/forecast?latitude={lat}&longitude={lon}&hourly=temperature_2m,relative_humidity_2m,wind_speed_10m,precipitation&timezone=America%2FArgentina%2FCordoba"
    
    try:
        response = requests.get(url, timeout=10)
        response.raise_for_status()
        data = response.json()
        hourly = data.get("hourly", {})
        times = hourly.get("time", [])
        temps = hourly.get("temperature_2m", [])
        winds = hourly.get("wind_speed_10m", [])
        precips = hourly.get("precipitation", [])
        hums = hourly.get("relative_humidity_2m", [])
        
        all_hours_rows = []
        for i, t in enumerate(times):
            date_str = t.split("T")[0]
            hour_str = t.split("T")[1]
            all_hours_rows.append({
                "Date": date_str,
                "Hour": hour_str,
                "Temperature": temps[i] if temps[i] is not None else 20.0,
                "Wind_Speed": winds[i] if winds[i] is not None else 10.0,
                "Rainfall_mm": precips[i] if precips[i] is not None else 0.0,
                "Humidity": hums[i] if hums[i] is not None else 50.0
            })
            
        df_all_hours = pd.DataFrame(all_hours_rows)
        
        asset = PhysicalAsset()
        model = StandardUreaModel(asset)
        engine = OptimizationEngine(model)
        
        results_all_df = engine.get_viability_index(df_all_hours)
        results_all_df["Hour"] = df_all_hours["Hour"]
        results_all_df["Date"] = df_all_hours["Date"]
        
        best_hours = {}
        for d_str, group in results_all_df.groupby("Date"):
            max_viability = group["Viability_%"].max()
            if max_viability > 0:
                best_row = group[group["Viability_%"] == max_viability].iloc[0]
                best_hours[d_str] = {"best_hour": best_row["Hour"], "best_viability": float(max_viability)}
            else:
                best_hours[d_str] = {"best_hour": None, "best_viability": 0.0}
        
        forecast_output = []
        for idx, row in results_all_df[results_all_df["Hour"] == "19:00"].iterrows():
            date_str = row["Date"]
            status_str = row["Status"]
            viability_val = row["Viability_%"]
            
            optimality_class = "optimal"
            if status_str.startswith("BLOCK:"):
                optimality_class = "suboptimal"
            elif viability_val < 50:
                optimality_class = "suboptimal"
            elif viability_val <= 75:
                optimality_class = "moderate"
                
            forecast_output.append({
                "date": str(date_str),
                "temperature": float(df_all_hours.loc[idx, "Temperature"]),
                "humidity": float(df_all_hours.loc[idx, "Humidity"]),
                "wind_speed": float(df_all_hours.loc[idx, "Wind_Speed"]),
                "rainfall": float(df_all_hours.loc[idx, "Rainfall_mm"]),
                "viability": float(viability_val),
                "status": str(status_str),
                "optimality_class": str(optimality_class),
                "volatilization_risk": float(row["Volatilization_Risk"]),
                "leaching_risk": float(row["Leaching_Risk"]),
                "is_fallback": False,
                "station_name": f"{station_name} (Open-Meteo)",
                "best_hour": str(best_hours.get(date_str, {}).get("best_hour")) if best_hours.get(date_str, {}).get("best_hour") else None,
                "best_viability": float(best_hours.get(date_str, {}).get("best_viability", 0.0))
            })
            
        return forecast_output
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error consultando pronóstico: {str(e)}")

@app.post("/fields/{field_id}/applications", response_model=ApplicationRecord, status_code=201)
def create_application(field_id: int, payload: ApplicationCreate):
    if field_id not in fields_db:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
        
    app_id = next(application_counter)
    recorded_at = datetime.datetime.now().isoformat()
    
    new_app = ApplicationRecord(
        id=app_id,
        field_id=field_id,
        recorded_at=recorded_at,
        **payload.dict()
    )
    
    if field_id not in applications_db:
        applications_db[field_id] = []
        
    applications_db[field_id].append(new_app)
    return new_app

@app.get("/fields/{field_id}/applications", response_model=List[ApplicationRecord])
def get_applications(field_id: int):
    if field_id not in fields_db:
        raise HTTPException(status_code=404, detail="Campo no encontrado")
        
    return sorted(applications_db.get(field_id, []), key=lambda x: x.recorded_at, reverse=True)

@app.get("/")
def root():
    return {"message": "Wippy API - Gestor de campos"}

