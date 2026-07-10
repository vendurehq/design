const root = new URL('../', import.meta.url);
const skillNames = ['vendure-ui', 'vendure-tokens'] as const;

function fail(message: string): never {
  throw new Error(message);
}

function parseFrontmatter(markdown: string, path: string) {
  const match = markdown.match(/^---\n([\s\S]*?)\n---\n/);
  if (!match?.[1]) {
    return fail(`${path} must start with YAML frontmatter.`);
  }

  const entries = match[1].split('\n').map((line) => {
    const separator = line.indexOf(':');
    if (separator === -1) {
      return fail(`${path} has invalid frontmatter line: ${line}`);
    }
    return [line.slice(0, separator).trim(), line.slice(separator + 1).trim()] as const;
  });

  const allowed = new Set(['name', 'description']);
  for (const [key] of entries) {
    if (!allowed.has(key)) {
      return fail(`${path} uses non-portable frontmatter field: ${key}`);
    }
  }
  return Object.fromEntries(entries) as Record<string, string>;
}

async function validateSkill(skillName: (typeof skillNames)[number]) {
  const directory = new URL(`skills/${skillName}/`, root);
  const skillPath = `skills/${skillName}/SKILL.md`;
  const skillFile = Bun.file(new URL('SKILL.md', directory));
  if (!(await skillFile.exists())) {
    return fail(`${skillPath} is missing.`);
  }

  const markdown = await skillFile.text();
  const frontmatter = parseFrontmatter(markdown, skillPath);
  if (frontmatter.name !== skillName) {
    return fail(`${skillPath} name must be ${skillName}.`);
  }
  if (!frontmatter.description || frontmatter.description.length < 40) {
    return fail(`${skillPath} needs a useful model-invocation description.`);
  }
  if (!/^[a-z0-9-]+$/.test(frontmatter.name)) {
    return fail(`${skillPath} name is not portable.`);
  }
  if (markdown.includes('/Users/') || markdown.includes('file://')) {
    return fail(`${skillPath} contains a machine-local path.`);
  }

  const links = Array.from(markdown.matchAll(/\[[^\]]+\]\(([^)]+)\)/g), (match) => match[1]);
  for (const link of links) {
    if (
      !link ||
      link.startsWith('http://') ||
      link.startsWith('https://') ||
      link.startsWith('#')
    ) {
      continue;
    }
    if (!(await Bun.file(new URL(link, directory)).exists())) {
      return fail(`${skillPath} links to missing file: ${link}`);
    }
  }

  const metadataPath = `skills/${skillName}/agents/openai.yaml`;
  const metadata = await Bun.file(new URL('agents/openai.yaml', directory)).text();
  if (!metadata.includes(`$${skillName}`)) {
    return fail(`${metadataPath} default_prompt must name $${skillName}.`);
  }
  if (!metadata.includes('allow_implicit_invocation: true')) {
    return fail(`${metadataPath} must allow model invocation.`);
  }
}

for (const skillName of skillNames) {
  await validateSkill(skillName);
}

const screenRecipes = await Bun.file(
  new URL('skills/vendure-ui/references/screen-recipes.md', root),
).text();
if (screenRecipes.includes("from '@vendure/dashboard'")) {
  fail(
    'screen-recipes.md must defer exact Dashboard imports to the installed package owned by the Dashboard repository.',
  );
}

const evalCases = (await Bun.file(new URL('evals/skills/cases.json', root)).json()) as {
  cases?: Array<{ skill?: string; prompt?: string; expect?: string[]; reject?: string[] }>;
};
if (!evalCases.cases?.length) {
  fail('evals/skills/cases.json must contain behavioral cases.');
}
for (const evalCase of evalCases.cases) {
  if (!skillNames.includes(evalCase.skill as (typeof skillNames)[number])) {
    fail(`Eval case references unknown skill: ${evalCase.skill}`);
  }
  if (!evalCase.prompt || !evalCase.expect?.length || !evalCase.reject?.length) {
    fail(`Eval case is incomplete: ${evalCase.prompt ?? '<missing prompt>'}`);
  }
}

console.log('Portable skill structure is valid for Codex and Claude Code.');
