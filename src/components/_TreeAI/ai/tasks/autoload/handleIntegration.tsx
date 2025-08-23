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
// import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
// import { readFileContent } from "../../../io/readFileContent";
// import { writeFileContent } from "../../../io/writeFileContent";
import { saveToBrowserDB } from "../../../io/saveToBrowserDB";
// import z from "zod";
// import { parseCodeBlocks } from "./_core/LokLokParser";
// import { parseCodeBlocksActionType } from "./_core/LokLokParser2";
// import { removeFile } from "../../../io/removeFile";
// import { parseCodeBlocksGen3 } from "../_core/LokLokParser3";
import { refreshEngineSlot } from "../../refreshEngines";
import { getAppOverviewPrompt } from "../prompts/getAppOverviewPrompt";
import { listOutFilesToChatBlocks } from "../prompts/listOutFilesToChatBlocks";
import { getFileOutputFormatting } from "../prompts/getFileOutputFormatting";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
import { parseCodeBlocksGen3 } from "../_core/LokLokParser3";
import { writeFileContent } from "../../../io/writeFileContent";
import { removeFile } from "../../../io/removeFile";
import { makeTicker } from "../_core/makeTicker";

export const name = "handleIntegration";
export const displayName = "Inegration";
export async function handleIntegration({
    userPrompt,
    task,
}: {
    userPrompt?: string;
    task: MyTask;
}) {
    let { model, engineSettingData: slot } = await getFreeAIAsync();
    let files = useAI.getState().files;

    //     let chatblocks = [];
    //     chatblocks.push({
    //         role: "system",
    //         content: `${await getAppOverviewPrompt()}`,
    //     });

    //     await listOutFilesToChatBlocks({ files, chatblocks });

    //     chatblocks.push({
    //         role: "user",
    //         content: `
    // Instructions:

    // - implement missing trpc backend procedure that are needed by the front end zustand tRPC client calls.
    // - make sure all backend procedure and front end procedures are matched.

    // ${await getFileOutputFormatting()}

    // `,
    //     });

    //     console.log("chatblocks", chatblocks);

    //     let response = streamText({
    //         // schema: z
    //         //     .array(
    //         //         z
    //         //             .object({
    //         //                 path: z.string().describe("file path"),
    //         //                 code: z.string().describe("code"),
    //         //             })
    //         //             .describe("file chatblocks"),
    //         //     )
    //         //     .describe("list of files and its content"),
    //         // schemaName: "file outputs",
    //         // schemaDescription: "a list of files to be written to file system",
    //         // toolChoice: "required",
    //         // tools: {
    //         //     ...IOTooling,
    //         // },

    //         messages: [
    //             //
    //             ...getModelMessagesFromUIMessages(),
    //             //
    //             ...chatblocks,

    //             //
    //         ],
    //         model,
    //     });

    //     //

    //     // let lastFile = "";
    //     let parseText = async (text) => {
    //         try {
    //             const blocks = parseCodeBlocksGen3(`${text}`);
    //             console.log("Parsed blocks:", JSON.stringify(blocks, null, 2));

    //             for (let block of blocks) {
    //                 if (block.action === "create-file") {
    //                     await writeFileContent({
    //                         summary: `${block.summary}`,
    //                         path: `${block.fileName}`,
    //                         content: block.code,
    //                     });
    //                     await saveToBrowserDB();
    //                 } else if (block.action === "update-file") {
    //                     await writeFileContent({
    //                         summary: `${block.summary}`,
    //                         path: `${block.fileName}`,
    //                         content: block.code,
    //                     });
    //                     await saveToBrowserDB();
    //                 } else if (block.action === "remove-file") {
    //                     await removeFile({
    //                         path: `${block.fileName}`,
    //                     });
    //                 } else {
    //                 }
    //             }
    //         } catch (e) {
    //             if (e instanceof Error) {
    //                 console.error(`Parse error: ${e.message}`);
    //             } else {
    //                 console.error(e);
    //             }
    //         }
    //     };

    //     let ticker = makeTicker({
    //         engineSettingData: slot,
    //         displayName: displayName,
    //     });

    //     let text = "";
    //     for await (let part of response.textStream) {
    //         text += part;
    //         console.log(text);

    //         parseText(text);

    //         ticker.tick(text);
    //         //
    //     }
    //     parseText(text);

    //     await saveToBrowserDB();

    await MyTaskManager.doneTask(task.name);

    //  platform

    await putBackFreeAIAsync({ engine: slot });
}
