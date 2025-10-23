/**
 * Package Manager Configuration
 * Defines commands and file patterns for different package managers
 */

export const PACKAGE_MANAGERS = {
  npm: {
    name: 'npm',
    lockFile: 'package-lock.json',
    packageFiles: 'package.json*',
    installCmd: 'npm install --only=production',
    installDevCmd: 'npm install',
    buildCmd: 'npm run build || echo "No build script found"',
    startCmd: '["npm", "start"]',
    globalInstallCmd: 'npm install -g serve',
    globalInstallCmdWithPnpm: 'npm install -g pnpm serve'
  },
  yarn: {
    name: 'yarn',
    lockFile: 'yarn.lock',
    packageFiles: 'package.json yarn.lock',
    installCmd: 'yarn install --production',
    installDevCmd: 'yarn install',
    buildCmd: 'yarn build || echo "No build script found"',
    startCmd: '["yarn", "start"]',
    globalInstallCmd: 'yarn global add serve',
    globalInstallCmdWithPnpm: 'yarn global add pnpm serve'
  },
  pnpm: {
    name: 'pnpm',
    lockFile: 'pnpm-lock.yaml',
    packageFiles: 'package.json pnpm-lock.yaml',
    installCmd: 'npm install -g pnpm && pnpm install --prod',
    installDevCmd: 'npm install -g pnpm && pnpm install',
    buildCmd: 'npm install -g pnpm && pnpm build || echo "No build script found"',
    startCmd: '["pnpm", "start"]',
    globalInstallCmd: 'npm install -g pnpm && pnpm add -g serve',
    globalInstallCmdWithPnpm: 'npm install -g pnpm && pnpm add -g serve'
  }
};

/**
 * Detect package manager based on lock files in the project
 * @param {string} projectPath - Path to the project directory
 * @returns {Object} Package manager configuration
 */
export async function detectPackageManager(projectPath) {
  const fs = await import('fs-extra');
  
  // Check for lock files in order of preference
  if (await fs.pathExists(`${projectPath}/pnpm-lock.yaml`)) {
    return PACKAGE_MANAGERS.pnpm;
  }
  
  if (await fs.pathExists(`${projectPath}/yarn.lock`)) {
    return PACKAGE_MANAGERS.yarn;
  }
  
  if (await fs.pathExists(`${projectPath}/package-lock.json`)) {
    return PACKAGE_MANAGERS.npm;
  }
  
  // Default to npm if no lock file is found
  return PACKAGE_MANAGERS.npm;
}

/**
 * Get template variables for a specific package manager
 * @param {Object} packageManager - Package manager configuration
 * @param {boolean} isDev - Whether to use dev dependencies
 * @returns {Object} Template variables
 */
export function getTemplateVariables(packageManager, isDev = false) {
  return {
    PACKAGE_FILES: packageManager.packageFiles,
    INSTALL_CMD: isDev ? packageManager.installDevCmd : packageManager.installCmd,
    INSTALL_DEV_CMD: packageManager.installDevCmd,
    BUILD_CMD: packageManager.buildCmd,
    START_CMD: packageManager.startCmd,
    GLOBAL_INSTALL_CMD: packageManager.globalInstallCmd
  };
}

/**
 * Replace template placeholders with actual values
 * @param {string} template - Template string with placeholders
 * @param {Object} variables - Variables to replace placeholders
 * @returns {string} Processed template
 */
export function processTemplate(template, variables) {
  let processed = template;
  
  for (const [key, value] of Object.entries(variables)) {
    const placeholder = `{{${key}}}`;
    processed = processed.replace(new RegExp(placeholder, 'g'), value);
  }
  
  return processed;
}
