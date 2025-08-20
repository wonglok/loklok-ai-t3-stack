import { useTreeAI } from "../state/useTreeAI";

export const readFileContent = async ({ path }) => {
    let files = useTreeAI.getState().files;

    let file = files.find((r) => r.path === path);

    return file?.content || "";
};
