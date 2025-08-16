import { MyFile, useGlobalAI } from "../../../useGlobalAI";
import { appsCode } from "./appsCode";

export const persistToDisk = async () => {
    let files = JSON.parse(
        JSON.stringify(useGlobalAI.getState().files),
    ) as MyFile[];

    await appsCode.setItem(useGlobalAI.getState().appID, files);
};
