"use client";

import type * as webllm from "@mlc-ai/web-llm";
import { CreateWebWorkerMLCEngine } from "@mlc-ai/web-llm";
// @ts-ignore
import Worker from "./webllm.worker.ts";

//
import { z } from "zod";

import * as markdownit from "markdown-it";
import * as pathUtil from "path";
// import { createInstance } from "localforage";
import md5 from "md5";
import { useGlobalAI } from "../../../useGlobalAI.js";
import { create } from "zustand";

type EngineProps = {
    llmStatus: "idle" | "downloading" | "writing";
    stopFunc: () => void;
    engine: webllm.MLCEngineInterface;
    setupProgress: string;
};

export type useEngineType = (v: (v: EngineProps) => any) => any;

export const makeEngine = async ({ currentModel }) => {
    let useEngine = create(() => {
        return {};
    });

    const initProgressCallback = (report: webllm.InitProgressReport) => {
        console.log(report.text);
        useEngine.setState({
            setupProgress: report.text,
        });
    };

    useEngine.setState({
        llmStatus: "downloading",
    });

    let aiWorker = new Worker();
    let engine = (await CreateWebWorkerMLCEngine(aiWorker, currentModel, {
        initProgressCallback: initProgressCallback,
        logLevel: "DEBUG",
    })) as webllm.MLCEngineInterface;

    useEngine.setState({
        llmStatus: "idle",
        engine: engine,
    });

    useEngine.setState({
        stopFunc: async () => {
            try {
            } catch (e) {
                console.log(e);
            }

            useEngine.setState({ llmStatus: "idle" });

            useEngine.setState({
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

    return {
        engine,
        useEngine,
    };
};
