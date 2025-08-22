import {
    convertToModelMessages,
    createUIMessageStream,
    generateObject,
    generateText,
    ModelMessage,
    streamObject,
    streamText,
    tool,
    UIMessage,
} from "ai";
import { IOTooling } from "../../io/IOTooling";
import { APP_ROOT_PATH, SPEC_DOC_PATH } from "../constants";
import { EngineSetting, useAI } from "../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { putBackFreeAIAsync } from "../putBackFreeAIAsync";
import { getFreeAIAsync } from "../getFreeAIAsync";
import { MyTask, MyTaskManager } from "./_core/MyTaskManager";
import { getModelMessagesFromUIMessages } from "../getModelMessagesFromUIMessages";
import { readFileContent } from "../../io/readFileContent";
import { writeFileContent } from "../../io/writeFileContent";
import { saveToBrowserDB } from "../../io/saveToBrowserDB";
// import z from "zod";
// import { parseCodeBlocks } from "./_core/LokLokParser";
// import { parseCodeBlocksActionType } from "./_core/LokLokParser2";
import { removeFile } from "../../io/removeFile";
import { parseCodeBlocksGen3 } from "./_core/LokLokParser3";

export async function handleAppSpec({
    userPrompt,
    task,
}: {
    userPrompt?: string;
    task: MyTask;
}) {
    let { model, engineSettingData: slot } = await getFreeAIAsync();

    //

    let oldSpec = "";

    oldSpec = await readFileContent({ path: `${SPEC_DOC_PATH}` });

    let chatblocks = [
        {
            role: "system",
            content: `

# Output Format:

- if you want to create file
[mydearlokloktag action="create-file" file="{file_path_name}" summary="{file_summary}"]
{content}
[/mydearlokloktag]

- if you want to remove file
[mydearlokloktag action="remove-file" file="{file_path_name}" summary="{file_summary}"][/mydearlokloktag]

- if you want to update file
[mydearlokloktag action="update-file" file="{file_path_name}" summary="{file_summary}"]
{content}
[/mydearlokloktag]

- {file_path_name} is the file path name
- {file_summary} is the overview, purpose and summary of the code file
- {content} is the content of the file

- if there is an existing file, then you can use [mydearlokloktag action="update-file" ...]
- if there is no existing file, then you can [mydearlokloktag action="create-file" ...]
- if you need to remove existing file, then you can [mydearlokloktag action="remove-file" ...]


        `,
        },
    ];

    let files = useAI.getState().files;
    if (files?.length > 0) {
        chatblocks.push({
            role: "assistant",
            content: `Here's the "file system of existing code": `,
        });

        files.forEach((ff) => {
            chatblocks.push({
                role: "assistant",
                content: `
[file: "${ff.path}"][begin]
    [file: "${ff.path}"][summary_start]
${ff.summary}
    [file: "${ff.path}"][summary_end]
    [file: "${ff.path}"][content_start]
${ff.content}
    [file: "${ff.path}"][content_end]
[file: "${ff.path}"][end]`,
            });
        });
    }

    chatblocks.push({
        role: `assistant`,

        content: `
Prompt for Vibe Coding Platform: Processing User Requirements
You are an expert AI assistant for a vibe coding platform (similar to Base44 or Lovable) designed to transform user requirements into a functional no-code/low-code web application. Your task is to process the provided user requirements, refine them for clarity, and generate a detailed design for a full-stack web app. The platform prioritizes simplicity, AI-driven code generation, and intuitive interfaces for non-technical users. Follow a structured process: Requirements Refinement, System Design, and Component Specification, ensuring outputs are beginner-friendly and aligned with vibe coding principles.

Instruction: Generating a "Product Requirement Definition"

Input Requirements:
${userPrompt} 

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
Frontend: ReactJS with TypeScript for UI components and pages, emphasizing intuitive, mobile-responsive design. zustand.js for React State Management for User Interface Interactivity. React Three Fiber for 3D Interactives. wouter hash rotuer for react
Backend: tRPC for type-safe APIs (assume react.js integration).
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
Key dependencies (e.g., react-hook-form, wouter hash rotuer for react, @trpc/client).
Integration details (e.g., how React components call tRPC APIs, wouter hash rotuer for react rotuer).

Output this step as a markdown section with a table or bullet points for components and notes.

General Guidelines:

Use markdown for clear formatting (headings, code blocks, tables).
Assume a modern tech stack: Zustand, ReactJS with TypeScript, tRPC with React.js, Mongoose/MongoDB.
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
Each Step is a unique file.

- Write to /docs/step1.md
- Write to /docs/step2.md
- Write to /docs/step3.md
...

`,
    });

    let resp = await streamText({
        model: model,
        messages: [
            //
            ...getModelMessagesFromUIMessages(),

            ...chatblocks,
        ],
    });

    let txt = "";

    for await (let part of resp.textStream) {
        txt += part;

        console.log(txt);
    }

    console.log("txt", txt);
    console.log("userPrompt", userPrompt);

    await MyTaskManager.doneTask(task.name);
    await putBackFreeAIAsync({ engine: slot });
}
