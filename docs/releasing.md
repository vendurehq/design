# Releasing Packages

Each package is released independently by creating a GitHub Release with a package-scoped tag. The tag triggers the corresponding GitHub Actions workflow, which publishes to npm and commits the version bump back to `main`.

## Tag Convention

| Package | Tag format | Example |
|---|---|---|
| `@vendure-io/design-tokens` | `design-tokens/v{version}` | `design-tokens/v1.2.0` |
| `@vendure-io/ui` | `ui/v{version}` | `ui/v2.0.0` |

Prereleases use the same tag format with a semver prerelease suffix:

| Package | Example tag | npm dist-tag |
|---|---|---|
| `@vendure-io/design-tokens` | `design-tokens/v1.3.0-beta.0` | `beta` |
| `@vendure-io/ui` | `ui/v2.1.0-rc.0` | `rc` |

The first prerelease identifier becomes the npm dist-tag. Use named channels such as `alpha`, `beta`, `rc`, or `next`; avoid numeric-only prerelease identifiers like `1.3.0-0`.

## How to Release

1. Go to the repo on GitHub
2. Click **Releases** → **Draft a new release**
3. Click **Choose a tag** and type the tag (e.g. `design-tokens/v1.2.0`), then select **Create new tag on publish**
4. Set the release title (e.g. `@vendure-io/design-tokens v1.2.0`)
5. Write release notes or click **Generate release notes**
6. Click **Publish release**

For prereleases, use a prerelease version in the tag and check **Set as a pre-release** before publishing. With the GitHub CLI:

```sh
gh release create ui/v2.1.0-beta.0 --title "@vendure-io/ui v2.1.0-beta.0" --generate-notes --prerelease
gh release create design-tokens/v1.3.0-beta.0 --title "@vendure-io/design-tokens v1.3.0-beta.0" --generate-notes --prerelease
```

The workflow will:
- Extract the version from the tag
- Update the target package's `package.json`
- Build all packages
- Publish to npm with provenance (`latest` for stable releases, or the prerelease channel for prereleases)
- Commit the version bump back to `main`

## Releasing Both Packages

When releasing both packages (e.g. after a design-tokens change that ui depends on):

1. Release `design-tokens` first
2. Wait for its workflow to complete (version bump committed to `main`)
3. Then release `ui`

This ensures the ui package picks up the latest design-tokens version when resolving the `workspace:*` dependency for npm.

The same ordering applies to prereleases. For example, publish `design-tokens/v1.3.0-beta.0`, wait for the workflow to commit the version bump to `main`, then publish `ui/v2.1.0-beta.0` so the ui tarball resolves `@vendure-io/design-tokens` to the prerelease version.

## Versioning

Packages follow independent semver. A design-tokens bump does not require a ui bump unless the ui package needs the new tokens.

## Workspace Dependency Resolution

`@vendure-io/ui` depends on `@vendure-io/design-tokens` via `workspace:*` in the repo. During the ui release workflow, this is resolved to a caret range (e.g. `^1.2.0`) in the published tarball. The `workspace:*` value stays in the repo — only the npm tarball gets the resolved version.

## Troubleshooting

### Workflow didn't run
Check the tag format. Tags must match `design-tokens/v*` or `ui/v*` exactly. Old-style `v1.0.0` tags won't trigger either workflow.

### Prerelease published as latest
The workflow derives the npm dist-tag from the first prerelease identifier. A tag like `ui/v2.1.0-beta.0` publishes with `--tag beta`; stable tags publish with `--tag latest`.

### npm publish failed
Verify the `NPM_TOKEN` secret is set and not expired in the repo settings.

### Version bump push failed
If both workflows run simultaneously, one may fail to push (non-fast-forward). The workflow uses `git pull --rebase` to handle this, but in rare cases you may need to manually update the package.json version on `main`.
