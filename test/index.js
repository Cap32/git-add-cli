
import { exec } from 'mz/child_process';
import { spawn } from 'child_process';
import { resolve } from 'path';
import assert from 'assert';

const cwd = resolve(__dirname, 'git');
const options = { cwd };
const run = (command) => exec(command, options);
const commitMessage = 'test commit';

const delay = (t = 1) => new Promise((done) => setTimeout(done, t * 1000));

describe('git-add-cli', async () => {
	it('🌚 ', async () => {
		await exec(`rm -rf ${cwd}`);
		await exec(`mkdir ${cwd}`);
		await run('rm -rf .git');
		await run('git init .');
		await run('touch a.txt');
		await run('touch b.txt');
		await run('touch c.txt');
		await run('git status -s');

		const child = spawn(resolve('bin/git-add'), {
			...options,
			stdio: 'pipe',
		});

		child.stdin.setEncoding('utf-8');

		// child.stdout.on('data', (data) => {
		// 	const info = data.toString().trim();
		// 	info && console.log(info);
		// });

		await delay();
		child.stdin.write('a');

		await delay();
		child.stdin.write('\n');

		await delay();
		child.stdin.write('test commit');

		await delay();

		child.stdin.end();

		await delay();

		const [log] = await run('git log');

		assert(log.trim().endsWith(commitMessage));

		await exec(`rm -rf ${cwd}`);
	});

	after(() => exec(`rm -rf ${cwd}`));
});
