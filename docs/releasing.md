# Releasing Packages

Each package is released independently using Git tags. Pushing a tag triggers the corresponding GitHub Actions workflow which publishes to npm and commits the version bump back to `main`.

## Tag Convention

| Package | Tag format | Example |
|---|---|---|
| `@vendure-io/design-tokens` | `design-tokens/v{version}` | `design-tokens/v1.2.0` |
| `@vendure-io/ui` | `ui/v{version}` | `ui/v2.0.0` |

## How to Release

1. Go to the repo on GitHub
2. Click **Releases** → **Draft a new release**
3. Click **Choose a tag** and type the tag (e.g. `design-tokens/v1.2.0`), then select **Create new tag on publish**
4. Set the release title (e.g. `@vendure-io/design-tokens v1.2.0`)
5. Write release notes or click **Generate release notes**
6. Click **Publish release**

The workflow will:
- Extract the version from the tag
- Update the target package's `package.json`
- Build all packages
- Publish to npm with provenance
- Commit the version bump back to `main`

## Releasing Both Packages

When releasing both packages (e.g. after a design-tokens change that ui depends on):

1. Release `design-tokens` first
2. Wait for its workflow to complete (version bump committed to `main`)
3. Then release `ui`

This ensures the ui package picks up the latest design-tokens version when resolving the `workspace:*` dependency for npm.

## Versioning

Packages follow independent semver. A design-tokens bump does not require a ui bump unless the ui package needs the new tokens.

## Workspace Dependency Resolution

`@vendure-io/ui` depends on `@vendure-io/design-tokens` via `workspace:*` in the repo. During the ui release workflow, this is resolved to a caret range (e.g. `^1.2.0`) in the published tarball. The `workspace:*` value stays in the repo — only the npm tarball gets the resolved version.

## Troubleshooting

### Workflow didn't run
Check the tag format. Tags must match `design-tokens/v*` or `ui/v*` exactly. Old-style `v1.0.0` tags won't trigger either workflow.

### npm publish failed
Verify the `NPM_TOKEN` secret is set and not expired in the repo settings.

### Version bump push failed
If both workflows run simultaneously, one may fail to push (non-fast-forward). The workflow uses `git pull --rebase` to handle this, but in rare cases you may need to manually update the package.json version on `main`.
