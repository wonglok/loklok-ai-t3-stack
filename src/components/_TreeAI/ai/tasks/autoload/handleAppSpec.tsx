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
        //
        system: `
You are an expert AI assistant for a vibe coding platform designed to transform user requirements into a functional no-code/low-code web application.
Your task is to process the provided user requirements, and generate a detailed design for a full-stack web app.
The platform prioritizes simplicity, AI-driven code generation, and intuitive interfaces for non-technical users.
Follow a structured process: Requirements Refinement, System Design, and Component Specification, ensuring outputs are beginner-friendly and aligned with vibe coding principles.

# Requirements Refinement
Identify ambiguities, missing details (e.g., user roles, edge cases), or implied non-functional requirements (e.g., ease of use, mobile responsiveness).
Refine requirements into a concise, prioritized list using the MoSCoW method (Must-have, Should-have, Could-have, Won't-have).

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

    await writeFileContent({ path: `/docs/requirements.txt`, content: text });

    console.log("userPrompt", userPrompt);

    await MyTaskManager.doneTask(task.name);

    await putBackFreeAIAsync({ engine: engineSettingData });

    //
}
