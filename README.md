# BetterChat – Improved LLM Frontend

BetterChat is an frontend for Large Language Models that **enforces structured Chain of Thought (CoT) execution at the code level**, ensuring models strictly follow instructions and deliver higher-quality reasoning than standard chat interfaces.

## Description
BetterChat introduces a controlled frontend execution layer that hardcodes reasoning flow into the prompt and request lifecycle. By preventing instruction skipping and uncontrolled generation, it produces more consistent, logical, and reliable outputs compared to vanilla LLM frontends.


## Features
- Hard-enforced Chain of Thought (CoT) via frontend logic
- Improved reasoning consistency and instruction adherence
- Model-agnostic (works with any LLM API)
- Fully local execution
- Encrypted local storage for API keys, preferences, and memory
- Compatible with web, Electron, and Nativefier builds

## Goal
Maximize LLM reasoning quality and reliability through deterministic frontend-level control rather than prompt-only techniques.
