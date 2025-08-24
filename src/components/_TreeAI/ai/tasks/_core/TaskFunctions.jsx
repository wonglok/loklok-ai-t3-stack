
// Dynamically import all .js files from the './src/components' directory
// and its subdirectories.
// @ts-ignore
const componentContext = require.context("../autoload/", true, /\.jsx$/);

const TaskFunctions = {}

// Iterate over the keys (module paths) and require each module
componentContext.keys().forEach((key) => {
    const theMod = componentContext(key);

    TaskFunctions[theMod.name] = {
        name: theMod.name,
        displayName: theMod.displayName,
        action: theMod[theMod.name],
    }
    // Do something with the imported module
});

// console.log(TaskFunctions)

export { TaskFunctions }