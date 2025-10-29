// FIX: Import 'process' to provide correct Node.js types and resolve errors.
import process from 'process';
import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

type CheckResult = {
    name: string;
    success: boolean;
    output?: string;
    error?: string;
};

async function runCommand(name: string, command: string): Promise<CheckResult> {
    process.stdout.write(`${BLUE}[RUNNING]${RESET} ${name}... `);
    try {
        const { stdout, stderr } = await execPromise(command);
        if (stderr) {
            console.log(`${YELLOW}[WARNING]${RESET}`);
            return { name, success: true, output: stderr };
        }
        console.log(`${GREEN}[PASS]${RESET}`);
        return { name, success: true, output: stdout };
    } catch (e: any) {
        console.log(`${RED}[FAIL]${RESET}`);
        return { name, success: false, error: e.stdout || e.stderr || e.message };
    }
}

async function checkTypeScript(): Promise<CheckResult> {
    return runCommand('TypeScript Type Check', 'tsc --noEmit');
}

async function checkESLint(): Promise<CheckResult> {
    return runCommand('ESLint', 'eslint . --ext .ts,.tsx --cache');
}

async function runTests(): Promise<CheckResult> {
    return runCommand('Unit & Component Tests', 'vitest run');
}

async function main() {
    console.log('--- Starting Quality Checks ---');
    const results: CheckResult[] = [];
    let overallSuccess = true;

    results.push(await checkTypeScript());
    results.push(await checkESLint());
    results.push(await runTests());

    console.log('\n--- Summary ---');
    for (const result of results) {
        if (!result.success) {
            overallSuccess = false;
            console.log(`\n${RED}[FAIL] ${result.name}${RESET}`);
            if (result.error) {
                console.log(result.error);
            }
        } else {
             console.log(`${GREEN}[PASS] ${result.name}${RESET}`);
             if (result.output && result.name.includes('Tests')) {
                console.log(result.output.trimEnd());
             }
        }
    }

    if (overallSuccess) {
        console.log(`\n${GREEN}All checks passed successfully!${RESET}`);
        process.exit(0);
    } else {
        console.log(`\n${RED}One or more quality checks failed.${RESET}`);
        process.exit(1);
    }
}

main().catch((err) => {
    console.error('An unexpected error occurred while running the quality check script:', err);
    process.exit(1);
});
