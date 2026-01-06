# Frontend especializado para API OpenAI con **Chain of Thought controlado por código** y **Modo de Aprendizaje**

---

[Demo usable del proyecto](https://japgcv.es/portfolio/betterChat)


## Descripción

Este proyecto es un **frontend minimalista** para interactuar con la API de OpenAI, diseñado para **controlar el flujo de razonamiento (Chain of Thought) desde el código**, en lugar de delegar toda la “cadena” a un único prompt largo.

En vez de pedirle al modelo que planifique y ejecute todo de una sola vez, la aplicación **orquesta el proceso paso a paso en JavaScript**, imponiendo un pipeline estable y auditable. Esto permite:

- **Reducir variabilidad** entre respuestas (menos “improvisación” del modelo).
- **Aplicar validaciones y heurísticas** antes de avanzar al siguiente paso.
- **Mantener control** sobre qué se pregunta, cuándo y con qué formato.

El flujo de trabajo se implementa explícitamente a nivel de código e incluye:

- **Resumen de la tarea**
- **Determinación de complejidad**
- **Descomposición en pasos (si aplica)**
- **Verificación de información faltante o requisitos**
- **Ejecución secuencial y controlada de cada paso**

Además, integra un **Modo de Aprendizaje**: tras cada consulta, el frontend muestra debajo del mensaje una **nube de etiquetas** relacionadas para explorar conceptos asociados y profundizar de forma guiada, fomentando el aprendizaje continuo sin recargar la interfaz.

Para evitar problemas comunes como la **sobreplanificación** o el **contexto redundante**, el sistema incorpora **heurísticas** que deciden cuándo dividir tareas, cuándo pedir aclaraciones y cuánto contexto incluir en cada llamada.

---

## Características principales

- **Orquestación del Chain of Thought por código (JavaScript)**: el programa define el pipeline, no un prompt monolítico.
- **Interfaz clara y minimalista** centrada en la tarea y el resultado.
- **Análisis automático de complejidad** para decidir si conviene descomponer.
- **División inteligente en pasos** con control de entrada/salida por etapa.
- **Chequeos de completitud y relevancia** antes de ejecutar o continuar.
- **Ejecución ordenada y verificable**: cada paso queda explícito y trazable.
- **Modo aprendizaje con nube de etiquetas** para navegación temática.
- **Heurísticas anti-sobreplanificación** y anti-exceso de contexto para optimizar rendimiento y consistencia.

#
#
#
#
#
#

## Specialized Frontend for the OpenAI API with Code-Level Chain-of-Thought Control and Learning Mode

[Working demo](https://japgcv.es/portfolio/betterChat)

---

## Description

This project is an **minimal clean frontend** that interacts with the OpenAI API, implementing **Chain-of-Thought control at code level**. This approach is preferable to relying on the model to execute an entire reasoning pipeline inside a single prompt, because the application can **enforce a structured, optimized flow** deterministically.

The frontend is designed to ensure that any OpenAI model processes tasks through a clear, minimalistic interface and a controlled sequence that includes:

- **Task summary**  
- **Complexity assessment**  
- **Step breakdown when the task is complex**  
- **Validation of required information**  
- **Step-by-step execution**  

In addition, it includes an **interactive learning mode** that, after each query, displays a **tag cloud** beneath the message to explore related topics and support continuous learning.

To avoid common issues such as **over-planning** and **excess context**, the system incorporates **smart heuristics** that optimize API interaction and improve overall performance.

---

## Key Features

- Explicit, code-enforced Chain-of-Thought reasoning flow for OpenAI models (rather than prompt-only orchestration).
- Automatic task complexity analysis.
- Intelligent decomposition of complex tasks into manageable steps.
- Completeness and relevance checks before execution.
- Ordered, controlled step execution at the application level.
- Learning mode with a tag cloud for topic navigation.
- Heuristics to minimize over-planning and prevent redundant context.