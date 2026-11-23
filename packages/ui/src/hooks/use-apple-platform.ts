'use client';

import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

// Apple platforms show ⌘, the rest show Ctrl. The server and the first
// hydration render have no platform, so they get false (Ctrl); React swaps in
// the client value right after hydration without a mismatch error.
function isApplePlatform() {
  if (typeof navigator === 'undefined') return false;
  const nav = navigator as Navigator & { userAgentData?: { platform?: string } };
  const platform = nav.userAgentData?.platform || nav.platform || nav.userAgent;
  return /mac|iphone|ipad|ipod/i.test(platform);
}

/**
 * Whether the browser runs on an Apple platform, to label a shortcut with ⌘
 * there and Ctrl elsewhere. False on the server and in the first hydration
 * render.
 */
function useIsApplePlatform() {
  return useSyncExternalStore(subscribe, isApplePlatform, () => false);
}

export { useIsApplePlatform };
