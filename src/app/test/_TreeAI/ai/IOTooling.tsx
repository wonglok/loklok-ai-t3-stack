import { tool } from "ai";
import z from "zod";
import { readFileContent } from "../io/readFileContent";
import { writeFileContent } from "../io/writeFileContent";

export const IOTooling = {
    readFile: tool({
        inputSchema: z.object({
            filepath: z.string().describe("file path"),
        }),
        execute: async ({ filepath }) => {
            return await readFileContent({ path: filepath });
        },
        outputSchema: z.string().describe("content"),
        description: `read file at path`,
    }),
    writeFile: tool({
        inputSchema: z.object({
            filepath: z.string().describe("file path"),
            content: z.string().describe("file content"),
        }),
        outputSchema: z.boolean().describe("successful write"),
        execute: async ({ filepath, content }) => {
            await writeFileContent({
                path: filepath,
                content: content,
            });
            return true;
        },
        description: `write file at path`,
    }),
};
