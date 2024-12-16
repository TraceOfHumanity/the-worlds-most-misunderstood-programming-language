import {exec, execFile, spawn, fork} from "child_process";
import path from "path";
import {fileURLToPath} from "url";
import {dirname} from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// execFile
const fileProcessorPath = path.resolve(__dirname, "execFileProcessor.js");
execFile("node", [fileProcessorPath], (error, stdout, stderr) => {
  if (error) {
    console.error(`error: ${error.message}`);
    return;
  }

  if (stderr) {
    console.error(`stderr: ${stderr}`);
    return;
  }

  console.log(`stdout:\n${stdout}`);
});
