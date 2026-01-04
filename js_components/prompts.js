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
                logical_conclusion: {
                    type: "string"
                },
                mode: {
                    type: "string",
                    enum: ["ask_for_missing_info", "not_missing_info"]
                },

            },
            required: [
                "logical_conclusion",
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
                complexity_level_from_1_to_10: { type: "integer" }
            },
            required: [
                "resume",
                "complexity_level_from_1_to_10"
            ],
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
