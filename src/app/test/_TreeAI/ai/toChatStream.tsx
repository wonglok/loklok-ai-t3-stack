// import { OpenAICompatibleChatLanguageModel } from "@ai-sdk/openai-compatible";
import {
    convertToModelMessages,
    streamText,
    tool,
    createUIMessageStream,
    createUIMessageStreamResponse,
} from "ai";
// import { writeFileContent } from "../io/writeFileContent";
// import { saveToBrowserDB } from "../io/saveToBrowserDB";
import { useTreeAI } from "../state/useTreeAI";
import z from "zod";
import { readFileContent } from "../io/readFileContent";
import { writeFileContent } from "../io/writeFileContent";
// import { readFileContent } from "../io/readFileContent";
// import { writeFileContent } from "../io/writeFileContent";

export const toChatStream = async ({
    setUIMessages = (v: any[]) => {},
    model,
    userPrompt = "",
    uiMessages = [],
}) => {
    // let ioTools = {
    //     readFile: tool({
    //         inputSchema: z.object({
    //             filepath: z.string(),
    //         }),
    //         execute: async ({ filepath }) => {
    //             return await readFileContent({ path: filepath });
    //         },
    //         description: `read content from file at path`,
    //     }),
    //     writeFile: tool({
    //         inputSchema: z.object({
    //             filepath: z.string(),
    //             content: z.string(),
    //         }),
    //         execute: async ({ filepath, content }) => {
    //             await writeFileContent({
    //                 path: filepath,
    //                 content: content,
    //             });
    //             return "successful";
    //         },
    //         description: `write content from file at path`,
    //     }),
    // };

    const stream = createUIMessageStream({
        execute: ({ writer }) => {
            const result = streamText({
                model,
                messages: [
                    ...convertToModelMessages(uiMessages),
                    {
                        role: "user",
                        content: `here's the User Requirement: ${userPrompt}`,
                    },
                ],
                toolChoice: "required",
                tools: {
                    processUserRequirement: tool({
                        name: "Processing User Requirements",
                        description: `Processing User Requirements`,
                        inputSchema: z.object({
                            userRequirement: z.string(),
                        }),
                        execute: async (
                            { userRequirement },
                            { toolCallId },
                        ) => {
                            const { textStream } = streamText({
                                model: model,
                                temperature: 0,
                                system: `

Instruction of generate a "unified diff" that can be cleanly applied to modify code files:

## Step-by-Step Instructions:

1. Start with file headers:
    - First line: "--- {original_file_path}"
    - Second line: "+++ {new_file_path}"

2. For each change section:
    - Begin with "@@ ... @@" separator line without line numbers
    - Include 2-3 lines of context before and after changes
    - Mark removed lines with "-"
    - Mark added lines with "+"
    - Preserve exact indentation

3. Group related changes:
    - Keep related modifications in the same hunk
    - Start new hunks for logically separate changes
    - When modifying functions/methods, include the entire block

## Requirements:

1. MUST include exact indentation
2. MUST include sufficient context for unique matching
3. MUST group related changes together
4. MUST use proper "unified diff" format
5. MUST NOT include timestamps in file headers
6. MUST NOT include line numbers in the @@ header

## Examples:

✅ Good diff (follows all requirements):
\`\`\`diff
--- src/utils.ts
+++ src/utils.ts
@@ ... @@
    def calculate_total(items):
-      total = 0
-      for item in items:
-          total += item.price
+      return sum(item.price for item in items)
\`\`\`
`,
                                messages: [
                                    {
                                        role: "user",
                                        content: `
Instruction: Generating a "Product Requirement Definition"

Prompt for Vibe Coding Platform: Processing User Requirements
You are an expert AI assistant for a vibe coding platform (similar to Base44 or Lovable) designed to transform user requirements into a functional no-code/low-code web application. Your task is to process the provided user requirements, refine them for clarity, and generate a detailed design for a full-stack web app. The platform prioritizes simplicity, AI-driven code generation, and intuitive interfaces for non-technical users. Follow a structured process: Requirements Refinement, System Design, and Component Specification, ensuring outputs are beginner-friendly and aligned with vibe coding principles.

Input Requirements:
${userRequirement} (Example: "I want a simple app where users can sign up, log in, create tasks with titles and descriptions, mark tasks as done, and see a list of their tasks.")

Step 1: Requirements Refinement

Analyze the user requirements for clarity, feasibility, and completeness, considering the vibe coding context (e.g., non-technical users, natural language inputs).
Identify ambiguities, missing details (e.g., user roles, edge cases), or implied non-functional requirements (e.g., ease of use, mobile responsiveness).
Refine requirements into a concise, prioritized list using the MoSCoW method (Must-have, Should-have, Could-have, Won't-have).
Make assumptions where needed (e.g., JWT authentication for user login) and list them explicitly.
Output this step as a markdown section with:
Refined requirements (bullet points).
Assumptions made.
Questions for clarification (if any).

Step 2: System Design

Using the refined requirements, design a full-stack web app for the vibe coding platform with:
Frontend: ReactJS with TypeScript for UI components and pages, emphasizing intuitive, mobile-responsive design. zustand.js for React State Management for User Interface Interactivity. React Three Fiber for 3D Interactives
Backend: tRPC for type-safe APIs (assume Next.js integration).
Database: Mongoose ODM with MongoDB for data storage.

Provide detailed designs for:
Screen UIs and Pages: List all screens/pages (e.g., SignUp Page, TaskList Page). For each, include:
Purpose (e.g., allow users to create tasks).
Key elements (e.g., input fields, buttons, task cards).
User interactions (e.g., click "Add Task" to submit form).
Text-based wireframe description (e.g., "Header with app logo, form with title and description fields, submit button").

Backend tRPC APIs: Define all tRPC procedures (queries and mutations). For each, specify:
Endpoint name (e.g., task.create).
Input parameters (with TypeScript types, e.g., { title: string, description: string }).
Output/response (with types, e.g., { id: string, title: string, status: boolean }).
Purpose and any authentication requirements (e.g., requires user session).
Group by routers (e.g., authRouter, taskRouter).

Mongoose Database: Design MongoDB schemas using Mongoose. For each model, provide:
Schema definition in code-like syntax (e.g., const TaskSchema = new mongoose.Schema({ title: String, description: String })).
Fields with types, validation, and defaults.
Relationships (e.g., reference to User model).
Indexes for performance (if applicable).

Ensure designs prioritize:
Simplicity for non-technical users (e.g., natural language-driven workflows).
Best practices: RESTful-like tRPC APIs, normalized schemas, accessible UIs, secure authentication (e.g., JWT).
Vibe coding principles: AI-generated code snippets, minimal user input for maximum output.

Output this step as markdown sections with headings, bullet points, and code blocks.

Step 3: Component Specification

Plan the ReactJS implementation based on Step 2 designs.
ReactJS Components Listing: Provide a detailed list of all ReactJS components. For each, include:
Name (e.g., TaskCard, AuthForm).
Purpose (e.g., display a single task, handle login/signup).
Props (with TypeScript interfaces, e.g., interface TaskCardProps { task: { id: string, title: string } }).
State (if any, e.g., form input state).
Usage (e.g., used in TaskList Page).
Categorize into reusable (e.g., Button, InputField) and page-specific (e.g., TaskList).

Include implementation notes:
Folder structure (e.g., /components, /pages, /server/trpc).
Key dependencies (e.g., react-hook-form, @trpc/client).
Integration details (e.g., how React components call tRPC APIs).

Output this step as a markdown section with a table or bullet points for components and notes.

General Guidelines:

Use markdown for clear formatting (headings, code blocks, tables).
Assume a modern tech stack: Zustand, ReactJS with TypeScript, tRPC with Next.js, Mongoose/MongoDB.
Prioritize vibe coding principles: simplicity, AI-driven automation, and rapid prototyping for non-coders.
If requirements are vague, note gaps in Step 1, suggest enhancements, and proceed with reasonable assumptions.
Ensure outputs are beginner-friendly, with clear explanations for non-technical users.
Summarize how the design enables rapid app development via AI-driven workflows.
Wrap the entire response in a single markdown document.

Folder Structure:

/components/... (react js compos - frontend)
/zustand/... (zustand js compos - frontend)
/trpc-frontend/... (trpc prcedures - frontend)
/trpc-backend/... (trpc prcedures - backend)
/model/... (mongoose models - backend)
/docs/... (knowledge base of the app)

Generate the "Product Requirement Definition" starting with Step 1, and output it as a complete design based on the provided requirements.
    `,
                                    },
                                ],
                                // schema: z.object({
                                //     files: z.array(
                                //         z.object({
                                //             path: z.string().describe("file path"),
                                //             content: z.string().describe("file content"),
                                //         }),
                                //     ),
                                // }),
                                // mode: "json",
                            });

                            let newMessageID = `${Math.random()}`;

                            writer.write({
                                type: "data-process-user-requirement",
                                id: toolCallId,
                                data: {
                                    id: newMessageID,
                                    status: "begin",
                                    text: "",
                                },
                            });

                            let text = "";
                            for await (let fragment of textStream) {
                                if (
                                    !useTreeAI.getState()
                                        .atLeastOneWorkerRunning
                                ) {
                                    useTreeAI.getState().atLeastOneWorkerRunning = true;
                                }
                                text += fragment;

                                writer.write({
                                    type: "data-process-user-requirement",
                                    id: toolCallId,
                                    data: {
                                        id: newMessageID,
                                        status: "in-progress",
                                        text: text,
                                    },
                                });
                            }

                            writer.write({
                                type: "data-process-user-requirement",
                                id: toolCallId,
                                data: {
                                    id: newMessageID,
                                    status: "done",
                                    text: text,
                                },
                            });

                            if (useTreeAI.getState().atLeastOneWorkerRunning) {
                                useTreeAI.getState().atLeastOneWorkerRunning = false;
                            }

                            // return e.g. custom status for tool call
                        },
                    }),
                },
            });

            writer.merge(result.toUIMessageStream());
        },
    });

    let reader = stream.getReader();

    let reasoning = {};
    let textOutput = {};
    let canGo = true;
    while (canGo) {
        let res = await reader.read();
        canGo = !res.done;
        let value = res.value;

        if (value.type === "reasoning-delta") {
            reasoning[value.id] = reasoning[value.id] || "";
            reasoning[value.id] += value.delta;

            setUIMessages([
                ...uiMessages,
                {
                    id: `${value.id}`,
                    role: "assistant",
                    parts: [{ type: "reasoning", text: reasoning[value.id] }],
                },
            ]);
        }

        if (value.type === "data-process-user-requirement") {
            let toolData = value.data as {
                id: string;
                status: "begin" | "in-progress" | "done";
                text: string;
            };

            if (toolData.status === "begin") {
                setUIMessages([
                    ...uiMessages,
                    {
                        id: toolData.id,
                        role: "assistant",
                        parts: [
                            //
                            {
                                type: "text",
                                text: "writing file...",
                            },
                        ],
                    },
                ]);
            }

            //

            if (toolData.status === "in-progress") {
                setUIMessages([
                    ...uiMessages,
                    {
                        id: toolData.id,
                        role: "assistant",
                        parts: [
                            //
                            //
                            { type: "reasoning", text: reasoning[value.id] },
                            {
                                type: "data-code-md",
                                data: toolData.text,
                            },
                        ],
                    },
                ]);
            }

            if (toolData.status === "done") {
                setUIMessages([
                    ...uiMessages,
                    {
                        id: toolData.id,
                        role: "assistant",
                        parts: [
                            //
                            //
                            { type: "reasoning", text: reasoning[value.id] },
                            {
                                type: "data-code-md",
                                data: toolData.text,
                            },
                        ],
                    },
                ]);
            }
        }
    }
};
