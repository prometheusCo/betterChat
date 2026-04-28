
---

DESCRIPCION

Este repositorio contiene una suite de tests con Jasmine enfocada exclusivamente en validar la logica de orquestacion de flujo.

Los tests se ejecutan directamente en el navegador sin necesidad de herramientas de build, modulos o configuracion adicional.

Todas las dependencias externas (API, storage, UI) estan mockeadas para garantizar pruebas deterministas y aisladas.

---

ALCANCE

La suite de tests valida:

- Logica de reintentos en operaciones asincronas
- Validacion de respuestas JSON
- Flujo completo de orquestacion (resume → plan → critical → complete)
- Manejo de informacion critica faltante
- Rama de baja complejidad
- Reutilizacion de estado entre llamadas
- Funciones auxiliares dependientes del DOM

---

COMO EJECUTAR

1. Abrir test/runner.html en un navegador
2. Jasmine se inicializa automaticamente
3. Todos los tests se ejecutan al cargar
4. Los resultados se muestran en pantalla


---

ESTRATEGIA DE MOCKING

La suite mockea:

- Llamadas API (apiCall, tryApiCall)
- Utilidades asincronas (wait)
- Storage (loadFromStorage, saveStorage)
- Efectos de UI (showSpinner, render, etc.)

---

LIMITACIONES

- No cubre integraciones reales
- Ejecucion solo en navegador


---
---
---
---


DESCRIPTION

This repository contains a Jasmine-based unit test suite focused exclusively on validating the flow orchestration logic.

The tests are designed to run directly in the browser without requiring build tools, modules, or external setup.

All external dependencies (API, storage, UI) are mocked to ensure deterministic and isolated unit testing.

---

SCOPE

The test suite validates:

- Retry logic for async operations
- JSON response validation
- Full orchestration flow (resume → plan → critical → complete)
- Handling of missing critical information
- Low complexity early exit branch
- State reuse across multiple calls
- DOM-dependent helper functions


---

HOW TO RUN

1. Open test/runner.html in a browser
2. Jasmine will initialize automatically
3. All tests will execute on load
4. Results will be displayed in the browser


---

MOCKING STRATEGY

The test suite mocks:

- API calls (apiCall, tryApiCall)
- Async utilities (wait)
- Storage (loadFromStorage, saveStorage)
- UI side effects (showSpinner, render, etc.)

---

LIMITATIONS

- Does not test real integrations
- Browser-only execution environment

