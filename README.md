# dcase-task-2-base-anomaly-sound-detection-agentic-analysis

A browser-based dashboard for reviewing DCASE Task 2 anomaly sound detection
candidates from manufacturing equipment.

The application helps operators inspect abnormal sound patterns, review
segment-level waveform details, monitor testbed devices, and generate
maintenance-oriented analysis reports.

## Project Structure

```text
.
├── README.md
└── dcase-task-2-base-anomaly-sound-detection-agentic-analysis/
    ├── src/
    ├── server.ts
    ├── package.json
    └── vite.config.ts
```

The runnable application lives in
`dcase-task-2-base-anomaly-sound-detection-agentic-analysis/`. This root README
is the single project README.

## Requirements

- Node.js 20 or newer
- npm

## Run Locally

Install dependencies:

```bash
cd dcase-task-2-base-anomaly-sound-detection-agentic-analysis
npm install
```

Start the development server:

```bash
npm run dev
```

Open the app:

```text
http://localhost:3000
```

## Remote Server Access

If the app is running on a remote machine, open it with that machine's address
instead of `localhost`.

Example with Tailscale:

```text
http://100.114.217.123:3000
```

When using VS Code Remote, the editor may also offer to forward port `3000`
automatically.

## Scripts

Run these commands from
`dcase-task-2-base-anomaly-sound-detection-agentic-analysis/`:

```bash
npm run dev      # start the local development server
npm run build    # build the production bundle
npm run start    # run the production server after build
npm run lint     # type-check the project
npm run clean    # remove generated build output
```

## Environment

Copy `.env.example` to `.env` when deployment-specific settings are needed.

```bash
cp .env.example .env
```

Set `APP_URL` to the URL where the app is hosted.
