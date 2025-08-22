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
// import { SPEC_DOC_PATH } from "../../constants";
// import { EngineSetting, useAI } from "../../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { saveToBrowserDB } from "../../../io/saveToBrowserDB";
import { putBackFreeAIAsync } from "../../putBackFreeAIAsync";
import { getFreeAIAsync } from "../../getFreeAIAsync";
import { MyTask, MyTaskManager } from "../_core/MyTaskManager";
import { putUIMessage } from "../../putUIMessage";
import { v4 } from "uuid";

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

    await putUIMessage({
        id: v4(),
        role: "user",
        parts: [
            {
                id: v4(),
                type: "text",
                text: userPrompt,
            },
        ],
    });

    MyTaskManager.add({
        waitFor: [task.name],
        name: "handleAppSpec",
        args: { userPrompt: userPrompt },
    });

    // parallels
    MyTaskManager.add({
        waitFor: ["handleAppSpec"],
        name: "handleZustand",
        args: { userPrompt: userPrompt },
    });

    // parallels
    MyTaskManager.add({
        waitFor: ["handleAppSpec", "handleZustand"],
        name: "handleReactAppRoot",
        args: { userPrompt: userPrompt },
    });

    await MyTaskManager.doneTask(task.name);

    await saveToBrowserDB();

    await putBackFreeAIAsync({ engine: slot });
}
