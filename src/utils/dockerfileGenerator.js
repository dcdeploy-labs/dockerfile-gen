import fs from 'fs-extra';
import path from 'path';
import { getDockerfileTemplate } from '../templates/dockerfileTemplates.js';

/**
 * Generate a Dockerfile for a project
 * @param {string} sourcePath - Path to the source directory
 * @param {Object} options - Generation options
 * @returns {Promise<string>} Generated Dockerfile content
 */
export async function generateDockerfile(sourcePath, options = {}) {
  const {
    language,
    framework = null,
    port = 3000,
    version = null,
    isProduction = false,
    entryPoint = null,
    customTemplate = null
  } = options;

  if (!language) {
    throw new Error('Language is required for Dockerfile generation');
  }

  // Use custom template if provided
  if (customTemplate) {
    return customTemplate;
  }

  // Generate configuration object
  const config = {
    version,
    port: parseInt(port),
    isProduction,
    entryPoint
  };

  // Get the appropriate template
  const dockerfileContent = getDockerfileTemplate(language, framework, config);

  return dockerfileContent;
}

/**
 * Generate additional Docker-related files
 * @param {string} sourcePath - Path to the source directory
 * @param {Object} options - Generation options
 * @returns {Promise<Object>} Generated files
 */
export async function generateDockerFiles(sourcePath, options = {}) {
  const files = {};
  const { language, framework, port = 3000 } = options;

  // Generate .dockerignore
  files['.dockerignore'] = generateDockerIgnore(language, framework);


  // Generate nginx.conf for React/Next.js apps
  if (isWebApp(language, framework)) {
    files['nginx.conf'] = generateNginxConfig();
  }

  return files;
}

/**
 * Generate .dockerignore file
 * @param {string} language - Primary language
 * @param {string} framework - Primary framework
 * @returns {string} .dockerignore content
 */
function generateDockerIgnore(language, framework) {
  const commonIgnores = [
    'node_modules',
    '.git',
    '.gitignore',
    '.dockerignore',
    'Dockerfile',
    '.env',
    '.env.local',
    '.env.development',
    '.env.test',
    '.env.production',
    'npm-debug.log*',
    'yarn-debug.log*',
    'yarn-error.log*',
    '.DS_Store',
    'Thumbs.db',
    '*.log',
    'coverage',
    '.nyc_output',
    'dist',
    'build'
  ];

  const languageSpecificIgnores = {
    nodejs: [
      'node_modules',
      'npm-debug.log*',
      'yarn-debug.log*',
      'yarn-error.log*',
      '.npm',
      '.yarn',
      'yarn.lock',
      'package-lock.json'
    ],
    python: [
      '__pycache__',
      '*.pyc',
      '*.pyo',
      '*.pyd',
      '.Python',
      'env',
      'venv',
      '.venv',
      'pip-log.txt',
      'pip-delete-this-directory.txt',
      '.pytest_cache',
      '.coverage',
      'htmlcov',
      '.tox',
      '.mypy_cache'
    ],
    go: [
      'vendor',
      '*.exe',
      '*.exe~',
      '*.dll',
      '*.so',
      '*.dylib',
      '*.test',
      '*.out',
      'go.work'
    ],
    java: [
      'target',
      '*.class',
      '*.jar',
      '*.war',
      '*.ear',
      '.gradle',
      'gradle-wrapper.jar',
      '.idea',
      '*.iml'
    ],
    php: [
      'vendor',
      'composer.phar',
      'composer.lock',
      '.env',
      'storage',
      'bootstrap/cache'
    ],
    ruby: [
      'vendor',
      'bundle',
      'Gemfile.lock',
      '.bundle',
      'log',
      'tmp',
      'storage'
    ]
  };

  const frameworkSpecificIgnores = {
    react: [
      'build',
      'dist',
      'public'
    ],
    nextjs: [
      '.next',
      'out'
    ],
    django: [
      'staticfiles',
      'media',
      'db.sqlite3'
    ],
    rails: [
      'log',
      'tmp',
      'storage',
      'public/assets',
      'public/packs',
      'public/packs-test',
      'node_modules',
      'yarn-error.log',
      'yarn-debug.log*',
      '.yarn-integrity'
    ]
  };

  let ignores = [...commonIgnores];

  if (languageSpecificIgnores[language]) {
    ignores = [...ignores, ...languageSpecificIgnores[language]];
  }

  if (framework && frameworkSpecificIgnores[framework]) {
    ignores = [...ignores, ...frameworkSpecificIgnores[framework]];
  }

  // Remove duplicates and sort
  ignores = [...new Set(ignores)].sort();

  return ignores.join('\n');
}


/**
 * Generate nginx.conf for web applications
 * @returns {string} nginx.conf content
 */
function generateNginxConfig() {
  return `events {
    worker_connections 1024;
}

http {
    include       /etc/nginx/mime.types;
    default_type  application/octet-stream;

    sendfile        on;
    keepalive_timeout  65;

    server {
        listen       80;
        server_name  localhost;

        location / {
            root   /usr/share/nginx/html;
            index  index.html index.htm;
            try_files $uri $uri/ /index.html;
        }

        error_page   500 502 503 504  /50x.html;
        location = /50x.html {
            root   /usr/share/nginx/html;
        }
    }
}`;
}


/**
 * Check if project is a web application
 * @param {string} language - Primary language
 * @param {string} framework - Primary framework
 * @returns {boolean} Whether it's a web app
 */
function isWebApp(language, framework) {
  const webFrameworks = ['react', 'nextjs', 'vue', 'angular'];
  return webFrameworks.includes(framework);
}



