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

    let ticker = makeTicker({
        engineSettingData: engineSettingData,
        displayName: displayName,
    });

    let response = streamText({
        system: `
    You are a technical startup founder with senior fullsack web development skill. You help user plan and develop the app.

    think about these things:
    what are the pages of the app? 
    / - home page
    /about - about the app page
    /login - login page
    /register - register page
    /app - app's page

    how to use the app?
    - interactions?
    
    what data are essential to the app?
    - DB collections?
    
    - you use these tech stack:

    ## NPM Libraries
    - react.js
    - @react-three/fiber for 3d app
    - @react-three/drei for 3d components
    - zustand for state management for React.js
    - react.js uses zustand stores
    - axios / fetch in es6
    - @trpc/client
    - @trpc/server
    - wouter for front end multiple page routing
    - javascript

    - MUST NOT use other library / framework / npm
    - MUST NOT use common.js style require or module.export

    ## Folders:
    - react.js UI Components are located at: "/components/*.tsx"
    - zustand.js stores are located at: "/store/*.ts"

            `,
        model: model,
        messages: [
            //
            ...getModelMessagesFromUIMessages(),
        ],
    });

    let text = "";
    for await (let part of response.textStream) {
        text += part;
        // console.log(text);

        ticker.tick(text);
    }

    console.log("text", text);

    await writeFileContent({ path: `/docs/requirements.md`, content: text });
    await saveToBrowserDB();
    saveToCloud();

    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: engineSettingData });

    //
}
