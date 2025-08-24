import {
    convertToModelMessages,
    createUIMessageStream,
    generateObject,
    generateText,
    ModelMessage,
    streamObject,
    streamText,
    tool,
    UIMessage,
} from "ai";
// import { IOTooling } from "../../../io/IOTooling";
import { EngineSetting, useAI } from "../../../state/useAI";
// import { refreshUIMessages } from "../refreshUIMessages";
// import { writeFileContent } from "../../io/writeFileContent";
// import { removeUIMessages } from "../removeUIMessages";
import { putBackFreeAIAsync } from "../../putBackFreeAIAsync";
import { getFreeAIAsync } from "../../getFreeAIAsync";
import { MyTask, MyTaskManager } from "../_core/MyTaskManager";
import { getModelMessagesFromUIMessages } from "../../getModelMessagesFromUIMessages";
// import { readFileContent } from "../../../io/readFileContent";
import { writeFileContent } from "../../../io/writeFileContent";
import { saveToBrowserDB } from "../../../io/saveToBrowserDB";
// import z from "zod";
// import { parseCodeBlocks } from "./_core/LokLokParser";
// import { parseCodeBlocksActionType } from "./_core/LokLokParser2";
import { removeFile } from "../../../io/removeFile";
import { parseCodeBlocksGen3 } from "../_core/LokLokParser3";
import { getAppOverviewPrompt } from "../prompts/getAppOverviewPrompt";
import { getFileOutputFormatting } from "../prompts/getFileOutputFormatting";
// import { v4 } from "uuid";
// import { putUIMessage } from "../../putUIMessage";
// import { removeUIMessage } from "../../removeUIMessage";
import { listOutFilesToChatBlocks } from "../prompts/listOutFilesToChatBlocks";
// import { LokLokSDK } from "../../../web/LokLokSDK";
// import { refreshEngineSlot } from "../../refreshEngines";
import { makeTicker } from "../_core/makeTicker";
import { saveToCloud } from "@/components/_TreeAI/io/saveToCloud";

export const name = "handleBackendTRPC";
export const displayName = "TRPC Backend";

