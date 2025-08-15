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

// @ts-ignore
// import { unified } from "unified";
// import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
// import remarkMan from "remark-man";
//

const appsCode = createInstance({
    name: "apps_code",
});

const aiPersonality = `AI Role: 

You are an AI Coding Agent with following description:

- You are a senior fullstack developer. 
- You love helping user to code things.
- You are Joyful and Wise. 
- You love short and sweet sentences and clear and insightful code comments.`;

//

// if (process.env.NODE_ENV === "development") {
//     if (typeof window !== "undefined") {
//         appsCode.setItem(useGenAI.getState().appID, []);
//     }
// }

//

export const WebLLMAppClient = {
    ["resetApp"]: async () => {
        await WebLLMAppClient.factoryReset();
        useGenAI.setState({
            files: [],
        });
    },
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
                useGenAI.setState({
                    stopFunc: () => {},
                });

                engine?.interruptGenerate();

                useGenAI.setState({ llmStatus: "init" });

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

        await WebLLMAppClient.studyRequirements({
            userPrompt: userPrompt,
            engine,
        });

        // await WebLLMAppClient.createMongooseFromSpec({
        //     engine,
        // });

        // await WebLLMAppClient.createBackendProcedures({
        //     engine,
        // });

        // await WebLLMAppClient.createFrontEndSDK({
        //     engine,
        // });

        await WebLLMAppClient.createReactComponents({
            engine,
        });

        useGenAI.getState().stopFunc();
    },
    ///////////////////////////////////////////////////////////////////////////////////
    // buildApp
    ///////////////////////////////////////////////////////////////////////////////////

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
        //

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

            await WebLLMAppClient.llmRequestToFileStream({
                path: `/app/study.md`,
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
            path: `/app/study.md`,
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
Please generate the database collection information.
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
                                    z.object({
                                        slug: z.string(),
                                        tableName: z.string(),
                                        // tableDescription: z
                                        //     .string()
                                        //     .describe(
                                        //         "full description of the table, including the data fields name and data field type",
                                        //     ),
                                        // dataFields: z.array(
                                        //     z.object({
                                        //         name: z.string(),
                                        //         type: z
                                        //             .string()
                                        //             .describe(
                                        //                 "mongoose data type compatible",
                                        //             ),
                                        //     }),
                                        // ),
                                    }),
                                )
                                .describe("mongoose database tables"),
                        }),
                    ),
                ),
            },
        };

        await WebLLMAppClient.llmRequestToFileStream({
            path: `/app/database.json`,
            request: request,
            engine,
        });
        let rootObject = await WebLLMAppClient.readFileParseJSONContent({
            path: `/app/database.json`,
        });

        for (let eachObject of rootObject.mongoose) {
            //
            {
                let slug = eachObject.slug;
                let eachText = JSON.stringify(eachObject);

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
Here's the mongoose database definiton:
${studyText}

Please only implement "${slug}" collection (${eachObject.tableName}) only:
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
                    path: `/models/${slug}.js.temp.md`,
                });

                let modelCode =
                    await WebLLMAppClient.extractFirstCodeBlockContent({
                        markdown: await WebLLMAppClient.readFileContent({
                            path: `/models/${slug}.js.temp.md`,
                        }),
                    });

                await WebLLMAppClient.removeFileByPath({
                    path: `/models/${slug}.js.temp.md`,
                });

                await WebLLMAppClient.writeToFile({
                    content: modelCode,
                    path: `/models/${slug}.js`,
                });
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // createBackendProcedures
    ///////////////////////////////////////////////////////////////////////////////////
    [`createBackendProcedures`]: async ({
        engine,
    }: {
        engine: webllm.MLCEngineInterface;
    }) => {
        let ns = {
            draft: "createBackendProceduresDraft",
            ok: "createBackendProceduresFinal",
        };
        useGenAI.setState({ [ns.draft]: " " });

        // @ts-ignore
        let trpcPromptEach = await import("../prompts/trpcPromptEach.md").then(
            (r) => r.default,
        );

        let mongooseText = await WebLLMAppClient.readFileContent({
            path: `/manifest/mongoose.json`,
        });

        let proceduresText = await WebLLMAppClient.readFileContent({
            path: `/manifest/procedures.json`,
        });

        console.log(proceduresText);

        let proceduresList = JSON.parse(proceduresText.trim()).procedures;

        console.log(proceduresList);

        for (let procedureDef of proceduresList) {
            //
            {
                let slug = procedureDef?.slug;

                let procedureJSONString = JSON.stringify(procedureDef);
                console.log(procedureJSONString);

                let technicalSpecificationFinal = `
${mongooseText}
${procedureJSONString}
        `;

                let messages: any = [
                    {
                        role: `system`,
                        content: `
${aiPersonality}
`,
                    },

                    {
                        role: "user",
                        content: `Here's the "user requirement technical specification":
${technicalSpecificationFinal}`,
                    },

                    {
                        role: "user",
                        content: `Here's the "example code":
${trpcPromptEach}`.trim(),
                    },

                    {
                        role: "user",
                        content: `
Instruction:

Implement code inside the "example code" according to the "user requirement technical specification" that user has provided above.

- only use mutation for procedure

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
                    path: `/backend/${slug}.js.temp.md`,
                });

                let modelCode =
                    await WebLLMAppClient.extractFirstCodeBlockContent({
                        markdown: await WebLLMAppClient.readFileContent({
                            path: `/backend/${slug}.js.temp.md`,
                        }),
                    });

                await WebLLMAppClient.removeFileByPath({
                    path: `/backend/${slug}.js.temp.md`,
                });

                await WebLLMAppClient.writeToFile({
                    content: modelCode,
                    path: `/backend/${slug}.js`,
                });

                //
            }
        }
    },

    ///////////////////////////////////////////////////////////////////////////////////
    // createFrontEndSDK
    ///////////////////////////////////////////////////////////////////////////////////
    [`createFrontEndSDK`]: async ({
        engine,
    }: {
        engine: webllm.MLCEngineInterface;
    }) => {
        let ns = {
            draft: "createFrontEndSDKDraft",
            ok: "createFrontEndSDKFinal",
        };
        useGenAI.setState({ [ns.draft]: " " });

        let zustandPromptEach = await import(
            // @ts-ignore
            "../prompts/zustandPromptEach.md"
        ).then((r) => r.default);

        let mongooseText = await WebLLMAppClient.readFileContent({
            path: `/manifest/mongoose.json`,
        });

        let proceduresText = await WebLLMAppClient.readFileContent({
            path: `/manifest/procedures.json`,
        });

        let proceduresList = JSON.parse(proceduresText.trim()).procedures;

        console.log(proceduresList);

        //
        {
            let technicalSpecificationFinal = `
${mongooseText}
${proceduresText}
        `;

            let messages: any = [
                {
                    role: `system`,
                    content: `
${aiPersonality}
`,
                },

                {
                    role: "user",
                    content: `Here's the "user requirement technical specification":
${technicalSpecificationFinal}`,
                },

                {
                    role: "user",
                    content: `Here's the "example code useFrontEnd":
${zustandPromptEach}`,
                },
                {
                    role: "user",
                    content: `
Instruction:

implement react js hooks using zustand store and refer to all the procedures in tech spec

create zustand store like this and change accordingly to the technical specfiication: 

export const useFrontEnd = create((set,get) =>{
    return {
        currentUser: null,
        myAvatars: [],
        // [more properties....]
    }
})

let getMyAvatars = async () => {
    let client = await getTRPC();
    let myAvatars = client.getMyAvatars.mutate({
            userID: currentUser.userID
    });
    useFrontEnd.setState({
            myAvatars: myAvatars
    });
}

only use trpc client with mutation calls, like: let client = await getTRPC()

if needed, save all resutls to useFrontendStore.setState({key1:value1}) replace "key1", replace "value1" accordingly
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
                seed: 1,
                max_tokens: 4096,
            };

            await WebLLMAppClient.llmRequestToFileStream({
                engine,
                request,
                path: `/frontend/sdk.js.temp.md`,
            });

            let modelCode = await WebLLMAppClient.extractFirstCodeBlockContent({
                markdown: await WebLLMAppClient.readFileContent({
                    path: `/frontend/sdk.js.temp.md`,
                }),
            });

            await WebLLMAppClient.removeFileByPath({
                path: `/frontend/sdk.js.temp.md`,
            });

            await WebLLMAppClient.writeToFile({
                content: modelCode,
                path: `/frontend/sdk.js`,
            });

            //
        }
    },

    createReactComponents: async ({
        engine,
    }: {
        engine: webllm.MLCEngineInterface;
    }) => {
        // let files: any[] =
        //     (await WebLLMAppClient.readFilesFromLocalDB()) as any[];

        // let others = files.filter((r) => r.path.includes("/zustand/"));

        let studyText = await WebLLMAppClient.readFileContent({
            path: `/app/study.md`,
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
                                        slug: z.string(),
                                        componentName: z.string(),

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
            path: `/app/components.json`,
            request: request,
            engine,
        });

        const rootObjectComponents =
            await WebLLMAppClient.readFileParseJSONContent({
                path: `/app/components.json`,
            });

        for (const eachObject of rootObjectComponents.components) {
            //
            {
                // let reactSystemPrompt = await import(
                //     // @ts-ignore
                //     "../prompts/reactSystemPrompt.md"
                // ).then((r) => r.default);

                let slug = eachObject?.slug;

                // let componentJSONString = JSON.stringify(eachObject);

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

                    // ${reactSystemPrompt}

                    {
                        role: "user",
                        content: `

- Implement "${slug}" react component (${eachObject.componentName}), only write code, no need comment or explain:

- Include zustand store "useFrontEnd" in header like the following:
import { useFrontEnd } from '/ui/useFrontEnd.js'

- Tailwind css to style the components

- Always use zustand store "useFrontEnd" to call props and backend procedures

- Always use this way to export component:
export { ${eachObject.componentName} };
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
                    path: `/ui/${slug}.js.temp.md`,
                });

                let modelCode =
                    await WebLLMAppClient.extractFirstCodeBlockContent({
                        markdown: await WebLLMAppClient.readFileContent({
                            path: `/ui/${slug}.js.temp.md`,
                        }),
                    });

                await WebLLMAppClient.removeFileByPath({
                    path: `/ui/${slug}.js.temp.md`,
                });

                await WebLLMAppClient.writeToFile({
                    content: modelCode,
                    path: `/ui/${slug}.js`,
                });
            }
        }

        {
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

import { Router, Route } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import PlatformAdminLoginComponent from '/ui/PlatformAdminLoginComponent'; // please follow the base path of "/ui/...." 
import PastorDashboardComponent from '/ui/PastorDashboardComponent'; // please follow the base path of "/ui/...." 

const App = () => (
    <Router hook={useHashLocation}>
        <Route path="/login" component={PlatformAdminLoginComponent} />
        <Route path="/pastor/dashboard" component={PastorDashboardComponent} />
        <Route path="/public-web-app" component={() => <h1>Public Web App</h1>} />
        <Route path="/user-profile" component={() => <h1>User Profile</h1>} />
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
                path: `/app-engine/App.js.temp.md`,
            });

            let modelCode = await WebLLMAppClient.extractFirstCodeBlockContent({
                markdown: await WebLLMAppClient.readFileContent({
                    path: `/app-engine/App.js.temp.md`,
                }),
            });

            await WebLLMAppClient.removeFileByPath({
                path: `/app-engine/App.js.temp.md`,
            });

            await WebLLMAppClient.writeToFile({
                content: modelCode,
                path: `/app-engine/App.js`,
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
    }: {
        content: string;
        path: string;
        persist?: boolean;
    }) => {
        let files = JSON.parse(
            JSON.stringify(useGenAI.getState().files),
        ) as MyFile[];

        let file = files.find((r) => r.path === path);
        if (file) {
            file.content = `${content}`;
            file.updatedAt = new Date().toISOString();
        } else {
            let newFile = {
                path: path,
                filename: pathUtil.basename(path),
                content: `${content}`,
                updatedAt: new Date().toISOString(),
                createdAt: new Date().toISOString(),
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
    }: {
        path: string;
        request: webllm.ChatCompletionRequestStreaming;
        engine: webllm.MLCEngineInterface;
    }) => {
        useGenAI.setState({ llmStatus: "writing" });
        await engine.resetChat();
        const asyncChunkGenerator = await engine.chatCompletion(request);

        let messageFragments = "";
        let i = 0;
        for await (const chunk of asyncChunkGenerator) {
            i++;

            let str = chunk.choices[0]?.delta?.content || "";

            let arr = str.split("");

            for (let frag of arr) {
                messageFragments += frag;

                await WebLLMAppClient.writeToFile({
                    content: messageFragments,
                    path: path,
                    persist: false,
                });

                await new Promise((resovle) => {
                    requestAnimationFrame(resovle);
                });
            }
        }

        //

        await WebLLMAppClient.writeToFile({
            content: messageFragments,
            path: path,
            persist: true,
        });
    },
};
