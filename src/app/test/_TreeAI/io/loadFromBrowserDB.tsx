import { createInstance } from "localforage";
import { MyFile, useTreeAI } from "../state/useTreeAI";

export const loadFromBrowserDB = async () => {
    const appID = useTreeAI.getState().appID;
    const appFiles = createInstance({
        name: `${appID}-files`,
    });

    let files = ((await appFiles.getItem("files")) as MyFile[]) || [];
    useTreeAI.setState({
        files: files,
    });
};
