import {
    convertToModelMessages,
    createUIMessageStream,
    streamText,
    tool,
    UIMessage,
} from "ai";
import { addUIMessage } from "../addUIMessage";
import { getUIMessages } from "../getUIMessages";
import z from "zod";
import { IOTooling } from "../../io/IOTooling";
import { SPEC_DOC_PATH } from "../constants";
import { useTreeAI } from "../../state/useTreeAI";
import { refreshUIMessages } from "../refreshUIMessages";
import { writeFileContent } from "../../io/writeFileContent";
import { removeUIMessages } from "../removeUIMessages";
import { saveToBrowserDB } from "../../io/saveToBrowserDB";

export async function defineAPp({ userPrompt, slot, model }) {
    addUIMessage({
        id: `${Math.random()}`,
        role: "user",
        parts: [{ type: "text", text: userPrompt }],
    });

    let loaderMessage: UIMessage = {
        id: `${Math.random()}`,
        role: "assistant",
        parts: [
            {
                type: "data-loading",
                data: `${slot.name} Developer is writing the Development Plan.`,
            },
        ],
    };
    addUIMessage(loaderMessage);

    const stream = createUIMessageStream({
        execute: ({ writer }) => {
            const result = streamText({
                model: model,
                messages: [
                    //
                    ...convertToModelMessages(getUIMessages()),
                ],
                toolChoice: "required",
                tools: {
                    processUserRequirement: tool({
                        name: "Processing User Requirements",
                        description: `When user wants to build app, processing User Requirements`,
                        inputSchema: z.object({
                            userRequirement: z.string(),
                        }),
                        execute: async (
                            { userRequirement },
                            { toolCallId },
                        ) => {
                            //
                            //
                            //
                            const result = streamText({
                                tools: {
                                    ...IOTooling,
                                },
                                model: model,
                                temperature: 0,
                                system: `
Prompt for Vibe Coding Platform: Processing User Requirements
You are an expert AI assistant for a vibe coding platform (similar to Base44 or Lovable) designed to transform user requirements into a functional no-code/low-code web application. Your task is to process the provided user requirements, refine them for clarity, and generate a detailed design for a full-stack web app. The platform prioritizes simplicity, AI-driven code generation, and intuitive interfaces for non-technical users. Follow a structured process: Requirements Refinement, System Design, and Component Specification, ensuring outputs are beginner-friendly and aligned with vibe coding principles.
                                `,
                                messages: [
                                    {
                                        role: "user",
                                        content: `

Instruction: Generating a "Product Requirement Definition"

Input Requirements:
${userRequirement} 

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

write the result to "${SPEC_DOC_PATH}"
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

                            let newMessageID = `_${Math.floor(Math.random() * 10000000)}`;

                            writer.write({
                                type: "data-user-requirements",
                                id: toolCallId,
                                data: {
                                    id: newMessageID,
                                    status: "begin",
                                    text: "",
                                },
                            });

                            let text = "";
                            let startTime = performance.now();
                            for await (let fragment of result.textStream) {
                                if (
                                    !useTreeAI.getState()
                                        .atLeastOneWorkerRunning
                                ) {
                                    useTreeAI.getState().atLeastOneWorkerRunning = true;
                                }
                                text += fragment;

                                writer.write({
                                    type: "data-user-requirements",
                                    id: toolCallId,
                                    data: {
                                        id: newMessageID,
                                        status: "in-progress",
                                        text: text,
                                    },
                                });
                            }
                            let endTime = performance.now();
                            let val = await result.usage;
                            let speedOutput =
                                val.outputTokens /
                                ((endTime - startTime) / 1000);

                            console.log(
                                "speedOutput",
                                speedOutput,
                                "duartion",
                                endTime - startTime,
                            );

                            writer.write({
                                type: "data-user-requirements",
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

    let thinking = {
        id: "work_" + Math.random(),
        role: "assistant",
        parts: [
            //
            {
                type: "text",
                text: "Thinking...",
            },
        ],
    } as UIMessage;

    addUIMessage(thinking);

    let canGo = true;
    let run = async () => {
        let res = await reader.read();
        canGo = !res.done;
        let value = res.value;

        if (value) {
            if (value?.type === "data-user-requirements") {
                let toolData = value.data as {
                    id: string;
                    status: "begin" | "in-progress" | "done";
                    text: string;
                };

                if (toolData.status === "begin") {
                    thinking.parts[0] = {
                        type: "data-code-md",
                        data: "Get Set Ready...",
                    };
                    refreshUIMessages({ ...thinking });
                }

                if (toolData.status === "in-progress") {
                    await writeFileContent({
                        path: `${SPEC_DOC_PATH}`,
                        content: toolData.text,
                    });

                    thinking.parts[0] = {
                        type: "data-code-md",
                        data: toolData.text,
                    };
                    refreshUIMessages({ ...thinking });
                }

                if (toolData.status === "done") {
                    await writeFileContent({
                        path: `${SPEC_DOC_PATH}`,
                        content: toolData.text,
                    });
                    thinking.parts[0] = {
                        type: "data-code-md",
                        data: toolData.text,
                    };
                    removeUIMessages({ ...loaderMessage });
                    refreshUIMessages({ ...thinking });
                }
            }
        }
        if (canGo) {
            requestAnimationFrame(() => {
                run();
            });
        }
    };
    run();

    await saveToBrowserDB();

    await new Promise((resolve) => {
        let tttt = setInterval(() => {
            if (!canGo) {
                resolve(null);
                clearInterval(tttt);
            }
        });
    });

    await putBackFreeAIAsync({ engine: slot });
}
