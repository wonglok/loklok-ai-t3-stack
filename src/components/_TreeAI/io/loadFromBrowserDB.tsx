import { createInstance } from "localforage";
import { MyFile, useAI } from "../state/useAI";

export const loadFromBrowserDB = async () => {
    const appID = useAI.getState().appID;
    const appFiles = createInstance({
        name: `${appID}-files`,
    });

    let files = ((await appFiles.getItem("files")) as MyFile[]) || [];
    useAI.setState({
        files: files,
    });
};
