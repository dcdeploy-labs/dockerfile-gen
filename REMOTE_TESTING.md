# Remote Testing Guide

This guide explains how to test the `@dcdeploy/dockerfile-gen` package on a remote Docker server.

## Prerequisites

- A remote server with Docker installed
- SSH access to the remote server
- The `@dcdeploy/dockerfile-gen` package published to npm

## Setup

1. **Copy the configuration template:**
   ```bash
   cp remote-config.example remote-config
   ```

2. **Edit the configuration:**
   ```bash
   nano remote-config
   ```
   
   Update with your server details:
   ```bash
   REMOTE_HOST=user@your-server.com
   REMOTE_PATH=/tmp/dockerfile-gen-test
   ```

3. **Load the configuration:**
   ```bash
   source remote-config
   ```

## Usage

### Test a single example:
```bash
REMOTE_HOST=user@host ./test-remote.sh express-app
```

### Test all examples:
```bash
REMOTE_HOST=user@host ./test-remote.sh all
```

### Test with custom port:
```bash
REMOTE_HOST=user@host ./test-remote.sh go-app 8080
```

### Cleanup containers:
```bash
REMOTE_HOST=user@host ./test-remote.sh cleanup
```

## Environment Variables

- `REMOTE_HOST` (required): SSH connection string (e.g., `user@host`)
- `REMOTE_PATH` (optional): Remote directory path (default: `/tmp/dockerfile-gen-test`)

## Examples

### Express App
```bash
REMOTE_HOST=user@host ./test-remote.sh express-app
```

### Go App
```bash
REMOTE_HOST=user@host ./test-remote.sh go-app 8080
```

### Python Flask
```bash
REMOTE_HOST=user@host ./test-remote.sh python-flask 5000
```

## Security Notes

- Never commit `remote-config` files to version control
- Use SSH keys instead of passwords when possible
- The `remote-config` file is already added to `.gitignore`

## Troubleshooting

### "REMOTE_HOST environment variable not set"
Make sure to set the `REMOTE_HOST` environment variable:
```bash
export REMOTE_HOST=user@host
```

### SSH connection issues
Test your SSH connection manually:
```bash
ssh $REMOTE_HOST
```

### Docker not found on remote server
Install Docker on the remote server:
```bash
ssh $REMOTE_HOST "curl -fsSL https://get.docker.com -o get-docker.sh && sh get-docker.sh"
```
