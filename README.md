# Docker File Generator

A powerful Node.js tool that automatically generates optimized Dockerfiles for any programming language and framework by analyzing your source code.

## 🚀 Features

- **Multi-Language Support**: Node.js, Python, Go, Java, C#, PHP, Ruby, Rust
- **Framework Detection**: Automatically detects popular frameworks (React, Django, Spring Boot, etc.)
- **Package Manager Support**: npm, yarn, pnpm with correct commands
- **Template-Based**: Uses smart templates with runtime placeholder replacement
- **Zero Configuration**: Just point it to your code folder
- **Production Ready**: Generates optimized, secure Dockerfiles following best practices

## 📦 Installation

```bash
npm install -g @dcdeploy/dockerfile-gen
```

Or use with npx:

```bash
npx @dcdeploy/dockerfile-gen <source-path>
```

## 🎯 Usage

### Command Line Interface

```bash
# Basic usage - auto-detect everything
@dcdeploy/dockerfile-gen ./my-project

# Specify language and framework
@dcdeploy/dockerfile-gen ./my-react-app --language nodejs --framework react

# Custom output location
@dcdeploy/dockerfile-gen ./my-api --output ./Dockerfile.prod

# Include development dependencies
@dcdeploy/dockerfile-gen ./my-app --dev

# Override port
@dcdeploy/dockerfile-gen ./my-service --port 8080

# Verbose output
@dcdeploy/dockerfile-gen ./my-project --verbose
```

### Programmatic Usage

```javascript
import { generateDockerfileForProject, detectProject } from '@dcdeploy/dockerfile-gen';

// Auto-detect and generate
const dockerfile = await generateDockerfileForProject('./my-project');

// With options
const dockerfile = await generateDockerfileForProject('./my-project', {
  language: 'nodejs',
  framework: 'react',
  isDev: true,
  port: '3000'
});

// Just detect language/framework
const detection = await detectProject('./my-project');
console.log(detection); // { language: 'nodejs', framework: 'react', confidence: 'high' }
```

## 📋 CLI Options Reference

### Basic Options
| Option | Description | Example |
|--------|-------------|---------|
| `-V, --version` | Output the version number | `--version` |
| `-h, --help` | Display help for command | `--help` |
| `-o, --output <file>` | Output Dockerfile path | `--output ./Dockerfile.prod` |
| `-f, --framework <name>` | Override detected framework | `--framework react` |
| `-l, --language <name>` | Override detected language | `--language nodejs` |
| `--dev` | Include development dependencies | `--dev` |
| `--port <number>` | Override default port | `--port 8080` |
| `--verbose` | Enable verbose output | `--verbose` |

### Image Customization
| Option | Description | Example |
|--------|-------------|---------|
| `--build-image <image>` | Custom build image | `--build-image node:20-alpine` |
| `--run-image <image>` | Custom run image | `--run-image nginx:alpine` |
| `--workdir <path>` | Custom working directory | `--workdir /app` |

### Environment Variables
| Option | Description | Example |
|--------|-------------|---------|
| `--env <key=value>` | Add to both stages | `--env NODE_ENV=production` |
| `--build-env <key=value>` | Add to build stage only | `--build-env CI=true` |
| `--runtime-env <key=value>` | Add to runtime stage only | `--runtime-env PORT=3000` |

### Build Arguments
| Option | Description | Example |
|--------|-------------|---------|
| `--arg <key=value>` | Add to both stages | `--arg NODE_VERSION=20` |
| `--build-arg <key=value>` | Add to build stage only | `--build-arg NODE_VERSION=20` |
| `--runtime-arg <key=value>` | Add to runtime stage only | `--runtime-arg APP_VERSION=1.0.0` |

### Dependencies & Commands
| Option | Description | Example |
|--------|-------------|---------|
| `--system-dep <package>` | Add to both stages | `--system-dep curl` |
| `--build-dep <package>` | Add to build stage only | `--build-dep build-essential` |
| `--runtime-dep <package>` | Add to runtime stage only | `--runtime-dep curl` |
| `--run-cmd <command>` | Add to both stages | `--run-cmd "apt-get update"` |
| `--build-cmd <command>` | Add to build stage only | `--build-cmd "npm ci"` |
| `--runtime-cmd <command>` | Add to runtime stage only | `--runtime-cmd "nginx -g daemon off"` |

