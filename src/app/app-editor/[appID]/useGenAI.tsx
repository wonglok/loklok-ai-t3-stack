import { create } from "zustand";
import type * as webllm from "@mlc-ai/web-llm";

export type MyFile = {
  filename: string;
  path: string;
  content: string;
  updatedAt: string;
  createdAt: string;
};

export const useGenAI = create<{
  files: MyFile[];
  expandID: string;

  // mongooseCodeFinal: string;
  // mongooseCodeDraft: string;

  // technicalSpecificationFinal: string;
  // technicalSpecificationDraft: string;

  // createBackendProceduresFinal: string;
  // createBackendProceduresDraft: string;

  // zustandStateTRPCMaanagerFinal: string;
  // zustandStateTRPCMaanagerDraft: string;

  currentModel: string;

  appID: string;
  prompt: string;
  llmStatus: "writing" | "downloading" | "init";
  loadingSpec: boolean;
  welcome: boolean;
  spec: string;
  setupLLMProgress: string;
  engine: webllm.MLCEngineInterface | null;

  brainworks: boolean;

  //

  models: { key: string; value: string }[];

  //

  stopFunc: () => void;
}>(() => {
  let models = [
    {
      key: "Qwen Coder 1.5B (~750MB)",
      value: `Qwen2.5-Coder-1.5B-Instruct-q4f16_1-MLC`,
    },
    {
      key: "Qwen Coder 3B (~1.5GB)",
      value: `Qwen2.5-Coder-3B-Instruct-q4f16_1-MLC`,
    },
    {
      key: "Qwen Coder 7B (~4GB)",
      value: `Qwen2.5-Coder-7B-Instruct-q4f16_1-MLC`,
    },
  ];
  return {
    files: [],
    expandID: "",
    // zustandStateTRPCMaanagerFinal: "",
    // zustandStateTRPCMaanagerDraft: "",

    // createBackendProceduresDraft: "",
    // createBackendProceduresFinal: "",

    // mongooseCodeDraft: "",
    // mongooseCodeFinal: "",

    // technicalSpecificationDraft: "",
    // technicalSpecificationFinal: "",

    //
    llmStatus: "init",

    stopFunc: () => {},
    models: models,
    currentModel: models[1].value,
    appID: "",
    prompt: `
I want to build a bible testimony database powered by ai embeddings and RAG Agents.

## PlatformAdmin:
After Login, PlatformAdmin can create Pastor Accounts and login info and help them change password.

## Pastor:
Pastors can login to Pastor Portal.

Pastor Portal can do a few things:
1. upload testimony text and youtube video link 
2. edit testimony and set it to be hidden or visible.
3. generate embeddings data for the testimony.
4. approve and publish the testimony to their pastor account.

## Internet users:
Before Login, They can view testimony video / text.
Before Login, They can only search testimonies.
After Login, They can write testimony and request pastor to approve for publishing.

`.trim(),
    loadingSpec: false,
    welcome: true,
    spec: "",
    setupLLMProgress: "",
    engine: null,
    brainworks: false,
  };
});
