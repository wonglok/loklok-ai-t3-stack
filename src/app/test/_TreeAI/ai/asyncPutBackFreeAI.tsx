import { EngineMap } from "../state/EngineMap";
import { EngineSetting, useTreeAI } from "../state/useTreeAI";

//  getLMStudioModel({ name: "openai/gpt-oss-20b" })

export const asyncPutBackFreeAI = async ({
    engine,
}: {
    engine: EngineSetting;
}) => {
    engine.status = "free";
    let inst = EngineMap.get(engine.name);
    // inst.
};
