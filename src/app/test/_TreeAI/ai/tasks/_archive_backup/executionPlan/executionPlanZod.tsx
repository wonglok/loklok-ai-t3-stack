import { z } from "zod";

const ExecutionPlanSchema = z.object({
    projectName: z
        .string()
        .min(1)
        .describe(
            "This field represents the official name or title assigned to the coding project based on the user's provided idea. It should be concise yet descriptive enough to capture the essence of the project.",
        ),
    description: z
        .string()
        .min(1)
        .describe(
            "This field provides a comprehensive yet succinct overview of the entire project idea, summarizing the main objectives, key features, and intended outcomes as derived from the user's input text.",
        ),
    steps: z
        .array(
            z.object({
                stepNumber: z
                    .number()
                    .int()
                    .positive()
                    .describe(
                        "This is the sequential integer identifier for each step in the execution plan, starting from 1 and increasing by 1 for each subsequent step to ensure a clear, logical order of operations.",
                    ),
                title: z
                    .string()
                    .min(1)
                    .describe(
                        "This field contains a brief, informative title that encapsulates the primary focus or action of this particular step in the plan.",
                    ),
                description: z
                    .string()
                    .min(1)
                    .describe(
                        "This field offers a detailed, step-by-step explanation of the activities, considerations, and rationale involved in completing this step, providing enough guidance for implementation.",
                    ),
                tasks: z
                    .array(z.string().min(1))
                    .min(1)
                    .describe(
                        "This is an array listing out specific, actionable subtasks or individual items that need to be accomplished within this step, each described clearly to facilitate execution.",
                    ),
                dependencies: z
                    .array(z.number().int().positive())
                    .optional()
                    .describe(
                        "This optional field lists the step numbers (as integers) of any previous steps that must be completed before this step can begin, helping to manage workflow dependencies.",
                    ),
            }),
        )
        .min(1)
        .describe(
            "This array outlines the complete sequence of steps required to bring the project idea to fruition, with each step building upon the previous ones in a structured manner.",
        ),
    requiredTools: z
        .array(z.string().min(1))
        .optional()
        .describe(
            "This optional array enumerates any necessary tools, software libraries, programming frameworks, or technologies that are essential for developing and executing the project.",
        ),
    estimatedTime: z
        .string()
        .optional()
        .describe(
            'This optional field provides an approximate duration for completing the entire project, expressed in a human-readable format such as "3-5 hours" or "1-2 days", based on reasonable assumptions.',
        ),
});

export { ExecutionPlanSchema };
