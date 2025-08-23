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
    saveToCloud();

    engineSettingData.bannerText = ``;
    refreshEngineSlot(engineSettingData);

    let ticker = makeTicker({
        engineSettingData: engineSettingData,
        displayName: displayName,
    });

    let response = streamText({
        system: `

You are a developer with product manager experience who helps user to elaborate user requirements.

- ReactJS App:
    - title of the app
    
    - description: purpose of the app and elaborate more on the features and add missing features.

    - use cases:
        - user
        - usage:
            - [example1]
            - [example2]
            - [example3]
            - ...

    - mongodb database tables:
        - table name
        - table description
        - data fields:
            - field name 
            - data type (compatible with mongoose)
            - descrition

    - components: 
        1. component slug
        2. component description and prupose
        3. backend procedures:
            - each backend procedure:
                1. procedure slug
                2. procedure description
                3. paramters
                    - name
                    - dataType (either string or number)

    - pages: 
        1. page title
        2. page route with params
        3. page params in page route
        4. components used in that page: 
            - component slug


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
        console.log(text);

        ticker.tick(text);
    }

    console.log("text", text);

    await writeFileContent({ path: `/docs/requirements.md`, content: text });

    console.log("userPrompt", userPrompt);
    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: engineSettingData });

    //
}
