import { EngineSetting, useTreeAI } from "../state/useTreeAI";

//  getLMStudioModel({ name: "openai/gpt-oss-20b" })

export const putBackFreeAIAsync = async ({
    engine,
}: {
    engine: EngineSetting;
}) => {
    engine.status = "free";
};
