// The build mode, read in one place. The design system ships its source, and a
// consumer type-checks it without Node types (the Console's app-shell package,
// for one). So `process` is declared here for this module only. Keep the
// literal `process.env.NODE_ENV`: bundlers replace it, so a production build
// drops the development-only checks.
declare const process: { env: { NODE_ENV?: string } };

/** True outside a production build: development warnings and checks run. */
export const isDevelopment = process.env.NODE_ENV !== 'production';
