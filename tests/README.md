```
# Flow Orchestration Engine + Test Suite

---


### Descripción
Este proyecto implementa un motor de orquestación en cliente que procesa mensajes del usuario mediante un flujo asíncrono estructurado:

1. Resumir la intención del usuario  
2. Planificar la tarea  
3. Detectar información crítica faltante  
4. Ejecutar o solicitar aclaración  
5. Guardar contexto e historial  

Incluye un sistema de reintentos y una suite de tests con Jasmine.

---

### Arquitectura
El sistema se basa en un flujo asíncrono controlado:

- processMessage → orquestador principal  
- resumeTask → extrae intención  
- planTask → genera pasos  
- gatherCriticalRequirements → detecta datos faltantes  
- completeTask → produce el resultado  
- askForMissingDetail → gestiona información incompleta  

---

### Características principales
- Orquestación asíncrona con estado global controlado  
- Sistema de reintentos (tryTillOk)  
- Reconstrucción de contexto usando DOM e historial  
- Salida temprana para tareas simples  
- Detección de información faltante  
- Reutilización de estado entre ejecuciones  

---

### Lógica de reintentos (tryTillOk)
Reintenta operaciones hasta:
- Obtener JSON válido, o  
- Alcanzar el máximo de intentos  

Comportamiento:
- Reintenta en errores de red  
- Reintenta en JSON inválido  
- Espera entre intentos (configurable)  
- Llama a errorHandling al fallar definitivamente  

---

### Gestión de estado
Variables globales:

- currenTask  
- currentPlan  
- prevMissing  
- chat_resume  
- startIndex  

El estado se reinicia mediante:
- clear()

---

### Suite de tests (Jasmine)

La suite valida:

- Lógica de reintentos (éxito / fallo / JSON inválido)  
- Flujo completo de ejecución  
- Rama de información faltante  
- Salida temprana por baja complejidad  
- Reutilización de estado entre llamadas  
- Lógica dependiente del DOM  
- Ejecución de efectos secundarios  

Características:
- Estado completamente aislado por test  
- Comportamiento asíncrono determinista  
- Sin dependencias reales de red o tiempo  
- Validación de flujo y datos  

---

### Cómo ejecutar los tests

1. Instalar Jasmine:
   npm install jasmine

2. Inicializar:
   npx jasmine init

3. Colocar el archivo de tests en:
   /spec/

4. Ejecutar:
   npx jasmine

---

### Notas
- Las dependencias externas (apiCall, prompts, storage) están simuladas en los tests  
- El sistema asume respuestas en formato JSON  
- Se utiliza el DOM para reconstrucción de contexto  


---
---
---


### Overview
This project implements a client-side orchestration engine that processes user messages through a structured async pipeline:

1. Resume user intent  
2. Plan the task  
3. Detect missing critical information  
4. Execute or request clarification  
5. Store context and history  

It includes a retry mechanism and a Jasmine-based test suite.

---

### Architecture
The system is built around a controlled async flow:

- processMessage → main orchestrator  
- resumeTask → extracts intent  
- planTask → generates steps  
- gatherCriticalRequirements → detects missing data  
- completeTask → produces output  
- askForMissingDetail → handles incomplete input  

---

### Core Features
- Async orchestration with controlled global state  
- Retry mechanism (tryTillOk)  
- Context reconstruction using DOM and history  
- Early exit for low-complexity tasks  
- Missing information detection  
- State reuse across executions  

---

### Retry Logic (tryTillOk)
Retries operations until:
- A valid JSON response is returned, or  
- Maximum attempts are reached  

Behavior:
- Retries on network errors  
- Retries on invalid JSON  
- Waits between attempts (configurable)  
- Calls errorHandling on final failure  

---

### State Management
Global variables:

- currenTask  
- currentPlan  
- prevMissing  
- chat_resume  
- startIndex  

State is reset using:
- clear()

---

### Test Suite (Jasmine)

The suite validates:

- Retry logic (success / failure / invalid JSON)  
- Full execution flow  
- Missing information branch  
- Low-complexity early exit  
- State reuse between calls  
- DOM-dependent logic  
- Side effects execution  

Characteristics:
- Fully isolated state per test  
- Deterministic async behavior  
- No real network or timing dependencies  
- Validation of both flow and data  

---

### How to run tests

1. Install Jasmine:
   npm install jasmine

2. Initialize:
   npx jasmine init

3. Place test file in:
   /spec/

4. Run:
   npx jasmine

---

### Notes
- External dependencies (apiCall, prompts, storage) are mocked in tests  
- The system assumes JSON responses  
- DOM is used for context reconstruction  
```
