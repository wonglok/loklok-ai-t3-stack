import { toast } from "sonner";
import { EngineMap } from "../state/EngineMap";
import { useTreeAI } from "../state/useTreeAI";
import { buildEngineModel } from "./buildEngineModel";
import { LMStudioClient } from "@lmstudio/sdk";

//  getLMStudioModel({ name: "openai/gpt-oss-20b" })

export const bootEngines = async () => {
    // //
    // let currentAIProvider = useTreeAI.getState().currentAIProvider;
    // if (currentAIProvider === "lmstudio") {
    //     getLMStudioModel({ name: "openai/gpt-oss-20b" });
    // }
    //

    const client = new LMStudioClient();

    let engines = useTreeAI.getState().engines || [];

    for (let engine of engines) {
        if (
            !EngineMap.has(`${engine.name}${engine.modelName}`) &&
            engine.enabled
        ) {
            try {
                await client?.llm
                    .load(engine.modelOriginalName, {
                        identifier: engine.modelName,
                        onProgress: (ev) => {
                            console.log(ev);
                        },
                        config: {
                            contextLength: 131070,
                        },
                    })
                    .catch((e) => {
                        console.log(e);
                    });
            } catch (e) {
                console.log(e);
            }

            let engineInstance = await buildEngineModel({ info: engine });

            EngineMap.set(`${engine.name}${engine.modelName}`, engineInstance);

            engine.status = "free";
        }
    }

    toast(`AI Developer Team Loaded`, {
        description: (
            <>{`Total: ${engines.filter((r) => r.enabled).length} AI Engineers`}</>
        ),
    });
};
