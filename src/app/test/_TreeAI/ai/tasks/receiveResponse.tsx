import {
    convertToModelMessages,
    createUIMessageStream,
    generateText,
    ModelMessage,
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
import { MyTask, MyTaskManager } from "./_core/MyTaskManager";
import { getModelMessagesFromUIMessages } from "../getModelMessagesFromUIMessages";

import { readFileContent } from "../../io/readFileContent";

export async function receiveResponse({
    userPrompt,
    task,
}: {
    userPrompt: string;
    task: MyTask;
}) {
    let { model, slot } = await getFreeAIAsync();
    let files = useAI.getState().files;

    let info = [];

    let content = await readFileContent({ path: SPEC_DOC_PATH });
    let hasSpec = typeof content === "string" && content.length > 0;

    if (hasSpec) {
        let hasCode: ModelMessage = {
            role: `assistant`,
            content: `
        we had an existing proejct.
        Here are the files:

${files
    .map((f) => {
        return `
--------- <${f.path}> file begin----------
file path "${f.path}"

content: 
${f.content}
--------- <${f.path}> file end----------
        `;
    })
    .join("\n")}

        `,
        };

        info.push(hasCode);
    } else {
        let haventInit: ModelMessage = {
            role: `assistant`,
            content: `
                we havent had existing proejct.
                we need to start a new software project.
            `,
        };
        info.push(haventInit);
    }

    let common = () => {
        MyTaskManager.add({
            name: "createNewApp",
            deps: [],
            args: { userPrompt: userPrompt },
        });

        MyTaskManager.add({
            name: "createrReactApp",
            deps: ["createNewApp"],
            args: { userPrompt: userPrompt },
        });
    };
    // createMongoose
    await generateText({
        toolChoice: "required",
        messages: [
            {
                role: `system`,
                content: `You are a polite senior developer.`,
            },
            ...info,
            ...getModelMessagesFromUIMessages(),
        ],
        system: `Your either create new project or update exsting project`,
        tools: {
            createNewProject: tool({
                description: "create a new software project",
                execute: async ({ userRequirement }) => {
                    //

                    console.log("createNewProject", userRequirement);

                    common();
                    return `ok`;
                },
                inputSchema: z.object({ userRequirement: z.string() }),
                outputSchema: z.string(),
            }),
            updateExistingProject: tool({
                description: "update existing software project",
                execute: async ({ userRequirement }) => {
                    //

                    console.log("updateExistingProject", userRequirement);

                    common();
                    return `ok`;
                },
                inputSchema: z.object({ userRequirement: z.string() }),
                outputSchema: z.string(),
            }),
        },
        model: model,
    });

    await saveToBrowserDB();

    await putBackFreeAIAsync({ engine: slot });
}
