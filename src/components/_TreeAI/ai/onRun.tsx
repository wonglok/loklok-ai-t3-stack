import { bootEngines } from "./bootEngines";

export async function onRun(
    {
        //
        //
    },
) {
    await bootEngines();

    let yolo = await new Promise((resolve) => {
        let tt = setInterval(() => {
            //
            let yolo = true;
            if (yolo) {
                resolve(yolo);
                clearInterval(tt);
            }
        });
    });

    console.log(yolo);
}
