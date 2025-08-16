import { useGlobalAI } from "../../../useGlobalAI";
import { appsCode } from "./appsCode";

export const readFilesFromLocalDB = async () => {
    let files = await appsCode.getItem(useGlobalAI.getState().appID);
    return files;
};
