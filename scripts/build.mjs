/** Dependency-free packager for this project's named-export ESM modules.
 * Deliberately rejects unsupported syntax instead of silently emitting a bad build.
 * Source stays modular; only the distributable is bundled.
 */
import { readFile, writeFile, mkdir, readdir } from 'node:fs/promises';
import { resolve, dirname, relative } from 'node:path';
const root = resolve(import.meta.dirname, '..');
const modules = new Map();
async function include(file) {
  const id = relative(root, file).replaceAll('\\', '/');
  if (modules.has(id)) return id;
  let source = await readFile(file, 'utf8');
  modules.set(id, '');
  for (const match of [...source.matchAll(/import\s+\{([^}]+)\}\s+from\s+['"]([^'"]+)['"];?/g)]) {
    const dependency = await include(resolve(dirname(file), match[2]));
    const names = match[1].replace(/\bas\b/g, ':');
    source = source.replace(match[0], `const {${names}} = require(${JSON.stringify(dependency)});`);
  }
  const exports = [...source.matchAll(/export\s+(?:const|let|function|class)\s+(\w+)/g)].map(m => m[1]);
  source = source.replace(/export\s+(?=const|let|function|class)/g, '');
  if (/^\s*(import|export)\s/m.test(source)) throw new Error(`Unsupported module syntax: ${id}`);
  modules.set(id, source + `\nreturn {${exports.join(',')}};`);
  return id;
}
await include(resolve(root, 'src/main.js'));
const art = {};
for (const file of await readdir(resolve(root, 'assets'))) {
  if (!file.endsWith('.svg')) continue;
  art[file.slice(0, -4)] = 'data:image/svg+xml;base64,' + (await readFile(resolve(root, 'assets', file))).toString('base64');
}
const css = await readFile(resolve(root, 'styles/tokens.css'), 'utf8') + await readFile(resolve(root, 'styles/game.css'), 'utf8');
const js = `globalThis.NBW_EMBEDDED_ASSETS=${JSON.stringify(art)};\n(() => {\nconst cache = {};\nconst modules={${[...modules].map(([id, code]) => `${JSON.stringify(id)}:function(require){\n${code}\n}`).join(',\n')}};\nfunction require(id){return cache[id] ??= modules[id](require);}\nrequire('src/main.js');\n})();`;
let html = await readFile(resolve(root, 'index.html'), 'utf8');
html = html.replace(/<link rel="(?:icon|stylesheet)"[^>]+>/g, '').replace('</head>', `<style>${css}</style></head>`).replace(/<script type="module"[^>]+><\/script>/, `<script>${js.replaceAll('</script', '<\\/script')}</script>`);
await mkdir(resolve(root, 'dist'), { recursive: true });
await writeFile(resolve(root, 'dist/index.html'), html);
console.log(`Built dist/index.html: ${modules.size} modules, ${Object.keys(art).length} embedded images, ${Math.round(Buffer.byteLength(html)/1024)} KB. Open directly in a browser.`);
