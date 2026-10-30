import { build } from 'esbuild';
import { mkdir } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
await mkdir('.cache', { recursive: true });
await build({ entryPoints: ['tests/calendar.test.tsx'], outfile: '.cache/calendar.test.mjs',
  bundle: true, platform: 'node', format: 'esm', jsx: 'automatic',
  packages: 'external',
  plugins: [{ name: 'ignore-test-css', setup(builder) {
    builder.onResolve({ filter: /\.css$/ }, () => ({ path: 'style', namespace: 'empty-css' }));
    builder.onLoad({ filter: /.*/, namespace: 'empty-css' }, () => ({ contents: '', loader: 'js' }));
  } }],
});
const result = spawnSync(process.execPath, ['--test', '.cache/calendar.test.mjs'], { stdio: 'inherit' });
process.exitCode = result.status ?? 1;
