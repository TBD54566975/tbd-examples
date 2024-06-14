const { readdirSync, readFileSync, existsSync, statSync } = require('node:fs');

const defaults = {
    javascript: {
        tests: {
            pre: ["npm install"],
            command: ["npm test"]
        },
    },
    kotlin: {
        tests: {
            command: ["./gradlew connectedCheck"],
        }
    }
}

function formatCommands(commands) {
    if (!commands) {
        return null;
    }
    return commands.map((c) => "echo \"::group::" + c + "\"\n" + c + "\necho \"::endgroup::\"").join("\n");
}

const languages = {};
for (const language of readdirSync('.')) {
    if (!statSync(language).isDirectory()) {
        continue;
    }

    const examples = [];

    for (const example of readdirSync(language)) {
        const directory = language + '/' + example
        if (!existsSync(directory + '/.tbd-example.json')) {
            continue;
        }

        const config = JSON.parse(readFileSync(directory + '/.tbd-example.json', 'utf8'));

        const entry = {
            name: config.name || example,
            directory: directory,
            tests: {},
            misc: config.misc || {},
        };

        var preTestCommands = defaults[language].tests ? defaults[language].tests.pre : null;
        if (config.tests && config.tests.pre) {
            preTestCommands = config.tests.pre;
        }
        if (preTestCommands) {
            entry.tests.pre = formatCommands(preTestCommands);
        }

        var testCommands = defaults[language].tests ? defaults[language].tests.command : null;
        if (config.tests && config.tests.command) {
            testCommands = [config.tests.command];
        } else if (config.tests && config.tests.commands) {
            testCommands = config.tests.commands;
        }
        if (testCommands) {
            entry.tests.command = formatCommands(testCommands);
        }

        examples.push(entry);
    }

    if (examples.length > 0) {
        languages[language] = examples;
    }
}

console.log("languages=" + JSON.stringify(languages));
