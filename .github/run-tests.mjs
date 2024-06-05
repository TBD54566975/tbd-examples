import { readFileSync } from 'node:fs';
import { execSync } from 'node:child_process';

const exampleDir = process.argv[2];

function runCommand(command) {
    console.log("::group::" + command)
    execSync(command, {
        cwd: exampleDir,
        stdio: "inherit",
    });
    console.log("::endgroup::");
}

const config = JSON.parse(readFileSync(exampleDir + '/.tbd-example.json', 'utf8'));

runCommand(config.install || "npm install");

if (config.tests && config.tests.pre) {
    for (const cmd of config.tests.pre) {
        runCommand(cmd);
    }
}

var testCommand = "npm test";
if (config.tests && config.tests.command) {
    testCommand = config.tests.command;
}

runCommand(testCommand);