import { useAI } from "../state/useAI";

export const writeFileContent = async ({ path, content }) => {
    let files = useAI.getState().files;

    let file = files.find((r) => r.path === path);

    if (!file) {
        file = {
            path: path,
            content: "",
        };
        files.push(file);
    }

    file.content = content;

    useAI.setState({
        files: JSON.parse(JSON.stringify(files)),
    });
};
