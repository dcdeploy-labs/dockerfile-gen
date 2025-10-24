/**
 * Template Processor
 * Handles loading and processing of Dockerfile templates with placeholders
 */

import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';
import { detectPackageManager, getTemplateVariables, processTemplate } from './packageManagerConfig.js';

// Get the directory of the current module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Detect TypeScript output directory from tsconfig.json
 * @param {string} projectPath - Path to the project
 * @returns {Promise<string>} Output directory (default: 'dist')
 */
async function detectTypeScriptOutputDir(projectPath) {
  try {
    const tsconfigPath = path.join(projectPath, 'tsconfig.json');
    
    if (await fs.pathExists(tsconfigPath)) {
      const tsconfig = await fs.readJson(tsconfigPath);
      const outDir = tsconfig.compilerOptions?.outDir;
      
      if (outDir) {
        // Remove leading './' and trailing '/' if present
        const cleanOutDir = outDir.replace(/^\.\//, '').replace(/\/$/, '');
        return cleanOutDir || 'dist';
      }
    }
  } catch (error) {
    // If tsconfig.json doesn't exist or is invalid, fall back to default
    console.warn(`Warning: Could not read tsconfig.json: ${error.message}`);
  }
  
  return 'dist'; // Default fallback for all cases
}

/**
 * Detect React output directory based on build tool
 * @param {string} projectPath - Path to the project
 * @returns {Promise<string>} Output directory ('build' for react-scripts, 'dist' for Vite, etc.)
 */
async function detectReactOutputDir(projectPath) {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    
    if (await fs.pathExists(packageJsonPath)) {
      const packageJson = await fs.readJson(packageJsonPath);
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };
      
      // Check for Vite (outputs to 'dist')
      if (dependencies.vite) {
        return 'dist';
      }
      
      // Check for react-scripts (outputs to 'build')
      if (dependencies['react-scripts']) {
        return 'build';
      }
      
      // Check for Next.js (outputs to '.next')
      if (dependencies.next) {
        return '.next';
      }
    }
  } catch (error) {
    console.warn(`Warning: Could not read package.json: ${error.message}`);
  }
  
  return 'dist'; // Default fallback
}

/**
 * Clean up empty comment blocks from Dockerfile
 * @param {string} content - Dockerfile content
 * @returns {string} Cleaned Dockerfile content
 */
