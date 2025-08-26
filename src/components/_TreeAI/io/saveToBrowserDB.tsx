import { createInstance } from "localforage";
import { useAI } from "../state/useAI";

let ttt;
export const saveToBrowserDB = async () => {
    clearTimeout(ttt);
    ttt = setTimeout(() => {
        const appID = useAI.getState().appID;
        const files = useAI.getState().files;
        const appFiles = createInstance({
            name: `${appID}-files`,
        });

        appFiles.setItem("files", files);

        console.log("save-browser-db");
    }, 200);
};
