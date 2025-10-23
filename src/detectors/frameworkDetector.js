import fs from 'fs-extra';
import path from 'path';
import { glob } from 'glob';

/**
 * Framework detection patterns for different languages
 */
const FRAMEWORK_PATTERNS = {
  'nodejs': {
    'express': {
      files: ['app.js', 'server.js', 'index.js'],
      keywords: ['express', 'app.use', 'app.get', 'app.post', 'router'],
      dependencies: ['express']
    },
    'react': {
      files: ['src/App.js', 'src/App.jsx', 'src/index.js', 'public/index.html'],
      keywords: ['react', 'jsx', 'component', 'useState', 'useEffect'],
      dependencies: ['react', 'react-dom']
    },
    'vue': {
      files: ['src/App.vue', 'src/main.js', 'public/index.html'],
      keywords: ['vue', 'vue-router', 'vuex', 'nuxt'],
      dependencies: ['vue', 'vue-router', 'vuex']
    },
    'angular': {
      files: ['src/app/app.component.ts', 'angular.json', 'src/main.ts'],
      keywords: ['angular', '@angular', 'ng-', 'component', 'service'],
      dependencies: ['@angular/core', '@angular/common']
    },
    'nextjs': {
      files: ['next.config.js', 'pages/', 'app/', 'src/app/'],
      keywords: ['next', 'getServerSideProps', 'getStaticProps', 'pages/api'],
      dependencies: ['next', 'react']
    },
    'nuxt': {
      files: ['nuxt.config.js', 'pages/', 'components/', 'layouts/'],
      keywords: ['nuxt', 'nuxt.config', 'pages/', 'components/'],
      dependencies: ['nuxt', 'vue']
    },
    'svelte': {
      files: ['src/App.svelte', 'svelte.config.js'],
      keywords: ['svelte', 'svelte/store', 'svelte/transition'],
      dependencies: ['svelte']
    },
    'nest': {
      files: ['src/main.ts', 'nest-cli.json'],
      keywords: ['@nestjs', 'nestjs', 'controller', 'service', 'module'],
      dependencies: ['@nestjs/core', '@nestjs/common']
    },
    'vite': {
      files: ['vite.config.js', 'vite.config.ts', 'index.html'],
      keywords: ['vite', 'vite.config', 'import.meta.env'],
      dependencies: ['vite', '@vitejs/plugin-react']
    }
  },
  'python': {
    'django': {
      files: ['manage.py', 'settings.py', 'urls.py', 'wsgi.py'],
      keywords: ['django', 'Django', 'from django', 'INSTALLED_APPS'],
      dependencies: ['django']
    },
    'flask': {
      files: ['app.py', 'application.py', 'main.py'],
      keywords: ['flask', 'Flask', 'from flask', 'app.route', 'Blueprint'],
      dependencies: ['flask']
    },
    'fastapi': {
      files: ['main.py', 'app.py'],
      keywords: ['fastapi', 'FastAPI', 'from fastapi', 'APIRouter', 'Depends'],
      dependencies: ['fastapi', 'uvicorn']
    },
    'tornado': {
      files: ['main.py', 'app.py'],
      keywords: ['tornado', 'Tornado', 'from tornado', 'RequestHandler'],
      dependencies: ['tornado']
    },
    'bottle': {
      files: ['app.py', 'main.py'],
      keywords: ['bottle', 'Bottle', 'from bottle', 'route'],
      dependencies: ['bottle']
    },
    'pyramid': {
      files: ['development.ini', 'production.ini'],
      keywords: ['pyramid', 'Pyramid', 'from pyramid', 'Configurator'],
      dependencies: ['pyramid']
    }
  },
  'go': {
    'gin': {
      keywords: ['gin', 'gin-gonic', 'c.JSON', 'c.String', 'router.GET'],
      dependencies: ['github.com/gin-gonic/gin']
    },
    'echo': {
      keywords: ['echo', 'labstack/echo', 'c.JSON', 'e.GET', 'e.POST'],
      dependencies: ['github.com/labstack/echo']
    },
    'fiber': {
      keywords: ['fiber', 'gofiber', 'c.JSON', 'app.Get', 'app.Post'],
      dependencies: ['github.com/gofiber/fiber']
    },
    'gorilla': {
      keywords: ['gorilla', 'mux', 'gorilla/mux', 'mux.NewRouter'],
      dependencies: ['github.com/gorilla/mux']
    },
    'beego': {
      keywords: ['beego', 'github.com/astaxie/beego', 'beego.Router'],
      dependencies: ['github.com/astaxie/beego']
    }
  },
  'java': {
    'spring-boot': {
      files: ['pom.xml', 'build.gradle', 'src/main/java/**/Application.java'],
      keywords: ['spring-boot', 'SpringBootApplication', '@SpringBootApplication', '@RestController'],
      dependencies: ['spring-boot-starter-web']
    },
    'spring-mvc': {
      files: ['pom.xml', 'build.gradle'],
      keywords: ['spring-mvc', 'spring-webmvc', '@Controller', '@RequestMapping'],
      dependencies: ['spring-webmvc']
    },
    'struts': {
      files: ['struts.xml', 'web.xml'],
      keywords: ['struts', 'struts2', 'ActionSupport', 'struts.xml'],
      dependencies: ['struts2-core']
    },
    'play': {
      files: ['build.sbt', 'conf/application.conf'],
      keywords: ['play', 'playframework', 'controllers', 'routes'],
      dependencies: ['play-java']
    }
  },
  'php': {
    'laravel': {
      files: ['artisan', 'composer.json', 'app/Http/Kernel.php'],
      keywords: ['laravel', 'Laravel', 'Illuminate', 'Route::', 'Eloquent'],
      dependencies: ['laravel/framework']
    },
    'symfony': {
      files: ['composer.json', 'config/', 'src/Controller/'],
      keywords: ['symfony', 'Symfony', 'AbstractController', 'Route'],
      dependencies: ['symfony/framework-bundle']
    },
    'codeigniter': {
      files: ['index.php', 'application/', 'system/'],
      keywords: ['codeigniter', 'CodeIgniter', 'CI_Controller', 'load->view'],
      dependencies: ['codeigniter/framework']
    },
    'cakephp': {
      files: ['composer.json', 'src/Controller/', 'config/'],
      keywords: ['cakephp', 'CakePHP', 'AppController', 'Table'],
      dependencies: ['cakephp/cakephp']
    },
    'zend': {
      files: ['composer.json', 'module/', 'config/'],
      keywords: ['zend', 'Zend', 'ZendFramework', 'AbstractActionController'],
      dependencies: ['zendframework/zend-mvc']
    }
  },
  'ruby': {
    'rails': {
      files: ['Gemfile', 'config/application.rb', 'app/controllers/'],
      keywords: ['rails', 'Rails', 'ActiveRecord', 'ActionController', 'routes'],
      dependencies: ['rails']
    },
    'sinatra': {
      files: ['app.rb', 'main.rb'],
      keywords: ['sinatra', 'Sinatra', 'get', 'post', 'put', 'delete'],
      dependencies: ['sinatra']
    },
    'hanami': {
      files: ['Gemfile', 'config/application.rb'],
      keywords: ['hanami', 'Hanami', 'Hanami::Controller'],
      dependencies: ['hanami']
    }
  },
  'rust': {
    'actix-web': {
      keywords: ['actix-web', 'actix_web', 'HttpServer', 'App::new'],
      dependencies: ['actix-web']
    },
    'warp': {
      keywords: ['warp', 'warp::', 'warp::serve', 'warp::path'],
      dependencies: ['warp']
    },
    'rocket': {
      keywords: ['rocket', 'Rocket', '#[get]', '#[post]', 'rocket::'],
      dependencies: ['rocket']
    },
    'axum': {
      keywords: ['axum', 'axum::', 'Router::new', 'axum::routing'],
      dependencies: ['axum']
    }
  }
};

