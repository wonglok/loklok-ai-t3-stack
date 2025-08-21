import { toast } from "sonner";
import { useAI } from "../state/useAI";
import { useEffect } from "react";

export type MyTask = {
    name: string;
    deps: string[];
    args: any;
    status: "init" | "reserved" | "working" | "done";
};

export const MyFuncs = {
    defineApp: (v: any) =>
        import("../ai/tasks/defineApp").then((r) => r.defineApp(v)),
    receiveResponse: (v: any) =>
        import("../ai/tasks/receiveResponse").then((r) => r.receiveResponse(v)),
};

let tasks: MyTask[] = [];
export const MyTaskManager = {
    tasks,
    add: (a: { name: string; deps: string[]; args?: any }) => {
        tasks.push({
            name: a.name,
            deps: a.deps,
            args: a.args,
            status: "init",
        });
    },
    workAll: async () => {
        let doWork = async () => {
            let freeEngineSetting = useAI
                .getState()
                .engines.find((r) => r.status === "free");

            let task = tasks.find((r) => r.status === "init");
            //
            let hasDeps;

            if (task) {
                hasDeps = await new Promise((resolve) => {
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
            }

            if (freeEngineSetting && task && hasDeps) {
                task.status = "reserved";
                freeEngineSetting.status = "reserved";
                toast(`Begin work: ${task.name}`);

                let func = MyFuncs[task.name];
                if (func) {
                    try {
                        func({ task: task, args: task.args });
                    } catch (e) {
                        console.log(e);
                    }
                }

                // await new Promise((resolve) => {
                //     setTimeout(() => {
                //         resolve(null);
                //     }, 150);
                // });

                // await doWork();
            } else {
                // await new Promise((resolve) => {
                //     setTimeout(() => {
                //         resolve(null);
                //     }, 150);
                // });
                // let allDone =
                //     tasks.length !== 0 &&
                //     tasks.filter((r) => r.status === "done").length ===
                //         tasks.length;
                // await doWork();
            }
        };
        setInterval(() => {
            doWork();
        }, 150);
    },
};

export const BootUpTaskManager = () => {
    useEffect(() => {
        MyTaskManager.workAll();
    }, []);

    return null;
};
