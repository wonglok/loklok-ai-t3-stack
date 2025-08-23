import { extname } from "path";

export let getLang = (filename: string) => {
    if (extname(filename) === ".json") {
        return "json";
    } else if (extname(filename) === ".js") {
        return "javascript";
    } else if (extname(filename) === ".jsx") {
        return "javascript";
    } else if (extname(filename) === ".ts") {
        return "typescript";
    } else if (extname(filename) === ".tsx") {
        return "typescript";
    } else {
        return "markdown";
    }
};
