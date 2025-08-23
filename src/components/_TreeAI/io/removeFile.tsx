import { useAI } from "../state/useAI";

export const removeFile = async ({ path }) => {
    let files = useAI.getState().files;

    useAI.setState({
        files: JSON.parse(
            JSON.stringify(
                files.filter((r) => {
                    return r.path !== path;
                }),
            ),
        ),
    });
};
