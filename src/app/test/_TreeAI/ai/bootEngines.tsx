import { toast } from "sonner";
import { EngineMap } from "../state/EngineMap";
import { useTreeAI } from "../state/useTreeAI";
import { getEngineModel } from "./getEngineModel";
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
    let loadedEngines = [];
    try {
        loadedEngines = await client.llm.listLoaded();
    } catch (e) {
        console.log(e);
    }

    let engines = useTreeAI.getState().engines || [];

    for (let engine of engines) {
        if (engine.enabled) {
            if (loadedEngines.some((r) => r.identifier === engine.modelName)) {
            } else {
                try {
                    await client?.llm
                        .load(engine.modelOriginalName, {
                            identifier: engine.modelName,
                            onProgress: (ev) => {
                                console.log(ev);
                                engine.bannerText = `✨ Loading ✨`;
                                useTreeAI.setState({
                                    engines: [...engines],
                                });
                            },
                            config: {
                                evalBatchSize: 131070 / 2,
                                contextLength: 131070,
                            },
                        })
                        .catch((e) => {
                            console.log(e);
                        });

                    engine.bannerText = ``;
                    useTreeAI.setState({
                        engines: [...engines],
                    });
                } catch (e) {
                    console.log(e);
                }
            }

            if (!EngineMap.has(`${engine.name}${engine.modelName}`)) {
                let engineInstance = await getEngineModel({ info: engine });

                EngineMap.set(
                    `${engine.name}${engine.modelName}`,
                    engineInstance,
                );

                engine.status = "free";
            }
        }
    }

    toast(`AI Developer Team Loaded`, {
        description: (
            <>{`Total: ${engines.filter((r) => r.enabled).length} AI Engineers`}</>
        ),
    });
};
