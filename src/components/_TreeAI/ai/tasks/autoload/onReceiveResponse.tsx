// import {
//     convertToModelMessages,
//     createUIMessageStream,
//     generateText,
//     ModelMessage,
//     tool,
//     UIMessage,
// } from "ai";
// import { addUIMessage } from "../../addUIMessage";
// import { getUIMessages } from "../../getUIMessages";
// import z from "zod";
// import { IOTooling } from "../../../io/IOTooling";
// import {  } from "../../constants";
// import { EngineSetting, useAI } from "../../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
// import { saveToBrowserDB } from "../../../io/saveToBrowserDB";
import { putBackFreeAIAsync } from "../../putBackFreeAIAsync";
import { getFreeAIAsync } from "../../getFreeAIAsync";
import { MyTask, MyTaskManager } from "../_core/MyTaskManager";
// import md5 from "md5";
// import { useAI } from "../../../state/useAI";
// import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";
// import { generateObject } from "ai";
// import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
// import z from "zod";
// import { listOutFilesToChatBlocks } from "../prompts/listOutFilesToChatBlocks";
// import { putUIMessage } from "../../putUIMessage";
// import { v4 } from "uuid";

// import { readFileContent } from "../../io/readFileContent";

export const name = "onReceiveResponse";
export const displayName = "Let us begin to work!";

export async function onReceiveResponse({
    userPrompt,
    task,
}: {
    userPrompt: string;
    task: MyTask;
}) {
    let { model, engineSettingData: slot } = await getFreeAIAsync();

    console.log(task.name, userPrompt, task);

    MyTaskManager.add({
        waitFor: [task.name],
        name: "handleAppSpec",
        args: { userPrompt: userPrompt },
    });

    await MyTaskManager.add({
        name: "handleMongoose",
        waitFor: ["handleAppSpec"],
        args: { userPrompt: userPrompt },
    });

    await MyTaskManager.add({
        name: "handleBackendTRPC",
        waitFor: ["handleMongoose"],
        args: { userPrompt: userPrompt },
    });

    await MyTaskManager.add({
        name: "handleZustand",
        waitFor: ["handleBackendTRPC"],
        args: { userPrompt: userPrompt },
    });

    await MyTaskManager.add({
        name: "handleReact",
        waitFor: ["handleZustand"],
        args: { userPrompt: userPrompt },
    });

    MyTaskManager.add({
        waitFor: [
            "handleReact",
            "handleZustand",
            "handleBackendTRPC",
            "handleMongoose",
        ],
        name: "handleDeploy",
        args: {},
    });

    await MyTaskManager.doneTask(task.name);
    await putBackFreeAIAsync({ engine: slot });
}
