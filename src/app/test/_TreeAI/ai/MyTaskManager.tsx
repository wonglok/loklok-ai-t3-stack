import { toast } from "sonner";
import { useTreeAI } from "../state/useTreeAI";

export type MyTask = {
    name: string;
    deps: string[];
    status: "init" | "reserved" | "working" | "done";
};

let tasks: MyTask[] = [];
export const MyTaskManager = {
    tasks,
    add: (a: MyTask) => {
        tasks.push(a);
    },
    workAll: async () => {
        let doWork = async () => {
            let freeEngineSetting = useTreeAI
                .getState()
                .engines.find((r) => r.status === "free");

            let task = tasks.find((r) => r.status === "init");
            //
            let hasDeps = await new Promise((resolve) => {
                let howManyDeps = task.deps.length;
                let doneCount = 0;

                for (let dep of task.deps) {
                    let hasFound = !!tasks.find(
                        (t) => t.name === dep && t.status === "done",
                    );
                    if (hasFound) {
                        doneCount++;
                    }
                }

                if (howManyDeps === doneCount) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            });

            if (freeEngineSetting && task && hasDeps) {
                task.status = "reserved";
                freeEngineSetting.status = "reserved";
                toast("Starting to work...");
                dispatchEvent(
                    new CustomEvent("work-task", {
                        detail: {
                            task,
                            engineSetting: freeEngineSetting,
                        },
                    }),
                );
            } else {
                await new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(null);
                    }, 150);
                });

                let allDone =
                    tasks.length !== 0 &&
                    tasks.filter((r) => r.status === "done").length ===
                        tasks.length;

                if (allDone) {
                } else {
                    await doWork();
                }
            }
        };
        await doWork();
    },
};
