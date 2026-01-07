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
                complexity_level_from_1_to_10: { type: "integer" },
                iso_code_user_message_lang: { type: "string" }

            },
            required: [
                "resume",
                "complexity_level_from_1_to_10",
                "iso_code_user_message_lang",
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


    cloud_tags: {

        name: "related_dive_in_topics",
        type: "json_schema",

        schema: {
            type: "object",
            properties: {
                related_dive_in_topics: {
                    type: "array",
                    items: { type: "string" },
                    minItems: 3,
                    maxItems: 5
                }
            },
            required: [
                "related_dive_in_topics"
            ],
            additionalProperties: false
        }
    },


};
