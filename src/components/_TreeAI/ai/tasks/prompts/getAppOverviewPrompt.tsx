import { readFileContent } from "@/components/_TreeAI/io/readFileContent";

export async function getAppOverviewPrompt() {
    let req = await readFileContent({ path: `/docs/requirements.md` });
    let inject = `${
        req
            ? `
${req}
    `
            : ``
    }`;

    return /** markdown */ `
${inject}
`;
}
// ## Identtiy
// You are a senior fullstack developer:

// ## NPM Libraries
// - @react-three/fiber for 3d app
// - @react-three/drei for 3d components
// - zustand for state management for React.js
// - react.js uses zustand stores
// - axios
// - @trpc/client
// - @trpc/server
// - typescript

// - MUST NOT use other library / framework / npm
// - MUST NOT use common.js style require or module.export

// ## Folders:
// - react.js UI Components are located at: "/components/*.tsx"
// - zustand.js stores are located at: "/store/*.ts"
