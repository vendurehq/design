# Agent Skills

The repository publishes two portable skills for agents building or reviewing design-system consumers:

| Skill | Use it for |
|---|---|
| `vendure-ui` | Component decisions, composition rules, forms, async states, illustrations, and strong-default screen recipes |
| `vendure-tokens` | Semantic colors, surfaces, typography, motion, theme setup, and token ownership |

Both skills use the portable Agent Skills `SKILL.md` format and work with OpenAI Codex and Claude Code. OpenAI-specific interface metadata is isolated under `agents/openai.yaml`; the skill instructions and references remain agent-neutral.

## Install globally

Install both skills from the GitHub repository and select the agents interactively:

```sh
npx skills add vendurehq/design \
  --skill vendure-ui \
  --skill vendure-tokens \
  --global
```

For a non-interactive Codex and Claude Code installation, copy the skills into each agent's native global directory:

```sh
npx skills add vendurehq/design \
  --skill vendure-ui \
  --skill vendure-tokens \
  --global \
  --agent codex \
  --agent claude-code \
  --copy \
  --yes
```

Install a single skill by removing the other `--skill` option.

## Update

The installed skills track the guidance on this repository's `main` branch. Refresh them after design-system releases or material guidance changes:

```sh
npx skills update --global vendure-ui vendure-tokens
```

Skill changes that accompany consumer-facing package behavior are maintained in the same pull request and called out in the release notes.

## Host behavior

`vendure-ui` automatically distinguishes Dashboard extensions from standalone consumers. Dashboard extensions import UI through `@vendure/dashboard`; standalone consumers use exact `@vendure-io/ui` subpaths.

`vendure-tokens` distinguishes three token-ownership modes:

- Repositories owned by `vendurehq` consume published values without overriding them.
- Dashboard extensions inherit the host theme without overriding it.
- Standalone external apps may remap semantic slot values while component code continues to use semantic colors.

All consumers use semantic colors in component code. Vendure's published semantic ramps are allowed for deliberate fixed intensity; generic palette ramps and literal colors belong only in approved theme definitions.
