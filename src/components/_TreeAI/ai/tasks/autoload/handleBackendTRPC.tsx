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
import { IOTooling } from "../../../io/IOTooling";
import { EngineSetting, useAI } from "../../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { putBackFreeAIAsync } from "../../putBackFreeAIAsync";
import { getFreeAIAsync } from "../../getFreeAIAsync";
import { MyTask, MyTaskManager } from "../_core/MyTaskManager";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
import { readFileContent } from "../../../io/readFileContent";
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
// import { LokLokSDK } from "../../../web/LokLokSDK";
// import { refreshEngineSlot } from "../../refreshEngines";
import { makeTicker } from "../_core/makeTicker";

export const name = "handleBackendTRPC";
export const displayName = "TRPC Backend";

export async function handleBackendTRPC({
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
        role: "system",
        content: `${await getAppOverviewPrompt()}`,
    });

    await listOutFilesToChatBlocks({ files, chatblocks });

    chatblocks.push({
        role: "user",
        content: `
Instructions:

- Identify trpc procedures for backend and implement them, use only javascript ".js" files:
- DO NOT WRAP THE CODE WITH markdown
- ONLY WRITE PURE CODE FOR

- The app has a Global variable window.trpcSDK as a custom tRPC Frontend Client.
- Dont import anything

window.trpcSDK
    .runTRPC({
        procedure: "hello", // [hello] is the procedure name
        input: { text: "sure been good" },// [input] is the input paramter
    })
    .then((result) => {
        console.log(result); // result is obtained via async functuin call
    });

- MUST write all the backend trpc procedures in this file: "/trpc/defineBackendProcedures.js"

- There are 2 global varaibles: "protectedProcedure" and "publicProcedure" for private and public access for appRouter

- DO NOT EXPORT "defineBackendProcedures"

- DO NOT CHANGE "defineBackendProcedures" function input arguments

- MUST use Mongoose Models in the "models" argument in the "defineBackendProcedures" function.

- DO NOT USE In-memory mock store 

- DO NOT IMPORT ANYTHING

- ALWAYS USE .mutation({...})
- NEVER USE .query({...})

- Prefer Mongoose naming "_id" instead of "id"
- ALWAYS USE "_id" instead of "id" 
- Example: USE "{ _id, ...updates }" instead of { id, ...updates } 

- DO NOT write: "export function defineBackendProcedures () {}" // bad
- ALWAYS write: "function defineBackendProcedures () {}" // good

function defineBackendProcedures({ models, otherProcedures, publicProcedure, protectedProcedure }) {
    const { User, ... /* more models are here ... */ } = models;

    return {
        ...otherProcedures,

        hello: publicProcedure
            .input(z.object({ text: z.string() }))
            .mutation(({ input }) => {
                return {
                    greeting: input.text,
                };
            }),

        create: protectedProcedure
            .input(z.object({ name: z.string().min(1) }))
            .mutation(async ({ input }) => {
                let post = { id: post.id + 1, name: input.name };
                return post;
            }),

        getLatest: protectedProcedure.mutation(() => {
            return post;
        }),

        getSecretMessage: protectedProcedure.mutation(() => {
            return "you can now see this secret message!";
        }),

        // ... develop more code here
    }
}

${await getFileOutputFormatting()}

                `,
    });

    console.log("chatblocks", chatblocks);

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
            //
            ...getModelMessagesFromUIMessages(),
            //
            ...chatblocks,

            //
        ],
        model,
    });

    //

    // let lastFile = "";
    let parseText = async (text) => {
        try {
            const blocks = parseCodeBlocksGen3(`${text}`);
            console.log("Parsed blocks:", JSON.stringify(blocks, null, 2));

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

    let text = "";

    let ticker = makeTicker({
        engineSettingData: slot,
        displayName: displayName,
    });

    for await (let part of response.textStream) {
        text += part;
        console.log(text);

        parseText(text);
        ticker.tick();

        //
    }
    parseText(text);

    await saveToBrowserDB();

    await MyTaskManager.doneTask(task.name);

    //  platform

    await putBackFreeAIAsync({ engine: slot });
}
