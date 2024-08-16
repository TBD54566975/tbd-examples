import globalCacheDir from "global-cache-dir";
import {
  intro,
  outro,
  spinner,
  select,
  cancel,
  text,
  isCancel,
} from "@clack/prompts";
import * as fs from "fs";
import { Eta } from "eta";
import isInvalid from "is-invalid-path";
import git from "isomorphic-git";
import http from "isomorphic-git/http/node/index.cjs";

class TemplateConfig {
  name: string;
  description?: string;
  variables?: Map<string, TemplateVariable>;
}

class TemplateVariable {
  name: string;
  type: string;
  regex?: string;
  options?: {
    value: string;
    label: string;
    hint?: string;
  }[];
}

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
      singleBranch: true,
    });
    s.stop("updated template library");
  } else {
    s.start("downloading template library");
    await git.clone({
      fs,
      http: http,
      url: "https://github.com/TBD54566975/tbd-examples",
      dir: gitDir,
      singleBranch: true,
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

class TemplateData {
  slug: string;
  location: string;
  config: TemplateConfig;
}

async function pickTemplate(
  langDir: string
): Promise<TemplateData | Symbol | null> {
  let templates: { value: TemplateData; label: string; hint?: string }[] = [];
  for (let slug of fs.readdirSync(langDir)) {
    if (slug.startsWith(".")) {
      continue;
    }

    const location = langDir + "/" + slug;

    if (!fs.statSync(location).isDirectory()) {
      continue;
    }

    const templateConfig = location + "/.tbd-example.json";
    try {
      fs.statSync(templateConfig);
    } catch (e) {
      if (e.code === "ENOENT") {
        continue;
      }
      throw e;
    }

    const config: TemplateConfig = JSON.parse(
      fs.readFileSync(templateConfig, "utf-8")
    );

    templates.push({
      value: { slug, location, config },
      label: config.name || slug,
      hint: config.description,
    });
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

async function copyFiles(src: string, dest: string) {
  const s = spinner();
  s.start("copying project files");
  try {
    await copyFilesRecursive(src, dest, s);
  } catch (e) {
    s.stop("failed to copy files template", 1);
    throw e;
  } finally {
    s.stop("copy files template");
  }
}

async function copyFilesRecursive(
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
      await copyFilesRecursive(srcPath, destPath, s);
      continue;
    }

    fs.copyFileSync(srcPath, destPath);
  }
}

async function templateQuestion(question: TemplateVariable): Promise<any> {
  switch (question.type) {
    case "text":
      const re = new RegExp(question.regex || ".*");
      return await text({
        message: question.name,
        validate(value) {
          if (!re.test(value)) {
            return "Must match regex: " + question.regex;
          }
        },
      });
      break;
    case "select":
      if (!question.options) {
        return cancel;
      }

      return await select({
        message: question.name,
        options: question.options,
      });
    default:
      cancel("question of unknown type: " + question.type);
  }
}

async function renderTemplate(
  src: string,
  dest: string,
  questions: Map<string, TemplateVariable>
): Promise<Symbol | undefined> {
  var answers = {};
  for (const [name, question] of Object.entries(questions)) {
    if (!question.name) {
      question.name = name;
    }

    const answer = await templateQuestion(question);
    if (isCancel(answer)) {
      return answer;
    }

    answers[name] = answer;
  }

  const s = spinner();
  s.start("rendering template");
  try {
    await renderTemplateRecursive(src, dest, s, answers);
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
  s: { message: (msg?: string) => void },
  answers
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
      await renderTemplateRecursive(srcPath, destPath, s, answers);
      continue;
    }

    fs.writeFileSync(
      destPath,
      new Eta({ views: src }).render(srcFile, answers)
    );
  }
}

async function main() {
  try {
    intro("Web5 App Creator");
    const cacheDir = await globalCacheDir("web5-app-creator");
    const gitDir = cacheDir + "/tbd-examples";

    await updateCache(gitDir);

    const language = await pickLanguage(gitDir);
    if (isCancel(language)) {
      outro("cancelled");
      return;
    }

    const template = await pickTemplate(gitDir + "/" + language);
    if (isCancel(template) || template instanceof Symbol) {
      outro("cancelled");
      return;
    }

    const dest = await text({
      message: "Where should we put this?",
      initialValue: "./" + template.slug,
      validate(value) {
        if (value.length === 0) return `Value is required!`;
        if (isInvalid(value)) return `invalid path`;
      },
    });
    if (isCancel(dest)) {
      outro("cancelled");
      return;
    }

    if (template.config && template.config.variables) {
      const result = await renderTemplate(
        template.location,
        dest,
        template.config.variables
      );
      if (isCancel(result)) {
        cancel("cancelled");
        return;
      }
    } else {
      await copyFiles(template.location, dest);
    }

    // TODO: customize the post-creation commands by language, allow overriding in the template config
    outro("Done! Now run:\n\n  cd " + dest.toString() + "\n  npm install");
  } catch (e) {
    console.log("\n", e.stack || e);
  }
}

main();
