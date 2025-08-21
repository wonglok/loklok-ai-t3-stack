import { OpenAICompatibleChatLanguageModel } from "@ai-sdk/openai-compatible";

export const getLMStudioModel = ({ name = "openai/gpt-oss-120b" }) => {
    const model = new OpenAICompatibleChatLanguageModel(name, {
        //
        provider: `lmstudio.chat.${name}`,
        //
        includeUsage: true,

        url: ({ path }) => {
            const url = new URL(`http://localhost:1234/v1${path}`);
            return url.toString();
        },
        headers: () => {
            let headers = new Headers();
            let object = {};
            for (let [key, val] of headers.entries()) {
                object[key] = val;
            }
            return object;
        },
        supportsStructuredOutputs: true,

        // 'defaultObjectGenerationMode' doesn't seem to be a valid option anymore
    });

    return model;
};
