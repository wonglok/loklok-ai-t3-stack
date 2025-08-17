import { useGlobalAI } from "../../../useGlobalAI";
import { appsCode } from "./appsCode";

export const factoryResetThisApp = async () => {
    useGlobalAI.setState({
        files: [],
    });
    await appsCode.setItem(useGlobalAI.getState().appID, []);

    location.reload();
};
