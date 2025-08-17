import { useGenAI } from "../../../useGenAI";
import { appsCode } from "./appsCode";

export const readFilesFromLocalDB = async () => {
    let files = await appsCode.getItem(useGenAI.getState().appID);
    return files;
};