## 🎨 Supported Languages & Frameworks

### Node.js
- **Frameworks**: React, Angular, Vue, Next.js, Nuxt, Express, Nest.js, Vite
- **Package Managers**: npm, yarn, pnpm
- **Features**: Multi-stage builds, production optimizations

### Python
- **Frameworks**: Django, Flask, FastAPI, Tornado
- **Package Managers**: pip, poetry
- **Features**: Virtual environment, dependency optimization

### Go
- **Frameworks**: Gin, Echo, Fiber
- **Features**: Multi-stage builds, static binaries

### Java
- **Frameworks**: Spring Boot, Maven, Gradle
- **Features**: JVM optimization, layered builds

### C#
- **Frameworks**: ASP.NET, .NET Core
- **Features**: Multi-stage builds, runtime optimization

### PHP
- **Frameworks**: Laravel, Symfony
- **Package Managers**: Composer
- **Features**: Apache/Nginx configuration

### Ruby
- **Frameworks**: Rails, Sinatra
- **Package Managers**: Bundler
- **Features**: Production server configuration

### Rust
- **Frameworks**: Actix Web, Rocket
- **Features**: Static compilation, minimal images

## 🔧 How It Works

1. **Analysis**: Scans your project directory for language-specific files and patterns
2. **Detection**: Identifies programming language, framework, and package manager
3. **Template Selection**: Chooses the appropriate Dockerfile template
4. **Placeholder Replacement**: Replaces template placeholders with correct commands
5. **Generation**: Outputs a production-ready Dockerfile

## 📁 Project Structure

```
@dcdeploy/dockerfile-gen/
├── src/
│   ├── detectors/
│   │   └── languageDetector.js    # Language and framework detection
│   ├── templates/
│   │   └── dockerfiles/           # Dockerfile templates
│   │       ├── nodejs/
│   │       ├── python/
│   │       ├── go/
│   │       └── ...
│   ├── utils/
│   │   ├── packageManagerConfig.js # Package manager configurations
│   │   └── templateProcessor.js    # Template processing logic
│   ├── cli.js                      # Command-line interface
│   └── index.js                    # Main module
├── examples/                       # Example projects
└── tests/                         # Test files
```

## 🎯 Template System

The tool uses a smart template system with placeholders that get replaced at runtime:

```dockerfile
# Copy package files
COPY {{PACKAGE_FILES}} ./

# Install dependencies
RUN {{INSTALL_CMD}}

# Build the application
RUN {{BUILD_CMD}}

# Start the application
CMD {{START_CMD}}
```

These placeholders are automatically replaced with the correct commands based on the detected package manager:

- **npm**: `npm ci --only=production`
- **yarn**: `yarn --frozen-lockfile --production`
- **pnpm**: `pnpm i --frozen-lockfile --prod`

## 🚀 Examples

### React App
```bash
@dcdeploy/dockerfile-gen ./my-react-app
```
Generates a multi-stage Dockerfile with npm/yarn/pnpm support.

### Django API
```bash
@dcdeploy/dockerfile-gen ./django-backend
```
Generates a Python Dockerfile with pip and Django optimizations.

### Go Microservice
```bash
@dcdeploy/dockerfile-gen ./go-service
```
Generates a multi-stage Go Dockerfile with static binary compilation.

## 🔧 Advanced Configuration Examples

### Build Arguments and Environment Variables

#### Basic Environment Variables
```bash
# Add environment variables for both build and runtime stages
@dcdeploy/dockerfile-gen ./my-app --env NODE_ENV=production --env DEBUG=false

# Add environment variables for specific stages
@dcdeploy/dockerfile-gen ./my-app --build-env NODE_ENV=development --runtime-env NODE_ENV=production
```

#### Build Arguments
```bash
# Add build arguments for both stages
@dcdeploy/dockerfile-gen ./my-app --arg NODE_VERSION=20 --arg APP_VERSION=1.0.0

# Add build arguments for specific stages
@dcdeploy/dockerfile-gen ./my-app --build-arg NODE_VERSION=20 --runtime-arg APP_VERSION=1.0.0
```

