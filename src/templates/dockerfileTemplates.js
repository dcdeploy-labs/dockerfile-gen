import fs from 'fs-extra';
import path from 'path';

/**
 * Load Dockerfile template from file
 */
async function loadTemplate(language, framework) {
  const templatePath = path.join(process.cwd(), 'src', 'templates', 'dockerfiles', language, `${framework}.tmpl`);
  
  try {
    if (await fs.pathExists(templatePath)) {
      return await fs.readFile(templatePath, 'utf8');
    }
  } catch (error) {
    console.warn(`Warning: Could not load template ${language}/${framework}: ${error.message}`);
  }
  
  return null;
}

/**
 * Get Dockerfile template from file system
 */
export async function getDockerfileTemplate(language, framework = 'default') {
  const template = await loadTemplate(language, framework);
  
  if (!template) {
    throw new Error(`Template not found for ${language}/${framework}`);
  }
  
  return template;
}

/**
 * Get all available languages
 */
export function getAvailableLanguages() {
  return ['nodejs', 'python', 'go', 'java', 'php', 'ruby', 'rust', 'cpp', 'c', 'csharp'];
}

/**
 * Get all available frameworks for a language
 */
export async function getAvailableFrameworks(language) {
  const frameworksDir = path.join(process.cwd(), 'src', 'templates', 'dockerfiles', language);
  
  try {
    if (await fs.pathExists(frameworksDir)) {
      const files = await fs.readdir(frameworksDir);
      return files
        .filter(file => file.endsWith('.tmpl'))
        .map(file => file.replace('.tmpl', ''));
    }
  } catch (error) {
    console.warn(`Warning: Could not read frameworks for ${language}: ${error.message}`);
  }
  
  return ['default'];
}