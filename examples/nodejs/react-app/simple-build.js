#!/usr/bin/env node

// Simple build script for React app
const fs = require('fs');
const path = require('path');

console.log('Building React app...');

// Create build directory
const buildDir = path.join(__dirname, 'build');
if (!fs.existsSync(buildDir)) {
  fs.mkdirSync(buildDir, { recursive: true });
}

// Create static directory
const staticDir = path.join(buildDir, 'static', 'js');
if (!fs.existsSync(staticDir)) {
  fs.mkdirSync(staticDir, { recursive: true });
}

// Create a simple HTML file
const htmlContent = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="theme-color" content="#000000" />
    <meta name="description" content="React example app for Dockerfile generation" />
    <title>React App</title>
    <style>
      body {
        margin: 0;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
          'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
          sans-serif;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
      }
      .App {
        text-align: center;
        background-color: #282c34;
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        font-size: calc(10px + 2vmin);
        color: white;
      }
      .App-header {
        background-color: #282c34;
        padding: 20px;
        color: white;
      }
      .App-header h1 {
        margin: 0 0 20px 0;
      }
      .App-header p {
        margin: 10px 0;
        font-size: 18px;
      }
    </style>
  </head>
  <body>
    <noscript>You need to enable JavaScript to run this app.</noscript>
    <div id="root">
      <div class="App">
        <header class="App-header">
          <h1>React Example App</h1>
          <p>This is a React app generated for Dockerfile testing.</p>
          <p>Built with Dockerfile Generator! 🐳</p>
          <p>SPA routing works - try /test or /about</p>
        </header>
      </div>
    </div>
  </body>
</html>`;

// Write HTML file
fs.writeFileSync(path.join(buildDir, 'index.html'), htmlContent);

// Create a simple JS file
const jsContent = `console.log('React app loaded successfully!');`;

fs.writeFileSync(path.join(staticDir, 'main.js'), jsContent);

console.log('✅ React app built successfully!');
console.log('Build directory created:', buildDir);
console.log('Files created:');
console.log('- build/index.html');
console.log('- build/static/js/main.js');
