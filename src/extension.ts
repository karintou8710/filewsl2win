import * as vscode from 'vscode';

export function activate(context: vscode.ExtensionContext) {

	console.log('Congratulations, your extension "filewsl2win" is now active!');

	let disposable = vscode.commands.registerCommand('filewsl2win.helloWorld', () => {
		vscode.window.showInformationMessage('Hello World from FileWSL2Win!');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
