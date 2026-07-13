import { describe, expect, test } from 'bun:test';

import { matchFileTypeIcon, processCode, transformCommand } from './code-block.tsx';

describe('transformCommand', () => {
  describe('npx → dlx / bunx', () => {
    test('pnpm rewrites npx to pnpm dlx', () => {
      expect(transformCommand('npx create-vendure-app my-shop', 'pnpm')).toBe(
        'pnpm dlx create-vendure-app my-shop',
      );
    });
    test('yarn rewrites npx to yarn dlx', () => {
      expect(transformCommand('npx create-vendure-app my-shop', 'yarn')).toBe(
        'yarn dlx create-vendure-app my-shop',
      );
    });
    test('bun rewrites npx to bunx', () => {
      expect(transformCommand('npx create-vendure-app my-shop', 'bun')).toBe(
        'bunx create-vendure-app my-shop',
      );
    });
  });

  describe('npm create | npm init → <pm> create', () => {
    test('pnpm', () => {
      expect(transformCommand('npm create vite', 'pnpm')).toBe('pnpm create vite');
    });
    test('yarn', () => {
      expect(transformCommand('npm create vite', 'yarn')).toBe('yarn create vite');
    });
    test('bun', () => {
      expect(transformCommand('npm create vite', 'bun')).toBe('bun create vite');
    });
    test('npm init maps to create as well', () => {
      expect(transformCommand('npm init vite', 'pnpm')).toBe('pnpm create vite');
      expect(transformCommand('npm init vite', 'yarn')).toBe('yarn create vite');
      expect(transformCommand('npm init vite', 'bun')).toBe('bun create vite');
    });
  });

  describe('npm install|i|add <pkgs> → <pm> add <pkgs>', () => {
    for (const verb of ['install', 'i', 'add'] as const) {
      test(`pnpm rewrites "npm ${verb} <pkg>" to "pnpm add <pkg>"`, () => {
        expect(transformCommand(`npm ${verb} @vendure/core`, 'pnpm')).toBe(
          'pnpm add @vendure/core',
        );
      });
      test(`yarn rewrites "npm ${verb} <pkg>" to "yarn add <pkg>"`, () => {
        expect(transformCommand(`npm ${verb} @vendure/core`, 'yarn')).toBe(
          'yarn add @vendure/core',
        );
      });
      test(`bun rewrites "npm ${verb} <pkg>" to "bun add <pkg>"`, () => {
        expect(transformCommand(`npm ${verb} @vendure/core`, 'bun')).toBe('bun add @vendure/core');
      });
    }

    test('preserves multiple packages', () => {
      expect(transformCommand('npm install @vendure/core @vendure/email-plugin', 'pnpm')).toBe(
        'pnpm add @vendure/core @vendure/email-plugin',
      );
    });
  });

  describe('dev-flag handling on add', () => {
    test('pnpm keeps -D', () => {
      expect(transformCommand('npm install -D typescript', 'pnpm')).toBe('pnpm add -D typescript');
    });
    test('yarn keeps -D', () => {
      expect(transformCommand('npm install -D typescript', 'yarn')).toBe('yarn add -D typescript');
    });
    test('bun lowercases the flag to -d', () => {
      expect(transformCommand('npm install -D typescript', 'bun')).toBe('bun add -d typescript');
    });
    test('--save-dev normalizes the same as -D', () => {
      expect(transformCommand('npm install --save-dev typescript', 'pnpm')).toBe(
        'pnpm add -D typescript',
      );
      expect(transformCommand('npm install --save-dev typescript', 'bun')).toBe(
        'bun add -d typescript',
      );
    });
  });

  describe('bare npm install | i | ci → install', () => {
    for (const verb of ['install', 'i', 'ci'] as const) {
      test(`pnpm rewrites bare "npm ${verb}" to "pnpm install"`, () => {
        expect(transformCommand(`npm ${verb}`, 'pnpm')).toBe('pnpm install');
      });
      test(`yarn rewrites bare "npm ${verb}" to "yarn"`, () => {
        expect(transformCommand(`npm ${verb}`, 'yarn')).toBe('yarn');
      });
      test(`bun rewrites bare "npm ${verb}" to "bun install"`, () => {
        expect(transformCommand(`npm ${verb}`, 'bun')).toBe('bun install');
      });
    }
  });

  describe('npm run <script>', () => {
    test('pnpm keeps run', () => {
      expect(transformCommand('npm run build', 'pnpm')).toBe('pnpm run build');
    });
    test('yarn drops run', () => {
      expect(transformCommand('npm run build', 'yarn')).toBe('yarn build');
    });
    test('bun keeps run', () => {
      expect(transformCommand('npm run build', 'bun')).toBe('bun run build');
    });
  });

  describe('npm remove | uninstall | rm → <pm> remove', () => {
    for (const verb of ['remove', 'uninstall', 'rm'] as const) {
      test(`pnpm rewrites "npm ${verb} <pkg>" to "pnpm remove <pkg>"`, () => {
        expect(transformCommand(`npm ${verb} @vendure/core`, 'pnpm')).toBe(
          'pnpm remove @vendure/core',
        );
      });
      test(`yarn rewrites "npm ${verb} <pkg>" to "yarn remove <pkg>"`, () => {
        expect(transformCommand(`npm ${verb} @vendure/core`, 'yarn')).toBe(
          'yarn remove @vendure/core',
        );
      });
      test(`bun rewrites "npm ${verb} <pkg>" to "bun remove <pkg>"`, () => {
        expect(transformCommand(`npm ${verb} @vendure/core`, 'bun')).toBe(
          'bun remove @vendure/core',
        );
      });
    }
  });

  describe('npm exec → <pm> exec / bun x', () => {
    test('pnpm', () => {
      expect(transformCommand('npm exec cowsay', 'pnpm')).toBe('pnpm exec cowsay');
    });
    test('yarn', () => {
      expect(transformCommand('npm exec cowsay', 'yarn')).toBe('yarn exec cowsay');
    });
    test('bun uses bun x', () => {
      expect(transformCommand('npm exec cowsay', 'bun')).toBe('bun x cowsay');
    });
  });

  describe('multi-line and non-npm content', () => {
    test('rewrites npm lines and leaves other lines untouched', () => {
      const input = 'cd my-shop\nnpm install\necho done';
      expect(transformCommand(input, 'pnpm')).toBe('cd my-shop\npnpm install\necho done');
    });

    test('rewrites each npm line independently in a mixed block', () => {
      const input = 'npm install @vendure/core\nnpm run build';
      expect(transformCommand(input, 'yarn')).toBe('yarn add @vendure/core\nyarn build');
    });

    test('leaves a block with no npm/npx lines unchanged', () => {
      const input = 'cd my-shop\ngit init\ncode .';
      expect(transformCommand(input, 'bun')).toBe(input);
    });
  });

  describe('npm target is the identity transform', () => {
    for (const input of [
      'npm install @vendure/core',
      'npm run build',
      'npx create-vendure-app',
      'npm install -D typescript',
    ]) {
      test(`returns "${input}" unchanged`, () => {
        expect(transformCommand(input, 'npm')).toBe(input);
      });
    }
  });
});