function cleanEmptyCommentBlocks(content) {
  // Remove comment lines followed by empty lines when there's no content
  const lines = content.split('\n');
  const cleanedLines = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const nextLine = lines[i + 1];
    const nextNextLine = lines[i + 2];
    
    // Check if this is a comment line that should be removed
    if (line.match(/^# (Set (ARG variables|environment variables|system dependencies|Additional RUN commands)|Install system dependencies|Additional RUN commands)$/)) {
      // Check if the next 1-2 lines are empty or contain only whitespace
      if ((nextLine === '' || nextLine.match(/^\s*$/)) && 
          (nextNextLine === '' || nextNextLine.match(/^\s*$/) || nextNextLine.match(/^#/) || nextNextLine.match(/^FROM/) || nextNextLine.match(/^WORKDIR/) || nextNextLine.match(/^COPY/) || nextNextLine.match(/^RUN/) || nextNextLine.match(/^EXPOSE/) || nextNextLine.match(/^CMD/) || nextNextLine.match(/^USER/) || nextNextLine.match(/^ENV/) || nextNextLine.match(/^ARG/))) {
        // Skip this comment line and the following empty line(s)
        if (nextLine === '' || nextLine.match(/^\s*$/)) {
          i++; // Skip the empty line after the comment
        }
        continue;
      }
    }
    
    cleanedLines.push(line);
  }
  
  // Remove multiple consecutive empty lines
  const finalLines = [];
  let lastWasEmpty = false;
  
  for (const line of cleanedLines) {
    if (line === '' || line.match(/^\s*$/)) {
      if (!lastWasEmpty) {
        finalLines.push(line);
      }
      lastWasEmpty = true;
    } else {
      finalLines.push(line);
      lastWasEmpty = false;
    }
  }
  
  return finalLines.join('\n');
}

/**
 * Get default base images for a language
 * @param {string} language - Programming language
 * @returns {Object} Default build and run images
 */
function getDefaultImages(language) {
  const defaults = {
    'nodejs': {
      build: 'node:22',
      run: 'node:22-alpine'
    },
    'python': {
      build: 'python:3.11-slim',
      run: 'python:3.11-slim'
    },
    'go': {
      build: 'golang:1.21-alpine',
      run: 'alpine:latest'
    },
    'java': {
      build: 'maven:3.9-openjdk-17',
      run: 'openjdk:17-jre-slim'
    }
  };
  
  return defaults[language] || defaults.nodejs;
}

/**
 * Get environment variables for a language
 * @param {string} language - Programming language
 * @param {Object} options - Additional options
 * @returns {string} Environment variables as Dockerfile ENV commands
 */
function getEnvVariables(language, options) {
  const envVars = options.envVars || {};
  const customEnvs = Object.entries(envVars).map(([key, value]) => `${key}=${value}`);
  return customEnvs.map(env => `ENV ${env}`).join('\n');
}

/**
 * Get ARG variables for a language
 * @param {string} language - Programming language
 * @param {Object} options - Additional options
 * @returns {string} ARG variables as Dockerfile ARG commands
 */
function getArgVariables(language, options) {
  const argVars = options.argVars || {};
  const customArgs = Object.entries(argVars).map(([key, value]) => `${key}=${value}`);
  return customArgs.map(arg => `ARG ${arg}`).join('\n');
}

/**
 * Get system dependencies for a language
 * @param {string} language - Programming language
 * @param {Object} options - Additional options
 * @returns {string} System dependencies as RUN commands
 */
function getSystemDependencies(language, options) {
  const additionalDeps = options.systemDeps || [];
  
  if (additionalDeps.length === 0) return '';
  
  return `RUN ${additionalDeps.join(' \\\n    && ')}`;
}

/**
 * Get additional RUN commands
 * @param {string} language - Programming language
 * @param {Object} options - Additional options
 * @returns {string} Additional RUN commands
 */
function getAdditionalRunCommands(language, options) {
  const additionalCmds = options.additionalRunCmds || [];
  
  if (additionalCmds.length === 0) return '';
  
  return additionalCmds.map(cmd => `RUN ${cmd}`).join('\n');
}

/**
 * Get default port for a language
 * @param {string} language - Programming language
 * @returns {number} Default port
 */
function getDefaultPort(language) {
  const defaults = {
    'nodejs': 3000,
    'python': 8000,
    'go': 8080,
    'java': 8080
  };
  
  return defaults[language] || 3000;
}

/**
 * Load and process a Dockerfile template
 * @param {string} templatePath - Path to the template file
 * @param {string} projectPath - Path to the project directory
 * @param {string} language - Programming language
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Processed Dockerfile content
 */
export async function processDockerfileTemplate(templatePath, projectPath, language, options = {}) {
  try {
    // Load the template
    const template = await fs.readFile(templatePath, 'utf8');
    
    // Detect package manager
    const packageManager = await detectPackageManager(projectPath);
    
    // Determine if we need dev dependencies (for build stages)
    const isDev = options.isDev || false;
    
    // Get template variables for build stage (always use dev dependencies for building)
    const buildVariables = getTemplateVariables(packageManager, true);
    
    // Get template variables for runtime stage (use production dependencies)
    const runtimeVariables = getTemplateVariables(packageManager, false);
    
    // Start with build variables as base
    const variables = { ...buildVariables, ...runtimeVariables };
    
    // Add default image variables based on language
    const defaultImages = getDefaultImages(language);
    variables.BUILD_IMAGE = options.buildImage || defaultImages.build;
    variables.RUN_IMAGE = options.runImage || defaultImages.run;
    
    // Add environment variables
    variables.ENV_VARS = getEnvVariables(language, { ...options, framework: options.framework || 'default' });
    variables.ARG_VARS = getArgVariables(language, options);
    variables.SYSTEM_DEPS = getSystemDependencies(language, options);
    variables.ADDITIONAL_RUN_CMDS = getAdditionalRunCommands(language, options);
    variables.PORT = options.port || getDefaultPort(language);
    variables.WORKDIR = options.workdir || '/app';
    
    // Add separate build and runtime variables
    const buildArgVars = { ...(options.argVars || {}), ...(options.buildArgVars || {}) };
    const runtimeArgVars = { ...(options.argVars || {}), ...(options.runtimeArgVars || {}) };
    const buildEnvVars = { ...(options.envVars || {}), ...(options.buildEnvVars || {}) };
    const runtimeEnvVars = { ...(options.envVars || {}), ...(options.runtimeEnvVars || {}) };
    
    variables.BUILD_ARG_VARS = getArgVariables(language, { argVars: buildArgVars });
    variables.RUNTIME_ARG_VARS = getArgVariables(language, { argVars: runtimeArgVars });
    variables.BUILD_ENV_VARS = getEnvVariables(language, { envVars: buildEnvVars });
    variables.RUNTIME_ENV_VARS = getEnvVariables(language, { envVars: runtimeEnvVars });
    
    // Add separate install commands for build and runtime stages
    variables.BUILD_INSTALL_CMD = buildVariables.INSTALL_CMD;
    variables.RUNTIME_INSTALL_CMD = runtimeVariables.INSTALL_CMD;
    
    // Detect TypeScript output directory for TypeScript frameworks
    if (language === 'nodejs' && (options.framework?.includes('ts') || options.framework?.includes('typescript'))) {
      variables.BUILD_OUTPUT_DIR = await detectTypeScriptOutputDir(projectPath);
    } else if (language === 'nodejs' && (options.framework === 'react' || options.framework === 'vite')) {
      // Detect React build tool to determine output directory
      variables.BUILD_OUTPUT_DIR = await detectReactOutputDir(projectPath);
    } else {
      variables.BUILD_OUTPUT_DIR = 'dist'; // Default fallback
    }
    variables.BUILD_SYSTEM_DEPS = getSystemDependencies(language, { 
      systemDeps: [...(options.systemDeps || []), ...(options.buildSystemDeps || [])]
    });
    variables.RUNTIME_SYSTEM_DEPS = getSystemDependencies(language, { 
      systemDeps: [...(options.systemDeps || []), ...(options.runtimeSystemDeps || [])]
    });
    variables.BUILD_ADDITIONAL_RUN_CMDS = getAdditionalRunCommands(language, { 
      additionalRunCmds: [...(options.additionalRunCmds || []), ...(options.buildAdditionalRunCmds || [])]
    });
    variables.RUNTIME_ADDITIONAL_RUN_CMDS = getAdditionalRunCommands(language, { 
      additionalRunCmds: [...(options.additionalRunCmds || []), ...(options.runtimeAdditionalRunCmds || [])]
    });
    
    // Add any additional variables from options
    if (options.variables) {
      Object.assign(variables, options.variables);
    }
    
    // Process the template
    let processedTemplate = processTemplate(template, variables);
    
    // Clean up empty comment blocks unless in debug mode
    if (!options.verbose && !options.debug) {
      processedTemplate = cleanEmptyCommentBlocks(processedTemplate);
    }
    
    return processedTemplate;
  } catch (error) {
    throw new Error(`Failed to process template ${templatePath}: ${error.message}`);
  }
}

/**
 * Get the appropriate template path based on language and framework
 * @param {string} language - Programming language
 * @param {string} framework - Framework name
 * @returns {string} Template path
 */
export function getTemplatePath(language, framework = 'default') {
  return path.join(__dirname, '..', 'templates', 'dockerfiles', language, `${framework}.tmpl`);
}

/**
 * Process multiple templates and return the best match
 * @param {string} projectPath - Path to the project directory
 * @param {string} language - Programming language
 * @param {string} framework - Framework name
 * @param {Object} options - Additional options
 * @returns {Promise<string>} Processed Dockerfile content
 */
export async function generateDockerfile(projectPath, language, framework = 'default', options = {}) {
  const templatePath = getTemplatePath(language, framework);
  
  try {
    return await processDockerfileTemplate(templatePath, projectPath, language, { ...options, framework });
  } catch (error) {
    // Fallback to default template if framework-specific template doesn't exist
    if (framework !== 'default') {
      console.warn(`Framework template not found: ${framework}, falling back to default`);
      const defaultTemplatePath = getTemplatePath(language, 'default');
      return await processDockerfileTemplate(defaultTemplatePath, projectPath, language, { ...options, framework: 'default' });
    }
    throw error;
  }
}

// Export the TypeScript output directory detection function for testing
export { detectTypeScriptOutputDir };
