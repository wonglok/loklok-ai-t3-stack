import { useAI } from "../state/useAI";

export const readFileContent = async ({ path }) => {
    let files = useAI.getState().files;

    let file = files.find((r) => r.path === path);

    return JSON.parse(file?.content);
};
