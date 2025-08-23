export async function listOutFilesToChatBlocks({ files, chatblocks }) {
    chatblocks?.push({
        role: "user",
        content: `Here's the files in this project: `,
    });

    files?.forEach((ff) => {
        chatblocks.push({
            role: "assistant",
            content: `
[file: "${ff.path}"------file_begin]
    [file: "${ff.path}"------summary_start]
        ${ff.summary}
    [file: "${ff.path}"------summary_end]
    [file: "${ff.path}"------content_start]
        ${ff.content}
    [file: "${ff.path}"------content_end]
[file: "${ff.path}"------file_end]`,
        });
    });
}
