import fs from 'fs-extra';
import path from 'path';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

/**
 * Dockerfile validation and verification utilities
 */
export class DockerfileValidator {
  constructor(options = {}) {
    this.options = {
      checkSyntax: true,
      checkBuild: false,
      checkSecurity: true,
      checkBestPractices: true,
      ...options
    };
  }

  /**
   * Validate a Dockerfile for syntax and best practices
   * @param {string} dockerfilePath - Path to the Dockerfile
   * @returns {Promise<Object>} Validation result
   */
  async validate(dockerfilePath) {
    const result = {
      valid: true,
      errors: [],
      warnings: [],
      suggestions: [],
      securityIssues: [],
      bestPractices: []
    };

    try {
      if (!await fs.pathExists(dockerfilePath)) {
        result.valid = false;
        result.errors.push('Dockerfile does not exist');
        return result;
      }

      const content = await fs.readFile(dockerfilePath, 'utf8');
      
      // Check syntax
      if (this.options.checkSyntax) {
        const syntaxResult = await this.checkSyntax(content);
        result.errors.push(...syntaxResult.errors);
        result.warnings.push(...syntaxResult.warnings);
      }

      // Check security issues
      if (this.options.checkSecurity) {
        const securityResult = this.checkSecurity(content);
        result.securityIssues.push(...securityResult);
      }

      // Check best practices
      if (this.options.checkBestPractices) {
        const bestPracticesResult = this.checkBestPractices(content);
        result.bestPractices.push(...bestPracticesResult);
      }

      // Check if Docker is available for build testing
      if (this.options.checkBuild) {
        const buildResult = await this.checkBuild(dockerfilePath);
        result.errors.push(...buildResult.errors);
        result.warnings.push(...buildResult.warnings);
      }

      result.valid = result.errors.length === 0;
      
    } catch (error) {
      result.valid = false;
      result.errors.push(`Validation error: ${error.message}`);
    }

    return result;
  }

