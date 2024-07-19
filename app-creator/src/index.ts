import globalCacheDir from "global-cache-dir";
import { intro, outro, spinner, select } from "@clack/prompts";
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

async function main() {
  intro("TBD App Creator");
  const cacheDir = await globalCacheDir("tbd-app-creator");
  const gitDir = cacheDir + "/tbd-examples";

  await updateCache(gitDir);

  const languages = fs.readdirSync(gitDir);
  const projectType = await select({
    message: "Select a language.",
    options: [
      { value: "javascript", label: "JavaScript" },
      { value: "kotlin", label: "Kotlin" },
      { value: "swift", label: "Swift" },
    ],
  });
  outro("thanks for playing");
}

main();
