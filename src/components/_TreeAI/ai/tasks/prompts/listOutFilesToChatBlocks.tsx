export async function listOutFilesToChatBlocks({ files, chatblocks }) {
    chatblocks?.push({
        role: "user",
        content: `Here are the files in this project: `,
    });

    files
        ?.filter((r) => {
            if (r.path.startsWith("/docs")) {
                return false;
            }

            return true;
        })
        .forEach((ff) => {
            chatblocks.push({
                role: "user",
                content: `
[file: "${ff.path}"------file_begin]
    [file: "${ff.path}"------summary_start]
Summary of this file:
${ff.summary}
    [file: "${ff.path}"------summary_end]
    [file: "${ff.path}"------content_start]
${ff.content}
    [file: "${ff.path}"------content_end]
[file: "${ff.path}"------file_end]`,
            });
        });
}
