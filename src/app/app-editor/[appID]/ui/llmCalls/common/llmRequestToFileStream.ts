"use client";

import type * as webllm from "@mlc-ai/web-llm";
// import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { EngineData, MyFile, useGlobalAI } from "../../../useGlobalAI";
// @ts-ignore
import { z } from "zod";

import * as markdownit from "markdown-it";
import * as pathUtil from "path";
import { createInstance } from "localforage";
import md5 from "md5";
import { readFileObject } from "./readFileObject";
import { writeToFile } from "./writeToFile";
import { extractFirstCodeBlockContent } from "./extractFirstCodeBlockContent";
// import { newUnifiedDiffStrategyService } from "diff-apply";

export const llmRequestToFileStream = async ({
    path = "/manifest/mongoose.json",
    request,
    engine,
    needsExtractCode = false,
    slot = null,
}: {
    path: string;
    needsExtractCode?: boolean;
    request: webllm.ChatCompletionRequestStreaming;
    engine: webllm.MLCEngineInterface;
    slot: EngineData | null;
}) => {
    slot.llmStatus = "writing";
    useGlobalAI.getState().refreshSlot(slot);

    let fileObject = await readFileObject({ path });

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

        await writeToFile({
            content: messageFragments,
            path: path,
            persist: false,
        });

        await new Promise((resovle) => {
            requestAnimationFrame(() => {
                resovle(null);
            });
        });

        slot.bannerText = `✍🏻 ${path}`;
        useGlobalAI.getState().refreshSlot(slot);

        let lockInWorkers = useGlobalAI.getState().lockInWorkers;
        if (!lockInWorkers) {
            break;
        }
    }

    if (pathUtil.extname(path) === ".js" && !needsExtractCode) {
        console.log("did you forget to set needsExtractCode to true ??");
    }
    if (needsExtractCode) {
        messageFragments = await extractFirstCodeBlockContent({
            markdown: messageFragments,
        });
    }

    await writeToFile({
        content: messageFragments,
        path: path,
        inputSignature:
            slot.llmStatus === "writing"
                ? `${md5(JSON.stringify({ request, content: messageFragments }))}`
                : `${Math.random()}`,

        persist: true,
    });
    slot.llmStatus = "idle";
    useGlobalAI.getState().refreshSlot(slot);
};
