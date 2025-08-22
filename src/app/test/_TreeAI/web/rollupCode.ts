"use client";

import { transform } from "sucrase";
import path from "path";
import { NPMCacheTasks } from "@/app/test/_TreeAI/web/npm-globals";

export const rollupCode = async ({ files = [] }) => {
    const CodePrefix = `dynamic-code:`;
    const NetworkPrefix = `${location.origin}`;

    //
    console.log("building:start");

    // yarn add rollup@"2.56.3"
    let rollup = await import("rollup/dist/rollup.browser.js").then(
        (rmod) => rmod.rollup,
    );

    // @ts-ignore
    let bundler = rollup({
        input: `${CodePrefix}/src/main.js`,
        plugins: [
            {
                name: "loklok-runner",
                async resolveId(moduleName: string, parentBaseURL) {
                    console.log(
                        "resolving module: ",
                        moduleName,
                        "wanted by",
                        parentBaseURL,
                    );

                    //
                    //
                    if (moduleName.startsWith("@/")) {
                        moduleName = moduleName.replace("@/", "/");
                    }

                    if (!parentBaseURL) {
                        return moduleName;
                    }

                    console.log("moduleName", moduleName);
                    let mod = NPMCacheTasks.find(
                        (r) => `${r.name}` === `npm-${moduleName}`,
                    );
                    if (mod) {
                        return `${NetworkPrefix}${mod.output}`;
                    }

                    // if (moduleName.indexOf("three/examples/") === 0) {
                    //     return `${NetworkPrefix}/vendor/three.js-r179/three/examples/${moduleName.replace("three/examples/", "")}`;
                    // }

                    return new URL(moduleName, parentBaseURL).href;
                },

                async load(id) {
                    if (id.indexOf("http") === 0) {
                        return fetch(id, { mode: "cors", method: "GET" })
                            .then((r) => r.text())
                            .then((t) => {
                                return `${t}`;
                            });
                    }

                    let removeTSJS = (pathname = "") => {
                        if (pathname.endsWith(".ts")) {
                            return pathname.replace(".ts", "");
                        }
                        if (pathname.endsWith(".tsx")) {
                            return pathname.replace(".tsx", "");
                        }
                        if (pathname.endsWith(".js")) {
                            return pathname.replace(".js", "");
                        }
                        if (pathname.endsWith(".jsx")) {
                            return pathname.replace(".jsx", "");
                        }
                        return pathname;
                    };

                    let file = files.find(
                        (e) =>
                            removeTSJS(`${CodePrefix}${e.path}`) ===
                            removeTSJS(id),
                    );

                    if (!file) {
                        return `console.log('file is not found or is under generation', ${JSON.stringify(id)})`;
                    }

                    if (path.extname(file.path) === ".json") {
                        return `export default ${JSON.stringify(file.content)}`;
                    }
                    if (path.extname(file.path) === ".vertex") {
                        return `export default ${JSON.stringify(file.content)}`;
                    }
                    if (path.extname(file.path) === ".fragment") {
                        return `export default ${JSON.stringify(file.content)}`;
                    }
                    if (path.extname(file.path) === ".json") {
                        return `export default ${file.content}`;
                    }
                    if (path.extname(file.path) === ".glsl") {
                        return `export default ${JSON.stringify(file.content)}`;
                    }
                    if (path.extname(file.path) === ".vs") {
                        return `export default ${JSON.stringify(file.content)}`;
                    }
                    if (path.extname(file.path) === ".fs") {
                        return `export default ${JSON.stringify(file.content)}`;
                    }

                    if (file?.content) {
                        try {
                            let es6 = transform(file.content || "", {
                                transforms: ["jsx", "typescript"],
                                preserveDynamicImport: true,
                                production: false,
                                jsxPragma: "React.createElement",
                                jsxFragmentPragma: "React.Fragment",
                            }).code;

                            return es6;
                        } catch (e) {
                            console.log(e);
                            console.error("error", file.path, file?.content);

                            return file?.content;
                        }
                    }

                    return `console.log('moudle is not found',${JSON.stringify(id)})`;
                },
            },
        ],
    });
    try {
        let compiler = await bundler;

        let gen = await compiler.generate({
            output: {
                format: "esm",
                inlineDynamicImports: true,
            },
        });

        let finalOutput = gen.output.map((res) => {
            return {
                ...res,
                path: res.facadeModuleId.replace(CodePrefix, ""),
            };
        });

        console.log("building:end");

        return finalOutput;
    } catch (e) {
        console.log("building:error");
        console.log(e);

        return "";
    }
};

//
