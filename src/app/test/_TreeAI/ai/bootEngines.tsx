import { toast } from "sonner";
import { EngineMap } from "../state/EngineMap";
import { useTreeAI } from "../state/useTreeAI";
import { buildEngineModel } from "./buildEngineModel";

//  getLMStudioModel({ name: "openai/gpt-oss-20b" })

export const bootEngines = async () => {
    // //
    // let currentAIProvider = useTreeAI.getState().currentAIProvider;
    // if (currentAIProvider === "lmstudio") {
    //     getLMStudioModel({ name: "openai/gpt-oss-20b" });
    // }
    //

    let engines = useTreeAI.getState().engines || [];

    for (let engine of engines) {
        if (!EngineMap.has(`${engine.name}${engine.modelName}`)) {
            let engineInstance = await buildEngineModel({ info: engine });

            EngineMap.set(`${engine.name}${engine.modelName}`, engineInstance);

            engine.status = "free";

            //
        }
    }

    toast(`AI Developer Team Loaded`, {
        description: <>{`Total: ${engines.length} AI Engineers`}</>,
    });
};
