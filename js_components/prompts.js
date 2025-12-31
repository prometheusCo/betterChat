const textFormats = {


    critical_info: {
        name: "critical_info",
        type: "json_schema",
        schema: {
            type: "object",
            properties: {

                missing_critical: {
                    type: "array",
                    items: { type: "string" }
                },
                result: {
                    type: "string"
                },
                mode: {
                    type: "string",
                    enum: ["ask", "execute"]
                },

            },
            required: [
                "result",
                "mode",
                "missing_critical",
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
            },
            required: ["resume"],
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
    },

    out_fields: {

        resume_task: "steps",
        critical_info: "missing_critical",

    }



};
