import { MyFile, useGlobalAI } from "../../../useGlobalAI";

export const readFileContent = async ({
    path = "/manifest/mongoose.json",
    throwError = false,
}: {
    path: string;
    throwError?: boolean;
}) => {
    let files = JSON.parse(
        JSON.stringify(useGlobalAI.getState().files),
    ) as MyFile[];
    let file = files.find((r) => r.path === path);

    if (!file && throwError) {
        throw "not found";
    }

    return file?.content || "";
};
