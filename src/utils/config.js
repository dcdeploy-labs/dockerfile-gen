import fs from 'fs-extra';
import path from 'path';
import yaml from 'yaml';

/**
 * Configuration management for Dockerfile Generator
 */
export class Config {
  constructor(configPath = null) {
    this.configPath = configPath || path.join(process.cwd(), '.dockerfile-gen.yml');
    this.config = this.getDefaultConfig();
  }

  /**
   * Get default configuration
   */
  getDefaultConfig() {
    return {
      // Default ports for different languages
      defaultPorts: {
        'nodejs': 3000,
        'python': 8000,
        'go': 8080,
        'java': 8080,
        'php': 9000,
        'ruby': 3000,
        'rust': 8080,
        'cpp': 8080,
        'c': 8080,
        'csharp': 5000
      },

      // Default base images
      defaultImages: {
        'nodejs': 'node:22',
        'python': 'python:3.11-slim',
        'go': 'golang:1.21-alpine',
        'java': 'openjdk:17-jre-slim',
        'php': 'php:8.2-fpm',
        'ruby': 'ruby:3.2-alpine',
        'rust': 'rust:1.75-alpine',
        'cpp': 'gcc:latest',
        'c': 'gcc:latest',
        'csharp': 'mcr.microsoft.com/dotnet/aspnet:7.0'
      },

      // Build optimizations
      buildOptimizations: {
        useMultiStage: true,
        useNonRootUser: true,
        minimizeLayers: true,
        useAlpine: true
      },

      // Security settings
      security: {
        scanVulnerabilities: false,
        useDistroless: false,
        addSecurityLabels: true
      },

      // Custom templates
      customTemplates: {},

      // Exclude patterns for file analysis
      excludePatterns: [
        'node_modules/**',
        '.git/**',
        'dist/**',
        'build/**',
        'target/**',
        '__pycache__/**',
        'vendor/**',
        '*.log',
        '*.tmp',
        '.DS_Store'
      ],

      // Framework-specific settings
      frameworkSettings: {
        'react': {
          buildCommand: 'npm run build',
          outputDir: 'build',
          serveCommand: 'npx serve -s build'
        },
        'vue': {
          buildCommand: 'npm run build',
          outputDir: 'dist',
          serveCommand: 'npx serve -s dist'
        },
        'angular': {
          buildCommand: 'npm run build --prod',
          outputDir: 'dist',
          serveCommand: 'npx serve -s dist'
        },
        'nextjs': {
          buildCommand: 'npm run build',
          outputDir: '.next',
          serveCommand: 'npm start'
        }
      }
    };
  }

  /**
   * Load configuration from file
   */
  async loadConfig() {
    try {
      if (await fs.pathExists(this.configPath)) {
        const configContent = await fs.readFile(this.configPath, 'utf8');
        const fileConfig = yaml.parse(configContent);
        this.config = { ...this.config, ...fileConfig };
      }
    } catch (error) {
      console.warn(`Warning: Could not load config file: ${error.message}`);
    }
    return this.config;
  }

  /**
   * Save configuration to file
   */
  async saveConfig() {
    try {
      const configContent = yaml.stringify(this.config);
      await fs.writeFile(this.configPath, configContent);
      return true;
    } catch (error) {
      console.error(`Error saving config: ${error.message}`);
      return false;
    }
  }

  /**
   * Get configuration value
   */
  get(key, defaultValue = null) {
    const keys = key.split('.');
    let value = this.config;
    
    for (const k of keys) {
      if (value && typeof value === 'object' && k in value) {
        value = value[k];
      } else {
        return defaultValue;
      }
    }
    
    return value;
  }

  /**
   * Set configuration value
   */
  set(key, value) {
    const keys = key.split('.');
    let current = this.config;
    
    for (let i = 0; i < keys.length - 1; i++) {
      const k = keys[i];
      if (!(k in current) || typeof current[k] !== 'object') {
        current[k] = {};
      }
      current = current[k];
    }
    
    current[keys[keys.length - 1]] = value;
  }

  /**
   * Get default port for language
   */
  getDefaultPort(language) {
    return this.get(`defaultPorts.${language}`, 8080);
  }

  /**
   * Get default base image for language
   */
  getDefaultImage(language) {
    return this.get(`defaultImages.${language}`, 'alpine:latest');
  }

  /**
   * Get framework-specific settings
   */
  getFrameworkSettings(framework) {
    return this.get(`frameworkSettings.${framework}`, {});
  }

  /**
   * Check if build optimization is enabled
   */
  isBuildOptimizationEnabled(optimization) {
    return this.get(`buildOptimizations.${optimization}`, false);
  }

  /**
   * Get exclude patterns
   */
  getExcludePatterns() {
    return this.get('excludePatterns', []);
  }

  /**
   * Add custom template
   */
  addCustomTemplate(language, framework, template) {
    if (!this.config.customTemplates[language]) {
      this.config.customTemplates[language] = {};
    }
    this.config.customTemplates[language][framework] = template;
  }

  /**
   * Get custom template
   */
  getCustomTemplate(language, framework) {
    return this.get(`customTemplates.${language}.${framework}`, null);
  }

  /**
   * Validate configuration
   */
  validateConfig() {
    const errors = [];

    // Validate default ports
    const defaultPorts = this.get('defaultPorts', {});
    for (const [language, port] of Object.entries(defaultPorts)) {
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        errors.push(`Invalid port for ${language}: ${port}`);
      }
    }

    // Validate default images
    const defaultImages = this.get('defaultImages', {});
    for (const [language, image] of Object.entries(defaultImages)) {
      if (typeof image !== 'string' || image.trim() === '') {
        errors.push(`Invalid image for ${language}: ${image}`);
      }
    }

    return errors;
  }

  /**
   * Reset to default configuration
   */
  resetToDefault() {
    this.config = this.getDefaultConfig();
  }

  /**
   * Get all configuration as object
   */
  getAll() {
    return { ...this.config };
  }
}