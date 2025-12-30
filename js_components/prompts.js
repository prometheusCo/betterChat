const textFormats = {


    critical_info: {
        name: "critical_info",
        type: "json_schema",
        schema: {
            type: "object",
            properties: {
                mode: {
                    type: "string",
                    enum: ["ask", "execute"]
                },
                missing_critical: {
                    type: "array",
                    items: { type: "string" }
                },
                result: {
                    type: "string"
                }
            },
            required: [
                "mode",
                "missing_critical",
                "result"
            ],
            additionalProperties: false
        }
    },


    resume_task: {
        name: "resume_task",
        type: "json_schema",
        schema: {
            type: "object",
            properties: {
                resume: { type: "string" },
                word_count: {
                    type: "integer",
                    minimum: 0
                }
            },
            required: ["resume", "word_count"],
            additionalProperties: false
        }
    },

    plan_task: {
        name: "plan_task",
        type: "json_schema",
        schema: {
            type: "object",
            properties: {
                steps: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 3
                }
            },
            required: ["steps"],
            additionalProperties: false
        }
    }

};
