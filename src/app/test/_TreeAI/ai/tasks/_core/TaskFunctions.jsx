
// Dynamically import all .ts files from the './src/components' directory
// and its subdirectories.
// @ts-ignore
const componentContext = require.context("../autoload/", true, /\.tsx$/);

const TaskFunctions = {}

// Iterate over the keys (module paths) and require each module
componentContext.keys().forEach((key) => {
    const module = componentContext(key);

    TaskFunctions[module.name] = {
        name: module.name,
        displayName: module.displayName,
        action: module[module.name],
    }
    // Do something with the imported module
});

console.log(TaskFunctions)

export { TaskFunctions }