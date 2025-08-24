export async function listOutFilesToChatBlocks({ files, chatblocks }) {
    chatblocks?.push({
        role: "user",
        content: `Here are the files in this project: `,
    });

    files?.forEach((ff) => {
        chatblocks.push({
            role: "user",
            content: `
File Path: ${ff.path}
File Summary: 
${ff.summary}

File Content: 
${ff.content}
`,
        });
    });
}
