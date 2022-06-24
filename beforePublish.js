const cp = require("child_process");
const fs = require("fs");

const readdir = require("recursive-readdir");


(async () => {
  let files = await readdir("./src");
  files.filter(i => i.endsWith(".d.ts")).forEach(file => {
    fs.unlinkSync(file);
  });
  cp.execSync(`tsc --allowJs -m commonjs --emitDeclarationOnly -d src/index.js`);
  console.log("done");
})();
