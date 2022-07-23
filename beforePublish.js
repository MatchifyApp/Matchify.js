const cp = require("child_process");
const fs = require("fs");

const readdir = require("recursive-readdir");


(async () => {
  console.log("clearing old d.ts");
  let files = await readdir("./src");
  files.filter(i => i.endsWith(".d.ts")).forEach(file => {
    fs.unlinkSync(file);
    console.log("unlinked", file);
  });
  console.log("generating fresh d.ts");
  cp.execSync(`tsc --allowJs -m commonjs --emitDeclarationOnly -d src/index.js`);
  console.log("done");
  setTimeout(() => { }, 2000);
})();
