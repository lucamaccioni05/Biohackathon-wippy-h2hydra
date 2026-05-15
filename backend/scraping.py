import requests
import pytesseract
from PIL import Image
from io import BytesIO
import re
import json
import urllib3
import sys
import base64 # <-- IMPORTANTE: Agregar esto

urllib3.disable_warnings(urllib3.exceptions.InsecureRequestWarning)

def extraer_clima_formato_omixon(station_code):
    url = f"https://clima.bccba.org.ar/bubble_marker_content/{station_code}"
    
    response = requests.get(url, verify=False)
    
    if response.status_code != 200:
        return {"error": f"Fallo al descargar código {station_code}"}
    
    # 1. Obtenemos el texto de la respuesta y le sacamos espacios en blanco
    texto_respuesta = response.text.strip()
    
    # 2. Intentamos decodificar ese texto de Base64 a bytes de imagen reales
    try:
        image_bytes = base64.b64decode(texto_respuesta)
        # 3. Ahora sí, le pasamos los bytes reales a Pillow
        img = Image.open(BytesIO(image_bytes)).convert('L')
    except Exception as e:
        return {"error": f"El servidor no devolvió una imagen válida para la estación {station_code}. Detalle: {e}"}
    
    configuracion_ocr = r'--oem 3 --psm 6'
    texto_crudo = pytesseract.image_to_string(img, config=configuracion_ocr)
    
    lineas = [linea.strip() for linea in texto_crudo.split('\n') if linea.strip() != '']
    
    datos_extraidos = {
        "codigo_estacion": station_code,
        "estacion": None,
        "fecha_hora": None,
        "temperatura_actual": None,
        "humedad_actual": None,
        "nivel_lluvia": None,
        "velocidad_viento": None
    }
    
    if len(lineas) >= 2:
        datos_extraidos["estacion"] = lineas[0]
        datos_extraidos["fecha_hora"] = lineas[1]

    def limpiar_numero(texto):
        match = re.search(r'(\d+[\.,]\d+)', texto)
        if match:
            return float(match.group(1).replace(',', '.'))
        return None

    for i, linea in enumerate(lineas):
        linea_lower = linea.lower()
        if "temperatura" in linea_lower and "sensacion" not in linea_lower:
            datos_extraidos["temperatura_actual"] = limpiar_numero(lineas[i-1])
        elif "humedad" in linea_lower:
            datos_extraidos["humedad_actual"] = limpiar_numero(lineas[i-1])
        elif "nivel de lluvia" in linea_lower:
            datos_extraidos["nivel_lluvia"] = limpiar_numero(lineas[i-1])
        elif "velocidad de viento" in linea_lower:
            datos_extraidos["velocidad_viento"] = limpiar_numero(lineas[i-1])

    return datos_extraidos


# --- Prueba con Los Cerrillos ---
# (Asegurate de tener tesseract instalado en el SO)
if __name__ == "__main__":
    resultado = extraer_clima_formato_omixon(34117)
    print(json.dumps(resultado, indent=4, ensure_ascii=False))