const { readdirSync, readFileSync, existsSync, statSync } = require('node:fs');

const stepsByLanguage = {
    javascript: {
        preTest: ["npm install"],
        test: ["npm test"],
    },
    kotlin: {
        test: ["./gradlew connectedCheck"],
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

        var preTestCommands = stepsByLanguage[language].preTest
        if (config.tests && config.tests.pre) {
            preTestCommands = config.tests.pre;
        }
        if (preTestCommands) {
            preTestCommands = formatCommands(preTestCommands);
        }

        var testCommands = stepsByLanguage[language].test
        if (config.tests && config.tests.command) {
            testCommands = [config.tests.command];
        } else if (config.tests && config.tests.commands) {
            testCommands = config.tests.commands;
        }
        if (testCommands) {
            testCommands = formatCommands(testCommands);
        }

        examples.push({
            name: example,
            preTestCommands: preTestCommands,
            testCommands: testCommands
        });
    }

    if (examples.length > 0) {
        languages[language] = examples;
    }
}

console.log("languages=" + JSON.stringify(languages));
