import { loadFromBrowserDB } from "../io/loadFromBrowserDB";
import { useTreeAI } from "../state/useTreeAI";
import { asyncGetFreeAI } from "./asyncGetFreeAI";
import { buildAppDoc } from "./buildAppDoc";
import { lazyRunEngines } from "./lazyRunEngines";

export const bootup = async () => {
    await loadFromBrowserDB();
    await lazyRunEngines();
};
