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
import { APP_ROOT_PATH, SPEC_DOC_PATH } from "../../constants";
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
// import { removeFile } from "../../../io/removeFile";
// import { parseCodeBlocksGen3 } from "../_core/LokLokParser3";
import { refreshEngineSlot } from "../../refreshEngines";

export const name = "handleAppSpec";
export const displayName = "Application Specification";
export async function handleAppSpec({
    userPrompt,
    task,
}: {
    userPrompt?: string;
    task: MyTask;
}) {
    let { model, engineSettingData } = await getFreeAIAsync();

    //     let chatblocks = [
    //         //
    //         //
    //         //
    //         ...getModelMessagesFromUIMessages(),
    //     ];

    //     let files = useAI.getState().files;
    //     if (files?.length > 0) {
    //         chatblocks.push({
    //             role: "assistant",
    //             content: `Here's the "file system of existing code": `,
    //         });

    //         files.forEach((ff) => {
    //             chatblocks.push({
    //                 role: "assistant",
    //                 content: `
    // [file: "${ff.path}"][begin]
    //     [file: "${ff.path}"][summary_start]
    // ${ff.summary}
    //     [file: "${ff.path}"][summary_end]
    //     [file: "${ff.path}"][content_start]
    // ${ff.content}
    //     [file: "${ff.path}"][content_end]
    // [file: "${ff.path}"][end]`,
    //             });
    //         });
    //     }

    //     chatblocks.push({
    //         role: `user`,

    //         content: `
    // User Requirements Collected:
    // "${userPrompt}"

    // Please describe the front end and backend requirements?

    // - frontend: reactjs, tailwindcss, trpc
    // - backend: trpc, mongoose

    // `,
    //     });

    //     //     chatblocks.push({
    //     //         role: "user",
    //     //         content: `
    //     // ## Output:

    //     // - if you want to create file
    //     // [mydearlokloktag action="create-file" file="{file_path_name}" summary="{file_summary}"]
    //     // {file_content}
    //     // [/mydearlokloktag]

    //     // - if you want to remove file
    //     // [mydearlokloktag action="remove-file" file="{file_path_name}" summary="{file_summary}"][/mydearlokloktag]

    //     // - if you want to update file
    //     // [mydearlokloktag action="update-file" file="{file_path_name}" summary="{file_summary}"]
    //     // {file_content}
    //     // [/mydearlokloktag]

    //     // - {file_path_name} is the file's path name
    //     // - {file_summary} is the file's overview, purpose and summary of the content
    //     // - {file_content} is the file's content

    //     // - if there is an existing file, then you can use [mydearlokloktag action="update-file" ...]
    //     // - if there is no existing file, then you can [mydearlokloktag action="create-file" ...]
    //     // - if you need to remove existing file, then you can [mydearlokloktag action="remove-file" ...]
    //     //         `,
    //     //     });

    //     let resp = await streamText({
    //         model: model,
    //         messages: [
    //             //
    //             ...chatblocks,
    //         ],
    //     });

    //     let txt = "";

    //     useAI.setState({
    //         topTab: "code",
    //         currentPath: `${SPEC_DOC_PATH}`,
    //     });

    //     for await (let part of resp.textStream) {
    //         txt += part;

    //         console.log(txt);
    //         engineSettingData.bannerText = `Working: ${task.name}`;
    //         refreshEngineSlot(engineSettingData);

    //         await writeFileContent({
    //             path: SPEC_DOC_PATH,
    //             content: txt,
    //         });
    //     }

    //     await writeFileContent({
    //         path: SPEC_DOC_PATH,
    //         content: txt,
    //     });

    await saveToBrowserDB();

    engineSettingData.bannerText = ``;
    refreshEngineSlot(engineSettingData);

    console.log("userPrompt", userPrompt);

    await MyTaskManager.doneTask(task.name);
    await putBackFreeAIAsync({ engine: engineSettingData });
}
