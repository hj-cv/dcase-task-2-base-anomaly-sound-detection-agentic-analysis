# Acoustic Anomaly Triage

A browser-based dashboard for reviewing acoustic anomaly candidates from manufacturing equipment.

The app provides a live operations overview, segment-level waveform inspection, testbed monitoring, and generated maintenance reports for abnormal sound patterns.

## Requirements

- Node.js 20 or newer
- npm

## Run Locally

Install dependencies:

```bash
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

If the app is running on a remote machine, open it with that machine's address instead of `localhost`.

Example with Tailscale:

```text
http://100.114.217.123:3000
```

When using VS Code Remote, the editor may also offer to forward port `3000` automatically.

## Scripts

```bash
npm run dev      # start the local development server
npm run build    # build the production bundle
npm run start    # run the production server after build
npm run lint     # type-check the project
```
