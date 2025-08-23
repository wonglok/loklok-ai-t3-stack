import { toast } from "sonner";
import { EngineMap } from "../state/EngineMap";
import { useAI } from "../state/useAI";
import { getEngineModel } from "./getEngineModel";
import { LMStudioClient } from "@lmstudio/sdk";

//  getLMStudioModel({ name: "openai/gpt-oss-20b" })
import nprogress from "nprogress";
export const bootEngines = async () => {
    // //
    // let currentAIProvider = useAI.getState().currentAIProvider;
    // if (currentAIProvider === "lmstudio") {
    //     getLMStudioModel({ name: "openai/gpt-oss-20b" });
    // }
    //

    const client = new LMStudioClient();
    let loadedEngines = [];
    try {
        loadedEngines = await client.llm.listLoaded();
        for (let engine of loadedEngines) {
            await engine.unload();
        }
    } catch (e) {
        console.log(e);
    } finally {
        loadedEngines = [];
    }

    let engines = useAI.getState().engines || [];
    nprogress.start();

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
                                useAI.setState({
                                    engines: [...engines],
                                });
                                nprogress.inc();
                            },
                            config: {
                                evalBatchSize: 131070 * 0.45,
                                contextLength: 131070,
                            },
                        })
                        .catch((e) => {
                            console.log(e);
                        });

                    engine.bannerText = ``;
                    useAI.setState({
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
    nprogress.done();

    toast(`AI Developer Team Loaded`, {
        description: (
            <>{`Total: ${engines.filter((r) => r.enabled).length} AI Engineers`}</>
        ),
    });
};
