import { useAI } from "@/components/_TreeAI/state/useAI";

export function addRelatedFiles({ name = "" }) {
    let files = useAI.getState().files;

    let inject = `
    ## Here are the related files:
        `;

    for (let file of files) {
        if (file.path.startsWith(name))
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

    if (inject === "") {
        inject = "no files at this moment.";
    }

    return inject;
}
