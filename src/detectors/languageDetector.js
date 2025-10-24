/**
 * Language Detection Module
 * Analyzes source code to detect programming languages and frameworks
 */

import fs from 'fs-extra';
import { glob } from 'glob';
import path from 'path';

/**
 * Language detection patterns
 */
const LANGUAGE_PATTERNS = {
  'nodejs': {
    files: ['package.json'],
    extensions: ['.js', '.ts', '.jsx', '.tsx', '.mjs'],
    frameworks: {
      'nextjs': {
        files: ['next.config.js', 'pages/', 'app/', 'src/app/'],
        dependencies: ['next'],
        scripts: ['next']
      },
      'vite': {
        files: ['vite.config.js', 'vite.config.ts', 'index.html'],
        dependencies: ['vite', '@vitejs/plugin-react'],
        scripts: ['vite']
      },
      'react': {
        files: ['src/App.jsx', 'src/App.tsx', 'src/index.jsx', 'src/index.tsx'],
        dependencies: ['react', 'react-dom'],
        scripts: ['react-scripts']
      },
      'angular': {
        files: ['angular.json', 'src/main.ts'],
        dependencies: ['@angular/core', '@angular/cli'],
        scripts: ['ng']
      },
      'vue': {
        files: ['vue.config.js', 'src/main.js', 'src/main.ts'],
        dependencies: ['vue', '@vue/cli-service'],
        scripts: ['vue-cli-service']
      },
      'nuxt': {
        files: ['nuxt.config.js', 'nuxt.config.ts'],
        dependencies: ['nuxt'],
        scripts: ['nuxt']
      },
      'nodejs-ts': {
        files: ['src/index.ts', 'src/server.ts', 'src/main.ts', 'tsconfig.json'],
        dependencies: ['express', 'fastify', '@nestjs/core', 'koa', 'hapi'],
        devDependencies: ['typescript', 'ts-node', '@types/node', '@types/express'],
        scripts: ['tsc', 'ts-node']
      },
      'nodejs-js': {
        files: ['app.js', 'server.js', 'index.js', 'main.js'],
        dependencies: ['express', 'fastify', '@nestjs/core', 'koa', 'hapi'],
        scripts: []
      },
      'nest': {
        files: ['nest-cli.json', 'src/main.ts'],
        dependencies: ['@nestjs/core', '@nestjs/common'],
        scripts: ['nest']
      },
      'vite': {
        files: ['vite.config.js', 'vite.config.ts'],
        dependencies: ['vite'],
        scripts: ['vite']
      }
    }
  },
  'python': {
    files: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile'],
    extensions: ['.py'],
    frameworks: {
      'django': {
        files: ['manage.py', 'settings.py'],
        dependencies: ['django'],
        scripts: []
      },
      'flask': {
        files: ['app.py', 'application.py'],
        dependencies: ['flask'],
        scripts: []
      },
      'fastapi': {
        files: ['main.py'],
        dependencies: ['fastapi'],
        scripts: []
      },
      'tornado': {
        files: ['main.py'],
        dependencies: ['tornado'],
        scripts: []
      }
    }
  },
  'go': {
    files: ['go.mod', 'go.sum', 'main.go'],
    extensions: ['.go'],
    frameworks: {
      'gin': {
        files: ['main.go'],
        dependencies: ['github.com/gin-gonic/gin'],
        scripts: []
      },
      'echo': {
        files: ['main.go'],
        dependencies: ['github.com/labstack/echo'],
        scripts: []
      },
      'fiber': {
        files: ['main.go'],
        dependencies: ['github.com/gofiber/fiber'],
        scripts: []
      }
    }
  },
  'java': {
    files: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
    extensions: ['.java'],
    frameworks: {
      'spring-boot': {
        files: ['pom.xml', 'build.gradle'],
        dependencies: ['spring-boot-starter'],
        scripts: []
      },
      'maven': {
        files: ['pom.xml'],
        dependencies: [],
        scripts: []
      },
      'gradle': {
        files: ['build.gradle', 'build.gradle.kts'],
        dependencies: [],
        scripts: []
      }
    }
  },
  'csharp': {
    files: ['*.csproj', '*.sln', 'Program.cs'],
    extensions: ['.cs'],
    frameworks: {
      'aspnet': {
        files: ['*.csproj', 'Program.cs'],
        dependencies: ['Microsoft.AspNetCore'],
        scripts: []
      },
      'dotnet': {
        files: ['*.csproj', '*.sln'],
        dependencies: [],
        scripts: []
      }
    }
  },
  'php': {
    files: ['composer.json', 'index.php'],
    extensions: ['.php'],
    frameworks: {
      'laravel': {
        files: ['artisan', 'composer.json'],
        dependencies: ['laravel/framework'],
        scripts: []
      },
      'symfony': {
        files: ['composer.json', 'bin/console'],
        dependencies: ['symfony/framework-bundle'],
        scripts: []
      }
    }
  },
  'ruby': {
    files: ['Gemfile', 'Rakefile'],
    extensions: ['.rb'],
    frameworks: {
      'rails': {
        files: ['Gemfile', 'config/application.rb'],
        dependencies: ['rails'],
        scripts: []
      },
      'sinatra': {
        files: ['app.rb', 'config.ru'],
        dependencies: ['sinatra'],
        scripts: []
      }
    }
  },
  'rust': {
    files: ['Cargo.toml', 'Cargo.lock'],
    extensions: ['.rs'],
    frameworks: {
      'actix-web': {
        files: ['Cargo.toml'],
        dependencies: ['actix-web'],
        scripts: []
      },
      'rocket': {
        files: ['Cargo.toml'],
        dependencies: ['rocket'],
        scripts: []
      }
    }
  }
};

