import { readFileSync } from "fs";

// Regex to match [mydearloklokcode] tags, capturing file name and code content
const regex =
    /\[mydearloklokcode\s+file="([^"]+)"\]([\s\S]*?)\[\/mydearloklokcode\]/g;

export interface CodeBlock {
    fileName: string;
    code: string;
}

// Function to parse the input string and extract code blocks
function parseCodeBlocks(input: string): CodeBlock[] {
    const blocks: CodeBlock[] = [];
    let match: RegExpExecArray | null;

    // Iterate over all matches in the input string
    while ((match = regex.exec(input)) !== null) {
        const fileName = match[1]; // Captured file name
        const code = match[2].trim(); // Captured code content, trimmed
        blocks.push({ fileName, code });
    }

    return blocks;
}

// // Example usage
// const input = `
// [mydearloklokcode file="example1.ts"]
// export function hello() {
//     console.log("Hello, world!");
// }
// [/mydearloklokcode]

// [mydearloklokcode file="example2.ts"]
// export function hello() {
//     console.log("Hello, world!");
// }
// [/mydearloklokcode]

// [mydearloklokcode file="example3.ts"]
// export function hello() {
//     console.log("Hello, world!");
// }
// [/mydearloklokcode]
// `;

// const codeBlocks = parseCodeBlocks(input);

// // Output the parsed results
// codeBlocks.forEach((block) => {
//     console.log(`File: ${block.fileName}`);
//     console.log(`Code:\n${block.code}`);
//     console.log("---");
// });

export { parseCodeBlocks };
