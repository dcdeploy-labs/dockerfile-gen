import chalk from 'chalk';

/**
 * Log levels
 */
export const LOG_LEVELS = {
  ERROR: 0,
  WARN: 1,
  INFO: 2,
  DEBUG: 3
};

/**
 * Logger class
 */
export class Logger {
  constructor(level = LOG_LEVELS.INFO, quiet = false) {
    this.level = level;
    this.quiet = quiet;
  }

  /**
   * Set log level
   * @param {number} level - Log level
   */
  setLevel(level) {
    this.level = level;
  }

  /**
   * Set quiet mode
   * @param {boolean} quiet - Quiet mode
   */
  setQuiet(quiet) {
    this.quiet = quiet;
  }

  /**
   * Log error message
   * @param {string} message - Error message
   * @param {Error} error - Error object
   */
  error(message, error = null) {
    if (this.quiet || this.level < LOG_LEVELS.ERROR) return;
    
    console.error(chalk.red('❌ Error:'), message);
    if (error && this.level >= LOG_LEVELS.DEBUG) {
      console.error(chalk.gray(error.stack));
    }
  }

  /**
   * Log warning message
   * @param {string} message - Warning message
   */
  warn(message) {
    if (this.quiet || this.level < LOG_LEVELS.WARN) return;
    
    console.warn(chalk.yellow('⚠️  Warning:'), message);
  }

  /**
   * Log info message
   * @param {string} message - Info message
   */
  info(message) {
    if (this.quiet || this.level < LOG_LEVELS.INFO) return;
    
    console.log(chalk.blue('ℹ️  Info:'), message);
  }

  /**
   * Log debug message
   * @param {string} message - Debug message
   */
  debug(message) {
    if (this.quiet || this.level < LOG_LEVELS.DEBUG) return;
    
    console.log(chalk.gray('🐛 Debug:'), message);
  }

  /**
   * Log success message
   * @param {string} message - Success message
   */
  success(message) {
    if (this.quiet) return;
    
    console.log(chalk.green('✅ Success:'), message);
  }

  /**
   * Log step message
   * @param {string} message - Step message
   */
  step(message) {
    if (this.quiet) return;
    
    console.log(chalk.blue('🔍'), message);
  }

  /**
   * Log progress message
   * @param {string} message - Progress message
   */
  progress(message) {
    if (this.quiet) return;
    
    console.log(chalk.cyan('⏳'), message);
  }

  /**
   * Log file operation
   * @param {string} operation - Operation type
   * @param {string} path - File path
   */
  file(operation, path) {
    if (this.quiet) return;
    
    const icons = {
      read: '📖',
      write: '📝',
      create: '📄',
      delete: '🗑️',
      copy: '📋',
      move: '📦'
    };
    
    console.log(chalk.gray(`${icons[operation] || '📁'} ${operation}:`), path);
  }

  /**
   * Log with custom icon and color
   * @param {string} icon - Icon/emoji
   * @param {string} message - Message
   * @param {string} color - Color name
   */
  custom(icon, message, color = 'white') {
    if (this.quiet) return;
    
    const colorFn = chalk[color] || chalk.white;
    console.log(colorFn(`${icon} ${message}`));
  }

  /**
   * Create a progress bar
   * @param {number} total - Total items
   * @param {string} label - Progress label
   * @returns {Object} Progress bar object
   */
  createProgressBar(total, label = 'Progress') {
    if (this.quiet) {
      return {
        update: () => {},
        complete: () => {}
      };
    }

    let current = 0;
    const barLength = 30;

    const update = (increment = 1) => {
      current += increment;
      const percentage = Math.round((current / total) * 100);
      const filled = Math.round((current / total) * barLength);
      const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);
      
      process.stdout.write(`\r${chalk.cyan(label)}: [${bar}] ${percentage}% (${current}/${total})`);
      
      if (current >= total) {
        process.stdout.write('\n');
      }
    };

    const complete = () => {
      current = total;
      update(0);
    };

    return { update, complete };
  }

  /**
   * Log table data
   * @param {Array} headers - Table headers
   * @param {Array} rows - Table rows
   */
  table(headers, rows) {
    if (this.quiet) return;

    // Simple table formatting
    const colWidths = headers.map((header, i) => {
      const maxWidth = Math.max(
        header.length,
        ...rows.map(row => String(row[i] || '').length)
      );
      return Math.min(maxWidth, 30); // Max column width
    });

    // Print header
    const headerRow = headers.map((header, i) => 
      header.padEnd(colWidths[i])
    ).join(' | ');
    console.log(chalk.bold(headerRow));
    console.log(chalk.gray('-'.repeat(headerRow.length)));

    // Print rows
    rows.forEach(row => {
      const rowStr = row.map((cell, i) => 
        String(cell || '').padEnd(colWidths[i])
      ).join(' | ');
      console.log(rowStr);
    });
  }
}

// Default logger instance
export const logger = new Logger();

// Export convenience functions
export const log = {
  error: (message, error) => logger.error(message, error),
  warn: (message) => logger.warn(message),
  info: (message) => logger.info(message),
  debug: (message) => logger.debug(message),
  success: (message) => logger.success(message),
  step: (message) => logger.step(message),
  progress: (message) => logger.progress(message),
  file: (operation, path) => logger.file(operation, path),
  custom: (icon, message, color) => logger.custom(icon, message, color),
  table: (headers, rows) => logger.table(headers, rows)
};

