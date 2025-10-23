# Examples Directory Structure

This directory contains example projects organized by programming language. Each language directory contains various framework and project type examples.

## Directory Structure

```
examples/
├── nodejs/           # Node.js examples
│   ├── angular-app/      # Angular application
│   ├── express-app/      # Express.js application
│   ├── express-ts-app/   # Express.js with TypeScript
│   ├── express-ts-pnpm/  # Express.js with TypeScript and pnpm
│   ├── express-ts-yarn/  # Express.js with TypeScript and yarn
│   ├── fastify-ts-app/   # Fastify with TypeScript
│   ├── nestjs-app/       # NestJS application
│   ├── nextjs-ts-app/    # Next.js with TypeScript
│   ├── react-app/        # React application
│   ├── react-ts-app/     # React with TypeScript
│   ├── react-yarn-app/   # React with yarn
│   ├── vite-ts-app/      # Vite with TypeScript
│   └── yarn-app/         # Generic Node.js with yarn
├── go/               # Go examples
│   ├── go-app/           # Basic Go application
│   ├── go-gin/           # Go with Gin framework
│   └── go-service/       # Go service
├── python/           # Python examples
│   ├── django-app/       # Django application
│   ├── python-api/       # Python API
│   ├── python-django/    # Django project
│   └── python-flask/     # Flask application
├── java/             # Java examples
│   └── java-spring/      # Spring Boot application
├── c/                # C examples (placeholder)
├── cpp/              # C++ examples (placeholder)
├── csharp/           # C# examples (placeholder)
├── php/              # PHP examples (placeholder)
├── ruby/             # Ruby examples (placeholder)
└── rust/             # Rust examples (placeholder)
```

## Usage

Each example directory contains a complete project that can be used to test the `dockerfile-gen` tool:

```bash
# Generate Dockerfile for a specific example
dockerfile-gen examples/nodejs/react-app/

# Generate Dockerfile with custom options
dockerfile-gen examples/go/go-gin/ --port 8080 --build-image golang:1.21
```

## Language Support

- **Node.js**: Full support with multiple frameworks (React, Angular, Next.js, Express, NestJS, Vite, Fastify)
- **Go**: Full support with Gin framework and basic Go applications
- **Python**: Full support with Django and Flask frameworks
- **Java**: Full support with Spring Boot
- **C/C++/C#/PHP/Ruby/Rust**: Placeholder directories for future examples

## Framework Detection

The tool automatically detects the appropriate framework and language based on:
- `package.json` files (Node.js)
- `go.mod` files (Go)
- `requirements.txt` or `pyproject.toml` files (Python)
- `pom.xml` files (Java)
- Configuration files and source code patterns

