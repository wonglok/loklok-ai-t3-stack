import { useGenAI } from "../../../useGenAI";
import { appsCode } from "./appsCode";

export const factoryResetThisApp = async () => {
    useGenAI.setState({
        files: [],
    });
    await appsCode.setItem(useGenAI.getState().appID, []);
};
