import { MyFile, useGlobalAI } from "../../../useGlobalAI";
import { appsCode } from "./appsCode";

export const removeFileByPath = async ({ path }: { path: string }) => {
    if (path) {
        let files = JSON.parse(
            JSON.stringify(useGlobalAI.getState().files),
        ) as MyFile[];

        files = files.filter((r) => {
            return r.path !== path;
        });

        useGlobalAI.setState({
            files: JSON.parse(JSON.stringify(files)) as MyFile[],
        });

        await appsCode.setItem(useGlobalAI.getState().appID, files);
    }
};
