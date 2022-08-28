# npm-specifier-loader

Node.js ["experimental" module loader](https://nodejs.org/api/esm.html#loaders) enabling support for npm specifier imports.

This is inspired by the [similar feature announced for Deno](https://deno.com/blog/changes#compatibility-with-node-and-npm),
and is a proof of concept providing the same functionality in Node.js.

Using this module loader, you can write code like the following and execute it in Node.js:

```js
import express from "npm:express@4";

const app = express();
const port = 3000;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
```

See the `demos` folder in the repository for other examples of the syntax.

## Setup

Requires Node 16+.

Node needs to be invoked with a couple special command line flags in order to use this module loader.

- `--experimental-loader /path/to/npm-specifier-loader.mjs`
  - To configure use of the loader.
- `--experimental-import-meta-resolve`
  - To enable an experimental API that the loader relies on.

There are a few ways you could go about supplying these command line args.

For example, if you want this to work at the system level for any script, the following works:

```bash
# Install the loader globally.
npm install -g npm-specifier-loader

# Set or update the NODE_OPTIONS environment variable so all invocations of node use the loader.
# The way to do this varies based on your operating system / shell.
export NODE_OPTIONS=--experimental-import-meta-resolve --experimental-loader npm-specifier-loader

# Run scripts anywhere!
node ./my-script.mjs
```

If you want to only use the loader in certain circumstances, you can `npm install` it into a local location
and explicitly pass the flags to node.

```
node --experimental-import-meta-resolve --experimental-loader ./path/to/npm-specifier-loader.mjs ./my-script.mjs
```

## Configuration

The loader works by installing npm packages on the fly as they are needed.

By default, the packages are downloaded into the `~/.npm-specifier-cache` home directory folder.
To customize this location, set the full path of a different directory to the `NPM_SPECIFIER_LOADER_CACHE_PATH` environment variable.

By default, the loader invokes `npm install` assuming `npm` is available in the system path.
To customize which `npm` to use, set the `NPM_SPECIFIER_LOADER_NPM_PATH` environment variable to the full path where npm is found.

## Caveats

- Each time you start node and import a given npm specifier, `npm install` will be performed.
  With the local file cache, this should not take too long for subsequent runs, but it still
  involves a process execution. This approach is done to ensure that the npm package requested
  is always up to date.
  - If you ask for `express@5` for example, you'll always get the latest patch version for `express` v5, regardless of the cache folder contents at the time of startup.