/**
 * Detects frameworks within a project
 */
export class FrameworkDetector {
  constructor(sourcePath, primaryLanguage) {
    this.sourcePath = sourcePath;
    this.primaryLanguage = primaryLanguage;
    this.detectedFrameworks = new Map();
  }

  /**
   * Detect frameworks for the primary language
   */
  async detectFrameworks() {
    if (!this.primaryLanguage || !FRAMEWORK_PATTERNS[this.primaryLanguage]) {
      return this.detectedFrameworks;
    }

    try {
      const languageFrameworks = FRAMEWORK_PATTERNS[this.primaryLanguage];
      const frameworkScores = new Map();

      // Initialize scores for all frameworks of the language
      Object.keys(languageFrameworks).forEach(framework => {
        frameworkScores.set(framework, 0);
      });

      // Check package.json, requirements.txt, etc. for dependencies
      await this.checkDependencies(frameworkScores, languageFrameworks);

      // Check for framework-specific files
      await this.checkFrameworkFiles(frameworkScores, languageFrameworks);

      // Check file content for framework keywords
      await this.checkFrameworkKeywords(frameworkScores, languageFrameworks);

      // If no frameworks detected, try fallback detection
      const hasDetectedFrameworks = Array.from(frameworkScores.values()).some(score => score > 0);
      if (!hasDetectedFrameworks) {
        console.log('⚠️  No frameworks detected, trying fallback methods...');
        await this.detectFromDirectoryName(frameworkScores, languageFrameworks);
      }

      // Filter out frameworks with zero score and sort by score
      const sortedFrameworks = Array.from(frameworkScores.entries())
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1]);

