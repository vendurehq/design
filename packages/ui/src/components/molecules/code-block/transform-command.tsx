type PackageManager = 'npm' | 'pnpm' | 'yarn' | 'bun';

const PACKAGE_MANAGERS: PackageManager[] = ['npm', 'pnpm', 'yarn', 'bun'];

/**
 * Detects if a single line is an npm/npx command that can be transformed
 */
function isNpmLine(line: string): boolean {
  const trimmed = line.trim();
  return /^(npm\s+(install|i|add|run|exec|create|init|ci|remove|uninstall|rm)|npx\s+)/.test(
    trimmed,
  );
}

/**
 * Detects if the code contains any package manager commands that can be transformed
 */
function isPackageManagerCommand(code: string): boolean {
  const lines = code.split('\n');
  return lines.some((line) => isNpmLine(line));
}

/**
 * Transforms a single npm/npx command line to the equivalent for other package
 * managers, preserving the line's leading whitespace. Returns the line unchanged
 * when no rewrite applies.
 */
function transformSingleLine(line: string, targetPm: PackageManager): string {
  if (targetPm === 'npm') return line;

  const transformed = transformTrimmedCommand(line.trim(), targetPm);
  if (transformed === null) return line;

  const indent = line.slice(0, line.length - line.trimStart().length);
  return indent + transformed;
}

function transformTrimmedCommand(
  trimmed: string,
  targetPm: Exclude<PackageManager, 'npm'>,
): string | null {
  // Handle npx commands
  if (trimmed.startsWith('npx ')) {
    const rest = trimmed.slice(4);
    switch (targetPm) {
      case 'pnpm':
        return `pnpm dlx ${rest}`;
      case 'yarn':
        return `yarn dlx ${rest}`;
      case 'bun':
        return `bunx ${rest}`;
    }
  }

  // Handle npm create / npm init
  if (/^npm\s+(create|init)\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+(create|init)\s+(.+)$/);
    if (match) {
      const args = match[2];
      switch (targetPm) {
        case 'pnpm':
          return `pnpm create ${args}`;
        case 'yarn':
          return `yarn create ${args}`;
        case 'bun':
          return `bun create ${args}`;
      }
    }
  }

  // Handle npm install / npm i / npm add (with packages)
  if (/^npm\s+(install|i|add)\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+(install|i|add)\s+(.+)$/);
    if (match) {
      const packages = match[2] ?? '';
      // Match dev flags as whole tokens so package names containing "-D"
      // don't false-positive.
      const tokens = packages.split(/\s+/);
      const devFlag = tokens.includes('-D') || tokens.includes('--save-dev');
      const cleanPackages = tokens
        .filter((token) => token !== '-D' && token !== '--save-dev')
        .join(' ');

      switch (targetPm) {
        case 'pnpm':
          return devFlag ? `pnpm add -D ${cleanPackages}` : `pnpm add ${cleanPackages}`;
        case 'yarn':
          return devFlag ? `yarn add -D ${cleanPackages}` : `yarn add ${cleanPackages}`;
        case 'bun':
          return devFlag ? `bun add -d ${cleanPackages}` : `bun add ${cleanPackages}`;
      }
    }
  }

  // Handle npm install (without packages - install from package.json)
  if (/^npm\s+(install|i|ci)$/.test(trimmed)) {
    switch (targetPm) {
      case 'pnpm':
        return 'pnpm install';
      case 'yarn':
        return 'yarn';
      case 'bun':
        return 'bun install';
    }
  }

  // Handle npm run <script>
  if (/^npm\s+run\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+run\s+(.+)$/);
    if (match) {
      const script = match[1];
      switch (targetPm) {
        case 'pnpm':
          return `pnpm run ${script}`;
        case 'yarn':
          return `yarn ${script}`;
        case 'bun':
          return `bun run ${script}`;
      }
    }
  }

  // Handle npm remove / npm uninstall / npm rm
  if (/^npm\s+(remove|uninstall|rm)\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+(remove|uninstall|rm)\s+(.+)$/);
    if (match) {
      const packages = match[2];
      switch (targetPm) {
        case 'pnpm':
          return `pnpm remove ${packages}`;
        case 'yarn':
          return `yarn remove ${packages}`;
        case 'bun':
          return `bun remove ${packages}`;
      }
    }
  }

  // Handle npm exec
  if (/^npm\s+exec\s+/.test(trimmed)) {
    const match = trimmed.match(/^npm\s+exec\s+(.+)$/);
    if (match) {
      const rest = match[1];
      switch (targetPm) {
        case 'pnpm':
          return `pnpm exec ${rest}`;
        case 'yarn':
          return `yarn exec ${rest}`;
        case 'bun':
          return `bun x ${rest}`;
      }
    }
  }

  return null;
}

/**
 * Transforms all npm/npx commands in a code block to the target package manager.
 * Leaves non-npm lines unchanged.
 */
function transformCommand(code: string, targetPm: PackageManager): string {
  if (targetPm === 'npm') return code;

  const lines = code.split('\n');
  const transformedLines = lines.map((line) => {
    if (isNpmLine(line)) {
      return transformSingleLine(line, targetPm);
    }
    return line;
  });

  return transformedLines.join('\n');
}

export { PACKAGE_MANAGERS, isPackageManagerCommand, transformCommand };
export type { PackageManager };
