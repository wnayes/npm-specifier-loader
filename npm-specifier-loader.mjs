/**
 * @file Node.js module loader that can load `npm:` specifier urls.
 */

import { execFileSync } from "node:child_process";
import { homedir } from "node:os";
import { join } from "node:path";
import { pathToFileURL } from "node:url";

const NodeModulesCachePath =
  process.env.NPM_SPECIFIER_LOADER_CACHE_PATH ||
  join(homedir(), ".npm-specifier-cache");

const NPMPath = process.env.NPM_SPECIFIER_LOADER_NPM_PATH || "npm";

/**
 * Module resolve hook.
 * @param {string} specifier
 * @param {unknown} context
 * @param {unknown} nextResolve
 * @returns Loader resolve result.
 */
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("npm:")) {
    const packageName = specifier.substring(4);
    const packageAlias = encodeNpmSpecifier(packageName);
    const cachePath = join(NodeModulesCachePath, "node_modules", packageAlias);
    const installName = `${packageAlias}@npm:${packageName}`;

    execNpmInstall(installName);

    const mainModuleUrlString = await import.meta.resolve(
      packageAlias,
      pathToFileURL(cachePath)
    );

    const resolveResult = {
      shortCircuit: true,
      url: mainModuleUrlString,
    };
    return resolveResult;
  }

  return nextResolve(specifier);
}

/**
 * Invokes `npm install` in the package cache directory.
 * @param {string} packageInstallName Name of package to install
 */
function execNpmInstall(packageInstallName) {
  execFileSync(NPMPath, [
    "install",
    "--no-package-lock",
    "--prefix",
    NodeModulesCachePath,
    packageInstallName,
  ]);
}

/**
 * Encodes an npm specifier into a format acceptable as an package alias.
 * @param {string} specifier Specifier string.
 */
function encodeNpmSpecifier(specifier) {
  return specifier
    .replace(/@/g, "_at_")
    .replace(/\^/g, "_caret_")
    .replace(/~/g, "_tilde_")
    .replace(/>=/g, "_gteq_")
    .replace(/>/g, "_gt_")
    .replace(/<=/g, "_lteq_")
    .replace(/</g, "_lt_")
    .replace(/\*/g, "_any_");
}
