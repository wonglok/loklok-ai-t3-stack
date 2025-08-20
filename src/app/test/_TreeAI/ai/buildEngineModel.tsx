import { EngineSetting } from "../state/useTreeAI";
import { getLMStudioModel } from "./getLMStudioModel";

export const buildEngineModel = ({ info }: { info: EngineSetting }) => {
    //
    //
    if (info.modelProvider === "lmstudio") {
        return getLMStudioModel({ name: info.modelName });
    }
    //
    //
};
