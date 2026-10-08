# Releasing Packages

Each package is released independently by creating a GitHub Release with a package-scoped tag. The tag triggers the corresponding GitHub Actions workflow, which publishes to npm and commits the version bump back to the branch the release was cut from (the release's target branch).

## Tag Convention

| Package | Tag format | Example |
|---|---|---|
| `@vendure-io/design-tokens` | `design-tokens/v{version}` | `design-tokens/v1.2.0` |
| `@vendure-io/ui` | `ui/v{version}` | `ui/v2.0.0` |
| `@vendure-io/design-lint` | `design-lint/v{version}` | `design-lint/v1.0.0` |

Prereleases use the same tag format with a semver prerelease suffix:

| Package | Example tag | npm dist-tag |
|---|---|---|
| `@vendure-io/design-tokens` | `design-tokens/v1.3.0-beta.0` | `beta` |
| `@vendure-io/ui` | `ui/v2.1.0-rc.0` | `rc` |
| `@vendure-io/design-lint` | `design-lint/v1.0.0-beta.0` | `beta` |

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
gh release create design-lint/v1.0.0-beta.0 --title "@vendure-io/design-lint v1.0.0-beta.0" --generate-notes --prerelease
```

The workflow will:
- Extract the version from the tag
- Update the target package's `package.json`
- Build all packages
- Publish to npm with provenance (`latest` for stable releases on the newest major, `v{major}` for stable releases on an older major, or the prerelease channel for prereleases)
- Commit the version bump back to the release's target branch

## Releasing Several Packages

When a change spans packages, release them in this order:

1. Release `design-tokens`.
2. Wait for its workflow to complete and commit the version bump to `main`.
3. Release `ui`.
4. Release `design-lint`.

`@vendure-io/ui` declares `@vendure-io/design-tokens` as a `^2.0.0` peer dependency. A ui prerelease replaces that range with `^<tokens version on main>` at publish time, because `^2.0.0` does not match prereleases. If you release ui before the tokens bump-back lands, the prerelease points at the previous tokens version.

The same ordering applies to prereleases. For example, publish `design-tokens/v1.3.0-beta.0`, wait for the workflow to commit the version bump to `main`, then publish `ui/v2.1.0-beta.0` so the ui tarball resolves `@vendure-io/design-tokens` to the prerelease version.

### Release notes for a major version

`--generate-notes` lists the merged pull requests only. For a major release such as 2.0.0, write the breaking changes and migration steps to a file and pass it with `--notes-file`:

```sh
gh release create design-tokens/v2.0.0 --title "@vendure-io/design-tokens v2.0.0" --notes-file design-tokens-2.0.0.md
gh release create ui/v2.0.0 --title "@vendure-io/ui v2.0.0" --notes-file ui-2.0.0.md
gh release create design-lint/v1.0.0 --title "@vendure-io/design-lint v1.0.0" --notes-file design-lint-1.0.0.md
```

Base the ui notes on [Migrating from 1.x to 2.0](./ui-components.md#migrating-from-1x-to-20).

## Maintaining an Older Major

Once a new major has started (e.g. `main` is on `2.x`), you can still ship patches to the previous major without disturbing the new line. Keep the old major on a long-lived `{major}.x` maintenance branch (e.g. `1.x`, branched from the last release of that major) and cut releases from it with `--target`:

```sh
# fix committed to the 1.x branch, then:
gh release create ui/v1.3.1 --target 1.x --title "@vendure-io/ui v1.3.1" --generate-notes
```

Two behaviors make this safe:

- **The version bump commits back to the release's target branch**, not `main`. Releasing `1.3.1` from `1.x` bumps `1.x`; releasing from `main` bumps `main`. Neither line clobbers the other. Releases cut from a raw commit SHA (no branch) skip the bump-back with a warning.
- **`latest` stays on the newest major.** A stable release whose major is lower than the current npm `latest` publishes to a `v{major}` dist-tag (e.g. `1.3.1` → `v1`) instead of `latest`, so `npm install` keeps resolving the newest major. While the old major is *still* the newest published major, its stable releases go to `latest` as usual. Consumers pin an older line with `npm install @vendure-io/ui@v1`.

## Versioning

Packages follow independent semver. A design-tokens bump does not require a ui bump unless the ui package needs the new tokens.

## Agent Skills

The skills install from `main` rather than npm and do not have a separate release line. When a package change affects consumer decisions, imports, composition, or token ownership:

1. Update the corresponding structured guidance in the same pull request.
2. Run `bun run skills:generate` and commit the generated references.
3. Mention `npx skills update --global vendure-ui vendure-tokens` in the package release notes.

## Workspace Dependency Resolution

In the repo, `@vendure-io/ui` links `@vendure-io/design-tokens` through a `workspace:*` dev dependency, and declares it as a `^2.0.0` peer dependency. The ui release workflow removes the dev dependency from the published `package.json`. For a prerelease, it also sets the peer range to `^<tokens version on main>`. The repo keeps both fields; only the npm tarball changes.

## Troubleshooting

### Workflow didn't run
Check the tag format. Tags must match `design-tokens/v*`, `ui/v*`, or `design-lint/v*` exactly. Old-style `v1.0.0` tags won't trigger a workflow.

### Prerelease published as latest
The workflow derives the npm dist-tag from the first prerelease identifier. A tag like `ui/v2.1.0-beta.0` publishes with `--tag beta`; stable tags publish with `--tag latest`.

### npm publish failed
Verify the `NPM_TOKEN` secret is set and not expired in the repo settings.

### Version bump push failed
Each release re-fetches its target branch and commits the bump onto the latest tip before pushing. If two release workflows target the same branch at the same time, one may still fail to push (non-fast-forward) — re-run the failed release, or manually update the package.json version on that branch. The npm publish happens before the bump-back, so a failed push does not affect what was published.
