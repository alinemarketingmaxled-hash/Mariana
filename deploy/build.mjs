/**
 * Build do deploy manual no Vercel.
 *
 * Enquanto o repositório não estiver conectado ao Vercel pelo GitHub, o deploy
 * é feito pelo upload dos arquivos desta pasta. Este script baixa o código do
 * app direto do repositório público (um único arquivo .tar.gz) e o extrai em
 * public/, que é o diretório publicado. Depois que a conexão com o GitHub for
 * feita nas configurações do projeto, o Vercel publica o repositório direto e
 * este script deixa de ser necessário.
 */
import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { gunzipSync } from 'node:zlib';

const OWNER = process.env.SOURCE_OWNER || 'alinemarketingmaxled-hash';
const REPO = process.env.SOURCE_REPO || 'Mariana';
const BRANCH = process.env.SOURCE_BRANCH || 'claude/allowance-monitoring-app-5ofgid';
const OUT = 'public';

// arquivos que não fazem parte do site publicado
const SKIP = [/^README\.md$/, /^\.gitignore$/, /^deploy\//, /^vercel\.json$/];

/** extrai um .tar (formato ustar) em uma lista de arquivos */
function untar(buf) {
  const files = [];
  const str = (start, len) => {
    const slice = buf.subarray(start, start + len);
    const end = slice.indexOf(0);
    return slice.toString('utf8', 0, end === -1 ? slice.length : end);
  };
  let offset = 0;
  while (offset + 512 <= buf.length) {
    const header = buf.subarray(offset, offset + 512);
    if (header.every((b) => b === 0)) break; // dois blocos zerados encerram o arquivo
    const name = str(offset, 100);
    const prefix = str(offset + 345, 155);
    const size = parseInt(str(offset + 124, 12).trim() || '0', 8);
    const type = header[156];
    const start = offset + 512;
    if (type === 48 || type === 0) { // '0' ou nulo: arquivo comum
      files.push({ path: prefix ? prefix + '/' + name : name, data: buf.subarray(start, start + size) });
    }
    offset = start + Math.ceil(size / 512) * 512;
  }
  return files;
}

const url = `https://codeload.github.com/${OWNER}/${REPO}/tar.gz/refs/heads/${BRANCH}`;
console.log(`Origem: ${OWNER}/${REPO}@${BRANCH}`);
const res = await fetch(url, { headers: { 'user-agent': 'mesada-deploy' } });
if (!res.ok) throw new Error(`Falha ao baixar o repositório: ${res.status} ${res.statusText}`);

const entries = untar(gunzipSync(Buffer.from(await res.arrayBuffer())))
  .map(({ path, data }) => ({ path: path.split('/').slice(1).join('/'), data })) // tira a pasta raiz
  .filter(({ path }) => path && !SKIP.some((rx) => rx.test(path)));

if (!entries.some((e) => e.path === 'index.html')) {
  throw new Error('index.html não encontrado no repositório.');
}

let bytes = 0;
for (const { path, data } of entries) {
  const dest = join(OUT, path);
  await mkdir(dirname(dest), { recursive: true });
  await writeFile(dest, data);
  bytes += data.length;
  console.log(`  ${path} (${data.length} bytes)`);
}
console.log(`${entries.length} arquivos, ${(bytes / 1024).toFixed(1)} KB publicados.`);
