"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { hasModelInCache } from "@mlc-ai/web-llm";
import { EngineData, useGenAI } from "../../useGenAI";
// import { z } from "zod";

// import * as markdownit from "markdown-it";
// import * as pathUtil from "path";
// import { createInstance } from "localforage";
// import md5 from "md5";
// import { newUnifiedDiffStrategyService } from "diff-apply";
//

import { genFeatrues } from "../llmCalls/calls/genFeatrues";
import { makeEngineAPI } from "../llmCalls/common/makeEngineAPI";
import {
    provideFreeEngineSlot,
    returnFreeEngineSlot,
} from "../llmCalls/common/provideFreeEngineSlot";
import { toast } from "sonner";
// import { genTRPCProcedure } from "../llmCalls/calls/genTRPCProcedure";
import { genReactComponentTree } from "../llmCalls/calls/genReactComponentTree";
import { genMongoDatabase } from "../llmCalls/calls/genMongoDatabase";
import { readFileContent } from "../llmCalls/common/readFileContent";

//
// import { systemPromptPureText } from "../llmCalls/persona/systemPromptPureText";
// import { appsCode } from "../llmCalls/common/appsCode";

// @ts-ignore
// import { unified } from "unified";
// import remarkParse from "remark-parse";
// import remarkRehype from "remark-rehype";
// import remarkMan from "remark-man";

let apiMap: Map<
    string,
    {
        //
        destroy: () => void;
        slot: EngineData;
        engine: webllm.MLCEngineInterface;
    }
> = new Map();

