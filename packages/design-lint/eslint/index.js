import {
  colorFunctionNames,
  opacitySuffix,
  rampNames,
  rampSteps,
  utilityPrefixes,
} from './pattern-parts.js';

const rampUtilityPattern = new RegExp(
  `(?:^|[\\s:!])${utilityPrefixes}-${rampNames}-${rampSteps}${opacitySuffix}!?(?=\\s|$)`,
  'i',
);
const namedUtilityPattern = new RegExp(
  `(?:^|[\\s:!])${utilityPrefixes}-(?:black|white)${opacitySuffix}!?(?=\\s|$)`,
  'i',
);
const rampVariablePattern = new RegExp(
  `var\\(\\s*--(?:color-)?${rampNames}-${rampSteps}\\s*\\)`,
  'i',
);
// The 3/4-digit branch requires at least one a-f letter so that pure-decimal
// runs (e.g. GitHub issue refs like `(#2608)`) are not treated as #RGB(A) colors.
// The 6/8-digit branches stay permissive because those lengths are almost
// always literal colors even when fully decimal (e.g. `#112233`).
const hexPattern =
  /(?:^|[\s:,([])#(?:(?=[0-9a-f]*[a-f])[0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})(?![0-9a-f])/i;
const colorFunctionPattern = new RegExp(`\\b${colorFunctionNames}\\(`, 'i');

/** @typedef {import('estree').Node | { type: 'JSXAttribute'; name: { type: 'JSXIdentifier'; name: string } | { type: 'JSXNamespacedName' } }} ParentNode */

/**
 * @param {string} value
 * @returns {'ramp-utility' | 'ramp-variable' | 'literal-color' | null}
 */
function findForbiddenColor(value) {
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

// Only className and style JSX attributes carry styling values; every other
// attribute (href, title, aria-*, data-*, …) holds prose or identifiers and
// is exempt, mirroring the Biome plugin's allowlist.
/** @param {import('estree').Node & { parent?: ParentNode }} node */
function isNonStyleJsxAttribute(node) {
  const parent = node.parent;
  if (!parent || parent.type !== 'JSXAttribute') {
    return false;
  }
  const name = parent.name;
  return name.type !== 'JSXIdentifier' || (name.name !== 'className' && name.name !== 'style');
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
