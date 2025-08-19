"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
import { useGenAI } from "../../../useGenAI";
// import Worker from "worker-loader!./webllm.worker.ts";

// @ts-ignore
import Worker from "./webllm.worker.ts";

// @ts-ignore
// import Worker from "./webllm.worker.js";

//
// import { z } from "zod";

// import * as markdownit from "markdown-it";
// import * as pathUtil from "path";
// import { createInstance } from "localforage";
// import md5 from "md5";

//
export const makeEngineAPI = async ({ name }: { name: string }) => {
    let engines = useGenAI.getState().engines;

    let slot = engines.find((r) => r.name === name);

    let refresh = useGenAI.getState().refreshSlot;

    const initProgressCallback = (report: webllm.InitProgressReport) => {
        // console.log(report);

        slot.bannerText = report.text;
        slot.llmStatus = "downloading";
        refresh(slot);
    };

    // let workerLLM = new Worker(new URL("./webllm.worker.ts", import.meta.url), {
    //     type: "module",
    // });

    let workerLLM = new Worker();

    let engine = (await CreateWebWorkerMLCEngine(workerLLM, slot.currentModel, {
        initProgressCallback: initProgressCallback,
        logLevel: "DEBUG",
    })) as webllm.MLCEngineInterface;

    // console.log("build", name);
    slot.bannerText = "";
    slot.llmStatus = "idle";
    refresh(slot);

    useGenAI.setState({
        loading: false,
    });

    let destroy = async () => {
        slot.llmStatus = "empty";
        slot.bannerText = "";
        refresh(slot);

        await engine?.interruptGenerate();

        await workerLLM.terminate();

        try {
            engine?.unload();
        } catch (e) {
            console.log(e);
        }
    };

    return {
        engine,
        slot,
        destroy,
    };
};
