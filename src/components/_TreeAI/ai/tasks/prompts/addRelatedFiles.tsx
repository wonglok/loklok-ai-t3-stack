import { useAI } from "@/components/_TreeAI/state/useAI";

export function addRelatedFiles({
    name = "",
    title = "## Here are the related files:",
}) {
    let files = useAI.getState().files;

    let inject = `
${title}
        `;

    let inc = "";
    for (let file of files) {
        if (file.path.startsWith(name)) {
            inc += "123";

            inject += `
------------------------
File Path: ${file.path}
File Summary:
${file.summary}

File Content:
${file.content}
------------------------
            `;
        }
    }

    if (inc === "") {
        inject = "";
    }

    return inject;
}
