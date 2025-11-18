# TechKnots Meet

TechKnots Meet is a Google Meet style experience built on **Mediasoup** for ultra-low-latency audio/video routing. It delivers a complete workflow: Google-based authentication, room creation/join flows, a live SFU room with chat, participant controls, and TechKnots emerald/ivory branding.

## Features
- Google OAuth sign-in with JWT session storage
- Secure REST API for meeting lifecycle plus socket.io signalling
- Mediasoup worker with SFU routing, chat relay, and screen sharing support
- React + Vite frontend with Zustand state, mediasoup-client integration, and rich UI components
- Reusable meeting controls, chat side panel, participant tiles, and responsive styles

## Project Structure
- `client/` – React app (Vite) that handles auth, dashboards, meeting UI, and mediasoup-client transport logic.
- `server/` – Express server that exposes auth/room APIs and hosts socket.io + mediasoup worker.

## Requirements
- Node.js **20.19+ or 22.12+** (Vite 7 requires this; upgrade if you see engine warnings)
- npm 10+
- For the mediasoup server on Windows: Microsoft VS Build Tools (Desktop development with C++) installed.

## Setup
1. **Clone / open the repository**
   ```bash
   cd "C:\Users\Annu\Downloads\projects\New folder"
   ```

2. **Configure environment files**
   - `client/env.template` → `client/.env`
     ```
     VITE_GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID
     VITE_SERVER_URL=http://localhost:4000
     ```
   - `server/env.template` → `server/.env`
     ```
     PORT=4000
     CLIENT_ORIGIN=http://localhost:5173
     GOOGLE_CLIENT_ID=YOUR_GOOGLE_OAUTH_CLIENT_ID
     JWT_SECRET=super-secret-string
     MEDIASOUP_LISTEN_IP=0.0.0.0
     MEDIASOUP_ANNOUNCED_IP=127.0.0.1   # replace with public IP for remote clients
     MEDIASOUP_MIN_PORT=40000
     MEDIASOUP_MAX_PORT=49999
     ```

3. **Install dependencies**
   ```bash
   cd server
   npm install

   cd ../client
   npm install
   ```

## Development
Start both services in separate terminals:
```bash
# Terminal 1 – mediasoup/Express server
cd server
npm run dev

# Terminal 2 – Vite frontend
cd client
npm run dev
```
Frontend runs on `http://localhost:5173`, proxying `/api` to the server at `http://localhost:4000`.

## Production Build
```bash
cd client
npm run build
npm run preview   # optional static preview
```
Ensure the server is running (`npm start`) with production env values and that `VITE_SERVER_URL` points to the deployed backend.

## Usage
1. Visit the landing page and sign in with Google.
2. From the dashboard, create a new room or join using an existing meeting code.
3. Inside a room, use the controls to toggle audio/video, share your screen, chat, and leave when finished.

## Notes & Troubleshooting
- Node 22.11.0 is slightly below Vite’s required 22.12+; upgrading Node avoids engine warnings.
- Mediasoup requires UDP ports `MEDIASOUP_MIN_PORT–MEDIASOUP_MAX_PORT` to be open.
- If Google OAuth fails locally, ensure your OAuth consent screen allows `http://localhost:5173` as an authorized origin.

Enjoy crystal-clear sessions with TechKnots Meet!

