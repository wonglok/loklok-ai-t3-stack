// import {
//     convertToModelMessages,
//     createUIMessageStream,
//     generateText,
//     ModelMessage,
//     streamText,
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
import { saveToBrowserDB } from "../../../io/saveToBrowserDB";
import { putBackFreeAIAsync } from "../../putBackFreeAIAsync";
import { getFreeAIAsync } from "../../getFreeAIAsync";
import { MyTask, MyTaskManager } from "../_core/MyTaskManager";
import md5 from "md5";
import { useAI } from "../../../state/useAI";
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";
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

    console.log("onReceiveResponse", userPrompt, task);

    MyTaskManager.add({
        waitFor: [task.name],
        name: "handleAppSpec",
        args: { userPrompt: userPrompt },
    });

    MyTaskManager.add({
        name: "handleMongoose",
        waitFor: ["handleAppSpec"],
        args: { userPrompt: userPrompt },
    });

    MyTaskManager.add({
        name: "handleBackendTRPC",
        waitFor: ["handleAppSpec"],
        args: { userPrompt: userPrompt },
    });

    MyTaskManager.add({
        name: "handleZustand",
        waitFor: ["handleAppSpec"],
        args: { userPrompt: userPrompt },
    });

    MyTaskManager.add({
        name: "handleReact",
        waitFor: ["handleAppSpec"],
        args: { userPrompt: userPrompt },
    });

    MyTaskManager.add({
        waitFor: [
            "handleMongoose",
            "handleBackendTRPC",
            "handleZustand",
            "handleReact",
            "handleTesting",
        ],
        name: "handleDeploy",
        args: {
            hash: `${md5(JSON.stringify(useAI.getState().files))}`,
        },
    });

    await MyTaskManager.doneTask(task.name);

    await saveToBrowserDB();
    saveToCloud();

    await putBackFreeAIAsync({ engine: slot });
}
