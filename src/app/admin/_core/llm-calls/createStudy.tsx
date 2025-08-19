"use client";

import { Button } from "@/components/ui/button";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { createOpenAI } from "@ai-sdk/openai";
import {
    generateObject,
    jsonSchema,
    JSONSchema7,
    streamObject,
    streamText,
    zodSchema,
} from "ai";
import z from "zod/v4";
import ollama from "ollama/browser";

const test = async () => {
    //     const ollamaOpenAI = createOpenAI({
    //         apiKey: "",
    //         baseURL: "http://localhost:11434/v1",
    //     });
    //     const openAICompatible = createOpenAICompatible({
    //         name: "any",
    //         baseURL: "http://localhost:11434/v1",
    //         // baseURL: "http://localhost:1234/v1",
    //         includeUsage: true, // Include usage information in streaming responses
    //     });
    //     let modelOptions = [
    //         {
    //             displayName: "GPT OSS (20b)",
    //             modelName: "gpt-oss:20b",
    //             context: "128K",
    //             purpose: "reason",
    //             provider: "ollama",
    //         },
    //         {
    //             displayName: "GPT OSS (120b)",
    //             modelName: "gpt-oss:120b",
    //             context: "128K",
    //             purpose: "reason",
    //             provider: "ollama",
    //         },
    //         {
    //             displayName: "Qwen Coder 3 (30b)",
    //             modelName: "qwen3-coder:30b",
    //             context: "256K",
    //             purpose: "code",
    //             provider: "ollama",
    //         },
    //         {
    //             displayName: "Deep Seek Coder v2 (16b)",
    //             modelName: "deepseek-coder-v2:16b",
    //             context: "160K",
    //             purpose: "code",
    //             provider: "ollama",
    //         },
    //         {
    //             displayName: "Qwen Coder 2.5 (7b)",
    //             modelName: "qwen2.5-coder:7b",
    //             context: "32K",
    //             purpose: "code",
    //             provider: "ollama",
    //         },
    //     ];
    //     let modelCache = new Map();
    //     let getModel = async ({ spec, onProgress = (v) => console.log(v) }) => {
    //         if (!spec) {
    //             throw new Error("spec is undefeind");
    //         }
    //         //
    //         let keyname = JSON.stringify([spec.provider, spec.modelName]);
    //         //
    //         if (modelCache.has(keyname)) {
    //             let modelInst = modelCache.get(keyname);
    //             console.log(modelInst);
    //             return modelInst;
    //         }
    //         //
    //         if (spec.provider === "ollama") {
    //             let res = await ollama.pull({
    //                 model: `${spec.modelName}`,
    //                 insecure: false,
    //                 stream: true,
    //             });
    //             for await (let prog of res) {
    //                 onProgress(prog);
    //             }
    //             let modelInst = await openAICompatible(spec.modelName);
    //             console.log("modelInst", modelInst);
    //             modelCache.set(keyname, modelInst);
    //             return modelInst;
    //         }
    //         throw new Error("not found provider");
    //     };
    //     console.log("begin call");
    //     let userPrompt = `I want to build an e-class software for a teacher and their students.
    // Here are the user types / role:
    // 1. System Admin (can access all features)
    // 2. Teacher (can access teacher features and Student features)
    // 3. Student (can only access student features)
    // System Admin can create Teacher Login Accounts and Student Login Accounts.
    // Teacher can create, update, delete, and metaverse.
    // Metaverse has
    // - Avatars of Teachers walking around
    // - Avatars of Students walking around
    // - NPC Avatars standing at spots
    // - Environment Lighting
    // - Venue 3D model like School / Canteen
    // Teacher can create NPC Avatars
    // Teacher can create Page.
    // 1. Each Page has a Metaverse
    // 2. Each Metaverse has a few NPC Avatars
    // 3. Each NPC Avatar can have multiple functionalities in the following:
    //     1. Generic NPC Avatars have different functionality.
    //         - Quiz Function
    //         - Video Watching Function
    //         - Portal Function
    // 4. Create Student Account Login (register for students in batch)
    // Teacher can review analytics and report
    // 1. Student Learning Progress
    // 2. Quiz Scores
    // 3. Traffic Count
    // 5. VR Practice data
    // 6. Page view count
    // Student can
    // 1. Register to Metaverse
    // 2. Login to Metaverse
    // 3. Interact with NPC
    // 4. Track their learning progress
    //     1. View what quiz are finished and what quiz haven't started
    //     2. View which video watched or not
    //     3. View VR Practice Result`;
    //     let runText = async ({ model }) => {
    //         let resp = streamText({
    //             model: model,
    //             prompt: `
    // System Prompt for Vibe Coding Platform: Processing User Requirements:
    // You are an expert AI assistant for a vibe coding platform (similar to Base44 or Lovable) designed to transform user requirements into a functional no-code/low-code web application.
    // Your task is to process the provided user requirements, refine them for clarity, and generate a detailed design for a full-stack web app. The platform prioritizes simplicity, AI-driven code generation, and intuitive interfaces for non-technical users.
    // Follow a structured process: Requirements Refinement, System Design, and Component Specification, ensuring outputs are beginner-friendly and aligned with vibe coding principles.
    // Input Requirements:
    // ${userPrompt}
    // Step 1: Requirements Refinement
    // Analyze the user requirements for clarity, feasibility, and completeness, considering the vibe coding context (e.g., non-technical users, natural language inputs).
    // Identify ambiguities, missing details (e.g., user roles, edge cases), or implied non-functional requirements (e.g., ease of use, mobile responsiveness).
    // Refine requirements into a concise, prioritized list using the MoSCoW method (Must-have, Should-have, Could-have, Won't-have).
    // Make assumptions where needed (e.g., JWT authentication for user login) and list them explicitly.
    // Output this step as a markdown section with:
    // Refined requirements (bullet points).
    // Assumptions made.
    // Questions for clarification (if any).
    // Step 2: System Design
    // Using the refined requirements, design a full-stack web app for the vibe coding platform with:
    // Frontend: ReactJS with TypeScript for UI components and pages, emphasizing intuitive, mobile-responsive design.
    // Backend: tRPC for type-safe APIs (assume Next.js integration).
    // Database: Mongoose ODM with MongoDB for data storage.
    // Provide detailed designs for:
    // Screen UIs and Pages: List all screens/pages (e.g., SignUp Page, TaskList Page). For each, include:
    // Purpose (e.g., allow users to create tasks).
    // Key elements (e.g., input fields, buttons, task cards).
    // User interactions (e.g., click "Add Task" to submit form).
    // Text-based wireframe description (e.g., "Header with app logo, form with title and description fields, submit button").
    // Backend tRPC APIs: Define all tRPC procedures (queries and mutations). For each, specify:
    // Endpoint name (e.g., task.create).
    // Input parameters (with TypeScript types, e.g., { title: string, description: string }).
    // Output/response (with types, e.g., { id: string, title: string, status: boolean }).
    // Purpose and any authentication requirements (e.g., requires user session).
    // Group by routers (e.g., authRouter, taskRouter).
    // Mongoose Database: Design MongoDB schemas using Mongoose. For each model, provide:
    // Schema definition in code-like syntax (e.g., const TaskSchema = new mongoose.Schema({ title: String, description: String })).
    // Fields with types, validation, and defaults.
    // Relationships (e.g., reference to User model).
    // Indexes for performance (if applicable).
    // Ensure designs prioritize:
    // Simplicity for non-technical users (e.g., natural language-driven workflows).
    // Best practices: RESTful-like tRPC APIs, normalized schemas, accessible UIs, secure authentication (e.g., JWT).
    // Vibe coding principles: AI-generated code snippets, minimal user input for maximum output.
    // Output this step as markdown sections with headings, bullet points, and code blocks.
    // Step 3: Component Specification
    // Plan the ReactJS implementation based on Step 2 designs.
    // ReactJS Components Listing: Provide a detailed list of all ReactJS components. For each, include:
    // Name (e.g., TaskCard, AuthForm).
    // Purpose (e.g., display a single task, handle login/signup).
    // Props (with TypeScript interfaces, e.g., interface TaskCardProps { task: { id: string, title: string } }).
    // State (if any, e.g., form input state).
    // Usage (e.g., used in TaskList Page).
    // Categorize into reusable (e.g., Button, InputField) and page-specific (e.g., TaskList).
    // Include implementation notes:
    // Folder structure (e.g., /components, /pages, /server/trpc).
    // Key dependencies (e.g., react-hook-form, @trpc/client).
    // Integration details (e.g., how React components call tRPC APIs).
    // Output this step as a markdown section with a table or bullet points for components and notes.
    // General Guidelines:
    // Use markdown for clear formatting (headings, code blocks, tables).
    // Assume a modern tech stack: ReactJS with TypeScript, tRPC with Next.js, Mongoose/MongoDB.
    // Prioritize vibe coding principles: simplicity, AI-driven automation, and rapid prototyping for non-coders.
    // If requirements are vague, note gaps in Step 1, suggest enhancements, and proceed with reasonable assumptions.
    // Ensure outputs are beginner-friendly, with clear explanations for non-technical users.
    // Summarize how the design enables rapid app development via AI-driven workflows.
    // Wrap the entire response in a single markdown document.
    // Generate the response now, starting with Step 1, and output it as a complete design based on the provided requirements.
    //             `,
    //         });
    //         console.log("runtext");
    //         let txt = "";
    //         for await (let output of resp.textStream) {
    //             txt += output;
    //             console.log(txt);
    //         }
    //         console.log("endtext");
    //     };
    //
    // let model = await getModel({
    //     spec: modelOptions.find((r) => r.modelName === "qwen3-coder:30b"),
    //     onProgress: (data) => {
    //         console.log(JSON.stringify(data, null, "\t"));
    //     },
    // });
    // let model = await getModel({
    //     spec: modelOptions.find((r) => r.modelName === "gpt-oss:20b"),
    //     onProgress: (data) => {
    //         console.log(JSON.stringify(data, null, "\t"));
    //     },
    // });
    // let yo = webLLM("Llama-3.2-3B-Instruct-q4f16_1-MLC", {
    //     initProgressCallback: (event) => {
    //         console.log(event);
    //     },
    //     worker: new Worker(new URL("./wellmworker.ts", import.meta.url), {
    //         type: "module",
    //     }),
    // });
    // const result = streamObject({
    //     // or generateText
    //     model: yo,
    //     schema: zodSchema(
    //         z.object({
    //             response: z.string(),
    //         }),
    //     ),
    //     messages: [
    //         { role: "user", content: "Hello, how are you? please respond" },
    //     ],
    // });
    // //
    // for await (const chunk of result.partialObjectStream) {
    //     console.log(chunk);
    // }
    // let frag = "";
    // for await (let item of stream.textStream) {
    //     if (item) {
    //         frag += item;
    //         console.log(frag);
    //     }
    // }
    // console.log("end");
};

export const ButtonYo = () => {
    return (
        <Button
            onClick={() => {
                test();
            }}
        >
            Hi
        </Button>
    );
};
