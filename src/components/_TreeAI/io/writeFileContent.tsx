import { useAI } from "../state/useAI";

export const writeFileContent = async ({ path, content, summary = "" }) => {
    let files = useAI.getState().files;

    let file = files.find((r) => r.path === path);

    if (!file) {
        file = {
            path: path,
            summary: "",
            content: "",
        };
        files.push(file);
    }

    file.content = content;
    file.summary = summary;

    useAI.setState({
        files: JSON.parse(JSON.stringify(files)),
    });
};
