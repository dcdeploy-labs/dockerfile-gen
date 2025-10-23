#!/usr/bin/env node

/**
 * Dockerfile Generator CLI
 * Main entry point for the command-line interface
 */

import { Command } from 'commander';
import chalk from 'chalk';
import fs from 'fs-extra';
import { detectLanguageAndFramework } from './detectors/languageDetector.js';
import { generateDockerfile } from './utils/templateProcessor.js';

// Helper function to collect multiple values for the same option
function collect(value, previous) {
  return previous.concat([value]);
}
import path from 'path';

const program = new Command();

program
  .name('docker-file-gen')
  .description('Generate Dockerfiles for any programming language and framework')
  .version('1.0.0')
  .argument('<source-path>', 'Path to the source code directory')
  .option('-o, --output <file>', 'Output Dockerfile path (default: ./Dockerfile)')
  .option('-f, --framework <name>', 'Override detected framework')
  .option('-l, --language <name>', 'Override detected language')
  .option('--dev', 'Include development dependencies')
  .option('--port <number>', 'Override default port', '3000')
  .option('--build-image <image>', 'Custom build image (e.g., node:20-alpine, python:3.12-slim, golang:1.22-alpine)')
  .option('--run-image <image>', 'Custom run image (e.g., node:20-slim, python:3.12-slim, alpine:latest)')
  .option('--workdir <path>', 'Custom working directory (default: /app)')
  .option('--env <key=value>', 'Add environment variable (can be used multiple times)', collect, [])
  .option('--arg <key=value>', 'Add ARG variable to both build and runtime stages (can be used multiple times)', collect, [])
  .option('--build-arg <key=value>', 'Add ARG variable only to build stage (can be used multiple times)', collect, [])
  .option('--runtime-arg <key=value>', 'Add ARG variable only to runtime stage (can be used multiple times)', collect, [])
  .option('--build-env <key=value>', 'Add environment variable only to build stage (can be used multiple times)', collect, [])
  .option('--runtime-env <key=value>', 'Add environment variable only to runtime stage (can be used multiple times)', collect, [])
  .option('--build-dep <package>', 'Add system dependency only to build stage (can be used multiple times)', collect, [])
  .option('--runtime-dep <package>', 'Add system dependency only to runtime stage (can be used multiple times)', collect, [])
  .option('--build-cmd <command>', 'Add RUN command only to build stage (can be used multiple times)', collect, [])
  .option('--runtime-cmd <command>', 'Add RUN command only to runtime stage (can be used multiple times)', collect, [])
  .option('--system-dep <package>', 'Add system dependency to both stages (can be used multiple times)', collect, [])
  .option('--run-cmd <command>', 'Add RUN command to both stages (can be used multiple times)', collect, [])
  .option('--verbose', 'Enable verbose output')
  .action(async (sourcePath, options) => {
    try {
      console.log(chalk.blue('🔍 Analyzing project...'));
      
      // Detect language and framework
      const detection = await detectLanguageAndFramework(sourcePath);
      
      if (options.verbose) {
        console.log(chalk.gray(`Detected language: ${detection.language}`));
        console.log(chalk.gray(`Detected framework: ${detection.framework}`));
        console.log(chalk.gray(`Confidence: ${detection.confidence}`));
      }
      
      // Override detection if specified
      const language = options.language || detection.language;
      const framework = options.framework || detection.framework;
      
      if (language === 'unknown') {
        console.error(chalk.red('❌ Could not detect programming language'));
        console.log(chalk.yellow('💡 Try specifying the language manually with --language'));
        process.exit(1);
      }
      
      console.log(chalk.green(`✅ Detected: ${language}${framework !== 'default' ? ` + ${framework}` : ''}`));
      
      // Generate Dockerfile
      console.log(chalk.blue('📝 Generating Dockerfile...'));
      
      // Process environment variables
      const envVars = {};
      const buildEnvVars = {};
      const runtimeEnvVars = {};
      
      if (options.env && options.env.length > 0) {
        options.env.forEach(env => {
          const [key, value] = env.split('=');
          envVars[key] = value;
        });
      }
      
      if (options.buildEnv && options.buildEnv.length > 0) {
        options.buildEnv.forEach(env => {
          const [key, value] = env.split('=');
          buildEnvVars[key] = value;
        });
      }
      
      if (options.runtimeEnv && options.runtimeEnv.length > 0) {
        options.runtimeEnv.forEach(env => {
          const [key, value] = env.split('=');
          runtimeEnvVars[key] = value;
        });
      }

      // Process ARG variables
      const argVars = {};
      const buildArgVars = {};
      const runtimeArgVars = {};
      
      if (options.arg && options.arg.length > 0) {
        options.arg.forEach(arg => {
          const [key, value] = arg.split('=');
          argVars[key] = value;
        });
      }
      
      if (options.buildArg && options.buildArg.length > 0) {
        options.buildArg.forEach(arg => {
          const [key, value] = arg.split('=');
          buildArgVars[key] = value;
        });
      }
      
      if (options.runtimeArg && options.runtimeArg.length > 0) {
        options.runtimeArg.forEach(arg => {
          const [key, value] = arg.split('=');
          runtimeArgVars[key] = value;
        });
      }
      
      // Process system dependencies
      const systemDeps = [];
      const buildSystemDeps = [];
      const runtimeSystemDeps = [];
      
      if (options.systemDep && options.systemDep.length > 0) {
        systemDeps.push(...options.systemDep);
      }
      
      if (options.buildDep && options.buildDep.length > 0) {
        buildSystemDeps.push(...options.buildDep);
      }
      
      if (options.runtimeDep && options.runtimeDep.length > 0) {
        runtimeSystemDeps.push(...options.runtimeDep);
      }
      
      // Process RUN commands
      const runCmds = [];
      const buildRunCmds = [];
      const runtimeRunCmds = [];
      
      if (options.runCmd && options.runCmd.length > 0) {
        runCmds.push(...options.runCmd);
      }
      
      if (options.buildCmd && options.buildCmd.length > 0) {
        buildRunCmds.push(...options.buildCmd);
      }
      
      if (options.runtimeCmd && options.runtimeCmd.length > 0) {
        runtimeRunCmds.push(...options.runtimeCmd);
      }
      

      const dockerfileContent = await generateDockerfile(
        sourcePath,
        language,
        framework,
        {
          isDev: options.dev,
          buildImage: options.buildImage,
          runImage: options.runImage,
          workdir: options.workdir,
          port: options.port,
          envVars,
          argVars,
          buildEnvVars,
          runtimeEnvVars,
          buildArgVars,
          runtimeArgVars,
          systemDeps,
          buildSystemDeps,
          runtimeSystemDeps,
          additionalRunCmds: runCmds,
          buildAdditionalRunCmds: buildRunCmds,
          runtimeAdditionalRunCmds: runtimeRunCmds,
          verbose: options.verbose,
          debug: options.verbose,
          variables: {
            PORT: options.port
          }
        }
      );
      
      // Determine output path
      let outputPath = options.output || path.join(sourcePath, 'Dockerfile');
      
      // If output is a directory, append Dockerfile to it
      if (fs.existsSync(outputPath) && fs.statSync(outputPath).isDirectory()) {
        outputPath = path.join(outputPath, 'Dockerfile');
      }
      
      // Write Dockerfile
      await fs.writeFile(outputPath, dockerfileContent);
      
      console.log(chalk.green(`✅ Dockerfile generated successfully!`));
      console.log(chalk.gray(`📁 Location: ${outputPath}`));
      
      // Show preview
      if (options.verbose) {
        console.log(chalk.blue('\n📋 Generated Dockerfile:'));
        console.log(chalk.gray('─'.repeat(50)));
        console.log(dockerfileContent);
        console.log(chalk.gray('─'.repeat(50)));
      }
      
    } catch (error) {
      console.error(chalk.red(`❌ Error: ${error.message}`));
      if (options.verbose) {
        console.error(chalk.gray(error.stack));
      }
      process.exit(1);
    }
  });

