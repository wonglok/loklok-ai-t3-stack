// Regex to match [mydearloklokcode] tags, capturing action, file name, and code content
const regex =
    /\[mydearloklokcode\s+action="([^"]+)"\s+file="([^"]+)"\]([\s\S]*?)\[\/mydearloklokcode\]/g;

interface CodeBlock {
    action: string;
    fileName: string;
    code: string;
}

// Function to parse the input string and extract code blocks
export function parseCodeBlocksActionType(input: string): CodeBlock[] {
    const blocks: CodeBlock[] = [];
    let match: RegExpExecArray | null;

    // Iterate over all matches in the input string
    while ((match = regex.exec(input)) !== null) {
        const action = match[1]; // Captured action type
        const fileName = match[2]; // Captured file name
        const code = match[3].trim(); // Captured code content, trimmed
        blocks.push({ action, fileName, code });
    }

    return blocks;
}
