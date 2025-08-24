import { extname } from "path";

export let getLang = (filename: string) => {
    if (extname(filename) === ".json") {
        return "json";
    } else if (extname(filename) === ".js") {
        return "javascript";
    } else if (extname(filename) === ".jsx") {
        return "javascript";
    } else if (extname(filename) === ".js") {
        return "javascript";
    } else if (extname(filename) === ".jsx") {
        return "javascript";
    } else {
        return "markdown";
    }
};
