const { spawn } = require('node:child_process');

const subprocess = spawn('ls', ['-l']);

subprocess.stdout.on('data', (data) => {
    console.log(`stdout: ${data}`);
});

subprocess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
});

subprocess.on('close', (code) => {
    console.log(`child process exited with code ${code}`);
});