export const WebLLMAppClient = {
    [`abortProcess`]: async () => {
        //

        useGenAI.getState().stopFunc();

        //
    },
    ///////////////////////////////////////////////////////////////////////////////////
    // buildApp
    ///////////////////////////////////////////////////////////////////////////////////
    [`buildApp`]: async ({ userPrompt }: { userPrompt: string }) => {
        useGenAI.setState({
            stopFunc: async () => {
                try {
                    for await (let [key, val] of apiMap.entries()) {
                        console.log("destroy", key);
                        await val.destroy();
                        val.slot.lockedBy = "";
                        val.slot.llmStatus = "idle";
                        val.slot.bannerText = "";
                    }
                    apiMap.clear();
                    useGenAI.setState({
                        engines: JSON.parse(
                            JSON.stringify(useGenAI.getState().engines),
                        ),
                        lockInWorkers: false,
                        stopFunc: () => {},
                    });
                } finally {
                }
            },
        });

        useGenAI.setState({ lockInWorkers: true });

        let enabledEngines = useGenAI
            .getState() //
            .engines //
            .filter((r) => r.enabled);

        // console.log(enabledEngines.map((r) => r.name));

        toast("Starting Engine", {
            description: (
                <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4">
                    <code className="text-white">
                        {enabledEngines
                            .map((r) => `${r.displayName}`)
                            .join("\n")}
                    </code>
                </pre>
            ),
        });

        for (let slot of enabledEngines) {
            let has = await hasModelInCache(slot.currentModel);
            if (has) {
                continue;
            } else {
                let api = await makeEngineAPI({ name: slot.name });
                apiMap.set(slot.name, api);
            }
        }

        await Promise.all(
            enabledEngines.map((slot) => {
                return new Promise(async (resolve) => {
                    try {
                        if (apiMap.has(slot.name)) {
                            let api = apiMap.get(slot.name);
                            resolve(api);
                            return;
                        }

                        let api = await makeEngineAPI({ name: slot.name });
                        apiMap.set(slot.name, api);
                        resolve(api);
                    } catch (e) {
                        console.log(e);
                    }
                });
            }),
        );

        //
        try {
            let manager = {
                addTask: ({
                    displayName = "",
                    name = "name",
                    needs = null,
                    func = async ({ slot, engine }) => {},
                }) => {
                    tasks.push({
                        name: `${name}`,
                        status: "waiting",
                        needs: needs || [],
                        displayName: displayName || name,
                        func: async ({ slot }) => {
                            // let slot = await provideFreeEngineSlot({
                            //     name: `${name}`,
                            // });

                            await func({
                                slot,
                                engine: apiMap.get(slot.name).engine,
                            });

                            // await returnFreeEngineSlot({ slot: slot });
                        },
                    });
                },
            };

            let tasks = [
                {
                    displayName: "User Requirement Specifcation",
                    name: "genFeatrues",
                    status: "waiting",
                    needs: [],
                    func: async ({ slot }) => {
                        await genFeatrues({
                            slot: slot,
                            userPrompt,
                            engine: apiMap.get(slot.name).engine,
                        });
                    },
                },

                {
                    displayName: "React Components",
                    name: "genReactComponentTree",
                    status: "waiting",
                    needs: ["genFeatrues"],
                    func: async ({ slot }) => {
                        await genReactComponentTree({
                            manager: manager,
                            slot: slot,
                            userPrompt: userPrompt,
                            featuresText: await readFileContent({
                                path: `/docs/genFeatrues.md`,
                            }),
                            engine: apiMap.get(slot.name).engine,
                        });
                    },
                },

                {
                    displayName: "MongoDB and Mongoose",
                    name: "genMongoDatabase",
                    status: "waiting",
                    needs: ["genFeatrues"],
                    func: async ({ slot }) => {
                        // let slot = await provideFreeEngineSlot({
                        //     name: "genMongoDatabase",
                        // });

                        await genMongoDatabase({
                            manager: manager,
                            slot: slot,
                            userPrompt: userPrompt,
                            featuresText: await readFileContent({
                                path: `/docs/genFeatrues.md`,
                            }),
                            engine: apiMap.get(slot.name).engine,
                        });

                        // await returnFreeEngineSlot({ slot: slot });
                    },
                },

                // {
                //     name: "genReactComponentTree",
                //     status: "waiting",
                //     needs: ["genFeatrues"],
                //     func: async () => {
                //         let slot = await provideFreeEngineSlot({
                //             name: "genReactComponentTree",
                //         });

                //         await genReactComponentTree({
                //             slot: slot,
                //             userPrompt: userPrompt,
                //             featuresText: await readFileContent({
                //                 path: `/docs/genFeatrues.md`,
                //             }),
                //             engine: apiMap.get(slot.name).engine,
                //         });
                //         await returnFreeEngineSlot({ slot: slot });
                //     },
                // },

                // {
                //     name: "genTRPCProcedure",
                //     status: "waiting",
                //     needs: ["genReactComponentTree"],
                //     func: async () => {
                //         let slot = await provideFreeEngineSlot({
                //             name: "genTRPCProcedure",
                //         });

                //         await genTRPCProcedure({
                //             slot: slot,
                //             userPrompt: userPrompt,
                //             reactComponentsText: await readFileContent({
                //                 path: `/docs/genReactComponentTree.md`,
                //             }),
                //             engine: apiMap.get(slot.name).engine,
                //         });
                //         await returnFreeEngineSlot({ slot: slot });
                //     },
                // },
            ];

            await (async () => {
                let tryTrigger = async () => {
                    let engines = useGenAI
                        .getState()
                        .engines.filter((r) => r.enabled && r.lockedBy === "");

                    if (engines.length > 0) {
                        let first = tasks.filter((tsk) => {
                            return tsk.status === "waiting";
                        })[0];

                        if (!first) {
                            return;
                        }

                        let dependenciesCount = first.needs.length;

                        let allCompleted =
                            first?.needs
                                .map((eachDep) => {
                                    let thisTask = tasks.find((tsk) => {
                                        return tsk.name === eachDep;
                                    });
                                    return thisTask?.status === "done";
                                })
                                .filter((r) => r).length === dependenciesCount;

                        if (first && allCompleted) {
                            if (first) {
                                first.status = "working";

                                toast("Begin Writing File", {
                                    description: (
                                        <pre className="mt-2 w-[320px] rounded-md bg-neutral-950 p-4 text-white">
                                            {`🧑🏻‍💻`} {first.displayName}
                                        </pre>
                                    ),
                                });

                                let slot = await provideFreeEngineSlot({
                                    name: first.name,
                                });

                                first.func({ slot }).then(async () => {
                                    await returnFreeEngineSlot({ slot: slot });
                                    setTimeout(() => {
                                        first.status = "done";
                                    });
                                });
                            }
                        }
                    }
                };

                //

                let tt = setInterval(() => {
                    if (tasks.filter((r) => r.status !== "done").length === 0) {
                        clearInterval(tt);
                        return;
                    }
                    tryTrigger();
                }, 250);

                await new Promise((resolve) => {
                    let ts = setInterval(() => {
                        let doneList = tasks.filter((r) => r.status === "done");
                        if (doneList.length === tasks.length) {
                            clearInterval(ts);
                            WebLLMAppClient.abortProcess();
                            resolve(null);
                        }
                    });
                });
            })();

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
            //
            //
        }
    },
    ///////////////////////////////////////////////////////////////////////////////////
    // buildApp
    ///////////////////////////////////////////////////////////////////////////////////

    //     ///////////////////////////////////////////////////////////////////////////////////
    //     // elaborateSpec
    //     ///////////////////////////////////////////////////////////////////////////////////
    //     [`studyRequirements`]: async ({
    //         userPrompt,
    //         engine,
    //     }: {
    //         engine: webllm.MLCEngineInterface;
    //         userPrompt: string;
    //     }) => {
    //         {
    //             ///////////////////////////////////////////////////////////////////////////////////
    //             // manifest
    //             ///////////////////////////////////////////////////////////////////////////////////
    //             let messages: any = [
    //                 {
    //                     role: `system`,
    //                     content: `${systemPromptPureText}`,
    //                 },
    //                 {
    //                     role: "user",
    //                     content: `Here's what the user want to build for the latest features:
    // ${userPrompt}`,
    //                 },

    //                 {
    //                     role: `user`,
    //                     content: `
    // Your Instruction:

    // - Please improve the user requirements using markdown foramt
    // - List out all the database table and data field needed
    // - List out all the screen names needed by the app and their page route (pathname with params)
    // - List out all the backend procedure needed by the screens

    // `,
    //                 },
    //             ];

    //             const request: webllm.ChatCompletionRequestStreaming = {
    //                 seed: 0,
    //                 stream: true,
    //                 stream_options: { include_usage: true },
    //                 messages: messages,
    //                 temperature: 0.0,
    //             };

    //             let path = `/docs/blueprint.md`;

    //             await WebLLMAppClient.llmRequestToFileStream({
    //                 path: path,
    //                 request: request,
    //                 engine,
    //             });

    //             ///////////////////////////////////////////////////////////////////////////////////
    //             // usecase
    //             ///////////////////////////////////////////////////////////////////////////////////
    //         }

    //         ///////////////////////////////////////////////////////////////////////////////////
    //         // Generate Function Output
    //         ///////////////////////////////////////////////////////////////////////////////////
    //     },

    //     ///////////////////////////////////////////////////////////////////////////////////
    //     // createMongooseFromSpec
    //     ///////////////////////////////////////////////////////////////////////////////////
    //     [`createMongooseFromSpec`]: async ({
    //         engine,
    //     }: {
    //         engine: webllm.MLCEngineInterface;
    //     }) => {
    //         let mongoosePromptEach = await import(
    //             // @ts-ignore
    //             "../prompts/mongoosePromptEach.md"
    //         ).then((r) => r.default);

    //         let studyText = await WebLLMAppClient.readFileContent({
    //             path: `/docs/blueprint.md`,
    //         });

    //         const request: webllm.ChatCompletionRequestStreaming = {
    //             seed: 0,
    //             stream: true,
    //             stream_options: { include_usage: true },
    //             messages: [
    //                 {
    //                     role: `system`,
    //                     content: `
    // ${systemPromptPureText}
    // `,
    //                 },

    //                 {
    //                     role: "user",
    //                     content: `Here's what the requirements are:
    // ${studyText}`,
    //                 },

    //                 {
    //                     role: `user`,
    //                     content: `
    // Your Instruction:
    // Please generate the mongoose database collection information.
    // `,
    //                 },
    //             ],
    //             temperature: 0.0,
    //             response_format: {
    //                 type: "json_object",
    //                 schema: JSON.stringify(
    //                     z.toJSONSchema(
    //                         z.object({
    //                             version: z.literal("2025-08-12---init"),
    //                             mongoose: z
    //                                 .array(
    //                                     z
    //                                         .object({
    //                                             modelName: z.string(),
    //                                         })
    //                                         .describe(
    //                                             "each mongoose database collection",
    //                                         ),
    //                                 )
    //                                 .describe("mongoose database collections"),
    //                         }),
    //                     ),
    //                 ),
    //             },
    //         };

    //         await WebLLMAppClient.llmRequestToFileStream({
    //             path: `/docs/database.json`,
    //             request: request,
    //             engine,
    //         });

    //         let rootObject = await WebLLMAppClient.readFileParseJSONContent({
    //             path: `/docs/database.json`,
    //         });

    //         console.log(rootObject);

    //         for (let eachObject of rootObject.mongoose) {
    //             //
    //             {
    //                 let modelName = eachObject.modelName;

    //                 let messages: any = [
    //                     {
    //                         role: `system`,
    //                         content: `${systemPromptPureText}`,
    //                     },
    //                     {
    //                         role: `user`,
    //                         content: `
    // Your Instruction:

    // 1. Implement to fullfill the full user requirements.
    // 2. Avoid Using Preserved Keyworads in Javascript as Model names. such as Map, WeakMap, Proxy, etc...
    // 3. only need 1 function
    // `,
    //                     },
    //                     {
    //                         role: "user",
    //                         content: `Here's the existing code as reference:
    // ${mongoosePromptEach}
    //                     `,
    //                     },
    //                     {
    //                         role: "user",
    //                         content: `
    // Here's the overall and mongoose database definiton:
    // ${studyText}

    // Please only implement "${modelName}" (${eachObject.modelName}) collection only:
    // `.trim(),
    //                     },
    //                 ];

    //                 ///////////////////////////////////////////////////////////////////////////////////
    //                 // Generate Function Output
    //                 ///////////////////////////////////////////////////////////////////////////////////
    //                 const request: webllm.ChatCompletionRequestStreaming = {
    //                     seed: 0,
    //                     stream: true,
    //                     stream_options: { include_usage: true },
    //                     messages: messages,
    //                     temperature: 0.0,
    //                     max_tokens: 4096,
    //                 };

    //                 await WebLLMAppClient.llmRequestToFileStream({
    //                     engine,
    //                     request,
    //                     path: `/models/${eachObject.modelName}.js`,
    //                     needsExtractCode: true,
    //                 });

    //                 console.log("modelName", eachObject.modelName);
    //             }
    //         }

    //         /////////
    //         /////////
    //         /////////
    //         /////////

    //         let content = "";

    //         for (let eachObject of rootObject.mongoose) {
    //             let modelName = eachObject.modelName;
    //             content += `
    // await import(${JSON.stringify(`/models/${modelName}.js`)}).then(async ({ defineOneModel }) => {
    //     return await defineOneModel({ db, output, bcrypt });
    // })
    // `;
    //         }

    //         let finalContent = `

    // async function loadModels({ bcrypt }) {
    //     const db = mongoose.connection.useDb(${JSON.stringify(`app_${useGlobalAI.getState().appID}`)}, { useCache: true });

    //     const output = {};

    //     ${content}

    //     return output;
    // }

    // export { loadModels }

    //         `;

    //         await WebLLMAppClient.writeToFile({
    //             content: `${finalContent}`,
    //             path: `/database/all.js`,
    //         });
    //     },

    //     ///////////////////////////////////////////////////////////////////////////////////
    //     // createBackendProcedures
    //     ///////////////////////////////////////////////////////////////////////////////////
    //     [`createBackendProcedures`]: async ({
    //         engine,
    //     }: {
    //         engine: webllm.MLCEngineInterface;
    //     }) => {
    //         //         let ns = {
    //         //             draft: "createBackendProceduresDraft",
    //         //             ok: "createBackendProceduresFinal",
    //         //         };
    //         //         useGlobalAI.setState({ [ns.draft]: " " });
    //         //         // @ts-ignore
    //         //         let trpcPromptEach = await import("../prompts/trpcPromptEach.md").then(
    //         //             (r) => r.default,
    //         //         );
    //         //         let mongooseText = await WebLLMAppClient.readFileContent({
    //         //             path: `/docs/mongoose.json`,
    //         //         });
    //         //         let proceduresText = await WebLLMAppClient.readFileContent({
    //         //             path: `/docs/procedures.json`,
    //         //         });
    //         //         console.log(proceduresText);
    //         //         let proceduresList = JSON.parse(proceduresText.trim()).procedures;
    //         //         console.log(proceduresList);
    //         //         for (let procedureDef of proceduresList) {
    //         //             //
    //         //             {
    //         //                 let slug = procedureDef?.slug;
    //         //                 let procedureJSONString = JSON.stringify(procedureDef);
    //         //                 console.log(procedureJSONString);
    //         //                 let technicalSpecificationFinal = `
    //         // ${mongooseText}
    //         // ${procedureJSONString}
    //         //         `;
    //         //                 let messages: any = [
    //         //                     {
    //         //                         role: `system`,
    //         //                         content: `
    //         // ${systemPromptPureText}
    //         // `,
    //         //                     },
    //         //                     {
    //         //                         role: "user",
    //         //                         content: `Here's the "user requirement technical specification":
    //         // ${technicalSpecificationFinal}`,
    //         //                     },
    //         //                     {
    //         //                         role: "user",
    //         //                         content: `Here's the "example code":
    //         // ${trpcPromptEach}`.trim(),
    //         //                     },
    //         //                     {
    //         //                         role: "user",
    //         //                         content: `
    //         // Instruction:
    //         // Implement code inside the "example code" according to the "user requirement technical specification" that user has provided above.
    //         // - only use mutation for procedure
    //         //         `.trim(),
    //         //                     },
    //         //                 ];
    //         //                 ///////////////////////////////////////////////////////////////////////////////////
    //         //                 // Generate Function Output
    //         //                 ///////////////////////////////////////////////////////////////////////////////////
    //         // const request: webllm.ChatCompletionRequestStreaming = {
    //         // seed: 0,
    //         // stream: true,
    //         //                     stream_options: { include_usage: true },
    //         //                     messages: messages,
    //         //                     temperature: 0.0,
    //         //                     max_tokens: 4096,
    //         //                 };
    //         //                 await WebLLMAppClient.llmRequestToFileStream({
    //         //                     engine,
    //         //                     request,
    //         //                     path: `/api/${slug}.js.temp.md`,
    //         //                 });
    //         //                 let modelCode =
    //         //                     await WebLLMAppClient.extractFirstCodeBlockContent({
    //         //                         markdown: await WebLLMAppClient.readFileContent({
    //         //                             path: `/api/${slug}.js.temp.md`,
    //         //                         }),
    //         //                     });
    //         //                 await WebLLMAppClient.removeFileByPath({
    //         //                     path: `/api/${slug}.js.temp.md`,
    //         //                 });
    //         //                 await WebLLMAppClient.writeToFile({
    //         //                     content: modelCode,
    //         //                     path: `/api/${slug}.js`,
    //         //                 });
    //         //                 //
    //         //             }
    //         //         }
    //     },

    //     ///////////////////////////////////////////////////////////////////////////////////
    //     // createFrontEndSDK
    //     ///////////////////////////////////////////////////////////////////////////////////
    //     [`createFrontEndSDK`]: async ({
    //         engine,
    //     }: {
    //         engine: webllm.MLCEngineInterface;
    //     }) => {
    //         //         let zustandPromptEach = await import(
    //         //             // @ts-ignore
    //         //             "../prompts/zustandPromptEach.md"
    //         //         ).then((r) => r.default);
    //         //         let mongooseText = await WebLLMAppClient.readFileContent({
    //         //             path: `/manifest/mongoose.json`,
    //         //         });
    //         //         let proceduresText = await WebLLMAppClient.readFileContent({
    //         //             path: `/manifest/procedures.json`,
    //         //         });
    //         //         let proceduresList = JSON.parse(proceduresText.trim()).procedures;
    //         //         //
    //         //         console.log(proceduresList);
    //         //         //
    //         //         {
    //         //             let technicalSpecificationFinal = `
    //         // ${mongooseText}
    //         // ${proceduresText}
    //         //         `;
    //         //             let messages: any = [
    //         //                 {
    //         //                     role: `system`,
    //         //                     content: `
    //         // ${systemPromptPureText}
    //         // `,
    //         //                 },
    //         //                 {
    //         //                     role: "user",
    //         //                     content: `Here's the "user requirement technical specification":
    //         // ${technicalSpecificationFinal}`,
    //         //                 },
    //         //                 {
    //         //                     role: "user",
    //         //                     content: `Here's the "example code useSDK":
    //         // ${zustandPromptEach}`,
    //         //                 },
    //         //                 {
    //         //                     role: "user",
    //         //                     content: `
    //         // Instruction:
    //         // implement react js hooks using zustand store and refer to all the procedures in tech spec
    //         // create zustand store like this and change accordingly to the technical specfiication:
    //         // export const useSDK = create((set,get) =>{
    //         //     return {
    //         //         currentUser: null,
    //         //         myAvatars: [],
    //         //         // [more properties....]
    //         //     }
    //         // })
    //         // let getMyAvatars = async () => {
    //         //     let client = await getTRPC();
    //         //     let myAvatars = client.getMyAvatars.mutate({
    //         //             userID: currentUser.userID
    //         //     });
    //         //     useSDK.setState({
    //         //             myAvatars: myAvatars
    //         //     });
    //         // }
    //         // only use trpc client with mutation calls, like: let client = await getTRPC()
    //         // if needed, save all resutls to useSDK.setState({key1:value1}) replace "key1", replace "value1" accordingly
    //         //         `.trim(),
    //         //                 },
    //         //             ];
    //         //             ///////////////////////////////////////////////////////////////////////////////////
    //         //             // Generate Function Output
    //         //             ///////////////////////////////////////////////////////////////////////////////////
    //         // const request: webllm.ChatCompletionRequestStreaming = {
    //         //     seed: 0,
    //         //                 stream: true,
    //         //                 stream_options: { include_usage: true },
    //         //                 messages: messages,
    //         //                 temperature: 0.0,
    //         //                 seed: 1,
    //         //                 max_tokens: 4096,
    //         //             };
    //         //             await WebLLMAppClient.llmRequestToFileStream({
    //         //                 engine,
    //         //                 request,
    //         //                 path: `/frontend/sdk.js.temp.md`,
    //         //             });
    //         //             let modelCode = await WebLLMAppClient.extractFirstCodeBlockContent({
    //         //                 markdown: await WebLLMAppClient.readFileContent({
    //         //                     path: `/frontend/sdk.js.temp.md`,
    //         //                 }),
    //         //             });
    //         //             await WebLLMAppClient.removeFileByPath({
    //         //                 path: `/frontend/sdk.js.temp.md`,
    //         //             });
    //         //             await WebLLMAppClient.writeToFile({
    //         //                 content: modelCode,
    //         //                 path: `/frontend/sdk.js`,
    //         //             });
    //         //             //
    //         //         }
    //     },

    //     createReactComponents: async ({
    //         engine,
    //     }: {
    //         engine: webllm.MLCEngineInterface;
    //     }) => {
    //         let studyText = await WebLLMAppClient.readFileContent({
    //             path: `/docs/blueprint.md`,
    //         });

    //         const request: webllm.ChatCompletionRequest = {
    //             seed: 0,
    //             stream: true,
    //             stream_options: { include_usage: true },
    //             messages: [
    //                 {
    //                     role: `system`,
    //                     content: `
    // ${systemPromptPureText}
    // `,
    //                 },

    //                 {
    //                     role: "user",
    //                     content: `Here's what the requirements are:
    // ${studyText}`,
    //                 },

    //                 {
    //                     role: `user`,
    //                     content: `
    // Your Instruction:
    // Please generate the json according to json schema.

    // Please make sure the components are unique.
    // `,
    //                 },
    //             ],
    //             temperature: 0.0,
    //             response_format: {
    //                 type: "json_object",
    //                 schema: JSON.stringify(
    //                     z.toJSONSchema(
    //                         z.object({
    //                             version: z.literal("2025-08-12---init"),
    //                             components: z
    //                                 .array(
    //                                     z.object({
    //                                         slug: z
    //                                             .string()
    //                                             .describe("Component name in slug"),
    //                                         componentName: z
    //                                             .string()
    //                                             .describe("ComponentName"),

    //                                         // componentDescription: z
    //                                         //     .string()
    //                                         //     .describe(
    //                                         //         "full description of the compon, including the data fields name and data field type",
    //                                         //     ),
    //                                     }),
    //                                 )
    //                                 .describe("unique react ui components"),
    //                         }),
    //                     ),
    //                 ),
    //             },
    //         };

    //         await WebLLMAppClient.llmRequestToFileStream({
    //             path: `/docs/ui.json`,
    //             request: request,
    //             engine,
    //         });

    //         const rootObjectComponents =
    //             await WebLLMAppClient.readFileParseJSONContent({
    //                 path: `/docs/ui.json`,
    //             });

    //         for (const eachObject of rootObjectComponents.components) {
    //             //
    //             {
    //                 let name = eachObject.componentName;

    //                 let messages: any = [
    //                     {
    //                         role: `system`,
    //                         content: `${systemPromptPureText}
    // `,
    //                     },
    //                     {
    //                         role: "user",
    //                         content: `Here's the "user requirement technical specification":
    // ${studyText}
    // `,
    //                     },
    //                     {
    //                         role: "user",
    //                         content: `

    // - Implement "${name}" react component (${name}), only write code, no need comment or explain:

    // - Include zustand store "useSDK" in header like the following:
    // import { useSDK } from '/ui/useSDK.js'

    // - Tailwind css to style the components

    // - Always use zustand store "useSDK" to call props and backend procedures

    // - Always use this way to export component:
    // export { ${name} };
    // `,
    //                     },

    //                     //
    //                 ];

    //                 ///////////////////////////////////////////////////////////////////////////////////
    //                 // Generate Function Output
    //                 ///////////////////////////////////////////////////////////////////////////////////
    //                 const request: webllm.ChatCompletionRequest = {
    //                     stream: true,
    //                     stream_options: { include_usage: true },
    //                     messages: messages,
    //                     temperature: 0.0,
    //                     seed: 1,
    //                     max_tokens: 4096,
    //                 };

    //                 await WebLLMAppClient.llmRequestToFileStream({
    //                     engine,
    //                     request,
    //                     path: `/ui/${name}.js`,
    //                     needsExtractCode: true,
    //                 });
    //             }
    //         }
    //     },

    //     createAppRootRouterComponents: async ({ engine }) => {
    //         {
    //             let studyText = await WebLLMAppClient.readFileContent({
    //                 path: `/docs/blueprint.md`,
    //             });

    //             const rootObjectComponents =
    //                 await WebLLMAppClient.readFileParseJSONContent({
    //                     path: `/docs/ui.json`,
    //                 });

    //             const request: webllm.ChatCompletionRequest = {
    //                 stream: true,
    //                 stream_options: { include_usage: true },
    //                 messages: [
    //                     {
    //                         role: `system`,
    //                         content: `
    // ${systemPromptPureText}
    // `,
    //                     },

    //                     {
    //                         role: "user",
    //                         content: `Here's what the "tech requirements" are:
    // ${studyText}`,
    //                     },
    //                     {
    //                         role: "user",
    //                         content: `
    // Here are all the components created:
    // ${JSON.stringify(rootObjectComponents.components)}
    //                     `,
    //                     },

    //                     {
    //                         role: `user`,
    //                         content: `
    // Your Instruction:
    // - Please build root "App" component for the reactjs app.
    // - The "App" component reuses all the components mentioend in above message.
    // - The "App" component uses "wouter" as a routing library
    // - The "App" component uses "Hash mode" of wouter like below:

    // import * as React from 'react';
    // import * as ReactDOM from 'react-dom';
    // import { Router, Route } from "wouter";
    // import { useHashLocation } from "wouter/use-hash-location";

    // import { [ComponentPlaceHolder] } from '/ui/[ComponentPlaceHolder].js'; // Change "[ComponentPlaceHolder]" to other component name
    // // [...] import the reamining page rotues and their component accordinf to the "tech requirements"

    // const App = () => (
    //     <Router hook={useHashLocation}>
    //         <Route path="/page-route" component={"[ComponentPlaceHolder]"} /> // Change "[ComponentPlaceHolder]" to other component name. "page-route" to right page route

    //         {/* [...] include more page routes and its components */}
    //     </Router>
    // );

    // export { App };
    // `,
    //                     },
    //                 ],
    //                 temperature: 0.0,
    //             };

    //             await WebLLMAppClient.llmRequestToFileStream({
    //                 engine,
    //                 request,
    //                 path: `/app-engine/App.js`,
    //                 needsExtractCode: true,
    //             });
    //         }
    //     },

    //

    //     //

    //     factoryReset: async () => {
    //         await appsCode.setItem(useGlobalAI.getState().appID, []);
    //     },

    //     //

    //     readFileObject: async ({
    //         path = "/manifest/mongoose.json",
    //         throwError = false,
    //     }: {
    //         path: string;
    //         throwError?: boolean;
    //     }) => {
    //         let files = JSON.parse(
    //             JSON.stringify(useGlobalAI.getState().files),
    //         ) as MyFile[];
    //         let file = files.find((r) => r.path === path);

    //         if (!file && throwError) {
    //             throw "not found";
    //         }

    //         return file;
    //     },

    //     readFileContent: async ({
    //         path = "/manifest/mongoose.json",
    //         throwError = false,
    //     }: {
    //         path: string;
    //         throwError?: boolean;
    //     }) => {
    //         let files = JSON.parse(
    //             JSON.stringify(useGlobalAI.getState().files),
    //         ) as MyFile[];
    //         let file = files.find((r) => r.path === path);

    //         if (!file && throwError) {
    //             throw "not found";
    //         }

    //         return file?.content || "";
    //     },

    //     readFileParseJSONContent: async ({
    //         path = "/manifest/mongoose.json",
    //         throwError = false,
    //     }: {
    //         path: string;
    //         throwError?: boolean;
    //     }) => {
    //         let files = JSON.parse(
    //             JSON.stringify(useGlobalAI.getState().files),
    //         ) as MyFile[];
    //         let file = files.find((r) => r.path === path);

    //         if (!file && throwError) {
    //             throw "not found";
    //         }

    //         return JSON.parse(file?.content);
    //     },

    //     writeToFile: async ({
    //         content,
    //         path,
    //         persist = true,
    //         inputSignature = "",
    //     }: {
    //         content: string;
    //         path: string;
    //         persist?: boolean;
    //         inputSignature?: string;
    //     }) => {
    //         let files = JSON.parse(
    //             JSON.stringify(useGlobalAI.getState().files),
    //         ) as MyFile[];

    //         let file = files.find((r) => r.path === path);
    //         if (file) {
    //             file.content = `${content}`;
    //             file.updatedAt = new Date().toISOString();
    //             file.inputSignature = inputSignature;
    //         } else {
    //             let newFile = {
    //                 path: path,
    //                 filename: pathUtil.basename(path),
    //                 content: `${content}`,
    //                 updatedAt: new Date().toISOString(),
    //                 createdAt: new Date().toISOString(),
    //                 inputSignature: inputSignature,
    //             };
    //             console.log(path);
    //             files.push(newFile);
    //         }

    //         useGlobalAI.setState({
    //             files: JSON.parse(JSON.stringify(files)) as MyFile[],
    //         });

    //         if (persist) {
    //             await appsCode.setItem(useGlobalAI.getState().appID, files);
    //         }
    //     },

    //     //

    //     persistToDisk: async () => {
    //         let files = JSON.parse(
    //             JSON.stringify(useGlobalAI.getState().files),
    //         ) as MyFile[];

    //         await appsCode.setItem(useGlobalAI.getState().appID, files);
    //     },
    //     extractAllCodeBlocks: async ({ markdown = "" }: { markdown: string }) => {
    //         //
    //         let codeblocks = (await new Promise((resolve) => {
    //             let array: { code: string; language: string }[] = [];
    //             const md = markdownit.default({
    //                 langPrefix: "language-",
    //                 highlight: (str: string, lang: string) => {
    //                     console.log("code", str);
    //                     console.log("lang", lang);

    //                     array.push({
    //                         code: str,
    //                         language: lang,
    //                     });

    //                     return "";
    //                 },
    //             });

    //             md.render(`${markdown}`);

    //             resolve(array);
    //         })) as { code: string; language: string }[];

    //         return codeblocks;
    //         //
    //     },

    //     extractFirstCodeBlockContent: async ({
    //         markdown = "",
    //     }: {
    //         markdown: string;
    //         removeFilePathAfterReading?: string;
    //     }): Promise<string> => {
    //         //
    //         let fistblock = (await new Promise((resolve) => {
    //             const md = markdownit.default({
    //                 langPrefix: "language-",
    //                 highlight: (str: string, lang: string) => {
    //                     console.log("code", str);
    //                     console.log("lang", lang);
    //                     resolve(str);

    //                     return "";
    //                 },
    //             });

    //             md.render(`${markdown}`);
    //         })) as string;

    //         return fistblock;
    //     },

    //     removeFileByPath: async ({ path }: { path: string }) => {
    //         if (path) {
    //             let files = JSON.parse(
    //                 JSON.stringify(useGlobalAI.getState().files),
    //             ) as MyFile[];

    //             files = files.filter((r) => {
    //                 return r.path !== path;
    //             });

    //             useGlobalAI.setState({
    //                 files: JSON.parse(JSON.stringify(files)) as MyFile[],
    //             });

    //             await appsCode.setItem(useGlobalAI.getState().appID, files);
    //         }
    //     },

    //     llmRequestToFileStream: async ({
    //         path = "/manifest/mongoose.json",
    //         request,
    //         engine,
    //         needsExtractCode = false,
    //     }: {
    //         path: string;
    //         needsExtractCode?: boolean;
    //         request: webllm.ChatCompletionRequestStreaming;
    //         engine: webllm.MLCEngineInterface;
    //     }) => {
    //         useGlobalAI.setState({ llmStatus: "writing" });

    //         let fileObject = await WebLLMAppClient.readFileObject({ path });

    //         if (fileObject) {
    //             let nowHash = `${md5(JSON.stringify({ request, content: fileObject.content }))}`;
    //             if (nowHash === fileObject.inputSignature) {
    //                 return;
    //             }
    //         }

    //         await engine.resetChat();
    //         const asyncChunkGenerator = await engine.chatCompletion(request);

    //         let messageFragments = "";
    //         let i = 0;
    //         for await (const chunk of asyncChunkGenerator) {
    //             i++;

    //             let str = chunk.choices[0]?.delta?.content || "";
    //             messageFragments += str;

    //             await WebLLMAppClient.writeToFile({
    //                 content: messageFragments,
    //                 path: path,
    //                 persist: false,
    //             });

    //             await new Promise((resovle) => {
    //                 requestAnimationFrame(() => {
    //                     resovle(null);
    //                 });
    //             });
    //         }

    //         if (pathUtil.extname(path) === ".js" && !needsExtractCode) {
    //             console.log("did you forget to set needsExtractCode to true ??");
    //         }
    //         if (needsExtractCode) {
    //             messageFragments =
    //                 await WebLLMAppClient.extractFirstCodeBlockContent({
    //                     markdown: messageFragments,
    //                 });
    //         }

    //         await WebLLMAppClient.writeToFile({
    //             content: messageFragments,
    //             path: path,
    //             inputSignature:
    //                 useGlobalAI.getState().llmStatus === "writing"
    //                     ? `${md5(JSON.stringify({ request, content: messageFragments }))}`
    //                     : `${Math.random()}`,

    //             persist: true,
    //         });
    //     },
    // ["factoryResetThisApp"]: async () => {},
};

/*

        if (request && path && fistblock) {
            await WebLLMAppClient.writeToFile({
                content: fistblock,
                path: path,
                inputSignature:
                    useGlobalAI.getState().llmStatus === "writing"
                        ? `${md5(JSON.stringify({ request, content: fistblock }))}`
                        : `${Math.random()}`,

                persist: true,
            });
        }
            
*/
