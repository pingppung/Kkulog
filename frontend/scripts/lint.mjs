import { readdir, readFile } from 'node:fs/promises';
import { transform } from 'esbuild';
import { ESLint } from 'eslint';

// The repository has no TS compiler/parser dependency. Check runtime TS/TSX
// through esbuild's type erasure and ESLint, preserving JSX and value imports.
const eslint = new ESLint();
const results = await eslint.lintFiles(['*.js', 'scripts/**/*.mjs']);
async function walk(directory) {
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const file = `${directory}/${entry.name}`;
    if (entry.isDirectory()) await walk(file);
    else if (/\.tsx?$/.test(file)) {
      const { code } = await transform(await readFile(file, 'utf8'), {
        loader: file.endsWith('tsx') ? 'tsx' : 'ts', jsx: 'preserve',
        tsconfigRaw: { compilerOptions: { verbatimModuleSyntax: true } },
      });
      results.push(...await eslint.lintText(code, { filePath: file.replace(/\.tsx?$/, '.jsx') }));
    }
  }
}
await walk('src');
console.log((await eslint.loadFormatter('stylish')).format(results));
if (results.some(result => result.errorCount || result.warningCount)) process.exitCode = 1;
