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
import { listOutFilesToChatBlocks } from "../prompts/listOutFilesToChatBlocks";
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
    let chats = [];

    //
    let files = useAI.getState().files;
    await listOutFilesToChatBlocks({ files, chatblocks: chats });
    //

    let { object: needsUpdate } = await generateObject({
        messages: [...getModelMessagesFromUIMessages(), ...chats],
        model,
        schema: z.object({
            mongoose: z.boolean().describe("update mongoose?"),
            trpc: z.boolean().describe("update trpc code?"),
            zustand: z.boolean().describe("update zustand?"),
            reactjs: z.boolean().describe("update reactjs?"),
        }),
        schemaDescription: `think about wheter we need to edit / update these category of code`,
    });

    if (needsUpdate.mongoose) {
        needsUpdate.mongoose = true;
    }

    if (needsUpdate.trpc) {
        needsUpdate.mongoose = true;
    }

    if (needsUpdate.zustand) {
        needsUpdate.trpc = true;
        needsUpdate.mongoose = true;
    }

    if (needsUpdate.reactjs) {
        needsUpdate.zustand = true;
        needsUpdate.trpc = true;
        needsUpdate.mongoose = true;
    }

    console.log("needs to work on", needsUpdate);
    console.log("needs to work on", needsUpdate);
    console.log("needs to work on", needsUpdate);
    console.log("needs to work on", needsUpdate);

    let waitFor = [];
    if (needsUpdate.mongoose) {
        waitFor.push("handleMongoose");
        await MyTaskManager.add({
            name: "handleMongoose",
            waitFor: ["handleAppSpec"],
            args: { userPrompt: userPrompt },
        });
    }

    if (needsUpdate.trpc) {
        waitFor.push("handleBackendTRPC");
        await MyTaskManager.add({
            name: "handleBackendTRPC",
            waitFor: ["handleMongoose"],
            args: { userPrompt: userPrompt },
        });
    }
    if (needsUpdate.zustand) {
        waitFor.push("handleZustand");
        await MyTaskManager.add({
            name: "handleZustand",
            waitFor: ["handleBackendTRPC"],
            args: { userPrompt: userPrompt },
        });
    }

    if (needsUpdate.zustand) {
        waitFor.push("handleReact");
        await MyTaskManager.add({
            name: "handleReact",
            waitFor: ["handleZustand"],
            args: { userPrompt: userPrompt },
        });
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
