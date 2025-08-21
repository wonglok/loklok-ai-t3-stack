"use client";
import { z } from "zod";
import { generateObject, generateText } from "ai";
import { createOpenAI } from "@ai-sdk/openai";
import { getLMStudioModel } from "../getLMStudioModel";

// Initialize the AI provider (assuming OpenAI; replace with your preferred provider if needed)
const gptOSS = getLMStudioModel({ name: "openai/gpt-oss-20b" });

// Define the Zod schema for the execution plan JSON
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

// Hardcode the system prompt
const systemPrompt = `
You are an advanced AI coding assistant specialized in the Vibe coding platform environment. Your primary responsibility is to carefully analyze and process the text of a user's idea for a coding project. From this analysis, you must create a highly structured and detailed execution plan in the form of a JSON object. This plan should systematically break down the user's idea into a series of logical, sequential steps that guide the implementation process from start to finish. Each step should include specific tasks, potential dependencies on prior steps, and any other relevant details to ensure the plan is practical, efficient, and easy to follow for developers or coders.

It is crucial that your output consists solely of the JSON object itself—do not include any additional text, explanations, comments, or wrappers around it. The JSON must adhere strictly and without deviation to the predefined Zod schema structure provided below, ensuring all required fields are populated appropriately and optional fields are used only when they add meaningful value:

- "projectName": This must be a string with at least one character, serving as the clear and fitting name for the coding project derived directly from the idea.
- "description": This must be a string with at least one character, offering a thorough yet concise summary that captures the core concept, goals, and scope of the project idea.
- "steps": This is a required array containing at least one object, where each object represents a distinct phase in the execution. Each step object must include:
  - "stepNumber": An integer greater than zero, indicating the order in which this step should be performed, starting from 1.
  - "title": A string with at least one character, providing a short, descriptive headline for the step's main activity.
  - "description": A string with at least one character, elaborating in detail on the purpose of the step, what needs to be achieved, and any key considerations or best practices.
  - "tasks": An array of strings, with at least one item, where each string details a specific sub-action or task to complete within the step, phrased actionably.
  - "dependencies": An optional array of positive integers, listing the stepNumbers of any preceding steps that this one relies upon for prerequisites or inputs.
- "requiredTools": An optional array of strings, each specifying a tool, library, framework, or technology that is necessary for the project, inferred from the idea if not explicitly stated.
- "estimatedTime": An optional string that estimates the total time needed to complete the project, formatted understandably like "4-6 hours" or "2 days", based on a realistic assessment.

When generating the plan, approach the user's idea with careful reasoning: Ensure the steps are logically ordered, starting from initial setup and progressing to completion and testing. If the idea lacks specifics, such as a programming language or framework, make informed and reasonable assumptions based on standard industry practices—for example, default to Python for general scripting or React for web applications—while keeping the plan aligned with the idea's intent. Make the plan as comprehensive as possible to cover potential edge cases, but avoid unnecessary complexity. Focus on clarity, feasibility, and completeness to empower the user to implement the idea successfully.
`;

// Hardcode the user prompt template
const userPromptTemplate = `
Below is the detailed text provided by the user describing their idea for a coding project on the Vibe platform: [IDEA_TEXT]. Your task is to thoroughly review and interpret this idea text, breaking it down into its fundamental components, objectives, and requirements. Then, formulate a complete execution plan in JSON format that provides a step-by-step roadmap for turning this idea into a functional coding project. Ensure the plan is detailed, sequential, and includes all necessary elements such as tasks within each step, any inter-step dependencies, and optional details like required tools or time estimates where they enhance the plan's usefulness.
`;

// Main function to process the idea, generate the plan, and execute it
export async function processAndExecuteIdea(ideaText: string) {
    // Prepare the full prompt for generating the execution plan
    const fullPrompt =
        systemPrompt + userPromptTemplate.replace("[IDEA_TEXT]", ideaText);

    // Generate the execution plan JSON using Vercel AI SDK
    const { object: executionPlan } = await generateObject({
        model: gptOSS, // Use a suitable model; optimized for 8B-like efficiency
        schema: ExecutionPlanSchema,
        prompt: fullPrompt,
        temperature: 0.7, // Balanced creativity and structure
    });

    console.log("Generated Execution Plan:", executionPlan);

    // Use a Map to store task/step outputs (key: stepNumber, value: generated output string)
    const outputMap = new Map<number, string>();

    // Sort steps by stepNumber (assuming they are provided in order, but ensure sequential processing)
    const sortedSteps = executionPlan.steps.sort(
        (a, b) => a.stepNumber - b.stepNumber,
    );

    // Execute each step in order, respecting dependencies
    for (const step of sortedSteps) {
        // Gather outputs from dependencies if any
        let depOutputs = "";
        if (step.dependencies && step.dependencies.length > 0) {
            for (const dep of step.dependencies) {
                const depOutput = outputMap.get(dep);
                if (depOutput) {
                    depOutputs += `Output from Step ${dep}: ${depOutput}\n`;
                    console.log(depOutputs);
                } else {
                    throw new Error(
                        `Dependency Step ${dep} not found or not executed yet.`,
                    );
                }
            }
        }

        // Create a prompt for executing the step
        const stepPrompt = `
Execute the following step in the coding project:
Title: ${step.title}
Description: ${step.description}
Tasks: ${step.tasks.join("\n- ")}
${depOutputs ? `Previous dependencies:\n${depOutputs}` : ""}
Generate the output for this step, which could include code snippets, implementation details, or results based on the tasks. Keep it concise and actionable.
`;

        // Use AI to generate the output for this step
        const { text: stepOutput } = await generateText({
            model: gptOSS,
            prompt: stepPrompt,
            temperature: 0.6, // Slightly lower for more deterministic outputs
        });

        // Store the output in the Map
        outputMap.set(step.stepNumber, stepOutput);

        console.log(`Executed Step ${step.stepNumber}:`, stepOutput);
    }

    // Return the final outputs Map (or convert to object for JSON if needed)
    return Object.fromEntries(outputMap);
}

export const ButtonIdeaExecution = () => {
    return (
        <button
            onClick={() => {
                //

                // Example usage (replace with your idea text)
                (async () => {
                    const ideaText =
                        "Build a simple todo list app in React with local storage.";
                    const finalOutputs = await processAndExecuteIdea(ideaText);
                    console.log("Final Outputs:", finalOutputs);
                })();
            }}
        >
            Test Grok AI
        </button>
    );
};
