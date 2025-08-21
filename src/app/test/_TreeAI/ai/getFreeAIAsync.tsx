import { LanguageModel } from "ai";
import { EngineMap } from "../state/EngineMap";
import { EngineSetting, useTreeAI } from "../state/useTreeAI";

//  getLMStudioModel({ name: "openai/gpt-oss-20b" })

export const getFreeAIAsync = async () => {
    let { model, slot }: { model: LanguageModel; slot: EngineSetting } =
        await new Promise((resolve) => {
            let ttt = setInterval(() => {
                let engines = useTreeAI.getState().engines || [];
                let eachFreeEngine = engines.filter(
                    (r) => r.status === "free",
                )[0];

                if (
                    eachFreeEngine &&
                    EngineMap.has(
                        eachFreeEngine.name + eachFreeEngine.modelName,
                    )
                ) {
                    clearInterval(ttt);
                    eachFreeEngine.status = "working";
                    resolve({
                        model: EngineMap.get(
                            eachFreeEngine.name + eachFreeEngine.modelName,
                        ),
                        slot: eachFreeEngine,
                    });
                }
            });
        });

    return {
        model: model as LanguageModel,
        slot: slot as EngineSetting,
    };
};
