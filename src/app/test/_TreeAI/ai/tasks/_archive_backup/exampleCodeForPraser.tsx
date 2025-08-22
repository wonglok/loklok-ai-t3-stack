// // ---------------------------------------------------------------
// // Example usage (you can delete or move this to a separate test file)

// import { parsemydearlokloktag, LokLokParseError } from "./LokLokParser";

// // ---------------------------------------------------------------
// if (require.main === module) {
//     const example = `
// Here is some text before.

// [mydearlokloktag file="example.ts"]
// export function hello() {
//     console.log("Hello, world!");
// }
// [/mydearlokloktag]

// And after.
// `;

//     try {
//         const blocks = parsemydearlokloktag(example);
//         console.log("Parsed blocks:", JSON.stringify(blocks, null, 2));
//     } catch (e) {
//         if (e instanceof LokLokParseError) {
//             console.error(`Parse error: ${e.message}`);
//         } else {
//             console.error(e);
//         }
//     }
// }
