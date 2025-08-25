import { createInstance } from "localforage";
import { useAI } from "../state/useAI";

export const saveToBrowserDB = async () => {
    //
    const appID = useAI.getState().appID;
    const files = useAI.getState().files;
    const appFiles = createInstance({
        name: `${appID}-files`,
    });

    await appFiles.setItem("files", files);

    console.log("save-browser-db");
};
