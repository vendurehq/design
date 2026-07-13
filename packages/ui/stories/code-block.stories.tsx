import type { Meta, StoryObj } from '@storybook/react';
import { SparklesIcon } from 'lucide-react';
import {
  CodeBlock,
  CodeBlockAction,
} from '../src/components/molecules/code-block.tsx';

const CONFIG_SNIPPET = `import { VendureConfig } from '@vendure/core';

export const config: VendureConfig = {
  apiOptions: {
    port: 3000,
    adminApiPath: 'admin-api',
    shopApiPath: 'shop-api',
  },
  authOptions: {
    tokenMethod: ['bearer', 'cookie'],
  },
};`;

const meta = {
  title: 'Molecules/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  args: {
    language: 'typescript',
    children: CONFIG_SNIPPET,
  },
  argTypes: {
    language: { control: 'text' },
    filename: { control: 'text' },
    hideHeader: { control: 'boolean' },
    packageManagerSwitcher: { control: 'boolean' },
    children: { control: 'text' },
  },
} satisfies Meta<typeof CodeBlock>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Playground: Story = {};

// filename prop drives the header label (FileIcon + path). Use it when the code
// is the contents of a file the reader is meant to create or edit.
export const WithFilename: Story = {
  args: {
    filename: 'src/vendure-config.ts',
  },
};

// The same header, sourced from a `// filename:` directive on the first line of
// the code instead of a prop. The directive line is stripped from the rendered
// code — handy when the snippet is copy-pasted from a real file.
export const FilenameDirective: Story = {
  args: {
    language: 'typescript',
    children: `// filename: src/plugins/loyalty/loyalty.plugin.ts
import { PluginCommonModule, VendurePlugin } from '@vendure/core';

@VendurePlugin({
  imports: [PluginCommonModule],
})
export class LoyaltyPlugin {}`,
  },
};

// packageManagerSwitcher adds npm → pnpm/yarn/bun tabs for shell blocks that
// contain npm/npx commands. The header reads "Terminal"; switching a tab
// rewrites the command in place. Only for install/CLI instructions.
export const ShellCommand: Story = {
  args: {
    language: 'bash',
    packageManagerSwitcher: true,
    children: 'npm install @vendure/core @vendure/email-plugin',
  },
};

// The identical command without the prop: a plain shell block, no tabs, header
// shows the language label. This is the correct rendering for terminal *output*
// or any command you are not asking the reader to run under their own PM.
export const PackageManagerSwitcherOff: Story = {
  args: {
    language: 'bash',
    children: 'npm install @vendure/core @vendure/email-plugin',
  },
};

// Shiki notations annotate lines without leaving the code string: highlight a
// line, mark diffs (++/--), focus (dims the rest), and highlight a word. Keep
// one intent per block — see the guidance page on notation restraint.
export const Notations: Story = {
  args: {
    language: 'typescript',
    children: `export const config: VendureConfig = { // [!code word:VendureConfig]
  apiOptions: {
    port: 3000, // [!code highlight]
    adminApiPath: 'admin-api', // [!code --]
    adminApiPath: 'admin', // [!code ++]
  },
  plugins: [
    EmailPlugin.init({ route: 'mailbox' }), // [!code focus]
  ],
};`,
  },
};

// Blocks over 40 lines collapse to 300px behind a "Show N more lines" expander,
// so a long file never dominates the page. Copy still takes the whole snippet.
export const Collapsible: Story = {
  args: {
    language: 'typescript',
    filename: 'src/plugins/loyalty/loyalty.plugin.ts',
    children: `import {
  Ctx,
  PluginCommonModule,
  RequestContext,
  Transaction,
  VendurePlugin,
} from '@vendure/core';
import gql from 'graphql-tag';

import { LoyaltyService } from './services/loyalty.service';
import { LoyaltyAccount } from './entities/loyalty-account.entity';
import { LOYALTY_PLUGIN_OPTIONS } from './constants';
import type { LoyaltyPluginOptions } from './types';

const schema = gql\`
  type LoyaltyAccount {
    id: ID!
    points: Int!
  }

  extend type Query {
    loyaltyAccount: LoyaltyAccount
  }

  extend type Mutation {
    redeemPoints(points: Int!): LoyaltyAccount!
  }
\`;

@VendurePlugin({
  imports: [PluginCommonModule],
  entities: [LoyaltyAccount],
  providers: [
    LoyaltyService,
    {
      provide: LOYALTY_PLUGIN_OPTIONS,
      useFactory: () => LoyaltyPlugin.options,
    },
  ],
  shopApiExtensions: {
    schema,
    resolvers: [],
  },
  compatibility: '^3.0.0',
})
export class LoyaltyPlugin {
  static options: LoyaltyPluginOptions;

  static init(options: LoyaltyPluginOptions) {
    this.options = options;
    return LoyaltyPlugin;
  }
}`,
  },
};

// The actions slot renders extra toolbar controls before the built-in copy
// button. Use CodeBlockAction (a tooltip icon button) for app-specific actions:
// this is where a docs app hangs its "Ask AI" button. The DS ships only Copy.
export const WithActions: Story = {
  args: {
    language: 'bash',
    filename: 'Terminal',
    children: 'npx @vendure/create my-shop',
    actions: (
      <CodeBlockAction
        icon={<SparklesIcon />}
        label="Ask AI"
        onClick={() => {}}
      />
    ),
  },
};

// hideHeader drops the header bar entirely — filename, language label, tabs and
// all — leaving just the code and its copy button. For dense inline embeds.
export const HideHeader: Story = {
  args: {
    hideHeader: true,
    language: 'json',
    children: `{
  "name": "my-shop",
  "dependencies": {
    "@vendure/core": "^3.0.0"
  }
}`,
  },
};

// Copy is always present. onCopied fires after a successful copy — wire your
// toast here; the DS never toasts. onCopyError fires if the clipboard write
// throws (e.g. an insecure context).
export const CopyFeedback: Story = {
  args: {
    language: 'graphql',
    children: `query ActiveOrder {
  activeOrder {
    id
    totalWithTax
    lines {
      quantity
      productVariant {
        name
      }
    }
  }
}`,
    onCopied: () => {
      // wire your toast here — the DS never toasts
    },
    onCopyError: (error) => {
      // surface the failure through your own toast/logging
      void error;
    },
  },
};
