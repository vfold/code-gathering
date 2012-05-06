var projectPath = process.ARGS[2];

process.chdir(projectPath);
require("compiler-js").init("main");