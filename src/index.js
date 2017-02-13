
import { exec } from 'mz/child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';
import { version } from '../package.json';

const [, , option] = process.argv;

if (option) {
	if (['-v', '--version'].includes(option)) {
		console.log(`v${version}`);
		process.exit(0);
	}
	else if (['-h', '--help'].includes(option)) {
		console.log(`Just run \`${chalk.blue('git-add')}\` to start the magic.`);
		process.exit(0);
	}
}

const execCommand = async ({ resets, files, commit }) => {
	const resetCommand = `git reset ${resets.join(' ')}`;
	const addCommand = `git add ${files.join(' ')}`;
	const commitCommand = `git commit -m ${JSON.stringify(commit)}`;
	const excapeStr = (str) => str.replace(/`/g, '\\`');

	const commands = [resetCommand, addCommand, commitCommand].map(excapeStr);
	const [result, stderr] = await exec(commands.join(' && '));

	if (stderr) { throw new Error(stderr); }
	console.log(result);
};

const select = async (list) => {

	const { files, ...other } = await inquirer.prompt([
		{
			type: 'checkbox',
			name: 'files',
			message: 'git add',
			choices: list,
		},
		{
			type: 'input',
			name: 'commit',
			message: 'git commit -m',
		},
	]);

	const resets = list
		.filter(({ checked }) => checked)
		.filter(({ value }) => files.every((file) => file !== value))
		.map(({ value }) => value)
	;

	await execCommand({ files, resets, ...other });
};

const start = async () => {
	const parseRegExp = /^(.)(.)\s+?(.*)$/;
	const [listStr, stderr] = await exec('git status -s');

	if (stderr) { throw new Error(stderr); }

	if (!listStr) { return; }

	const list = listStr
		.split('\n')
		.filter(Boolean)
		.map((line) => {
			const [, codeX, codeY, fileName] = parseRegExp.exec(line);
			const hasAdded = !/[!?]/.test(codeX);
			const styledCodeX = chalk[hasAdded ? 'green' : 'red'](codeX);
			const styledCodeY = chalk.red(codeY);
			const checked = hasAdded && !codeY.trim();
			return {
				checked,
				value: fileName,
				name: `${styledCodeX}${styledCodeY} ${fileName}`,
			};
		})
	;

	await select(list);
};

start().catch((err) => console.error(err.message));
