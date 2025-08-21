import { toast } from "sonner";
import { useAI } from "../../../state/useAI";
import { useEffect } from "react";

export type MyTask = {
    name: string;
    deps: string[];
    args: Record<string, any>;
    status: "init" | "reserved" | "working" | "done";
};

export const MyFuncs = {
    createNewApp: (v: any) =>
        import("../createNewApp").then((r) => r.createNewApp(v)),

    createrReactApp: (v: any) =>
        import("../createReactApp").then((r) => r.createReactApp(v)),

    receiveResponse: (v: any) =>
        import("../receiveResponse").then((r) => r.receiveResponse(v)),
};

export const MyTaskManager = {
    taskList: [] as MyTask[],
    doneTask: (name: string) => {
        let task = MyTaskManager.taskList.find((r) => r.name === name);
        console.log(task);
        if (task) {
            task.status = "done";
        }
    },
    add: (a: { name: string; deps: string[]; args?: any }) => {
        MyTaskManager.taskList.push({
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

            let task = MyTaskManager.taskList.find((r) => r.status === "init");
            //
            let hasDeps;

            if (task) {
                hasDeps = await new Promise((resolve) => {
                    let howManyDeps = task.deps.length;
                    let doneCount = 0;

                    for (let dep of task.deps) {
                        let hasFound = !!MyTaskManager.taskList.find(
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
                        func({ task: task, ...task.args });
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
