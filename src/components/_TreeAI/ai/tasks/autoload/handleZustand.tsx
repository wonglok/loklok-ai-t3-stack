import {
    streamText,
    convertToModelMessages,
    createUIMessageStream,
    generateObject,
    generateText,
    ModelMessage,
    streamObject,
    tool,
    UIMessage,
} from "ai";
// import { IOTooling } from "../../../io/IOTooling";
import { EngineSetting, useAI } from "../../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { putBackFreeAIAsync } from "../../putBackFreeAIAsync";
import { getFreeAIAsync } from "../../getFreeAIAsync";
import { MyTask, MyTaskManager } from "../_core/MyTaskManager";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
// import { readFileContent } from "../../../io/readFileContent";
import { writeFileContent } from "../../../io/writeFileContent";
import { saveToBrowserDB } from "../../../io/saveToBrowserDB";

// import z from "zod";
// import { parseCodeBlocks } from "./_core/LokLokParser";
// import { parseCodeBlocksActionType } from "./_core/LokLokParser2";

import { removeFile } from "../../../io/removeFile";
import { parseCodeBlocksGen3 } from "../_core/LokLokParser3";
import { getAppOverviewPrompt } from "../prompts/getAppOverviewPrompt";
import { getFileOutputFormatting } from "../prompts/getFileOutputFormatting";

// import { v4 } from "uuid";
// import { putUIMessage } from "../../putUIMessage";
// import { removeUIMessage } from "../../removeUIMessage";

import { listOutFilesToChatBlocks } from "../prompts/listOutFilesToChatBlocks";
import { makeTicker } from "../_core/makeTicker";
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";

export const name = "handleZustand";
export const displayName = "Zustand";

export async function handleZustand({
    userPrompt,
    task,
}: {
    userPrompt: string;
    task: MyTask;
}) {
    let { model, engineSettingData: slot } = await getFreeAIAsync();
    let files = useAI.getState().files;

    let chatblocks = [];
    chatblocks.push({
        role: "assistant",
        content: `
        Here's the entire tech spec, but only focus on ------ "ZUSTAND & @trpc/client Section" -----:
        ${await getAppOverviewPrompt()}
        `,
    });

    await listOutFilesToChatBlocks({ files, chatblocks });

    chatblocks.push({
        role: "user",
        content: `
Instructions:

- Identify ALL Zustand stores (includeing user login register) and implement them, use only javascript ".js" files:
- MUST WRITE TO write to folder: "/stores/*.js"

Requirements: 
- DO NOT WRAP THE CODE WITH markdown
- ONLY WRITE PURE CODE FOR

- MUST use: import { create } from 'zustand'; // good
- MUST use: zustand selector like: const user = useAuthStore((r) => r.user) // good
- MUST NOT use: multiple properies zustand selector like: const {user, logout} = useAuthStore((r) => { // bad
    return { // bad
        user: r.user, // bad
        logout: r.logout  // bad
    }  // bad
}) // bad


- all zustand trpc frontend method must exist in trpc backend

- MUST use sub-procedure like "auth.hydrate"
- MUST use sub-procedure like "auth.signup"
- MUST use sub-procedure like "auth.login"

- There's a Global variable window.trpcSDK as a custom tRPC Frontend Client.

declare global {
    interface Window {
        trpcSDK?: {
            client: any;
            setAuthToken: (v: any) => Promise<void>;
            getAuthToken: (v: any) => Promise<string>;
        };
    }
}

- use client.app.auth for authentication modules
example login: window.trpcSDK.client.app.auth.login.mutate({email: email, password: password})

- store when we receive JWT when login / register 
example save token after login: window.trpcSDK.setAuthToken(result.token)


- hydrate store state by using "window.trpcSDK.getAuthToken"
example: await window.trpcSDK.getAuthToken()

- MUST implmenet auth store with hydration logic, login, signup, logout and more .... and uses "await window.trpcSDK.getAuthToken()"

- MUST NOT Impport "@/types"
- MUST USE "_id" for object id ("_id" = good)
- MUST NOT USE "id" for object id ("id" = bad)

- MUST NOT IMPORT "@tanstack/react-query"

- MUST ONLY WRITE PURE CODE
- MUST NOT WRAP THE CODE WITH markdown
- MUST ONLY import { create } from 'zustand'
- MUST NOT common.js style require or module.export


${await getFileOutputFormatting()}


                `,
    });

    // console.log("chatblocks", chatblocks);

    let response = streamText({
        // schema: z
        //     .array(
        //         z
        //             .object({
        //                 path: z.string().describe("file path"),
        //                 code: z.string().describe("code"),
        //             })
        //             .describe("file chatblocks"),
        //     )
        //     .describe("list of files and its content"),
        // schemaName: "file outputs",
        // schemaDescription: "a list of files to be written to file system",
        // toolChoice: "required",
        // tools: {
        //     ...IOTooling,
        // },

        messages: [
            //             {
            //                 role: "system",
            //                 content: `
            // You are a developer you are good at writing json.
            //                 `,
            //             },
            //

            ...getModelMessagesFromUIMessages(),
            ...chatblocks,

            //
        ],
        model,
    });

    // let lastFile = "";
    let parseText = async (text) => {
        try {
            const blocks = parseCodeBlocksGen3(`${text}`);
            // console.log("Parsed blocks:", JSON.stringify(blocks, null, 2));

            for (let block of blocks) {
                if (block.action === "create-file") {
                    await writeFileContent({
                        summary: `${block.summary}`,
                        path: `${block.fileName}`,
                        content: block.code,
                    });
                    await saveToBrowserDB();
                } else if (block.action === "update-file") {
                    await writeFileContent({
                        summary: `${block.summary}`,
                        path: `${block.fileName}`,
                        content: block.code,
                    });
                    await saveToBrowserDB();
                } else if (block.action === "remove-file") {
                    await removeFile({
                        path: `${block.fileName}`,
                    });
                } else {
                }
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error(`Parse error: ${e.message}`);
            } else {
                console.error(e);
            }
        }
    };

    let ticker = makeTicker({
        engineSettingData: slot,
        displayName: displayName,
    });

    let text = "";
    for await (let part of response.textStream) {
        text += part;
        // console.log(text);

        parseText(text);

        //
        ticker.tick(text);
        //
    }
    parseText(text);

    await saveToBrowserDB();
    saveToCloud();
    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: slot });
}
