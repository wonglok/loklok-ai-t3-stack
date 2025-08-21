import {
    convertToModelMessages,
    createUIMessageStream,
    generateText,
    streamText,
    tool,
    UIMessage,
} from "ai";
import { addUIMessage } from "../addUIMessage";
import { getUIMessages } from "../getUIMessages";
import z from "zod";
import { IOTooling } from "../../io/IOTooling";
import { SPEC_DOC_PATH } from "../constants";
import { EngineSetting, useAI } from "../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { saveToBrowserDB } from "../../io/saveToBrowserDB";
import { putBackFreeAIAsync } from "../putBackFreeAIAsync";
import { getFreeAIAsync } from "../getFreeAIAsync";
import { refreshEngineSlot } from "../refreshEngines";
import { MyTask, MyTaskManager } from "../MyTaskManager";
import { getModelMessagesFromUIMessages } from "../getModelMessagesFromUIMessages";
import md5 from "md5";
import { putUIMessage } from "../putUIMessage";
import { v4 } from "uuid";

export async function receiveResponse({
    args,
    task,
}: {
    args: { userPrompt: string };
    task: MyTask;
}) {
    let userPrompt = useAI.getState().userPrompt;

    useAI.setState({
        userPrompt: "",
    });

    let replyMessage = {
        id: `_${md5(`${Math.random()}`)}`,
        role: "user",
        parts: [
            {
                type: "text",
                text: `${args.userPrompt}`,
            },
        ],
    };

    putUIMessage(replyMessage as UIMessage);

    let { model, slot } = await getFreeAIAsync();

    await generateText({
        toolChoice: "required",
        messages: [
            {
                role: `system`,
                content: `You are a polite senior developer.`,
            },
            {
                role: `assistant`,
                content: `
                we havent had existing proejct.
                we need to start a new software project.
                `,
            },
            ...getModelMessagesFromUIMessages(),
        ],
        system: `You help user start a new software project, or update feature`,
        tools: {
            startNewProject: tool({
                description: "start a new software project",
                execute: async ({ userRequirement }) => {
                    //

                    console.log("userRequirement", userRequirement);

                    MyTaskManager.add({
                        name: "defineApp",
                        deps: [],
                        args: { userPrompt: userRequirement },
                    });

                    return `${userRequirement}`;
                },
                inputSchema: z.object({ userRequirement: z.string() }),
                outputSchema: z.string(),
            }),
        },
        model: model,
    });

    await saveToBrowserDB();

    slot.bannerText = ``;
    refreshEngineSlot(slot);

    await putBackFreeAIAsync({ engine: slot });
}
