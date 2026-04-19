---
name: server-manager
description: Provides a consistent way to securely turn the local Vite development server on, off, restart it, or check its status.
---

# Local Server Manager Skill

This skill guarantees that the agent and the user can easily manage the local development server lifecycle, prevent port collisions (which happen frequently when background Node tasks hang), and verify the server's uptime status.

## When to use this skill
- When you need to turn the UI server `on` (start) before running browser tests or checking visual parity.
- When you need to turn the server `off` (stop) because of persistent 500 errors, cache poisoning, or to free up port resources.
- If the user explicitly asks to "reboot the server" or "restart local server".
- Whenever a terminal returns `EADDRINUSE` (port already in use) for port 5173.

## Configuration Details
- **Port:** `5173` (Vite Default)
- **Command:** `npm run dev`

## How to use it

We have bundled a standalone Node script that interacts directly with Windows `netstat` and `taskkill` to safely detach, supervise, and destroy server instances safely. 

**Path:** `.agents/skills/server-manager/scripts/manageServer.mjs`

### Available Commands:

**1. Start the Server:**
Spins up the server in a detached background process.
```bash
node .agents/skills/server-manager/scripts/manageServer.mjs start
```

**2. Stop the Server:**
Forcefully hunts down any Node processes bound to port 5173 and terminates them.
```bash
node .agents/skills/server-manager/scripts/manageServer.mjs stop
```

**3. Restart the Server:**
Runs the stop command, waits 1 second, and starts a fresh instance.
```bash
node .agents/skills/server-manager/scripts/manageServer.mjs restart
```

**4. Check Server Status:**
Verifies if any processes are currently listening on port 5173 and returns their PIDs.
```bash
node .agents/skills/server-manager/scripts/manageServer.mjs status
```
