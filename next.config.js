/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";

import fs from 'fs'
import path from 'path'
import { NPMCacheTasks } from "./src/app/test/_TreeAI/web/npm-globals.js";

NPMCacheTasks.filter(r => r.output).map((tsk) => {

    let taskName = JSON.stringify(tsk.name)

    let textString = `
// @ts-ignore
window.NPM_CACHE = window.NPM_CACHE || {};
// @ts-ignore
const NPM_CACHE = window.NPM_CACHE;

NPM_CACHE[${taskName}] = NPM_CACHE[${taskName}] || {}; 
`
    for (let propName in tsk?.importVaraible) {
        if (propName !== 'default') {
            textString += `
export const ${propName} = NPM_CACHE[${taskName}]['${propName}'];
`
        } else {
            textString += `
export default NPM_CACHE[${taskName}]['${propName}'];
`
        }
    }

    let dir = path.dirname(`${import.meta.dirname}/public${tsk.output}`)
    fs.mkdirSync(dir, { recursive: true })
    fs.writeFileSync(`${import.meta.dirname}/public${tsk.output}`, textString)
})

const nextConfig = {
    eslint: { ignoreDuringBuilds: !!process.env.CI },
    /* config options here */
    // compilerOptions: {
    //     // ...
    //     strictNullChecks: true,
    // },
    reactStrictMode: false, // Recommended for the `pages` directory, default in `app`.
    images: {},
    devIndicators: false,
    webpack(config, { isServer }) {
        // if (!isServer) {
        //     // We're in the browser build, so we can safely exclude the sharp module
        //     config.externals.push("sharp");
        // }

        // audio support
        // config.module.rules.push({
        //   test: /\.(ogg|mp3|fbx|glb|pdf|wav|mpe?g)$/i,
        //   exclude: config.exclude,
        //   use: [
        //     {
        //       loader: require.resolve('url-loader'),
        //       options: {
        //         limit: config.inlineImageLimit,
        //         fallback: require.resolve('file-loader'),
        //         publicPath: `${config.assetPrefix}/_next/static/images/`,
        //         outputPath: `${isServer ? '../' : ''}static/images/`,
        //         name: '[name]-[hash].[ext]',
        //         esModule: config.esModule || false,
        //       },
        //     },
        //   ],
        // })

        // config.module.rules.push({
        //     test: /\.(glb|gltf|hdr|exr|fbx|ttf|png|jpg|jpeg|gif|webp|avif|ico|bmp|svg)$/,
        //     exclude: /node_modules/,
        //     use: [
        //         {
        //             //${config.assetPrefix}
        //             loader: "file-loader",
        //             options: {
        //                 limit: 0, /// config.inlineImageLimit,
        //                 fallback: "file-loader",
        //                 publicPath: `/_next/static/images/`,
        //                 outputPath: `${isServer ? "../" : ""}static/images/`,
        //                 name: "[name]-[hash].[ext]",
        //                 esModule: config.esModule || false,
        //             },
        //         },
        //     ],
        // });

        // shader support
        config.module.rules.push({
            test: /\.(glsl|vs|fs|vert|frag)$/,
            exclude: /node_modules/,
            use: ["raw-loader", "glslify-loader"],
        });

        config.module.rules.push({
            test: /\.md$/,
            exclude: /node_modules/,
            use: ["raw-loader"],
        });

        config.module.rules.push({
            test: /\.worker\.ts$/,
            exclude: /node_modules/,
            use: ["worker-loader"],
        });

        // See https://webpack.js.org/configuration/resolve/#resolvealias
        // config.resolve.alias = {
        //     ...config.resolve.alias,
        //     sharp$: false,
        //     "onnxruntime-node$": false,
        // };

        return config;
    },

    // webpack(config, { isServer }) {
    //   if (!isServer) {
    //     // We're in the browser build, so we can safely exclude the sharp module
    //     config.externals.push('sharp')
    //   }
    //   // audio support
    //   config.module.rules.push({
    //     test: /\.(ogg|mp3|wav|mpe?g)$/i,
    //     exclude: config.exclude,
    //     use: [
    //       {
    //         loader: require.resolve('url-loader'),
    //         options: {
    //           limit: config.inlineImageLimit,
    //           fallback: require.resolve('file-loader'),
    //           publicPath: `${config.assetPrefix}/_next/static/images/`,
    //           outputPath: `${isServer ? '../' : ''}static/images/`,
    //           name: '[name]-[hash].[ext]',
    //           esModule: config.esModule || false,
    //         },
    //       },
    //     ],
    //   })

    //   // shader support
    //   config.module.rules.push({
    //     test: /\.(glsl|vs|fs|vert|frag)$/,
    //     exclude: /node_modules/,
    //     use: ['raw-loader', 'glslify-loader'],
    //   })

    //   return config
    // },
};

export default nextConfig