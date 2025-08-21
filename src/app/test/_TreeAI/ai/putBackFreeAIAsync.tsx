import { EngineSetting, useTreeAI } from "../state/useTreeAI";

//  getLMStudioModel({ name: "openai/gpt-oss-20b" })

export const putBackFreeAIAsync = async ({
    engine,
}: {
    engine: EngineSetting;
}) => {
    engine.status = "free";
    useTreeAI.setState({
        engines: useTreeAI.getState().engines.map((r) => {
            if (r.name === engine.name) {
                return { ...engine };
            }
            return r;
        }),
    });
};
