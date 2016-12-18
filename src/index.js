
import { exec } from 'mz/child_process';
import inquirer from 'inquirer';
import chalk from 'chalk';

const execCommand = async ({ files, commit }) => {
	const addCommand = `git add ${files.join(' ')}`;
	const commitCommand = `git commit -m ${JSON.stringify(commit)}`;
	const [result, stderr] = await exec(`${addCommand} && ${commitCommand}`);

	if (stderr) { throw new Error(stderr); }
	console.log(result);
};

const select = async (list) => {

	const anwser = await inquirer.prompt([
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

	await execCommand(anwser);
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
			const styledCodeX = chalk[/[!?]/.test(codeX) ? 'red' : 'green'](codeX);
			const styledCodeY = chalk.red(codeY);
			return {
				value: fileName,
				name: `${styledCodeX}${styledCodeY} ${fileName}`,
			};
		})
	;

	await select(list);
};

start().catch((err) => console.error(err.message));