/**
 * Detect programming language and framework from project directory
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Object>} Detection result with language and framework
 */
export async function detectLanguageAndFramework(projectPath) {
  try {
    const files = await getAllFiles(projectPath);
    const packageJson = await getPackageJson(projectPath);
    
    for (const [language, config] of Object.entries(LANGUAGE_PATTERNS)) {
      // Check for language-specific files
      const hasLanguageFiles = config.files.some(file => 
        files.some(f => f.endsWith(file))
      );
      
      // Check for language-specific extensions
      const hasLanguageExtensions = config.extensions.some(ext => 
        files.some(f => f.endsWith(ext))
      );
      
      if (hasLanguageFiles || hasLanguageExtensions) {
        // Detect framework within the language
        const framework = await detectFramework(projectPath, language, config, files, packageJson);
        
        return {
          language,
          framework,
          confidence: hasLanguageFiles ? 'high' : 'medium'
        };
      }
    }
    
    return {
      language: 'unknown',
      framework: 'default',
      confidence: 'low'
    };
  } catch (error) {
    throw new Error(`Language detection failed: ${error.message}`);
  }
}

/**
 * Get all files in the project directory
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Array>} Array of file paths
 */
async function getAllFiles(projectPath) {
  try {
    const files = await glob('**/*', { 
      cwd: projectPath,
      ignore: ['node_modules/**', '.git/**', 'dist/**', 'build/**', '*.log']
    });
    return files;
  } catch (error) {
    return [];
  }
}

/**
 * Get package.json content if it exists
 * @param {string} projectPath - Path to the project directory
 * @returns {Promise<Object|null>} Package.json content or null
 */
async function getPackageJson(projectPath) {
  try {
    const packageJsonPath = path.join(projectPath, 'package.json');
    const content = await fs.readFile(packageJsonPath, 'utf8');
    return JSON.parse(content);
  } catch (error) {
    return null;
  }
}

/**
 * Detect framework within a language
 * @param {string} projectPath - Path to the project directory
 * @param {string} language - Programming language
 * @param {Object} config - Language configuration
 * @param {Array} files - All files in the project
 * @param {Object} packageJson - Package.json content
 * @returns {Promise<string>} Framework name
 */
async function detectFramework(projectPath, language, config, files, packageJson) {
  if (!config.frameworks) {
    return 'default';
  }
  
  for (const [framework, frameworkConfig] of Object.entries(config.frameworks)) {
    // Check for framework-specific files
    const hasFrameworkFiles = frameworkConfig.files.some(file => 
      files.some(f => f.endsWith(file))
    );
    
    // Check for framework-specific dependencies
    let hasFrameworkDeps = false;
    if (packageJson && packageJson.dependencies) {
      hasFrameworkDeps = frameworkConfig.dependencies.some(dep => 
        packageJson.dependencies[dep] || packageJson.devDependencies?.[dep]
      );
    }
    
    // Check for framework-specific devDependencies
    let hasFrameworkDevDeps = false;
    if (packageJson && packageJson.devDependencies && frameworkConfig.devDependencies) {
      hasFrameworkDevDeps = frameworkConfig.devDependencies.some(dep => 
        packageJson.devDependencies[dep]
      );
    }
    
    // Check for framework-specific scripts
    let hasFrameworkScripts = false;
    if (packageJson && packageJson.scripts) {
      hasFrameworkScripts = frameworkConfig.scripts.some(script => 
        Object.keys(packageJson.scripts).some(key => key.includes(script))
      );
    }
    
    // For TypeScript frameworks, require both files AND dependencies
    if (framework.includes('-ts') || framework.includes('typescript')) {
      if ((hasFrameworkFiles || hasFrameworkScripts) && (hasFrameworkDeps || hasFrameworkDevDeps)) {
        return framework;
      }
    } else {
      // For regular frameworks, require dependencies to match (not just files)
      if (hasFrameworkDeps && (hasFrameworkFiles || hasFrameworkDevDeps || hasFrameworkScripts)) {
        return framework;
      }
    }
  }
  
  return 'default';
}