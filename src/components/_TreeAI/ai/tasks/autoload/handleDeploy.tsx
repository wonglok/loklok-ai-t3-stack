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
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";
import { putUIMessage } from "../../putUIMessage";
import { v4 } from "uuid";
import { LMStudioClient } from "@lmstudio/sdk";
import { makeTicker } from "../_core/makeTicker";

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

    let ticker = makeTicker({ displayName, engineSettingData });
    let sdk = new LokLokSDK({
        appID: useAI.getState().appID,
    });

    let uiMsg = {
        id: `${v4()}`,
        role: "assistant",
        parts: [
            {
                type: "data-deployed",
                data: `Deployed`, // text
                text: ``,
            },
        ],
    };

    let i = 0;
    let files = useAI.getState().files;
    for (let file of files) {
        //

        await sdk.setupPlatform({
            procedure: "setFS",
            input: {
                path: file.path,
                content: file.content || "",
                summary: file.summary || "",
            },
        });

        uiMsg.parts[0].type = "text";
        uiMsg.parts[0].text = `Uploading ${((i / files.length) * 100).toFixed(0)}%`;

        putUIMessage(uiMsg as UIMessage);
        engineSettingData.bannerText = `Uploading ${((i / files.length) * 100).toFixed(0)}%`;
        refreshEngineSlot(engineSettingData);
        ticker.tick(`Uploading ${((i / files.length) * 100).toFixed(0)}%`);
        i++;
    }

    useAI.setState({
        topTab: "web",
        engines: useAI.getState().engines.map((en) => {
            return { ...en, status: "free" };
        }),
    });

    uiMsg.parts[0].type = "data-deployed";
    putUIMessage(uiMsg as UIMessage);

    useAI.setState({
        refreshID: `_${v4()}`,
    });

    await saveToBrowserDB();
    await saveToCloud();

    engineSettingData.bannerText = ``;
    refreshEngineSlot(engineSettingData);

    await MyTaskManager.doneTask(task.name);
    await putBackFreeAIAsync({ engine: engineSettingData });
    MyTaskManager.taskList = [];

    useAI.setState({
        refreshID: `_${v4()}`,
    });

    ticker.remove();

    try {
        const client = new LMStudioClient();
        let loadedEngines = await client.llm.listLoaded();
        for (let engine of loadedEngines) {
            await engine.unload();
        }
    } catch (e) {
        console.log(e);
    } finally {
    }
}
