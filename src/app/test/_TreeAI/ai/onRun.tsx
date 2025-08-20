import { asyncGetFreeAI } from "./asyncGetFreeAI";
import { buildAppDoc } from "./buildAppDoc";

export async function onRun(
    {
        //
        //
    },
) {
    let yo = await new Promise((resolve) => {
        let tt = setInterval(() => {
            //
            let yo = true;
            if (yo) {
                resolve(yo);
                clearInterval(tt);
            }
        });
    });

    console.log(yo);
}
