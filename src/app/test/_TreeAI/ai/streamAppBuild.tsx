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
import { MyTaskManager } from "./MyTaskManager";

const MyFuncs = {
    defineApp: (v: any) =>
        import("./tasks/defineApp").then((r) => r.defineApp(v)),
};

export const streamAppBuild = async () => {
    await bootEngines();

    // console.log(slot);

    // let content = await readFileContent({ path: SPEC_DOC_PATH });
    window.addEventListener("work-task", ({ detail }: any) => {
        let { task, engineSetting } = detail;

        // console.log(task, engineSetting);

        MyFuncs[task.name]({ task });
    });

    MyTaskManager.add({
        status: "init",
        name: "defineApp",
        deps: [],
    });

    await MyTaskManager.workAll();
};
