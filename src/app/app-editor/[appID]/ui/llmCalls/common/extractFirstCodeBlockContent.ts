import * as markdownit from "markdown-it";

export const extractFirstCodeBlockContent = async ({
    markdown = "",
}: {
    markdown: string;
    removeFilePathAfterReading?: string;
}): Promise<string> => {
    //
    let fistblock = (await new Promise((resolve) => {
        const md = markdownit.default({
            langPrefix: "language-",
            highlight: (str: string, lang: string) => {
                console.log("code", str);
                console.log("lang", lang);
                resolve(str);

                return "";
            },
        });

        md.render(`${markdown}`);
    })) as string;

    return fistblock;
};
