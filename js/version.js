/* global VIZR_VERSION, VIZR_GIT_HASH */

// Constants injected by Webpack build
export const VERSION = VIZR_VERSION;
export const GIT_HASH = VIZR_GIT_HASH;

export const VERSION_STRING = `${VERSION}+${GIT_HASH}`;

export default VERSION_STRING;
