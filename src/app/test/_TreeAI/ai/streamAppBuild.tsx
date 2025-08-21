// import {
//     convertToModelMessages,
//     streamText,
//     tool,
//     createUIMessageStream,
//     UIMessage,
// } from "ai";
// import { z } from "zod";
// import { useAI } from "../state/useAI";
// import { getUIMessages } from "./getUIMessages";
import { generateText } from "ai";
import { bootEngines } from "./bootEngines";
// import { getFreeAIAsync } from "./getFreeAIAsync";
// import { addUIMessage } from "./addUIMessage";
// import { refreshUIMessages } from "./refreshUIMessages";
// import { SPEC_DOC_PATH } from "./constants";
// import { refreshEngineSlot } from "./refreshEngines";
// import { IOTooling } from "../io/IOTooling";
// import { writeFileContent } from "../io/writeFileContent";
// import { putBackFreeAIAsync } from "./putBackFreeAIAsync";
// import { saveToBrowserDB } from "../io/saveToBrowserDB";
// import { readFileContent } from "../io/readFileContent";
// import { removeUIMessages } from "./removeUIMessages";
// import { defineApp } from "./tasks/defineApp";
import { MyTaskManager } from "./tasks/_core/MyTaskManager";
import { useAI } from "../state/useAI";
import { getModelMessagesFromUIMessages } from "./getModelMessagesFromUIMessages";

export const streamAppBuild = async () => {};
