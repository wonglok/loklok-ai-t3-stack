"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { MyFile, useGenAI } from "../../useGenAI";
// @ts-ignore
import Worker from "./webllm.worker.ts";
import { z } from "zod";

import * as markdownit from "markdown-it";
import * as pathUtil from "path";
import { createInstance } from "localforage";
import md5 from "md5";
import * as diffApply from "diff-apply";

// @ts-ignore
// import { unified } from "unified";
// import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
// import remarkMan from "remark-man";

const appsCode = createInstance({
    name: "apps_code",
});

const aiPersonality = `AI Role: 

You are an AI Coding Agent with following description:

- You are a senior fullstack developer. 
- You love helping user to code things.
- You are Joyful and Wise. 
- You love short and sweet sentences and clear and insightful code comments.`;

export const WebLLMAppClient = {
    ///////////////////////////////////////////////////////////////////////////////////
    // buildApp
    ///////////////////////////////////////////////////////////////////////////////////
    [`buildApp`]: async ({
        userPrompt,
        currentModel,
    }: {
        userPrompt: string;
        currentModel: string;
    }) => {
        const initProgressCallback = (report: webllm.InitProgressReport) => {
            console.log(report.text);
            useGenAI.setState({
                setupLLMProgress: report.text,
            });
        };

        useGenAI.setState({
            llmStatus: "downloading",
        });

        let aiWorker = new Worker();
        let engine = (await CreateWebWorkerMLCEngine(aiWorker, currentModel, {
            initProgressCallback: initProgressCallback,
            logLevel: "DEBUG",
        })) as webllm.MLCEngineInterface;

        useGenAI.setState({
            stopFunc: async () => {
                try {
                    useGenAI.getState().onCancelSigature();
                } catch (e) {
                    console.log(e);
                }

                useGenAI.setState({ llmStatus: "init" });

                useGenAI.setState({
                    stopFunc: () => {},
                });

                engine?.interruptGenerate();
                aiWorker.terminate();
                try {
                    engine?.unload();
                } catch (e) {
                    console.log(e);
                }
            },
        });

        useGenAI.setState({
            llmStatus: "writing",
        });

        try {
            await WebLLMAppClient.testDiff({
                //
                engine,
            });

            // console.log("before studyRequirements");
            // await WebLLMAppClient.studyRequirements({
            //     userPrompt: userPrompt,
            //     engine,
            // });
            // console.log("before createMongooseFromSpec");
            // await WebLLMAppClient.createMongooseFromSpec({
            //     engine,
            // });
            // // // // await WebLLMAppClient.createBackendProcedures({
            // // // //     engine,
            // // // // });
            // // // // await WebLLMAppClient.createFrontEndSDK({
            // // // //     engine,
            // // // // });
            // console.log("before createReactComponents");
            // await WebLLMAppClient.createReactComponents({
            //     engine,
            // });
            // console.log("before createAppRootRouterComponents");
            // await WebLLMAppClient.createAppRootRouterComponents({
            //     engine,
            // });
        } finally {
            useGenAI.getState().stopFunc();
        }
    },
    ///////////////////////////////////////////////////////////////////////////////////
    // buildApp
    ///////////////////////////////////////////////////////////////////////////////////

    [`testDiff`]: async ({ engine }) => {
        {
            const editRule = `# apply_diff Tool - Generate Precise Code Changes

Generate a unified diff that can be cleanly applied to modify code files.

## Step-by-Step Instructions:

1. Start with file headers:
    - First line: "--- {original_file_path}"
    - Second line: "+++ {new_file_path}"

2. For each change section:
    - Begin with "@@ ... @@" separator line without line numbers
    - Include 2-3 lines of context before and after changes
    - Mark removed lines with "-"
    - Mark added lines with "+"
    - Preserve exact indentation

3. Group related changes:
    - Keep related modifications in the same hunk
    - Start new hunks for logically separate changes
    - When modifying functions/methods, include the entire block

## Requirements:

1. MUST include exact indentation
2. MUST include sufficient context for unique matching
3. MUST group related changes together
4. MUST use proper unified diff format
5. MUST NOT include timestamps in file headers
6. MUST NOT include line numbers in the @@ header
7. Only output mardkwon, no comments needed.

## Examples:

✅ Good diff (follows all requirements):
\`\`\`diff
--- src/utils.ts
+++ src/utils.ts
@@ ... @@
    def calculate_total(items):
-      total = 0
-      for item in items:
-          total += item.price
+      return sum(item.price for item in items)
\`\`\`
            `;

            ///////////////////////////////////////////////////////////////////////////////////
            // manifest
            ///////////////////////////////////////////////////////////////////////////////////
            let existingCode = `// happy.js
function yo () {
    console.log(123)
}
`;
            let messages: any = [
                {
                    role: `system`,
                    content: `${editRule}`,
                },

                {
                    role: `user`,
                    content: `I will show you the original code in next message.`,
                },

                {
                    role: `user`,
                    content: `${existingCode}`,
                },
                {
                    role: "user",
                    content: `

i want to log "hahaha" instead of 123

`,
                },
            ];

            //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide
            //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide
            //https://github.com/pylarco/diff-apply?tab=readme-ov-file#llm-integration-and-prompting-guide

            const request: webllm.ChatCompletionRequest = {
                stream: true,
                stream_options: { include_usage: true },
                messages: messages,
                temperature: 0.0,
            };

            let path = `/ppap/diff_gen.md`;

            await WebLLMAppClient.llmRequestToFileStream({
                path: path,
                request: request,
                engine,
            });

            let diffText = await WebLLMAppClient.readFileContent({ path });

            let diffObj = await import("parse-diff").then(async (par) => {
                let results = await par.default(diffText);

                return results;
            });

            console.log(diffObj);

            let strategy = diffApply.newUnifiedDiffStrategy.create(0.95);

            let result = (await strategy.applyDiff({
                originalContent: existingCode,
                diffContent: diffText,
            })) as any;

            console.log(result.success, result.content);

            // // const strategy = newUnifiedDiffStrategyService.create(0.95); // 95% confidence required

            ///////////////////////////////////////////////////////////////////////////////////
            // usecase
            ///////////////////////////////////////////////////////////////////////////////////
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // elaborateSpec
    ///////////////////////////////////////////////////////////////////////////////////
    [`studyRequirements`]: async ({
        userPrompt,
        engine,
    }: {
        engine: webllm.MLCEngineInterface;
        userPrompt: string;
    }) => {
        {
            ///////////////////////////////////////////////////////////////////////////////////
            // manifest
            ///////////////////////////////////////////////////////////////////////////////////
            let messages: any = [
                {
                    role: `system`,
                    content: `${aiPersonality}`,
                },
                {
                    role: "user",
                    content: `Here's what the user want to build for the latest features:
${userPrompt}`,
                },

                {
                    role: `user`,
                    content: `
Your Instruction:

- Please improve the user requirements using markdown foramt
- List out all the database table and data field needed
- List out all the screen names needed by the app and their page route (pathname with params) 
- List out all the backend procedure needed by the screens

`,
                },
            ];

            const request: webllm.ChatCompletionRequest = {
                stream: true,
                stream_options: { include_usage: true },
                messages: messages,
                temperature: 0.0,
            };

            let path = `/study/blueprint.md`;

            await WebLLMAppClient.llmRequestToFileStream({
                path: path,
                request: request,
                engine,
            });

            ///////////////////////////////////////////////////////////////////////////////////
            // usecase
            ///////////////////////////////////////////////////////////////////////////////////
        }

        ///////////////////////////////////////////////////////////////////////////////////
        // Generate Function Output
        ///////////////////////////////////////////////////////////////////////////////////
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // createMongooseFromSpec
    ///////////////////////////////////////////////////////////////////////////////////
    [`createMongooseFromSpec`]: async ({
        engine,
    }: {
        engine: webllm.MLCEngineInterface;
    }) => {
        let mongoosePromptEach = await import(
            // @ts-ignore
            "../prompts/mongoosePromptEach.md"
        ).then((r) => r.default);

        let studyText = await WebLLMAppClient.readFileContent({
            path: `/study/blueprint.md`,
        });

        const request: webllm.ChatCompletionRequest = {
            stream: true,
            stream_options: { include_usage: true },
            messages: [
                {
                    role: `system`,
                    content: `
${aiPersonality}
`,
                },

                {
                    role: "user",
                    content: `Here's what the requirements are:
${studyText}`,
                },

                {
                    role: `user`,
                    content: `
Your Instruction:
Please generate the mongoose database collection information.
`,
                },
            ],
            temperature: 0.0,
            response_format: {
                type: "json_object",
                schema: JSON.stringify(
                    z.toJSONSchema(
                        z.object({
                            version: z.literal("2025-08-12---init"),
                            mongoose: z
                                .array(
                                    z
                                        .object({
                                            modelName: z.string(),
                                        })
                                        .describe(
                                            "each mongoose database collection",
                                        ),
                                )
                                .describe("mongoose database collections"),
                        }),
                    ),
                ),
            },
        };

        await WebLLMAppClient.llmRequestToFileStream({
            path: `/study/database.json`,
            request: request,
            engine,
        });

        let rootObject = await WebLLMAppClient.readFileParseJSONContent({
            path: `/study/database.json`,
        });

        console.log(rootObject);

        for (let eachObject of rootObject.mongoose) {
            //
            {
                let modelName = eachObject.modelName;

                let messages: any = [
                    {
                        role: `system`,
                        content: `${aiPersonality}`,
                    },
                    {
                        role: `user`,
                        content: `
Your Instruction:

1. Implement to fullfill the full user requirements.
2. Avoid Using Preserved Keyworads in Javascript as Model names. such as Map, WeakMap, Proxy, etc...
3. only need 1 function
`,
                    },
                    {
                        role: "user",
                        content: `Here's the existing code as reference:
${mongoosePromptEach}
                    `,
                    },
                    {
                        role: "user",
                        content: `
Here's the overall and mongoose database definiton:
${studyText}

Please only implement "${modelName}" (${eachObject.modelName}) collection only:
`.trim(),
                    },
                ];

                ///////////////////////////////////////////////////////////////////////////////////
                // Generate Function Output
                ///////////////////////////////////////////////////////////////////////////////////
                const request: webllm.ChatCompletionRequest = {
                    stream: true,
                    stream_options: { include_usage: true },
                    messages: messages,
                    temperature: 0.0,
                    max_tokens: 4096,
                };

                await WebLLMAppClient.llmRequestToFileStream({
                    engine,
                    request,
                    path: `/models/${eachObject.modelName}.js`,
                    needsExtractCode: true,
                });

                console.log("modelName", eachObject.modelName);
            }
        }

        /////////
        /////////
        /////////
        /////////

        let content = "";

        for (let eachObject of rootObject.mongoose) {
            let modelName = eachObject.modelName;
            content += `
await import(${JSON.stringify(`/models/${modelName}.js`)}).then(async ({ defineOneModel }) => {
    return await defineOneModel({ db, output, bcrypt });
})
`;
        }

        let finalContent = `

async function loadModels({ bcrypt }) {
    const db = mongoose.connection.useDb(${JSON.stringify(`app_${useGenAI.getState().appID}`)}, { useCache: true });
    
    const output = {};

    ${content}

    return output;
}

export { loadModels }

        `;

        await WebLLMAppClient.writeToFile({
            content: `${finalContent}`,
            path: `/database/all.js`,
        });
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // createBackendProcedures
    ///////////////////////////////////////////////////////////////////////////////////
    [`createBackendProcedures`]: async ({
        engine,
    }: {
        engine: webllm.MLCEngineInterface;
    }) => {
        //         let ns = {
        //             draft: "createBackendProceduresDraft",
        //             ok: "createBackendProceduresFinal",
        //         };
        //         useGenAI.setState({ [ns.draft]: " " });
        //         // @ts-ignore
        //         let trpcPromptEach = await import("../prompts/trpcPromptEach.md").then(
        //             (r) => r.default,
        //         );
        //         let mongooseText = await WebLLMAppClient.readFileContent({
        //             path: `/study/mongoose.json`,
        //         });
        //         let proceduresText = await WebLLMAppClient.readFileContent({
        //             path: `/study/procedures.json`,
        //         });
        //         console.log(proceduresText);
        //         let proceduresList = JSON.parse(proceduresText.trim()).procedures;
        //         console.log(proceduresList);
        //         for (let procedureDef of proceduresList) {
        //             //
        //             {
        //                 let slug = procedureDef?.slug;
        //                 let procedureJSONString = JSON.stringify(procedureDef);
        //                 console.log(procedureJSONString);
        //                 let technicalSpecificationFinal = `
        // ${mongooseText}
        // ${procedureJSONString}
        //         `;
        //                 let messages: any = [
        //                     {
        //                         role: `system`,
        //                         content: `
        // ${aiPersonality}
        // `,
        //                     },
        //                     {
        //                         role: "user",
        //                         content: `Here's the "user requirement technical specification":
        // ${technicalSpecificationFinal}`,
        //                     },
        //                     {
        //                         role: "user",
        //                         content: `Here's the "example code":
        // ${trpcPromptEach}`.trim(),
        //                     },
        //                     {
        //                         role: "user",
        //                         content: `
        // Instruction:
        // Implement code inside the "example code" according to the "user requirement technical specification" that user has provided above.
        // - only use mutation for procedure
        //         `.trim(),
        //                     },
        //                 ];
        //                 ///////////////////////////////////////////////////////////////////////////////////
        //                 // Generate Function Output
        //                 ///////////////////////////////////////////////////////////////////////////////////
        //                 const request: webllm.ChatCompletionRequest = {
        //                     stream: true,
        //                     stream_options: { include_usage: true },
        //                     messages: messages,
        //                     temperature: 0.0,
        //                     max_tokens: 4096,
        //                 };
        //                 await WebLLMAppClient.llmRequestToFileStream({
        //                     engine,
        //                     request,
        //                     path: `/api/${slug}.js.temp.md`,
        //                 });
        //                 let modelCode =
        //                     await WebLLMAppClient.extractFirstCodeBlockContent({
        //                         markdown: await WebLLMAppClient.readFileContent({
        //                             path: `/api/${slug}.js.temp.md`,
        //                         }),
        //                     });
        //                 await WebLLMAppClient.removeFileByPath({
        //                     path: `/api/${slug}.js.temp.md`,
        //                 });
        //                 await WebLLMAppClient.writeToFile({
        //                     content: modelCode,
        //                     path: `/api/${slug}.js`,
        //                 });
        //                 //
        //             }
        //         }
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // createFrontEndSDK
    ///////////////////////////////////////////////////////////////////////////////////
    [`createFrontEndSDK`]: async ({
        engine,
    }: {
        engine: webllm.MLCEngineInterface;
    }) => {
        //         let zustandPromptEach = await import(
        //             // @ts-ignore
        //             "../prompts/zustandPromptEach.md"
        //         ).then((r) => r.default);
        //         let mongooseText = await WebLLMAppClient.readFileContent({
        //             path: `/manifest/mongoose.json`,
        //         });
        //         let proceduresText = await WebLLMAppClient.readFileContent({
        //             path: `/manifest/procedures.json`,
        //         });
        //         let proceduresList = JSON.parse(proceduresText.trim()).procedures;
        //         //
        //         console.log(proceduresList);
        //         //
        //         {
        //             let technicalSpecificationFinal = `
        // ${mongooseText}
        // ${proceduresText}
        //         `;
        //             let messages: any = [
        //                 {
        //                     role: `system`,
        //                     content: `
        // ${aiPersonality}
        // `,
        //                 },
        //                 {
        //                     role: "user",
        //                     content: `Here's the "user requirement technical specification":
        // ${technicalSpecificationFinal}`,
        //                 },
        //                 {
        //                     role: "user",
        //                     content: `Here's the "example code useSDK":
        // ${zustandPromptEach}`,
        //                 },
        //                 {
        //                     role: "user",
        //                     content: `
        // Instruction:
        // implement react js hooks using zustand store and refer to all the procedures in tech spec
        // create zustand store like this and change accordingly to the technical specfiication:
        // export const useSDK = create((set,get) =>{
        //     return {
        //         currentUser: null,
        //         myAvatars: [],
        //         // [more properties....]
        //     }
        // })
        // let getMyAvatars = async () => {
        //     let client = await getTRPC();
        //     let myAvatars = client.getMyAvatars.mutate({
        //             userID: currentUser.userID
        //     });
        //     useSDK.setState({
        //             myAvatars: myAvatars
        //     });
        // }
        // only use trpc client with mutation calls, like: let client = await getTRPC()
        // if needed, save all resutls to useSDK.setState({key1:value1}) replace "key1", replace "value1" accordingly
        //         `.trim(),
        //                 },
        //             ];
        //             ///////////////////////////////////////////////////////////////////////////////////
        //             // Generate Function Output
        //             ///////////////////////////////////////////////////////////////////////////////////
        //             const request: webllm.ChatCompletionRequest = {
        //                 stream: true,
        //                 stream_options: { include_usage: true },
        //                 messages: messages,
        //                 temperature: 0.0,
        //                 seed: 1,
        //                 max_tokens: 4096,
        //             };
        //             await WebLLMAppClient.llmRequestToFileStream({
        //                 engine,
        //                 request,
        //                 path: `/frontend/sdk.js.temp.md`,
        //             });
        //             let modelCode = await WebLLMAppClient.extractFirstCodeBlockContent({
        //                 markdown: await WebLLMAppClient.readFileContent({
        //                     path: `/frontend/sdk.js.temp.md`,
        //                 }),
        //             });
        //             await WebLLMAppClient.removeFileByPath({
        //                 path: `/frontend/sdk.js.temp.md`,
        //             });
        //             await WebLLMAppClient.writeToFile({
        //                 content: modelCode,
        //                 path: `/frontend/sdk.js`,
        //             });
        //             //
        //         }
    },

    createReactComponents: async ({
        engine,
    }: {
        engine: webllm.MLCEngineInterface;
    }) => {
        let studyText = await WebLLMAppClient.readFileContent({
            path: `/study/blueprint.md`,
        });

        const request: webllm.ChatCompletionRequest = {
            stream: true,
            stream_options: { include_usage: true },
            messages: [
                {
                    role: `system`,
                    content: `
${aiPersonality}
`,
                },

                {
                    role: "user",
                    content: `Here's what the requirements are:
${studyText}`,
                },

                {
                    role: `user`,
                    content: `
Your Instruction:
Please generate the json according to json schema.

Please make sure the components are unique.
`,
                },
            ],
            temperature: 0.0,
            response_format: {
                type: "json_object",
                schema: JSON.stringify(
                    z.toJSONSchema(
                        z.object({
                            version: z.literal("2025-08-12---init"),
                            components: z
                                .array(
                                    z.object({
                                        slug: z
                                            .string()
                                            .describe("Component name in slug"),
                                        componentName: z
                                            .string()
                                            .describe("ComponentName"),

                                        // componentDescription: z
                                        //     .string()
                                        //     .describe(
                                        //         "full description of the compon, including the data fields name and data field type",
                                        //     ),
                                    }),
                                )
                                .describe("unique react ui components"),
                        }),
                    ),
                ),
            },
        };

        await WebLLMAppClient.llmRequestToFileStream({
            path: `/study/ui.json`,
            request: request,
            engine,
        });

        const rootObjectComponents =
            await WebLLMAppClient.readFileParseJSONContent({
                path: `/study/ui.json`,
            });

        for (const eachObject of rootObjectComponents.components) {
            //
            {
                let name = eachObject.componentName;

                let messages: any = [
                    {
                        role: `system`,
                        content: `${aiPersonality}
`,
                    },
                    {
                        role: "user",
                        content: `Here's the "user requirement technical specification":
${studyText}
`,
                    },
                    {
                        role: "user",
                        content: `

- Implement "${name}" react component (${name}), only write code, no need comment or explain:

- Include zustand store "useSDK" in header like the following:
import { useSDK } from '/ui/useSDK.js'

- Tailwind css to style the components

- Always use zustand store "useSDK" to call props and backend procedures

- Always use this way to export component:
export { ${name} };
`,
                    },

                    //
                ];

                ///////////////////////////////////////////////////////////////////////////////////
                // Generate Function Output
                ///////////////////////////////////////////////////////////////////////////////////
                const request: webllm.ChatCompletionRequest = {
                    stream: true,
                    stream_options: { include_usage: true },
                    messages: messages,
                    temperature: 0.0,
                    seed: 1,
                    max_tokens: 4096,
                };

                await WebLLMAppClient.llmRequestToFileStream({
                    engine,
                    request,
                    path: `/ui/${name}.js`,
                    needsExtractCode: true,
                });
            }
        }
    },

    createAppRootRouterComponents: async ({ engine }) => {
        {
            let studyText = await WebLLMAppClient.readFileContent({
                path: `/study/blueprint.md`,
            });

            const rootObjectComponents =
                await WebLLMAppClient.readFileParseJSONContent({
                    path: `/study/ui.json`,
                });

            const request: webllm.ChatCompletionRequest = {
                stream: true,
                stream_options: { include_usage: true },
                messages: [
                    {
                        role: `system`,
                        content: `
${aiPersonality}
`,
                    },

                    {
                        role: "user",
                        content: `Here's what the "tech requirements" are:
${studyText}`,
                    },
                    {
                        role: "user",
                        content: `
Here are all the components created:
${JSON.stringify(rootObjectComponents.components)}
                    `,
                    },

                    {
                        role: `user`,
                        content: `
Your Instruction:
- Please build root "App" component for the reactjs app. 
- The "App" component reuses all the components mentioend in above message.
- The "App" component uses "wouter" as a routing library
- The "App" component uses "Hash mode" of wouter like below:

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { Router, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";

import { [ComponentPlaceHolder] } from '/ui/[ComponentPlaceHolder].js'; // Change "[ComponentPlaceHolder]" to other component name
// [...] import the reamining page rotues and their component accordinf to the "tech requirements"

const App = () => (
    <Router hook={useHashLocation}>
        <Route path="/page-route" component={"[ComponentPlaceHolder]"} /> // Change "[ComponentPlaceHolder]" to other component name. "page-route" to right page route

        {/* [...] include more page routes and its components */}
    </Router>
);

export { App };
`,
                    },
                ],
                temperature: 0.0,
            };

            await WebLLMAppClient.llmRequestToFileStream({
                engine,
                request,
                path: `/app-engine/App.js`,
                needsExtractCode: true,
            });
        }
    },

    readFilesFromLocalDB: async () => {
        let files = await appsCode.getItem(useGenAI.getState().appID);
        return files;
    },

    //

    factoryReset: async () => {
        await appsCode.setItem(useGenAI.getState().appID, []);
    },

    //

    readFileObject: async ({
        path = "/manifest/mongoose.json",
        throwError = false,
    }: {
        path: string;
        throwError?: boolean;
    }) => {
        let files = JSON.parse(
            JSON.stringify(useGenAI.getState().files),
        ) as MyFile[];
        let file = files.find((r) => r.path === path);

        if (!file && throwError) {
            throw "not found";
        }

        return file;
    },

    readFileContent: async ({
        path = "/manifest/mongoose.json",
        throwError = false,
    }: {
        path: string;
        throwError?: boolean;
    }) => {
        let files = JSON.parse(
            JSON.stringify(useGenAI.getState().files),
        ) as MyFile[];
        let file = files.find((r) => r.path === path);

        if (!file && throwError) {
            throw "not found";
        }

        return file?.content || "";
    },

    readFileParseJSONContent: async ({
        path = "/manifest/mongoose.json",
        throwError = false,
    }: {
        path: string;
        throwError?: boolean;
    }) => {
        let files = JSON.parse(
            JSON.stringify(useGenAI.getState().files),
        ) as MyFile[];
        let file = files.find((r) => r.path === path);

        if (!file && throwError) {
            throw "not found";
        }

        return JSON.parse(file?.content);
    },

    writeToFile: async ({
        content,
        path,
        persist = true,
        inputSignature = "",
    }: {
        content: string;
        path: string;
        persist?: boolean;
        inputSignature?: string;
    }) => {
        let files = JSON.parse(
            JSON.stringify(useGenAI.getState().files),
        ) as MyFile[];

        let file = files.find((r) => r.path === path);
        if (file) {
            file.content = `${content}`;
            file.updatedAt = new Date().toISOString();
            file.inputSignature = inputSignature;
        } else {
            let newFile = {
                path: path,
                filename: pathUtil.basename(path),
                content: `${content}`,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
                inputSignature: inputSignature,
            };
            console.log(path);
            files.push(newFile);
        }

        useGenAI.setState({
            files: JSON.parse(JSON.stringify(files)) as MyFile[],
        });

        if (persist) {
            await appsCode.setItem(useGenAI.getState().appID, files);
        }
    },

    //

    persistToDisk: async () => {
        let files = JSON.parse(
            JSON.stringify(useGenAI.getState().files),
        ) as MyFile[];

        await appsCode.setItem(useGenAI.getState().appID, files);
    },
    extractAllCodeBlocks: async ({ markdown = "" }: { markdown: string }) => {
        //
        let codeblocks = await new Promise((resolve) => {
            let array: { code: string; language: string }[] = [];
            const md = markdownit.default({
                langPrefix: "language-",
                highlight: (str: string, lang: string) => {
                    console.log("code", str);
                    console.log("lang", lang);

                    array.push({
                        code: str,
                        language: lang,
                    });
                    return "";
                },
            });

            md.render(`${markdown}`);

            resolve(array);
        });

        return codeblocks;
        //
    },

    extractFirstCodeBlockContent: async ({
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
    },

    removeFileByPath: async ({ path }: { path: string }) => {
        if (path) {
            let files = JSON.parse(
                JSON.stringify(useGenAI.getState().files),
            ) as MyFile[];

            files = files.filter((r) => {
                return r.path !== path;
            });

            useGenAI.setState({
                files: JSON.parse(JSON.stringify(files)) as MyFile[],
            });

            await appsCode.setItem(useGenAI.getState().appID, files);
        }
    },

    llmRequestToFileStream: async ({
        path = "/manifest/mongoose.json",
        request,
        engine,
        needsExtractCode = false,
    }: {
        path: string;
        needsExtractCode?: boolean;
        request: webllm.ChatCompletionRequestStreaming;
        engine: webllm.MLCEngineInterface;
    }) => {
        useGenAI.setState({ llmStatus: "writing" });

        let fileObject = await WebLLMAppClient.readFileObject({ path });

        if (fileObject) {
            let nowHash = `${md5(JSON.stringify({ request, content: fileObject.content }))}`;
            if (nowHash === fileObject.inputSignature) {
                return;
            }
        }

        await engine.resetChat();
        const asyncChunkGenerator = await engine.chatCompletion(request);

        let messageFragments = "";
        let i = 0;
        for await (const chunk of asyncChunkGenerator) {
            i++;

            let str = chunk.choices[0]?.delta?.content || "";
            messageFragments += str;

            await WebLLMAppClient.writeToFile({
                content: messageFragments,
                path: path,
                persist: false,
            });

            await new Promise((resovle) => {
                requestAnimationFrame(() => {
                    resovle(null);
                });
            });
        }

        if (pathUtil.extname(path) === ".js" && !needsExtractCode) {
            console.log("did you forget to set needsExtractCode to true ??");
        }
        if (needsExtractCode) {
            messageFragments =
                await WebLLMAppClient.extractFirstCodeBlockContent({
                    markdown: messageFragments,
                });
        }

        await WebLLMAppClient.writeToFile({
            content: messageFragments,
            path: path,
            inputSignature:
                useGenAI.getState().llmStatus === "writing"
                    ? `${md5(JSON.stringify({ request, content: messageFragments }))}`
                    : `${Math.random()}`,

            persist: true,
        });
    },
    ["resetApp"]: async () => {
        await WebLLMAppClient.factoryReset();
        useGenAI.setState({
            files: [],
        });
    },
};

/*

        if (request && path && fistblock) {
            await WebLLMAppClient.writeToFile({
                content: fistblock,
                path: path,
                inputSignature:
                    useGenAI.getState().llmStatus === "writing"
                        ? `${md5(JSON.stringify({ request, content: fistblock }))}`
                        : `${Math.random()}`,

                persist: true,
            });
        }
            
*/
