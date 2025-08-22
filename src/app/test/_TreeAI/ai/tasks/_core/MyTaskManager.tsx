import { toast } from "sonner";
import { useAI } from "../../../state/useAI";
import { useEffect } from "react";

export type MyTask = {
    name: string;
    waitFor: string[];
    args: Record<string, any>;
    status: "init" | "reserved" | "working" | "done";
};

export const MyFuncs = {
    handleAppSpec: (v: any) =>
        import("../routes/handleAppSpec").then((r) => r.handleAppSpec(v)),

    handleReactAppRoot: (v: any) =>
        import("../routes/handleReactAppRoot").then((r) =>
            r.handleReactAppRoot(v),
        ),

    receiveResponse: (v: any) =>
        import("../routes/onReceiveResponse").then((r) =>
            r.onReceiveResponse(v),
        ),
};

export const MyTaskManager = {
    taskList: [] as MyTask[],
    doneTask: (name: string) => {
        let task = MyTaskManager.taskList.find((r) => r.name === name);
        if (task) {
            task.status = "done";
        }
        console.log("done-task", task);
    },
    add: (a: { name: string; waitFor: string[]; args?: any }) => {
        MyTaskManager.taskList.push({
            name: a.name,
            waitFor: a.waitFor,
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
            let noMoreWaiting;

            if (task) {
                noMoreWaiting = await new Promise((resolve) => {
                    let howManyDeps = task.waitFor.length;
                    let doneCount = 0;

                    for (let dep of task.waitFor) {
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

            if (freeEngineSetting && task && noMoreWaiting) {
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
