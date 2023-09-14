import fs from "fs";

const paths = ["dist"];
for (const path of paths) {
  if (fs.existsSync(path)) {
    fs.rmSync(path, { recursive: true });
    console.log(`deleted ${path}`);
  }
}
