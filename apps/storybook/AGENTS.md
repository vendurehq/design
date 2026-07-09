# Storybook app

Hosts the stories from `packages/ui/stories/`. These rules apply to all story content rendered here.

## Story content rules

- **This is a public, open source repo.** Story copy must never reference internal consuming apps, private repos, or internal file paths (Cloud, portals, EE plugins, `ops-admin`, etc.). Describe domains generically ("Deployment", "Quotes"), not by which app owns them.
- **No em dashes** in story copy. Use a colon, semicolon, or parentheses instead.
- **Keep descriptions concise.** Guidance pages document decisions, not props: short definitions, one idea per sentence, no restating what the rendered example already shows.

## MCP server

Running `bun run storybook` exposes a Storybook MCP endpoint at `http://localhost:6006/mcp` (via `@storybook/addon-mcp`). Connect an agent with `claude mcp add --transport http storybook-ui http://localhost:6006/mcp`, then use its tools to read documented components and author stories. The story content rules above still apply to anything it writes.