#### Complex Configuration Example
```bash
# React app with custom build configuration
@dcdeploy/dockerfile-gen ./react-app \
  --env NODE_ENV=production \
  --env REACT_APP_API_URL=https://api.example.com \
  --arg NODE_VERSION=20 \
  --arg BUILD_TIMESTAMP=$(date +%s) \
  --build-env CI=true \
  --runtime-env PORT=3000
```

#### Python Django with Database Configuration
```bash
# Django app with database and security settings
@dcdeploy/dockerfile-gen ./django-app \
  --env DJANGO_SETTINGS_MODULE=myproject.settings \
  --env DATABASE_URL=postgresql://user:pass@db:5432/mydb \
  --env SECRET_KEY=your-secret-key \
  --arg PYTHON_VERSION=3.11 \
  --build-env PIP_CACHE_DIR=/tmp/pip-cache \
  --runtime-env PYTHONUNBUFFERED=1
```

#### Go Application with Build Configuration
```bash
# Go app with build flags and version info
@dcdeploy/dockerfile-gen ./go-app \
  --env GOOS=linux \
  --env GOARCH=amd64 \
  --env CGO_ENABLED=0 \
  --arg GO_VERSION=1.21 \
  --arg APP_NAME=my-go-app \
  --build-env GOPROXY=https://proxy.golang.org \
  --runtime-env PORT=8080
```

#### Java Spring Boot with Maven Configuration
```bash
# Spring Boot app with Maven and JVM settings
@dcdeploy/dockerfile-gen ./spring-app \
  --env SPRING_PROFILES_ACTIVE=production \
  --env JAVA_OPTS=-Xmx512m \
  --arg JAVA_VERSION=17 \
  --arg MAVEN_VERSION=3.9.0 \
  --build-env MAVEN_OPTS=-Xmx1024m \
  --runtime-env SERVER_PORT=8080
```

### Custom Images and Dependencies

#### Custom Base Images
```bash
# Use custom Node.js image
@dcdeploy/dockerfile-gen ./node-app --build-image node:20-alpine --run-image node:20-slim

# Use custom Python image
@dcdeploy/dockerfile-gen ./python-app --build-image python:3.12-slim --run-image python:3.12-slim

# Use custom Go image
@dcdeploy/dockerfile-gen ./go-app --build-image golang:1.22-alpine --run-image alpine:3.18
```

#### System Dependencies
```bash
# Add system dependencies for both stages
@dcdeploy/dockerfile-gen ./my-app --system-dep curl --system-dep git

# Add dependencies for specific stages
@dcdeploy/dockerfile-gen ./my-app --build-dep build-essential --runtime-dep curl

# Python app with database client
@dcdeploy/dockerfile-gen ./python-app --runtime-dep postgresql-client --runtime-dep libpq-dev
```

#### Custom Commands
```bash
# Add custom RUN commands
@dcdeploy/dockerfile-gen ./my-app --run-cmd "apt-get update && apt-get install -y curl"

# Add commands for specific stages
@dcdeploy/dockerfile-gen ./my-app \
  --build-cmd "npm ci --only=production" \
  --runtime-cmd "useradd -m appuser && chown -R appuser:appuser /app"
```

### Complete Real-World Example
```bash
# Production-ready React app with full configuration
@dcdeploy/dockerfile-gen ./react-app \
  --env NODE_ENV=production \
  --env REACT_APP_API_URL=https://api.myapp.com \
  --env REACT_APP_VERSION=1.2.3 \
  --arg NODE_VERSION=20 \
  --arg BUILD_TIMESTAMP=$(date +%s) \
  --arg GIT_COMMIT=$(git rev-parse HEAD) \
  --build-image node:20-alpine \
  --run-image nginx:alpine \
  --build-env CI=true \
  --runtime-env PORT=80 \
  --build-dep git \
  --runtime-dep curl \
  --build-cmd "npm ci --only=production" \
  --runtime-cmd "nginx -g 'daemon off;'" \
  --output ./Dockerfile.prod \
  --verbose
```

This generates a production-ready Dockerfile with:
- Custom environment variables for the React app
- Build arguments for versioning and timestamps
- Custom base images for build and runtime
- System dependencies for both stages
- Custom commands for optimization
- Proper output location

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Add your language/framework support
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.

## 🙏 Acknowledgments

- Docker community for best practices
- Framework maintainers for their excellent documentation
- Open source contributors
- 
