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
import { LokLokSDK } from "../../../web/LokLokSDK";

export const name = "handleDeploy";
export const displayName = "Deploy Application";
export async function handleDeploy({
    userPrompt,
    task,
}: {
    userPrompt?: string;
    task: MyTask;
}) {
    let { model, engineSettingData } = await getFreeAIAsync();

    let sdk = new LokLokSDK({
        appID: useAI.getState().appID,
    });

    await sdk.setupPlatform({
        procedure: "reset",
        input: {
            empty: 123,
        },
    });

    let i = 0;
    let files = useAI.getState().files;
    for (let file of files) {
        await sdk.setupPlatform({
            procedure: "setKV",
            input: {
                path: file.path,
                content: file.content || "",
                summary: file.summary || "",
            },
        });

        engineSettingData.bannerText = `Uploading ${((i / files.length) * 100).toFixed(0)}%`;
        refreshEngineSlot(engineSettingData);
        i++;
    }

    useAI.setState({
        topTab: "web",
        engines: useAI.getState().engines.map((en) => {
            return { ...en, status: "free" };
        }),
    });
    //

    await saveToBrowserDB();

    engineSettingData.bannerText = ``;
    refreshEngineSlot(engineSettingData);

    console.log("userPrompt", userPrompt);

    await MyTaskManager.doneTask(task.name);
    await putBackFreeAIAsync({ engine: engineSettingData });
}
