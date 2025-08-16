import * as pathUtil from "path";
import { MyFile, useGlobalAI } from "../../../useGlobalAI";
import { appsCode } from "./appsCode";

export const writeToFile = async ({
    content,
    path,
    persist = true,
    inputSignature = "",
    author = "",
}: {
    author?: string;
    content: string;
    path: string;
    persist?: boolean;
    inputSignature?: string;
}) => {
    let files = JSON.parse(
        JSON.stringify(useGlobalAI.getState().files),
    ) as MyFile[];

    let file = files.find((r) => r.path === path);
    if (file) {
        file.author = author;
        file.content = `${content}`;
        file.updatedAt = new Date().toISOString();
        file.inputSignature = inputSignature;
    } else {
        let newFile = {
            author: author,
            writing: !persist,
            path: path,
            filename: pathUtil.basename(path),
            content: `${content}`,
            updatedAt: new Date().toISOString(),
            createdAt: new Date().toISOString(),
            inputSignature: inputSignature,
        };
        console.log(path);
        files.push(newFile);
    }

    useGlobalAI.setState({
        files: JSON.parse(JSON.stringify(files)) as MyFile[],
    });

    if (persist) {
        await appsCode.setItem(useGlobalAI.getState().appID, files);
    }
};
