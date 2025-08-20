import { useTreeAI } from "../state/useTreeAI";

export const writeFileContent = async ({ path, content }) => {
    let files = useTreeAI.getState().files;

    let file = files.find((r) => r.path === path);

    if (!file) {
        file = {
            path: path,
            content: "",
        };
        files.push(file);
    }

    file.content = content;

    useTreeAI.setState({
        files: JSON.parse(JSON.stringify(files)),
    });
};