export async function handleBackendTRPC({
    userPrompt,
    task,
}: {
    userPrompt: string;
    task: MyTask;
}) {
    let { model, engineSettingData: slot } = await getFreeAIAsync();
    let files = useAI.getState().files;

    let chatblocks = [];
    chatblocks.push({
        role: "system",
        content: `${await getAppOverviewPrompt()}`,
    });

    await listOutFilesToChatBlocks({ files, chatblocks });

    chatblocks.push({
        role: "user",
        content: `

Instructions:

- Identify trpc procedures for backend and implement them, use only javascript ".js" files:
- DO NOT WRAP THE CODE WITH markdown
- ONLY WRITE PURE CODE FOR

- Please refer to mongoose models in "/models/defineMongooseModels.js" to have all features 

- The app has a Global variable window.trpcSDK as a custom tRPC Frontend Client.


- NEVER use common.js style require or module.export

- MUST NOT import module
- DO NOT IMPORT ANYTHING
- NEVER use common.js nodejs

window.trpcSDK
    .runTRPC({
        procedure: "hello", // [hello] is the procedure name
        input: { text: "sure been good" },// [input] is the input paramter
    })
    .then((result) => {
        console.log(result); // result is obtained via async functuin call
    });

- MUST write all the backend trpc procedures in this file: "/trpc/*.js"

- There are 2 global varaibles: "protectedProcedure" and "publicProcedure" for private and public access for appRouter

- DO NOT CHANGE Immediately Invoked Function Expression input arguments

- MUST use Mongoose Models in the "models" argument in the Immediately Invoked Function Expression.

- DO NOT USE In-memory mock store 

- ALWAYS USE .mutation({...})
- NEVER USE .query({...})

- ALWAYS USE "_id" for object id (good)
- NEVER USE "id" for object id (bad)
- Example: USE "{ _id, ...updates }" instead of { id, ...updates } 

- ALWAYS use: ctx.session.user to get user from the procedure context (GOOD)
- NEVER use: ctx.user to get user from the procedure context (BAD)

- ALWAYS make sure we implemented the code for login resgiter and write at: "/trpc/authProcedures.ts"

- Example: "/trpc/authProcedures.ts"
(function ({ z, models, allProcedures, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET, ObjectId, mongoose, dbInstance }) {
    const User = dbInstance.model("User")

    // Register a new user (public)
    allProcedures.publicProcedure
        .input(z.object({
            email: z.string(),
            password: z.string().min(6),
        }))
        .mutation(async ({ input }) => {
            const existing = await User.findOne({ email: input.email });
            if (existing) throw new Error('Email already in use');

            const hashed = await bcrypt.hash(input.password, 10);
            const user = await User.create({ email: input.email, passwordHash: hashed });

            const token = jwt.sign({ _id: String(user._id) }, JWT_SECRET, { expiresIn: '1d' });
            return { token };
        });
    
    allProcedures.login = publicProcedure
            .input(z.object({
                email: z.string(),
                password: z.string(),
            }))
            .mutation(async ({ input }) => {
                const user = await User.findOne({ email: input.email });

                if (!user) throw new Error('Invalid credentials');

                const match = await bcrypt.compare(input.password, user.passwordHash);
                if (!match) throw new Error('Invalid credentials');

                const token = jwt.sign({ _id: String(user._id) }, JWT_SECRET, { expiresIn: '1week' });
                return { token };
            });

}({ z, models, allProcedures, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET, ObjectId, mongoose, dbInstance }))


- Example: "/trpc/todoProcedures.ts"
(function ({ z, models, allProcedures, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET, ObjectId, mongoose, dbInstance }) {
    const Task = dbInstance.model("Task")

    allProcedures.getTasks = protectedProcedure
            .mutation(async ({ ctx }) => {
                const tasks = await Task.find({ userID: ObjectId.createFromHexString(ctx.session.user._id) })
                    .sort({ _id: -1 })
                    .lean();
                return tasks;
            });


    allProcedures.addTask = protectedProcedure
            .input(z.object({
                title: z.string(),
            }))
            .mutation(async ({ input, ctx }) => {
                const task = await Task.create({
                    title: input.title,
                    completed: false,
                    userID: ObjectId.createFromHexString(ctx.session.user._id),
                });

                return JSON.parse(JSON.stringify(task));
            });

            

    allProcedures.toggleTask = protectedProcedure
            .input(z.object({
                _id: z.string(),
            }))
            .mutation(async ({ input, ctx }) => {
                const task = await Task.findOne({
                    _id: ObjectId.createFromHexString(input._id),
                    userID: ObjectId.createFromHexString(ctx.session.user._id),
                });

                if (!task) throw new Error('Task not found');

                task.completed = !task.completed;
                await task.save();
                return task;
            });

    allProcedures.deleteTask = protectedProcedure
            .input(z.object({
                _id: z.string(),
            }))
            .mutation(async ({ input, ctx }) => {
                await Task.deleteOne({
                    _id: ObjectId.createFromHexString(input._id),
                    userID: ObjectId.createFromHexString(ctx.session.user._id),
                });
                return { success: true };
            });

}({ z, models, allProcedures, publicProcedure, protectedProcedure, jwt, bcrypt, JWT_SECRET, ObjectId, mongoose, dbInstance }))


- Only Implement "defineBackendProcedures" function
- DO NOT write any other function or file

- issue JWT when login / register 

# instruction
update suitable code files to meet the latest requirements

${await getFileOutputFormatting()}

                `,
    });

    // console.log("chatblocks", chatblocks);

    let response = streamText({
        // schema: z
        //     .array(
        //         z
        //             .object({
        //                 path: z.string().describe("file path"),
        //                 code: z.string().describe("code"),
        //             })
        //             .describe("file chatblocks"),
        //     )
        //     .describe("list of files and its content"),
        // schemaName: "file outputs",
        // schemaDescription: "a list of files to be written to file system",
        // toolChoice: "required",
        // tools: {
        //     ...IOTooling,
        // },

        messages: [
            //
            ...getModelMessagesFromUIMessages(),
            //
            ...chatblocks,

            //
        ],
        model,
    });

    //

    // let lastFile = "";
    let parseText = async (text) => {
        try {
            const blocks = parseCodeBlocksGen3(`${text}`);
            // console.log("Parsed blocks:", JSON.stringify(blocks, null, 2));

            for (let block of blocks) {
                if (block.action === "create-file") {
                    await writeFileContent({
                        summary: `${block.summary}`,
                        path: `${block.fileName}`,
                        content: block.code,
                    });
                    await saveToBrowserDB();
                } else if (block.action === "update-file") {
                    await writeFileContent({
                        summary: `${block.summary}`,
                        path: `${block.fileName}`,
                        content: block.code,
                    });
                    await saveToBrowserDB();
                } else if (block.action === "remove-file") {
                    await removeFile({
                        path: `${block.fileName}`,
                    });
                } else {
                }
            }
        } catch (e) {
            if (e instanceof Error) {
                console.error(`Parse error: ${e.message}`);
            } else {
                console.error(e);
            }
        }
    };

    let text = "";

    let ticker = makeTicker({
        engineSettingData: slot,
        displayName: displayName,
    });

    for await (let part of response.textStream) {
        text += part;
        // console.log(text);

        parseText(text);
        ticker.tick(text);

        //
    }
    parseText(text);

    await saveToBrowserDB();
    saveToCloud();
    ticker.remove();

    await MyTaskManager.doneTask(task.name);

    //  platform

    await putBackFreeAIAsync({ engine: slot });
}
