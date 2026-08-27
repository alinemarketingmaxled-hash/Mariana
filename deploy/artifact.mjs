// gera o arquivo unico usado para publicar o app como artifact
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const ler = (p) => readFileSync(resolve(raiz, p), 'utf8');
const b64 = (p) => readFileSync(resolve(raiz, p)).toString('base64');

const html = ler('index.html');
let css = ler('assets/styles.css');
for (const f of ['archivo-latin', 'archivo-italic-latin']) {
  css = css.replace(`url('fonts/${f}.woff2')`,
    `url('data:font/woff2;base64,${b64(`assets/fonts/${f}.woff2`)}')`);
}

const scripts = [...html.matchAll(/<script src="([^"]+)"><\/script>/g)].map((m) => m[1]);
const js = scripts.map((src) => `/* ${src} */\n${ler(src)}`).join('\n');

const saida = html
  .replace('<link rel="stylesheet" href="assets/styles.css" />', `<style>\n${css}\n</style>`)
  .replace(/<link rel="manifest"[^>]*>\n?/, '')
  .replace(/<link rel="apple-touch-icon"[^>]*>\n?/, '')
  .replace(/<script src="[^"]+"><\/script>\n?/g, '')
  .replace('</body>', `<script>\n${js}\n</script>\n</body>`);

// a pagina publicada como artifact ja vem embrulhada em <html><head><body>,
// entao nesse modo saem so o titulo, o estilo e o conteudo do corpo
const corpo = saida.slice(saida.indexOf('<body>') + 6, saida.lastIndexOf('</body>'));
const paraArtifact = `<title>Minha Mesada</title>\n<style>\n${css}\n</style>\n${corpo}`;

const modoArtifact = process.argv.includes('--artifact');
const texto = modoArtifact ? paraArtifact : saida;
const destino = process.argv.filter((a) => a !== '--artifact')[2] || resolve(raiz, 'mesada-artifact.html');
writeFileSync(destino, texto);
console.log(destino, (texto.length / 1024).toFixed(0) + ' kB,', scripts.length, 'scripts');
