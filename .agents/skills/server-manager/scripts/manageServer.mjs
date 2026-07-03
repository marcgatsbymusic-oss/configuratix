import { execSync, spawn } from 'child_process';
import fs from 'fs';

const action = process.argv[2];

if (!action || !['start', 'stop', 'restart', 'status'].includes(action)) {
    console.log("Usage: node manageServer.mjs [start|stop|restart|status]");
    process.exit(1);
}

function getPidsOnPort(port) {
    try {
        const output = execSync(`netstat -ano | findstr :${port}`).toString();
        const pids = new Set();
        output.split('\n').forEach(line => {
             const parts = line.trim().split(/\s+/);
             if (parts.length >= 5 && parts[1].includes(`:${port}`) && parts[3] === 'LISTENING') {
                 pids.add(parts[4]);
             }
        });
        return Array.from(pids);
    } catch (e) {
        return [];
    }
}

function stopServer() {
    console.log("Stopping server on port 5173...");
    const pids = getPidsOnPort(5173);
    if (pids.length === 0) {
        console.log("No server found running on port 5173.");
        return false;
    }
    for (const pid of pids) {
        try {
            execSync(`taskkill /PID ${pid} /F`);
            console.log(`Killed PID ${pid}.`);
        } catch(e) {
            console.log(`Failed to kill PID ${pid}.`);
        }
    }
    return true;
}

function startServer() {
    const pids = getPidsOnPort(5173);
    if (pids.length > 0) {
        console.log(`Server already running on PIDs: ${pids.join(', ')}`);
        return;
    }
    console.log("Starting server (npm run dev)...");
    
    const out = fs.openSync('./server.log', 'w');
    const err = fs.openSync('./server_err.log', 'w');
    
    const child = spawn('npm', ['run', 'dev'], {
        stdio: ['ignore', out, err],
        detached: true,
        shell: true
    });
    child.unref();
    console.log("Server started in background.");
}

if (action === 'status') {
    const pids = getPidsOnPort(5173);
    if (pids.length > 0) {
        console.log(`Server is running (PIDs: ${pids.join(', ')})`);
    } else {
        console.log("Server is stopped.");
    }
}

if (action === 'stop') {
    stopServer();
}

if (action === 'start') {
    startServer();
}

if (action === 'restart') {
    stopServer();
    setTimeout(() => {
        startServer();
    }, 1000);
}
