const detect = require('detect-port').default;
const { spawn } = require('child_process');

const defaultPort = 3000;

detect(defaultPort, (err, newPort) => {
    if (err) {
        console.error('Error detecting port:', err);
        process.exit(1);
    }

    if (defaultPort !== newPort) {
        console.log(`Port ${defaultPort} is busy, using port ${newPort} instead.`);
    }

    // Set the PORT environment variable for the child process
    const env = { ...process.env, PORT: newPort };

    // Start the React development server
    const child = spawn('react-scripts', ['start'], { stdio: 'inherit', env, shell: true });

    child.on('close', (code) => {
        if (code !== 0) {
            console.error(`React script exited with code ${code}`);
        }
    });
});
