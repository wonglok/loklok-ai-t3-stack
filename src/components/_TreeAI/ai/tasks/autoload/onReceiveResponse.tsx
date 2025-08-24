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
import { generateObject } from "ai";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
import z from "zod";
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

    let { object: needsUpdate } = await generateObject({
        messages: [...getModelMessagesFromUIMessages()],
        model,
        schema: z.object({
            mongoose: z.boolean().describe("do we need to update mongoose?"),
            trpc: z.boolean().describe("do we need to update trpc code?"),
            zustand: z.boolean().describe("do we need to update zustand?"),
            reactjs: z.boolean().describe("do we need to update reactjs?"),
        }),
        schemaDescription: `think about wheter we should edit / update these category of content`,
    });

    console.log("response", needsUpdate);
    // [
    //     "handleMongoose",
    //     "handleBackendTRPC",
    //     "handleZustand",
    //     "handleReact",
    //     "handleTesting",
    // ]
    let waitFor = [];
    if (needsUpdate.mongoose) {
        await MyTaskManager.add({
            name: "handleMongoose",
            waitFor: ["handleAppSpec"],
            args: { userPrompt: userPrompt },
        });
        waitFor.push("handleMongoose");
    }

    if (needsUpdate.trpc) {
        await MyTaskManager.add({
            name: "handleBackendTRPC",
            waitFor: ["handleMongoose"],
            args: { userPrompt: userPrompt },
        });
        waitFor.push("handleBackendTRPC");
    }
    if (needsUpdate.zustand) {
        await MyTaskManager.add({
            name: "handleZustand",
            waitFor: ["handleBackendTRPC"],
            args: { userPrompt: userPrompt },
        });
        waitFor.push("handleZustand");
    }

    if (needsUpdate.zustand) {
        await MyTaskManager.add({
            name: "handleReact",
            waitFor: ["handleZustand"],
            args: { userPrompt: userPrompt },
        });
        waitFor.push("handleReact");
    }

    MyTaskManager.add({
        waitFor: waitFor,
        name: "handleDeploy",
        args: {
            hash: `${md5(JSON.stringify(useAI.getState().files))}`,
        },
    });

    await MyTaskManager.doneTask(task.name);
    await putBackFreeAIAsync({ engine: slot });
}
