import { loadFromBrowserDB } from "../io/loadFromBrowserDB";
import { bootEngines } from "./bootEngines";

export const bootup = async () => {
    await loadFromBrowserDB();
    await bootEngines();
};
