import { createInstance } from "localforage";
import { useTreeAI } from "../state/useTreeAI";

export const saveToBrowserDB = async () => {
    //
    const appID = useTreeAI.getState().appID;
    const files = useTreeAI.getState().files;
    const appFiles = createInstance({
        name: `${appID}-files`,
    });

    await appFiles.setItem("files", files);
};