describe('processCode', () => {
  describe('filename directive extraction', () => {
    test('pulls a `// filename:` first line into extractedFilename and removes it', () => {
      const result = processCode('// filename: src/foo.ts\nconst x = 1;', 'typescript');
      expect(result.extractedFilename).toBe('src/foo.ts');
      expect(result.cleanCode).toBe('const x = 1;');
    });

    test('leaves cleanCode free of the directive', () => {
      const result = processCode(
        '// filename: src/plugins/loyalty/loyalty.plugin.ts\nexport class LoyaltyPlugin {}',
        'typescript',
      );
      expect(result.cleanCode).not.toContain('filename:');
      expect(result.cleanCode).toContain('export class LoyaltyPlugin {}');
    });

    test('no directive → cleanCode is the input, extractedFilename undefined', () => {
      const result = processCode('const x = 1;', 'typescript');
      expect(result.cleanCode).toBe('const x = 1;');
      expect(result.extractedFilename).toBeUndefined();
    });
  });

  describe('notation handling for unsupported languages', () => {
    test('strips a trailing `// [!code highlight]` from a json line', () => {
      const result = processCode('{\n  "port": 3000 // [!code highlight]\n}', 'json');
      expect(result.cleanCode).not.toContain('[!code');
      expect(result.cleanCode).toContain('"port": 3000');
    });

    test('drops a notation-only line entirely', () => {
      const result = processCode('{\n  // [!code focus]\n  "port": 3000\n}', 'json');
      expect(result.cleanCode).not.toContain('[!code');
      expect(result.cleanCode).not.toContain('focus');
      expect(result.cleanCode).toContain('"port": 3000');
    });

    test('strips a `# [!code ++]` notation for text-like languages', () => {
      const result = processCode('plain value # [!code ++]', 'text');
      expect(result.cleanCode).not.toContain('[!code');
      expect(result.cleanCode).toContain('plain value');
    });
  });

  describe('notation preservation for supported languages', () => {
    test('leaves `// [!code highlight]` intact for typescript', () => {
      const input = 'const port = 3000; // [!code highlight]';
      const result = processCode(input, 'typescript');
      expect(result.cleanCode).toContain('[!code highlight]');
    });

    test('leaves `# [!code ++]` intact for bash', () => {
      const input = 'npm install @vendure/core # [!code ++]';
      const result = processCode(input, 'bash');
      expect(result.cleanCode).toContain('[!code ++]');
    });
  });
});

describe('matchFileTypeIcon', () => {
  test('matches by extension', () => {
    expect(matchFileTypeIcon('vendure-config.ts')?.title).toBe('TypeScript');
    expect(matchFileTypeIcon('ProductList.tsx')?.title).toBe('React');
    expect(matchFileTypeIcon('package.json')?.title).toBe('JSON');
    expect(matchFileTypeIcon('docker-compose.yml')?.title).toBe('YAML');
    expect(matchFileTypeIcon('order.graphql')?.title).toBe('GraphQL');
    expect(matchFileTypeIcon('deploy.sh')?.title).toBe('Bash');
  });

  test('matches on the basename of a path with dots in it', () => {
    expect(matchFileTypeIcon('src/plugins/reviews/reviews.plugin.spec.ts')?.title).toBe(
      'TypeScript',
    );
  });

  test('is case-insensitive', () => {
    expect(matchFileTypeIcon('README.MD')?.title).toBe('Markdown');
  });

  test('matches Dockerfile by basename, with or without a directory', () => {
    expect(matchFileTypeIcon('Dockerfile')?.title).toBe('Docker');
    expect(matchFileTypeIcon('docker/Dockerfile')?.title).toBe('Docker');
  });

  test('returns undefined for unknown extensions, dotfiles and extensionless names', () => {
    expect(matchFileTypeIcon('main.rs')).toBeUndefined();
    expect(matchFileTypeIcon('.env')).toBeUndefined();
    expect(matchFileTypeIcon('LICENSE')).toBeUndefined();
  });
});
