/**
 * Dockerfile Generator
 * Main module for programmatic usage
 */

import { detectLanguageAndFramework } from './detectors/languageDetector.js';
import { generateDockerfile } from './utils/templateProcessor.js';

/**
 * Generate a Dockerfile for a given project
 * @param {string} projectPath - Path to the project directory
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated Dockerfile content
 */
export async function generateDockerfileForProject(projectPath, options = {}) {
  try {
    // Detect language and framework
    const detection = await detectLanguageAndFramework(projectPath);
    
    // Use provided overrides or detected values
    const language = options.language || detection.language;
    const framework = options.framework || detection.framework;
    
    if (language === 'unknown') {
      throw new Error('Could not detect programming language. Please specify manually.');
    }
    
    // Generate Dockerfile
    const dockerfileContent = await generateDockerfile(
      projectPath,
      language,
      framework,
      options
    );
    
    return dockerfileContent;
  } catch (error) {
    throw new Error(`Failed to generate Dockerfile: ${error.message}`);
  }
}

/**
 * Detect language and framework for a project
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Object>} Detection result
 */
export async function detectProject(projectPath) {
  return await detectLanguageAndFramework(projectPath);
}

// Re-export utilities for advanced usage
export { detectLanguageAndFramework } from './detectors/languageDetector.js';
export { generateDockerfile } from './utils/templateProcessor.js';
export { PACKAGE_MANAGERS, detectPackageManager } from './utils/packageManagerConfig.js';