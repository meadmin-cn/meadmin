import { basename } from 'node:path';
import serialize from 'serialize-javascript';
import { renderToString } from 'vue/server-renderer';
import { createApp } from './main';
import { useGlobalStore } from './store/index.js';
import { setServerCookies } from './utils/cookies.js';
import { cleanServerCache, getAllServerCache } from './utils/server.js';
export async function render(url: string, manifest: Record<string, string[]>, context: Record<string, any>) {
  setServerCookies(context.ssrVersion, context.cookies);
  const { app, router, store } = await createApp(context.ssrVersion);
  const globalStore = useGlobalStore(store);
  globalStore.websiteName = context.assign.websiteName;
  // set the router to the desired URL before rendering
  await router.push(url === router.options.history.base ? '/' : url);
  await router.isReady();
  // passing SSR context object which will be available via useSSRContext()
  // @vitejs/plugin-vue injects code into a component's setup() that registers
  // itself on ctx.modules. After the render, ctx.modules would contain all the
  // components that have been instantiated during this render call.
  const ctx = {} as Record<string, any>;
  const html = await renderToString(app, ctx);
  // which we can then use to determine what files need to be preloaded for this
  // request.
  const __pinia = serialize(store.state.value, { ignoreFunction: true });
  const serverCache = getAllServerCache(context.ssrVersion);
  const __serverCache = serialize(serverCache, { ignoreFunction: true });
  const preloadLinks = `<script>window.__pinia=${__pinia};</script>\n` + `<script>window.__serverCache=${__serverCache};</script>\n` + renderPreloadLinks(ctx.modules, manifest);
  const teleports = renderTeleports(ctx.teleports);
  setServerCookies(context.ssrVersion, null);
  cleanServerCache(context.ssrVersion);
  return [html, preloadLinks, teleports];
}

function renderPreloadLinks(modules: string[], manifest: Record<string, string[]>) {
  let links = '';
  const seen = new Set();
  modules.forEach((id) => {
    const files = manifest[id];
    if (files) {
      files.forEach((file) => {
        if (!seen.has(file)) {
          seen.add(file);
          const filename = basename(file);
          if (manifest[filename]) {
            for (const depFile of manifest[filename]) {
              links += renderPreloadLink(depFile);
              seen.add(depFile);
            }
          }
          links += renderPreloadLink(file);
        }
      });
    }
  });
  return links;
}

function renderPreloadLink(file: string) {
  if (file.endsWith('.js')) {
    return `<link rel="modulepreload" crossorigin href="${file}">`;
  } else if (file.endsWith('.css')) {
    return `<link rel="stylesheet" href="${file}">`;
  } else if (file.endsWith('.woff')) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff" crossorigin>`;
  } else if (file.endsWith('.woff2')) {
    return ` <link rel="preload" href="${file}" as="font" type="font/woff2" crossorigin>`;
  } else if (file.endsWith('.gif')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/gif">`;
  } else if (file.endsWith('.jpg') || file.endsWith('.jpeg')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/jpeg">`;
  } else if (file.endsWith('.png')) {
    return ` <link rel="preload" href="${file}" as="image" type="image/png">`;
  } else {
    // TODO
    return '';
  }
}

function renderTeleports(teleports?: Record<string, any>) {
  if (!teleports) return '';
  return Object.entries(teleports).reduce((all, [key, value]) => {
    if (key.startsWith('#el-popper-container-')) {
      return `${all}<div id="${key.slice(1)}">${value}</div>`;
    }
    return all;
  }, teleports.body || '');
}
