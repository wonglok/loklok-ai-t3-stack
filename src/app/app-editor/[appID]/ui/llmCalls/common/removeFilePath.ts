import { MyFile, useGenAI } from "../../../useGenAI";
import { appsCode } from "./appsCode";

export const removeFileByPath = async ({ path }: { path: string }) => {
    if (path) {
        let files = JSON.parse(
            JSON.stringify(useGenAI.getState().files),
        ) as MyFile[];

        files = files.filter((r) => {
            return r.path !== path;
        });

        useGenAI.setState({
            files: JSON.parse(JSON.stringify(files)) as MyFile[],
        });

        await appsCode.setItem(useGenAI.getState().appID, files);
    }
};
