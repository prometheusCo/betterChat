# BetterChat – Improved LLM Frontend

BetterChat is a frontend for Large Language Models that enforces structured Chain of Thought (CoT) execution at the code level, ensuring models follow instructions through a deterministic, multi-step reasoning pipeline rather than free-form generation.

## Description

BetterChat introduces a controlled execution layer that hardcodes reasoning flow into the request lifecycle. User input is summarized, planned, and validated before execution, preventing instruction skipping, hidden assumptions, and uncontrolled outputs.

## Core Reasoning Pipeline

BetterChat processes every task through three enforced stages:

- **Task Resume** – normalizes the user request into a concise objective  
- **Task Planning** – divides execution into three explicit steps  
- **Critical Requirements Check** – detects missing essential information and only executes when all requirements are satisfied  

This guarantees structure before execution.

## Features

- Hard-enforced Chain of Thought via frontend logic  
- Deterministic task resume → plan → validation flow  
- Model-agnostic (OpenAI, Ollama, etc.)  
- Prevents silent assumptions and hallucinated inputs  
- Encrypted local storage (API keys, preferences, memory)  
- Web, Electron, and Nativefier compatible  

## Goal

Maximize LLM reasoning quality and reliability by enforcing code-level reasoning control, not prompt-only techniques.
