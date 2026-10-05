import { createRequire } from 'node:module';
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
const require = createRequire(import.meta.url);
const packages = ['react','react-dom','scheduler','@tanstack/react-query','@tanstack/query-core'];
const notices = packages.map(name => {
  // Resolve transitive packages from their owning installed package.
  const resolver = name === 'scheduler' ? createRequire(require.resolve('react-dom/package.json')) : name === '@tanstack/query-core' ? createRequire(require.resolve('@tanstack/react-query/package.json')) : require;
  const path = resolver.resolve(name + '/package.json');
  const metadata = JSON.parse(readFileSync(path,'utf8'));
  return `${name} ${metadata.version}\nDeclared license: ${metadata.license}\n\n${readFileSync(join(dirname(path),'LICENSE'),'utf8')}`;
});
writeFileSync(new URL('../../signalrank/static/react/THIRD-PARTY-NOTICES.txt',import.meta.url), 'Bundled frontend runtime dependencies\n\n' + notices.join('\n\n' + '-'.repeat(72) + '\n\n'));
