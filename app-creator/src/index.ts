import globalCacheDir from "global-cache-dir";
import { intro, outro, spinner, select, cancel, text } from "@clack/prompts";
import * as fs from "fs";
import isInvalid from "is-invalid-path";
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

async function renderTemplate(src: string, dest: string) {
  const s = spinner();
  s.start("rendering template");
  try {
    await renderTemplateRecursive(src, dest, s);
  } catch (e) {
    s.stop("failed to rendered template", 1);
    throw e;
  } finally {
    s.stop("rendered template");
  }
}

async function renderTemplateRecursive(
  src: string,
  dest: string,
  s: { message: (msg?: string) => void }
) {
  try {
    fs.statSync(dest);
  } catch (e) {
    if (e.code == "ENOENT") {
      fs.mkdirSync(dest);
    } else {
      throw e;
    }
  }

  const srcFiles = fs.readdirSync(src);
  for (const srcFile of srcFiles) {
    if (srcFile == ".tbd-example.json") {
      continue;
    }

    const srcPath = src + "/" + srcFile;
    const destPath = dest + "/" + srcFile;
    s.message(srcPath + " => " + destPath);

    const stat = fs.statSync(src + "/" + srcFile);
    if (stat.isDirectory()) {
      await renderTemplateRecursive(srcPath, destPath, s);
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
  }
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

    const dest = await text({
      message: "Where should we put this?",
      initialValue: "./" + template.toString(),
      validate(value) {
        if (value.length === 0) return `Value is required!`;
        if (isInvalid(value)) return `invalid path`;
      },
    });

    const templateSrc = [gitDir, language.toString(), template.toString()].join(
      "/"
    );
    await renderTemplate(templateSrc, dest.toString());

    outro("thanks for playing");
  } catch (e) {
    console.log("\n", e.stack || e);
  }
}

main();