      this.detectedFrameworks = new Map(sortedFrameworks);
      return this.detectedFrameworks;
    } catch (error) {
      console.log('⚠️  Framework detection failed, trying fallback methods...');
      return await this.detectFromDirectoryName();
    }
  }

  /**
   * Fallback framework detection based on directory name
   */
  async detectFromDirectoryName(frameworkScores = null, languageFrameworks = null) {
    if (!this.primaryLanguage || !FRAMEWORK_PATTERNS[this.primaryLanguage]) {
      return this.detectedFrameworks;
    }

    if (!frameworkScores) {
      frameworkScores = new Map();
      languageFrameworks = FRAMEWORK_PATTERNS[this.primaryLanguage];
      Object.keys(languageFrameworks).forEach(framework => {
        frameworkScores.set(framework, 0);
      });
    }

    const dirName = path.basename(this.sourcePath).toLowerCase();

    // Check directory name for framework hints
    if (this.primaryLanguage === 'nodejs') {
      if (dirName.includes('react') || dirName.includes('frontend')) {
        frameworkScores.set('react', 10);
      }
      if (dirName.includes('vue')) {
        frameworkScores.set('vue', 10);
      }
      if (dirName.includes('angular')) {
        frameworkScores.set('angular', 10);
      }
      if (dirName.includes('next')) {
        frameworkScores.set('nextjs', 10);
      }
      if (dirName.includes('express') || dirName.includes('api') || dirName.includes('backend')) {
        frameworkScores.set('express', 10);
      }
      if (dirName.includes('nest')) {
        frameworkScores.set('nest', 10);
      }
      if (dirName.includes('vite')) {
        frameworkScores.set('vite', 10);
      }
    }

    // For frontend projects, default to React if no specific framework detected
    if (this.primaryLanguage === 'nodejs' && (dirName.includes('frontend') || dirName.includes('web') || dirName.includes('ui'))) {
      if (!Array.from(frameworkScores.values()).some(score => score > 0)) {
        frameworkScores.set('react', 5); // Default to React for frontend projects
      }
    }

    this.detectedFrameworks = new Map(
      Array.from(frameworkScores.entries())
        .filter(([_, score]) => score > 0)
        .sort((a, b) => b[1] - a[1])
    );

    return this.detectedFrameworks;
  }

  /**
   * Check dependency files for framework packages
   */
  async checkDependencies(frameworkScores, languageFrameworks) {
    const dependencyFiles = await this.findDependencyFiles();
    
    for (const file of dependencyFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        for (const [framework, pattern] of Object.entries(languageFrameworks)) {
          if (pattern.dependencies) {
            for (const dep of pattern.dependencies) {
              if (content.includes(dep)) {
                const currentScore = frameworkScores.get(framework) || 0;
                frameworkScores.set(framework, currentScore + 10);
              }
            }
          }
        }
        
        // Special handling for Vite + React projects - prioritize Vite
        if (content.includes('vite') && content.includes('react')) {
          const viteScore = frameworkScores.get('vite') || 0;
          const reactScore = frameworkScores.get('react') || 0;
          if (viteScore > 0 && reactScore > 0) {
            // Boost Vite score and reduce React score to prioritize Vite
            frameworkScores.set('vite', viteScore + 5);
            frameworkScores.set('react', Math.max(0, reactScore - 5));
          }
        }
        
        // Special handling for Next.js + React projects - prioritize Next.js
        if (content.includes('next') && content.includes('react')) {
          const nextScore = frameworkScores.get('nextjs') || 0;
          const reactScore = frameworkScores.get('react') || 0;
          if (nextScore > 0 && reactScore > 0) {
            // Boost Next.js score and reduce React score to prioritize Next.js
            frameworkScores.set('nextjs', nextScore + 5);
            frameworkScores.set('react', Math.max(0, reactScore - 5));
          }
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
  }

  /**
   * Find dependency files based on language
   */
  async findDependencyFiles() {
    const patterns = {
      'nodejs': ['package.json', 'package-lock.json', 'yarn.lock'],
      'python': ['requirements.txt', 'pyproject.toml', 'Pipfile', 'setup.py'],
      'java': ['pom.xml', 'build.gradle'],
      'php': ['composer.json', 'composer.lock'],
      'ruby': ['Gemfile', 'Gemfile.lock'],
      'go': ['go.mod', 'go.sum'],
      'rust': ['Cargo.toml', 'Cargo.lock']
    };

    const files = [];
    const languagePatterns = patterns[this.primaryLanguage] || [];

    for (const pattern of languagePatterns) {
      const matches = await glob(pattern, {
        cwd: this.sourcePath,
        absolute: true,
        nodir: true
      });
      files.push(...matches);
    }

    return files;
  }

  /**
   * Check for framework-specific files
   */
  async checkFrameworkFiles(frameworkScores, languageFrameworks) {
    for (const [framework, pattern] of Object.entries(languageFrameworks)) {
      if (pattern.files) {
        for (const filePattern of pattern.files) {
          const matches = await glob(filePattern, {
            cwd: this.sourcePath,
            absolute: true,
            nodir: true
          });
          
          if (matches.length > 0) {
            const currentScore = frameworkScores.get(framework) || 0;
            frameworkScores.set(framework, currentScore + 15);
          }
        }
      }
    }
  }

  /**
   * Check file content for framework keywords
   */
  async checkFrameworkKeywords(frameworkScores, languageFrameworks) {
    const codeFiles = await this.getCodeFiles();
    
    for (const file of codeFiles.slice(0, 20)) { // Limit to first 20 files for performance
      try {
        const content = await fs.readFile(file, 'utf8');
        const lowerContent = content.toLowerCase();

        for (const [framework, pattern] of Object.entries(languageFrameworks)) {
          if (pattern.keywords) {
            let keywordMatches = 0;
            for (const keyword of pattern.keywords) {
              const matches = (lowerContent.match(new RegExp(keyword.toLowerCase(), 'g')) || []).length;
              keywordMatches += matches;
            }
            
            if (keywordMatches > 0) {
              const currentScore = frameworkScores.get(framework) || 0;
              frameworkScores.set(framework, currentScore + keywordMatches * 3);
            }
          }
        }
      } catch (error) {
        // Skip files that can't be read
        continue;
      }
    }
  }

  /**
   * Get code files for keyword analysis
   */
  async getCodeFiles() {
    const extensions = {
      'nodejs': ['.js', '.jsx', '.ts', '.tsx', '.mjs'],
      'python': ['.py'],
      'go': ['.go'],
      'java': ['.java'],
      'php': ['.php'],
      'ruby': ['.rb'],
      'rust': ['.rs'],
      'csharp': ['.cs'],
      'cpp': ['.cpp', '.cc', '.cxx', '.hpp', '.h'],
      'c': ['.c', '.h']
    };

    const languageExtensions = extensions[this.primaryLanguage] || [];
    const patterns = languageExtensions.map(ext => `**/*${ext}`);

    const files = await glob(patterns, {
      cwd: this.sourcePath,
      absolute: true,
      nodir: true
    });

    return files;
  }

  /**
   * Get the primary detected framework
   */
  getPrimaryFramework() {
    if (this.detectedFrameworks.size === 0) {
      return null;
    }
    return Array.from(this.detectedFrameworks.keys())[0];
  }

  /**
   * Get all detected frameworks with their scores
   */
  getAllDetectedFrameworks() {
    return this.detectedFrameworks;
  }

  /**
   * Check if a specific framework is detected
   */
  hasFramework(framework) {
    return this.detectedFrameworks.has(framework);
  }

  /**
   * Get confidence score for a framework (0-100)
   */
  getConfidenceScore(framework) {
    if (!this.detectedFrameworks.has(framework)) {
      return 0;
    }
    
    const scores = Array.from(this.detectedFrameworks.values());
    const maxScore = Math.max(...scores);
    const frameworkScore = this.detectedFrameworks.get(framework);
    
    return Math.round((frameworkScore / maxScore) * 100);
  }
}