import { MyFile, useGenAI } from "../../../useGenAI";
import { appsCode } from "./appsCode";

export const persistToDisk = async () => {
    let files = JSON.parse(
        JSON.stringify(useGenAI.getState().files),
    ) as MyFile[];

    await appsCode.setItem(useGenAI.getState().appID, files);
};
