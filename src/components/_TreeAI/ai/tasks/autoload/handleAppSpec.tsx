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
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";
import { getAppOverviewPrompt } from "../prompts/getAppOverviewPrompt";
import { getFileOutputFormatting } from "../prompts/getFileOutputFormatting";

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
    saveToCloud();

    engineSettingData.bannerText = ``;
    refreshEngineSlot(engineSettingData);

    let ticker = makeTicker({
        engineSettingData: engineSettingData,
        displayName: displayName,
    });

    let response = streamText({
        system: `
${await getAppOverviewPrompt()}
    `,
        model: model,
        messages: [
            //
            ...getModelMessagesFromUIMessages(),
            {
                role: "user",
                content: `
## AI Insturction
User will tell you what they want to build

## Here's what the user want to build:
${userPrompt}

## Output Format
1. Public Users and Private Users (text description, no code)
2. Public Pages and Protected Pages(text description, no code)
3. Interactive actions in Each Page (text description, no code)
4. Routing (text description, no code)
5. Zustand State (text description, no code)
6. TRPC APIs (text description, no code)
7. UI Components (text description, no code)

                `,
            },
        ],
    });

    let text = "";
    for await (let part of response.textStream) {
        text += part;
        console.log(text);
        ticker.tick(text);

        await writeFileContent({
            path: `/docs/requirements.md`,
            content: text,
        });
    }

    console.log("text", text);

    await writeFileContent({ path: `/docs/requirements.md`, content: text });
    await saveToBrowserDB();
    await saveToCloud();

    console.log("userPrompt", userPrompt);
    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: engineSettingData });

    //
}