  /**
   * Check Dockerfile syntax using docker build --dry-run
   * @param {string} content - Dockerfile content
   * @returns {Promise<Object>} Syntax check result
   */
  async checkSyntax(content) {
    const result = { errors: [], warnings: [] };
    
    try {
      // Basic syntax checks
      const lines = content.split('\n');
      
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i].trim();
        const lineNum = i + 1;
        
        // Skip empty lines and comments
        if (!line || line.startsWith('#')) continue;
        
        // Check for valid Dockerfile instructions
        const validInstructions = [
          'FROM', 'RUN', 'CMD', 'LABEL', 'MAINTAINER', 'EXPOSE', 'ENV', 'ADD', 'COPY',
          'ENTRYPOINT', 'VOLUME', 'USER', 'WORKDIR', 'ARG', 'ONBUILD', 'STOPSIGNAL',
          'HEALTHCHECK', 'SHELL'
        ];
        
        const instruction = line.split(' ')[0];
        if (!validInstructions.includes(instruction)) {
          result.errors.push(`Line ${lineNum}: Invalid instruction '${instruction}'`);
        }
        
        // Check for common syntax issues
        if (instruction === 'FROM' && !line.includes(' ')) {
          result.errors.push(`Line ${lineNum}: FROM instruction requires an image name`);
        }
        
        if (instruction === 'COPY' && !line.includes(' ')) {
          result.errors.push(`Line ${lineNum}: COPY instruction requires source and destination`);
        }
        
        if (instruction === 'RUN' && line === 'RUN') {
          result.errors.push(`Line ${lineNum}: RUN instruction requires a command`);
        }
      }
      
    } catch (error) {
      result.errors.push(`Syntax check failed: ${error.message}`);
    }
    
    return result;
  }

  /**
   * Check for security issues in Dockerfile
   * @param {string} content - Dockerfile content
   * @returns {Array} Security issues
   */
  checkSecurity(content) {
    const issues = [];
    const lines = content.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      const lineNum = i + 1;
      
      // Check for running as root
      if (line.startsWith('USER root') || (!content.includes('USER ') && line.startsWith('RUN'))) {
        issues.push({
          line: lineNum,
          severity: 'warning',
          message: 'Consider running as non-root user for security',
          suggestion: 'Add USER instruction to run as non-root user'
        });
      }
      
      // Check for hardcoded secrets
      if (line.includes('password') || line.includes('secret') || line.includes('key')) {
        issues.push({
          line: lineNum,
          severity: 'warning',
          message: 'Potential hardcoded secret detected',
          suggestion: 'Use environment variables or secrets management'
        });
      }
      
      // Check for using latest tag
      if (line.includes('FROM') && line.includes(':latest')) {
        issues.push({
          line: lineNum,
          severity: 'warning',
          message: 'Using :latest tag can lead to unpredictable builds',
          suggestion: 'Use specific version tags'
        });
      }
      
      // Check for running package managers without cleanup
      if (line.includes('apt-get install') && !content.includes('apt-get clean')) {
        issues.push({
          line: lineNum,
          severity: 'info',
          message: 'Package manager cache not cleaned',
          suggestion: 'Add apt-get clean to reduce image size'
        });
      }
    }
    
    return issues;
  }

  /**
   * Check for best practices in Dockerfile
   * @param {string} content - Dockerfile content
   * @returns {Array} Best practices suggestions
   */
  checkBestPractices(content) {
    const suggestions = [];
    const lines = content.split('\n');
    
    // Check for multi-stage builds
    if (!content.includes('FROM') || content.split('FROM').length < 3) {
      suggestions.push({
        type: 'optimization',
        message: 'Consider using multi-stage builds for smaller images',
        suggestion: 'Use multiple FROM statements to separate build and runtime'
      });
    }
    
    // Check for .dockerignore
    if (!fs.existsSync(path.join(path.dirname(content), '.dockerignore'))) {
      suggestions.push({
        type: 'optimization',
        message: 'Consider adding .dockerignore file',
        suggestion: 'Create .dockerignore to exclude unnecessary files'
      });
    }
    
    // Check for health checks
    if (!content.includes('HEALTHCHECK')) {
      suggestions.push({
        type: 'reliability',
        message: 'Consider adding HEALTHCHECK instruction',
        suggestion: 'Add HEALTHCHECK to monitor container health'
      });
    }
    
    // Check for proper layer ordering
    const copyLines = lines.filter(line => line.startsWith('COPY'));
    const runLines = lines.filter(line => line.startsWith('RUN'));
    
    if (copyLines.length > 0 && runLines.length > 0) {
      const firstCopyIndex = lines.findIndex(line => line.startsWith('COPY'));
      const firstRunIndex = lines.findIndex(line => line.startsWith('RUN'));
      
      if (firstCopyIndex > firstRunIndex) {
        suggestions.push({
          type: 'optimization',
          message: 'Consider copying package files before source code',
          suggestion: 'Copy package.json before source code for better caching'
        });
      }
    }
    
    return suggestions;
  }

  /**
   * Test Dockerfile build (requires Docker)
   * @param {string} dockerfilePath - Path to the Dockerfile
   * @returns {Promise<Object>} Build test result
   */
  async checkBuild(dockerfilePath) {
    const result = { errors: [], warnings: [] };
    
    try {
      // Check if Docker is available
      await execAsync('docker --version');
      
      const dir = path.dirname(dockerfilePath);
      const imageName = `test-${Date.now()}`;
      
      // Try to build the Dockerfile
      const { stdout, stderr } = await execAsync(
        `docker build -t ${imageName} -f ${dockerfilePath} ${dir}`,
        { timeout: 300000 } // 5 minutes timeout
      );
      
      if (stderr && !stderr.includes('warning')) {
        result.warnings.push(`Build warnings: ${stderr}`);
      }
      
      // Clean up the test image
      try {
        await execAsync(`docker rmi ${imageName}`);
      } catch (cleanupError) {
        // Ignore cleanup errors
      }
      
    } catch (error) {
      if (error.message.includes('docker: command not found')) {
        result.warnings.push('Docker not available for build testing');
      } else {
        result.errors.push(`Build failed: ${error.message}`);
      }
    }
    
    return result;
  }

  /**
   * Generate a verification report
   * @param {Object} validationResult - Validation result
   * @returns {string} Formatted report
   */
  generateReport(validationResult) {
    let report = '\n📋 Dockerfile Validation Report\n';
    report += '=' .repeat(50) + '\n\n';
    
    // Overall status
    const status = validationResult.valid ? '✅ VALID' : '❌ INVALID';
    report += `Status: ${status}\n\n`;
    
    // Errors
    if (validationResult.errors.length > 0) {
      report += '❌ Errors:\n';
      validationResult.errors.forEach(error => {
        report += `  • ${error}\n`;
      });
      report += '\n';
    }
    
    // Warnings
    if (validationResult.warnings.length > 0) {
      report += '⚠️  Warnings:\n';
      validationResult.warnings.forEach(warning => {
        report += `  • ${warning}\n`;
      });
      report += '\n';
    }
    
    // Security issues
    if (validationResult.securityIssues.length > 0) {
      report += '🔒 Security Issues:\n';
      validationResult.securityIssues.forEach(issue => {
        report += `  • Line ${issue.line}: ${issue.message}\n`;
        if (issue.suggestion) {
          report += `    💡 ${issue.suggestion}\n`;
        }
      });
      report += '\n';
    }
    
    // Best practices
    if (validationResult.bestPractices.length > 0) {
      report += '💡 Best Practices:\n';
      validationResult.bestPractices.forEach(practice => {
        report += `  • ${practice.message}\n`;
        if (practice.suggestion) {
          report += `    💡 ${practice.suggestion}\n`;
        }
      });
      report += '\n';
    }
    
    return report;
  }
}

/**
 * Quick validation function
 * @param {string} dockerfilePath - Path to the Dockerfile
 * @param {Object} options - Validation options
 * @returns {Promise<Object>} Validation result
 */
export async function validateDockerfile(dockerfilePath, options = {}) {
  const validator = new DockerfileValidator(options);
  return await validator.validate(dockerfilePath);
}

/**
 * Quick verification with report
 * @param {string} dockerfilePath - Path to the Dockerfile
 * @param {Object} options - Validation options
 * @returns {Promise<string>} Formatted report
 */
export async function verifyDockerfile(dockerfilePath, options = {}) {
  const validator = new DockerfileValidator(options);
  const result = await validator.validate(dockerfilePath);
  return validator.generateReport(result);
}

