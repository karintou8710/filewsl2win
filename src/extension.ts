import * as vscode from 'vscode';
import { spawn } from 'child_process';

async function SaveWinPath(context: vscode.ExtensionContext) {

	const winPath = context.globalState.get('winPath', null);
	const value = winPath || "/mnt/";

	const resWinPath = await vscode.window.showInputBox({
		prompt: "Enter the path on the windows side.",
		value: value,
	});

	if (resWinPath != undefined && resWinPath != '') {
		context.globalState.update('winPath', resWinPath);
		return resWinPath;
	} else {
		return null;
	}
}

function CopyFile(wslPath:string, winPath:string) {

	let overwriteFlag = true;
	const cp = spawn('cp', ['-r', '-i', wslPath, winPath]);

	cp.stdout.on('data', (data: Buffer) => {
		console.log(`stdout: ${data}`);
	});

	cp.stderr.on('data', async(data: Buffer) => {
		const dataStr = data.toString();
		if (dataStr.startsWith('cp: overwrite')) {
			const fileName = dataStr.substring(4);
			const res = await vscode.window.showInputBox({
				prompt: `${fileName} [y/n]`,
				placeHolder: "y/n"
			});

			const resBuf = res == 'y' ? Buffer.from('y\n') : Buffer.from('n\n');
			overwriteFlag = res == 'y';
			cp.stdin.write(resBuf);
		} else {
			console.error(`stderr: ${dataStr}`);
			vscode.window.showErrorMessage(dataStr);
		}
	});

	cp.on('close', (code: number) => {
		if (code == 0 && overwriteFlag) {
			vscode.window.showInformationMessage(
				`Copying from ${wslPath} to ${winPath} was successful.`
			);
		}
	});
}

export function activate(context: vscode.ExtensionContext) {

	console.log('"filewsl2win" is now active!');

	let setWinPath = vscode.commands.registerCommand('filewsl2win.setWinPath', async() => {
		const resWinPath = await SaveWinPath(context);

		if (resWinPath != null) {
			vscode.window.showInformationMessage(`set winPath: ${resWinPath}`);
		}
	});

	let copyWSL2Win = vscode.commands.registerCommand('filewsl2win.copyWSL2Win', async(e: any) => {

		const wslPath = e.path;
		const winPath = context.globalState.get('winPath', null);

		if (winPath == undefined || winPath == '') {
			const resWinPath = await SaveWinPath(context);

			if (resWinPath != null) {
				CopyFile(wslPath, resWinPath);
			}
		}else{
			CopyFile(wslPath, winPath);
		}
	});

	context.subscriptions.push(copyWSL2Win);
	context.subscriptions.push(setWinPath);
}

export function deactivate() {}