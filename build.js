const esbuild = require("esbuild");
const c = require("child_process");

function runInstall() {
  c.spawnSync(
    "../aha-cli/bin/run",
    ["extension:install", "-s", process.env.SUBDOMAIN],
    {
      stdio: ["pipe", process.stdout, process.stderr],
    }
  );
}

esbuild
  .build({
    entryPoints: ["src/index.tsx"],
    outfile: "dist/bundle.js",
    bundle: true,
    external: ["react"],
    loader: {
      ".png": "dataurl",
      ".svg": "binary",
      ".css": "dataurl",
    },
    format: "esm",
    target: ["es2020"],
    watch: {
      onRebuild(error, result) {
        if (error) {
          console.error("watch build failed:", error);
          return;
        }

        runInstall();
      },
    },
  })
  .then(() => {
    runInstall();
  });
