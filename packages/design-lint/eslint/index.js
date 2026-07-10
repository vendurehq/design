const rampNames =
  '(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)';
const rampSteps = '(?:50|100|200|300|400|500|600|700|800|900|950)';
const utilityPrefixes =
  '(?:bg|text|border|divide|outline|ring|shadow|accent|caret|fill|stroke|decoration|from|via|to)';

const rampUtilityPattern = new RegExp(
  `(?:^|[\\s:!])${utilityPrefixes}-${rampNames}-${rampSteps}(?:\\/[0-9.]+)?!?(?=\\s|$)`,
  'i',
);
const namedUtilityPattern = new RegExp(
  `(?:^|[\\s:!])${utilityPrefixes}-(?:black|white)(?:\\/[0-9.]+)?!?(?=\\s|$)`,
  'i',
);
const rampVariablePattern = new RegExp(
  `var\\(\\s*--(?:color-)?${rampNames}-${rampSteps}\\s*\\)`,
  'i',
);
const hexPattern = /(?:^|[\s:,([])#(?:[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![0-9a-f])/i;
const colorFunctionPattern = /\b(?:rgb|rgba|hsl|hsla|hwb|lab|lch|oklab|oklch|color)\s*\(/i;

/** @typedef {import('estree').Node | { type: 'JSXAttribute'; name: { type: 'JSXIdentifier'; name: string } }} ParentNode */

/**
 * @param {string} value
 * @returns {'ramp-utility' | 'ramp-variable' | 'literal-color' | null}
 */
export function findForbiddenColor(value) {
  if (rampUtilityPattern.test(value) || namedUtilityPattern.test(value)) {
    return 'ramp-utility';
  }
  if (rampVariablePattern.test(value)) {
    return 'ramp-variable';
  }
  if (hexPattern.test(value) || colorFunctionPattern.test(value)) {
    return 'literal-color';
  }
  return null;
}

/** @param {import('estree').Node & { parent?: ParentNode }} node */
function isNonStyleJsxAttribute(node) {
  const parent = node.parent;
  if (!parent || parent.type !== 'JSXAttribute' || parent.name.type !== 'JSXIdentifier') {
    return false;
  }
  const name = parent.name.name;
  return (
    name === 'href' ||
    name === 'to' ||
    name === 'id' ||
    name === 'name' ||
    name.startsWith('aria-') ||
    name.startsWith('data-')
  );
}

const noRawColors = {
  meta: {
    type: 'problem',
    docs: {
      description: 'Require semantic Vendure color slots in component code.',
    },
    schema: [],
    messages: {
      rawColor:
        'Use a semantic Vendure color slot. Raw ramp utilities, literal colors, and ramp variables belong only in theme definitions.',
    },
  },
  /** @param {import('eslint').Rule.RuleContext} context */
  create(context) {
    /** @param {import('estree').Literal & { parent?: ParentNode }} node */
    function checkLiteral(node) {
      if (typeof node.value !== 'string' || isNonStyleJsxAttribute(node)) {
        return;
      }
      if (findForbiddenColor(node.value)) {
        context.report({ node, messageId: 'rawColor' });
      }
    }

    /** @param {import('estree').TemplateElement} node */
    function checkTemplate(node) {
      if (findForbiddenColor(node.value.raw)) {
        context.report({ node, messageId: 'rawColor' });
      }
    }

    return {
      Literal: checkLiteral,
      TemplateElement: checkTemplate,
    };
  },
};

const plugin = {
  meta: {
    name: '@vendure-io/design-lint',
  },
  rules: {
    'no-raw-colors': noRawColors,
  },
  configs: {},
};

plugin.configs.recommended = [
  {
    name: '@vendure-io/design-lint/recommended',
    plugins: {
      '@vendure-io/design': plugin,
    },
    rules: {
      '@vendure-io/design/no-raw-colors': 'error',
    },
  },
];

export default plugin;
export { noRawColors };
