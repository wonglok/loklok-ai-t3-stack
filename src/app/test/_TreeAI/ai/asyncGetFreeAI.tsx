import { EngineMap } from "../state/engineMap";
import { useTreeAI } from "../state/useTreeAI";

//  getLMStudioModel({ name: "openai/gpt-oss-20b" })

export const asyncGetFreeAI = async () => {
    let engineConfig = await new Promise((resolve) => {
        let ttt = setInterval(() => {
            let engines = useTreeAI.getState().engines || [];
            let eachFreeEngine = engines.filter((r) => r.status === "free")[0];

            if (
                eachFreeEngine &&
                EngineMap.has(eachFreeEngine.name + eachFreeEngine.modelName)
            ) {
                clearInterval(ttt);
                resolve(
                    EngineMap.get(
                        eachFreeEngine.name + eachFreeEngine.modelName,
                    ),
                );
            }
        });
    });

    return engineConfig;
};
