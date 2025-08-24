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
import { makeTicker } from "../_core/makeTicker";
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";
import { v4 } from "uuid";

export const name = "handleMongoose";
export const displayName = "Mongoose DB ORM";

export async function handleMongoose({
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

- Identify mongoose models for backend and implement it in "defineMongooseModels", use only javascript ".js" files:
- DO NOT WRAP THE CODE WITH markdown
- ONLY WRITE PURE CODE FOR
- Dont import anything

- please write the backend trpc procedures in this file: "/models/defineMongooseModels.js"

- MUST INCLUDE this "defineMongooseModels" typescript function:
- for eaxmple the Example Schema and Models
- Dont change "getAllModesl"
- DONT EXPORT "defineMongooseModels"
- NEVER common.js style require or module.export

function defineMongooseModels({ dbInstance, Schema, mongoose }) {
    const db = dbInstance

    // Dont include example here
    //    const Example = new Schema({
    //         ...
    //    })
    //. if (!db.models['Example']) { db.model("Example", Example); }

    // add more schemas and models ..

    return {
        // ["Example"]: db.model("Example"),
        ... // add more models
    };
}

- Only Implement "defineMongooseModels" function
- DO NOT write any other function or file

# instruction
update suitable code files to meet the latest requirements

${await getFileOutputFormatting()}

                `,
    });
    // mongoose.connection.useDb("app_development_appID", { useCache: true });

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

    let ticker = makeTicker({
        engineSettingData: slot,
        displayName: displayName,
    });

    let text = "";
    for await (let part of response.textStream) {
        text += part;
        // console.log(text);

        await parseText(text);

        ticker.tick(text);
    }
    await parseText(text);

    await saveToBrowserDB();
    saveToCloud();
    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: slot });
}

//
