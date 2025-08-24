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
import { writeFileContent } from "@/components/_TreeAI/io/writeFileContent";
import { makeTicker } from "../_core/makeTicker";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";

export const name = "handleAppSpec";
export const displayName = "Features";
export async function handleAppSpec({
    userPrompt,
    task,
}: {
    userPrompt?: string;
    task: MyTask;
}) {
    let { model, engineSettingData } = await getFreeAIAsync();

    await saveToBrowserDB();

    engineSettingData.bannerText = ``;
    refreshEngineSlot(engineSettingData);

    //     let ticker = makeTicker({
    //         engineSettingData: engineSettingData,
    //         displayName: displayName,
    //     });

    //     let response = streamText({
    //         system: `

    // You are a senior developer who has product management skills. You help user analyse the tech sepc.

    //     # Output format:

    //     ## mongoose collections
    //     [mongoose name, desc]

    //     ## trpcProcedures
    //     [prcedure name, desc]

    //     ## trpcProcedures
    //     [prcedure name, desc]

    //     ## zustand
    //     [zustand state props name, desc]
    //     [zustand api method call name, desc]

    //     ## react js ui components
    //     [ui components names, desc]

    //         `,
    //         model: model,
    //         messages: [
    //             //
    //             ...getModelMessagesFromUIMessages(),
    //         ],
    //     });

    //     let text = "";
    //     for await (let part of response.textStream) {
    //         text += part;
    //         console.log(text);

    //         ticker.tick(text);
    //     }

    //     console.log("text", text);

    //     await writeFileContent({ path: `/docs/requirements.md`, content: text });

    //     ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: engineSettingData });

    //
}
