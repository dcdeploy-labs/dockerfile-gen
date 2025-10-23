/**
 * Default configuration for Dockerfile Generator
 */

export const DEFAULT_CONFIG = {
  // Language detection settings
  languageDetection: {
    minConfidence: 0.1,
    maxFilesToScan: 50,
    supportedExtensions: [
      '.js', '.ts', '.jsx', '.tsx', '.mjs',
      '.py', '.pyw',
      '.go',
      '.java', '.class',
      '.php', '.phtml',
      '.rb',
      '.rs',
      '.cs', '.csx',
      '.cpp', '.cxx', '.cc', '.c++', '.hpp', '.hxx', '.h',
      '.c'
    ]
  },

  // Framework detection settings
  frameworkDetection: {
    minConfidence: 0.1,
    maxSourceFilesToScan: 20,
    dependencyWeight: 5,
    fileWeight: 3,
    keywordWeight: 1,
    configFileWeight: 2
  },

  // Dockerfile generation settings
  dockerfile: {
    defaultPort: 3000,
    defaultVersion: {
      nodejs: '18',
      python: '3.11',
      go: '1.21',
      java: '17',
      php: '8.2',
      ruby: '3.2',
      rust: '1.75',
      cpp: '11',
      c: '11'
    },
    production: {
      nodejs: {
        useAlpine: true,
        multiStage: false,
        optimizeForSize: true
      },
      python: {
        useAlpine: true,
        multiStage: false,
        optimizeForSize: true
      },
      go: {
        useAlpine: true,
        multiStage: true,
        optimizeForSize: true,
        staticBinary: true
      },
      java: {
        useAlpine: false,
        multiStage: true,
        optimizeForSize: true
      }
    }
  },

  // Additional files generation
  additionalFiles: {
    generateDockerIgnore: true,
    generateNginxConfig: false,
    generateGitIgnore: false
  },

  // Database configurations
  databases: {
    postgres: {
      image: 'postgres:15-alpine',
      port: 5432,
      environment: {
        POSTGRES_DB: 'myapp',
        POSTGRES_USER: 'postgres',
        POSTGRES_PASSWORD: 'password'
      }
    },
    mysql: {
      image: 'mysql:8.0',
      port: 3306,
      environment: {
        MYSQL_DATABASE: 'myapp',
        MYSQL_USER: 'myapp',
        MYSQL_PASSWORD: 'password',
        MYSQL_ROOT_PASSWORD: 'password'
      }
    },
    redis: {
      image: 'redis:alpine',
      port: 6379
    }
  },

  // Framework-specific configurations
  frameworks: {
    react: {
      buildCommand: 'npm run build',
      serveCommand: 'npm start',
      staticFiles: 'build',
      nginxConfig: true
    },
    nextjs: {
      buildCommand: 'npm run build',
      serveCommand: 'npm start',
      staticFiles: false,
      nginxConfig: false
    },
    django: {
      collectStatic: true,
      database: 'postgres',
      redis: false
    },
    rails: {
      precompileAssets: true,
      database: 'postgres',
      redis: true
    },
    laravel: {
      optimize: true,
      database: 'mysql',
      redis: true
    },
    springBoot: {
      buildCommand: 'mvn clean package -DskipTests',
      database: 'postgres',
      redis: false
    }
  },

  // Output settings
  output: {
    dockerfileName: 'Dockerfile',
    dockerIgnoreName: '.dockerignore',
    nginxConfigName: 'nginx.conf',
    indentSize: 2,
    lineEnding: '\n'
  },

  // Validation settings
  validation: {
    checkPortAvailability: false,
    validateDockerfile: true,
    checkDependencies: true
  }
};

/**
 * Get configuration for a specific language
 * @param {string} language - Language name
 * @returns {Object} Language-specific configuration
 */
export function getLanguageConfig(language) {
  const config = DEFAULT_CONFIG.dockerfile.defaultVersion[language];
  return {
    version: config,
    ...DEFAULT_CONFIG.dockerfile.production[language] || {}
  };
}

/**
 * Get configuration for a specific framework
 * @param {string} framework - Framework name
 * @returns {Object} Framework-specific configuration
 */
export function getFrameworkConfig(framework) {
  return DEFAULT_CONFIG.frameworks[framework] || {};
}

/**
 * Merge user configuration with default configuration
 * @param {Object} userConfig - User-provided configuration
 * @returns {Object} Merged configuration
 */
export function mergeConfig(userConfig = {}) {
  return {
    ...DEFAULT_CONFIG,
    ...userConfig,
    languageDetection: {
      ...DEFAULT_CONFIG.languageDetection,
      ...userConfig.languageDetection
    },
    frameworkDetection: {
      ...DEFAULT_CONFIG.frameworkDetection,
      ...userConfig.frameworkDetection
    },
    dockerfile: {
      ...DEFAULT_CONFIG.dockerfile,
      ...userConfig.dockerfile,
      defaultVersion: {
        ...DEFAULT_CONFIG.dockerfile.defaultVersion,
        ...userConfig.dockerfile?.defaultVersion
      },
      production: {
        ...DEFAULT_CONFIG.dockerfile.production,
        ...userConfig.dockerfile?.production
      }
    },
    additionalFiles: {
      ...DEFAULT_CONFIG.additionalFiles,
      ...userConfig.additionalFiles
    },
    databases: {
      ...DEFAULT_CONFIG.databases,
      ...userConfig.databases
    },
    frameworks: {
      ...DEFAULT_CONFIG.frameworks,
      ...userConfig.frameworks
    },
    output: {
      ...DEFAULT_CONFIG.output,
      ...userConfig.output
    },
    validation: {
      ...DEFAULT_CONFIG.validation,
      ...userConfig.validation
    }
  };
}

