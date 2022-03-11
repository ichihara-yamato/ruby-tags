// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import { allowedNodeEnvironmentFlags } from 'process';
import * as vscode from 'vscode';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
	const kCommandName: string = 'extension.ruby-tags';
	
	// The command has been defined in the package.json file
	// Now provide the implementation of the command with registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand(kCommandName, () => {
		// The code you place here will be executed every time your command is executed
		// Display a message box to the user
		// vscode.window.showInformationMessage('Hello World from Ruby tags!');

		// select text
		const active = vscode.window.activeTextEditor;
		if (!active) { return; } // null check

		const selection = active.selection;
		if (!selection) { return; } // null check

		let regexp = getRegexp(1);

		const text = active.document.getText(new vscode.Range(selection.start, selection.end));

		let ruby = setRubyTags(text, regexp);

		if (ruby.indexOf('<ruby>') === -1) {
			regexp = getRegexp(2);
			ruby = setRubyTags(ruby, regexp);
		}
		
		active.edit(editBuilder => {
			editBuilder.replace(selection, ruby);
		});
	});

	context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

// Get regular expression format
export function getRegexp(f: number) {
	let lang = vscode.env.language; // lang
	let regexp = null; // replace conditions

	// change lang type
	if (f === 2) lang = 'en';

	// Set conditions
	switch (lang) {
		case 'ja':
			regexp = /([\u{3005}\u{3007}\u{303b}\u{3400}-\u{9FFF}\u{F900}-\u{FAFF}\u{20000}-\u{2FFFF}]+|[\u{E0100}-\u{E01EF}\u{FE00}-\u{FE02}]+)/gmu;
			break;
		case 'zh':
		case 'ko':
		case 'th':
			regexp = /(.+)/gmu;
			break;
		default:
			regexp = /([^ ]+)/gmu;
			break;
	}

	return regexp;
}

// Set ruby tag
export function setRubyTags(d: string, r: RegExp) {
	let ruby = d.replace(/<ruby>/mug, '')
		.replace(/<\/ruby>/mug, '')
		.replace(/<rt>.+?<\/rt>/mug, '')
		.replace(/<rt>/mug, '')
		.replace(/<\/rt>/mug, '');

	return ruby.replace(r, '<ruby>$1<rt>xxx</rt></ruby>');
}

