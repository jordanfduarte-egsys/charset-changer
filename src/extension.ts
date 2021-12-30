import * as vscode from 'vscode';

const jschardet = require('chardet');
const updateJsonFile = require('update-json-file');
const loadJsonFile = require('load-json-file');
const execShPromise = require("exec-sh").promise;
const os = require('os');
let controler = 1;	
const message = 'Arquivo reaberto na codificação correta: ';
let fileSettings = '';	

export function activate(context: vscode.ExtensionContext) {
	let disposable = vscode.commands.registerCommand('extension.charsetchanger', () => {		
	});

	const processFile = function(document: vscode.TextDocument) {		
		if (controler != 1) {
			return;
		}
		
		if (fileSettings.length == 0) {
			return;
		}

		console.log("Arquivo: " + document.fileName);
		jschardet.detectFile(document.fileName, (err: string, encoding: string) => {
			console.log("CODIFICACAO: " + encoding.toLowerCase());		
					
			if (document.getText().length == 0){
				return;
			}

			if (!encoding){
				return;
			}

			const columnToShowIn = vscode.window.activeTextEditor
				? vscode.window.activeTextEditor.viewColumn
				: undefined;

			encoding = encoding.toLowerCase();			
			const filePath = fileSettings;
			loadJsonFile(filePath).then((config: { [x: string]: string|boolean; }) => {
				const ext = document.fileName.match(/(php|html|phtml|js|java|jsp|css|scss|hbs|ini|bat|pdf|sql|temp|dump|sh)$/i);
				const changeCharset = (charset: string, line: vscode.ViewColumn|undefined, fileNameReopen: string, de: string) => {
					updateJsonFile(filePath, (data: { [x: string]: string|boolean; }) => {			
						console.log("ALTERANDO DE : " + de + " PARA: " + charset);
						data['files.encoding'] = charset;
						delete data["files.autoGuessEncoding"];
						return data;
					}).then(() => {
						console.log("FECHANDO ARQUIVO...");						
						controler = 2;
						
						vscode.commands.executeCommand('workbench.action.closeActiveEditor').then(() => {
							controler = 3;
							console.log("REABRINDO...");
							const setting: vscode.Uri = vscode.Uri.parse("file:///" + fileNameReopen);
							let file = vscode.workspace.asRelativePath(setting);
				
							vscode.workspace.openTextDocument(file).then((doc: vscode.TextDocument) => {
								vscode.window.showTextDocument(doc, line, false).then(()=> {
									controler = 1;
								});								
							});					
						});						
					});
				};

				if (ext != null) {
					if (encoding == 'utf-8') {
						if (
							(
								config.hasOwnProperty('files.encoding') &&
								(
									config['files.encoding'] != 'utf8'
								)
							) ||
							(
								!config.hasOwnProperty('files.encoding')
							)
						) {
							changeCharset('utf8', columnToShowIn, document.fileName, encoding);	
							vscode.window.showInformationMessage(message);
						}
					} else {
						if (
							(
								config.hasOwnProperty('files.encoding') &&
								(
									config['files.encoding'] != 'iso88591'
								)
							) ||
							(
								!config.hasOwnProperty('files.encoding')
							)
						) {
							changeCharset('iso88591', columnToShowIn, document.fileName, encoding);
							vscode.window.showInformationMessage(message);
						}
					}
				} else {
					vscode.window.showInformationMessage('Verifique o charset do arquivo antes de salvar o mesmo!');
					updateJsonFile(filePath, (data: { [x: string]: string|boolean; }) => {			
						// delete data['files.encoding'];
						delete data["files.autoGuessEncoding"];
						return data;
					});
				}
			}).catch(()=> {			
				let fs = require("fs");
				fs.readFile(filePath, (err: string, data: string) => {
					try {
						const json = JSON.parse(data);		
						vscode.window.showErrorMessage(`Verifique o arquivo de configuração na pasta "${filePath}". Erro de leitura!`);
					} catch(e) {
						vscode.window.showErrorMessage(`Arquivo settings.json está mal formatado. Verifique e remova espaçamentos, vírgulas que estão sobrando ou comentários de código. Ex: ${e}`);
					}
				});
			});
		});
	};

	// vscode.workspace.onDidOpenTextDocument((document) => {
	// 	//return;
	// 	//processFile(document);
	// 	//console.log("KODKOS");
	// });

	vscode.window.onDidChangeActiveTextEditor((editor) => {		
		if (editor) {	
			if (editor.selections.length) {
				let isProcess = true;
				editor.selections.forEach((v) => {
					if (v.start.line > 0 || v.start.character > 0) {
						isProcess = false;
						return;
					}
				});

				if (isProcess) {
					processFile(editor.document);
				}
			} else {
				processFile(editor.document);
			}
		}
	});

	const run = async () => {
		try {
			if (os.type().match(/Windows/) != null) { // Windows
				let username = await execShPromise('echo %username%', true);
				username = username.stdout.trim();

				fileSettings = `C:/Users/${username}/AppData/Roaming/Code/User/settings.json`;
			} else if (os.type().match(/Darwin/) != null) { // MAC
				let home = await execShPromise('echo $HOME', true);
				home = home.stdout.trim();
				
				fileSettings = `${home}/Library/Application Support/Code/User/settings.json`;
			} else { // Linux
				let home = await execShPromise('echo $HOME', true);
				home = home.stdout.trim();
				
				fileSettings = `${home}/.config/Code/User/settings.json`;
			}
		} catch (e) {
			console.log('Error: ', e);
			console.log('Stderr: ', e.stderr);
			console.log('Stdout: ', e.stdout);		
			return e;
		}
		
		console.log('out: ', fileSettings);
	};
	
	run().then(() => {
		const document = vscode.window.activeTextEditor
			? vscode.window.activeTextEditor.document
			: undefined;

		if (document != undefined) {
			processFile(document);
		}

		vscode.window.showInformationMessage('Iniciando extensão charsetchanger');
	});

	context.subscriptions.push(disposable);
}

export function deactivate() {}
