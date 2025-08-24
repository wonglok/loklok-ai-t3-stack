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
import { putBackFreeAIAsync } from "../../putBackFreeAIAsync";
import { getFreeAIAsync } from "../../getFreeAIAsync";
import { MyTask, MyTaskManager } from "../_core/MyTaskManager";
import { saveToBrowserDB } from "../../../io/saveToBrowserDB";
import { refreshEngineSlot } from "../../refreshEngines";
import { writeFileContent } from "@/components/_TreeAI/io/writeFileContent";
import { makeTicker } from "../_core/makeTicker";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";
import { getAppOverviewPrompt } from "../prompts/getAppOverviewPrompt";

export const name = "writeAppSpec";
export const displayName = "App Spec";
export async function writeAppSpec({
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
## Here's what the user want to build:
${userPrompt}

## Output Format
1. Public Users and Private Users (simple and short description, no code)
2. Public Pages and Protected Pages(simple and short description, no code)
3. Interactive actions in Each Page (simple and short description, no code)
4. Routing (simple and short description, no code)
5. Zustand State (simple and short description, no code)
6. TRPC APIs (simple and short description, no code)
7. UI Components (simple and short description, no code)

# Requiremetns:
- make it really sweet and short and concise and accurate

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