// Add examples
program.addHelpText('after', `
${chalk.blue('Examples:')}
  ${chalk.gray('$')} dockerfile-gen ./my-react-app
  ${chalk.gray('$')} dockerfile-gen ./django-backend --framework django
  ${chalk.gray('$')} dockerfile-gen ./go-service --language go --framework gin
  ${chalk.gray('$')} dockerfile-gen ./nodejs-api --output ./Dockerfile.prod
  ${chalk.gray('$')} dockerfile-gen ./python-app --dev --port 8000 --verbose
  ${chalk.gray('$')} dockerfile-gen ./react-app --build-image node:20-alpine --run-image node:20-slim
  ${chalk.gray('$')} dockerfile-gen ./python-flask --build-image python:3.12-slim --run-image python:3.12-slim
  ${chalk.gray('$')} dockerfile-gen ./go-app --build-image golang:1.22-alpine --run-image alpine:latest
  ${chalk.gray('$')} dockerfile-gen ./java-spring --build-image maven:3.9-openjdk-21 --run-image openjdk:21-jre-slim
  ${chalk.gray('$')} dockerfile-gen ./node-app --env NODE_ENV=production --env DEBUG=false --arg NODE_VERSION=20
  ${chalk.gray('$')} dockerfile-gen ./python-app --system-dep postgresql-client --run-cmd "pip install --upgrade pip"
  ${chalk.gray('$')} dockerfile-gen ./go-app --workdir /app --port 9000 --env GIN_MODE=release

${chalk.blue('Supported Languages:')}
  ${chalk.gray('•')} Node.js (React, Angular, Vue, Next.js, Express, Nest.js, Vite)
  ${chalk.gray('•')} Python (Django, Flask, FastAPI, Tornado)
  ${chalk.gray('•')} Go (Gin, Echo, Fiber)
  ${chalk.gray('•')} Java (Spring Boot, Maven, Gradle)
  ${chalk.gray('•')} C# (.NET, ASP.NET)
  ${chalk.gray('•')} PHP (Laravel, Symfony)
  ${chalk.gray('•')} Ruby (Rails, Sinatra)
  ${chalk.gray('•')} Rust (Actix Web, Rocket)
`);

program.parse();