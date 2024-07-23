import globalCacheDir from "global-cache-dir";
import { intro, outro, spinner, select, cancel } from "@clack/prompts";
import * as fs from "fs";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node/index.cjs";

async function updateCache(gitDir: string) {
  const s = spinner();
  if (fs.existsSync(gitDir)) {
    s.start("updating template library");
    await git.pull({
      fs,
      http: http,
      url: "https://github.com/TBD54566975/tbd-examples",
      dir: gitDir,
      author: { name: "user", email: "user@host" },
    });
    s.stop("updated template library");
  } else {
    s.start("downloading template library");
    await git.clone({
      fs,
      http: http,
      url: "https://github.com/TBD54566975/tbd-examples",
      dir: gitDir,
    });
    s.stop("downloaded template library");
  }
}

async function pickLanguage(gitDir: string): Promise<string | symbol> {
  let languages: { value: string; label: string; hint?: string }[] = [];
  for (let lang of fs.readdirSync(gitDir)) {
    if (lang.startsWith(".")) {
      continue;
    }
    const stat = fs.statSync(gitDir + "/" + lang);
    if (!stat.isDirectory()) {
      continue;
    }

    languages.push({ value: lang, label: lang });
  }

  return await select({
    message: "Select a language.",
    options: languages,
  });
}

async function pickTemplate(langDir: string): Promise<string | symbol | null> {
  let templates: { value: string; label: string; hint?: string }[] = [];
  for (let template of fs.readdirSync(langDir)) {
    if (template.startsWith(".")) {
      continue;
    }

    if (!fs.statSync(langDir + "/" + template).isDirectory()) {
      continue;
    }

    const templateConfig = langDir + "/" + template + "/.tbd-example.json";
    try {
      fs.statSync(templateConfig);
    } catch (e) {
      if (e.code === "ENOENT") {
        continue;
      }
      throw e;
    }

    const config = JSON.parse(fs.readFileSync(templateConfig, "utf-8"));

    templates.push({ value: template, label: config.name || template });
  }

  if (templates.length == 0) {
    cancel("language has no templates :(");
    return null;
  }

  return await select({
    message: "Select a template.",
    options: templates,
  });
}

async function main() {
  try {
    intro("TBD App Creator");
    const cacheDir = await globalCacheDir("tbd-app-creator");
    const gitDir = cacheDir + "/tbd-examples";

    await updateCache(gitDir);

    const language = await pickLanguage(gitDir);
    const template = await pickTemplate(gitDir + "/" + language.toString());
    if (template === null) {
      return;
    }

    outro("thanks for playing");
  } catch (e) {
    console.log("\n", e.stack || e);
  }
}

main();
