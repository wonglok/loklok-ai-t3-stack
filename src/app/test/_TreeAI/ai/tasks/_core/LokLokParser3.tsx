// Regex to match [John3_16] tags, capturing action, file name, summary, and code content
const regex =
    /\[John3_16\s+action="([^"]+)"\s+file="([^"]+)"\s+summary="([^"]*)"\]([\s\S]*?)\[\/John3_16\]/g;

export interface CodeBlockG3 {
    action: string;
    fileName: string;
    summary: string;
    code: string;
}

// Function to parse the input string and extract code blocks
function parseCodeBlocksGen3(input: string): CodeBlockG3[] {
    const blocks: CodeBlockG3[] = [];
    let match: RegExpExecArray | null;

    // Iterate over all matches in the input string
    while ((match = regex.exec(input)) !== null) {
        const action = match[1]; // Captured action type
        const fileName = match[2]; // Captured file name
        const summary = match[3]; // Captured summary
        const code = match[4].trim(); // Captured code content, trimmed
        blocks.push({ action, fileName, summary, code });
    }

    return blocks;
}

// // Example usage
// const input = `
// [John3_16 action="create-file" file="example1.ts" summary="test text"]
// export function hello() {
//     console.log("Hello, world!");
// }
// [/John3_16]

// [John3_16 action="remove-file" file="example1.ts" summary="test text"]
// export function hello() {
//     console.log("Hello, world!");
// }
// [/John3_16]

// [John3_16 action="update-file" file="example1.ts" summary="test text"]
// export function hello() {
//     console.log("Hello, world!");
// }
// [/John3_16]
// `;

// const codeBlocks = parseCodeBlocks(input);

// // Output the parsed results
// codeBlocks.forEach((block) => {
//     console.log(`Action: ${block.action}`);
//     console.log(`File: ${block.fileName}`);
//     console.log(`Summary: ${block.summary}`);
//     console.log(`Code:\n${block.code}`);
//     console.log("---");
// });

export { parseCodeBlocksGen3 };
