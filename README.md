# BetterChat — Frontend OpenAI con Chain of Thought controlado por código

[Versión web](https://japgcv.es/portfolio/betterChat)

## Descripción

BetterChat es un **frontend minimalista para la API de OpenAI** que controla el razonamiento del modelo **desde el código**, y no desde prompts.


El sistema impone un flujo determinista en JavaScript que:

- Resume la tarea del usuario
- **Explicita qué NO ha pedido el usuario**
- Evalúa la complejidad de la petición
- Decide si planificar o ejecutar directamente según un nivel de complejidad predefinido
- Detecta información crítica faltante
- Pide aclaraciones  cuando es necesario
- Ejecuta la respuesta final teniendo en cuenta un contexto global guardado en "settings"

La identificación explícita de **lo que el usuario no ha solicitado** permite **evitar verbosidad innecesaria**, suposiciones y trabajo no requerido.

Incluye un **Modo Aprendizaje** que genera una **nube de etiquetas** tras cada respuesta para explorar temas relacionados sin afectar al flujo principal.

Al tratarse de una interfaz **simple**, no introduce lógica de UI adicional durante la recepción de la respuesta, por lo que el streaming se muestra sin pausas ni bloqueos mientras el modelo responde.


## Características

- Chain of Thought orquestado por código
- Resumen del objetivo y **exclusión explícita de lo no solicitado**
- Análisis automático de complejidad
- Planificación condicional en pasos
- Detección temprana de información crítica faltante
- Parada segura y solicitud de aclaraciones
- Contexto y estado persistente
- **Interfaz simple que no bloquea el streaming**
- Modo aprendizaje con etiquetas semánticas
- Heurísticas anti-sobreplanificación, anti-verbosidad y anti-contexto redundante


## Objetivo

Reducir la improvisación del modelo y ofrecer **respuestas más concisas, consistentes y controlables**, manteniendo el razonamiento bajo control del desarrollador. Evitando en lo posible rodeos, verbosidad no solicitada y alucinaciones.

#
#
#

# BetterChat — OpenAI Frontend with Code-Controlled Chain of Thought

[Web version](https://japgcv.es/portfolio/betterChat)

## Description

BetterChat is a **minimal frontend for the OpenAI API** that controls the model’s reasoning **from code**, rather than through prompts.

The system enforces a deterministic JavaScript flow that:

- Summarizes the user’s task  
- **Explicitly states what the user did NOT ask for**  
- Evaluates the request complexity  
- Decides whether to plan or execute directly based on a predefined complexity level  
- Detects missing critical information  
- Requests clarifications when necessary  
- Executes the final response taking into account a global context stored in “settings”

Explicitly identifying **what the user did not request** helps **avoid unnecessary verbosity**, assumptions, and unrequested work.

It includes a **Learning Mode** that generates a **tag cloud** after each response, allowing exploration of related topics without affecting the main flow.

Because the interface is **simple**, it does not introduce additional UI logic while receiving the response, so streaming is displayed continuously, without pauses or blocking, as the model responds.

## Features

- Code-orchestrated Chain of Thought  
- Task summarization and **explicit exclusion of what was not requested**  
- Automatic complexity analysis  
- Conditional step-based planning  
- Early detection of missing critical information  
- Safe stopping and clarification requests  
- Persistent context and state  
- **Simple interface that does not block streaming**  
- Learning mode with semantic tags  
- Anti-overplanning, anti-verbosity, and anti-redundant-context heuristics  

## Goal

To reduce model improvisation and provide **more concise, consistent, and controllable responses**, keeping reasoning under developer control and avoiding unnecessary detours, unrequested verbosity, and hallucinations.
