import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve, relative } from 'node:path';

const source = __dirname;
function files(directory: string): string[] {
    return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
        const path = join(directory, entry.name);
        return entry.isDirectory() ? files(path) : path.endsWith('.ts') && !path.endsWith('.spec.ts') ? [path] : [];
    });
}
function dependencies(file: string): string[] {
    return [...readFileSync(file, 'utf8').matchAll(/(?:from\s+|import\s*|require\s*\()(['"])([^'"]+)\1/g)].map((match) => match[2]);
}
function internal(file: string, dependency: string): string | undefined {
    return dependency.startsWith('#Root/') ? dependency.slice(6) : dependency.startsWith('.') ? relative(source, resolve(dirname(file), dependency)) : undefined;
}

describe('DDD dependency rules', () => {
    const paths = files(join(source, 'contexts'));
    it.each(paths.filter((path) => /\/(domain|application)\//.test(path)).map((path) => [relative(source, path), path]))(
        '%s depends only on inward layers and public application contracts',
        (_label, path) => {
            const local = relative(source, path);
            const context = local.split('/')[1];
            const domain = local.includes('/domain/');
            for (const dependency of dependencies(path)) {
                const target = internal(path, dependency);
                if (!target) {
                    // Domain arithmetic is the only third-party dependency allowed in the model.
                    expect(dependency).toBe('decimal.js');
                    continue;
                }
                expect(target).not.toMatch(/(?:infrastructure|presentation|platform)\//);
                if (domain) {
                    expect(target.startsWith(`contexts/${context}/domain/`) || target.startsWith('shared/domain/')).toBe(true);
                } else if (target.startsWith('shared/')) {
                    expect(target).toMatch(/^shared\/(domain|application)\//);
                }
                if (target.startsWith('contexts/') && target.split('/')[1] !== context) {
                    expect(target).toMatch(/^contexts\/[^/]+\/application\/.+\.port$/);
                }
            }
        },
    );
    it('keeps shared domain primitives independent of business contexts and adapters', () => {
        for (const path of files(join(source, 'shared/domain'))) {
            for (const dependency of dependencies(path)) {
                const target = internal(path, dependency);
                if (target) expect(target.startsWith('shared/domain/')).toBe(true);
                else expect(dependency).toBe('decimal.js');
            }
        }
    });
});
