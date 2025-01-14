import * as vscode from 'vscode';
import * as dotenv from 'dotenv';

dotenv.config();

/**
 * @param {vscode.ExtensionContext} context
 */
export function activate(context: vscode.ExtensionContext) {
    console.log('Your extension is now active!');

    const apiUrl = process.env.API_URL ?? 'http://localhost:5000';

    if (!apiUrl) {
        vscode.window.showErrorMessage('API URL is not configured.');
    }

    // Register a command for the extension
    const disposable = vscode.commands.registerCommand('extension.processSelectedCode', async () => {
        // Get the active editor
        const editor = vscode.window.activeTextEditor;
        if (!editor) {
            vscode.window.showErrorMessage('No active editor found.');
            return;
        }

        // Get the selected text
        const selection = editor.selection;
        const selectedText = editor.document.getText(selection);
        if (!selectedText) {
            vscode.window.showErrorMessage('No text selected.');
            return;
        }

        // Show a dropdown with options
        const options = ['Create unit tests', 'Format comments'];
        const selectedOption = await vscode.window.showQuickPick(options, {
            placeHolder: 'Choose an action for the selected code',
        });

        if (!selectedOption) {
            vscode.window.showInformationMessage('No action selected.');
            return;
        }

        // Call the external API with the selected text and action
        const requestData = {
            action: selectedOption,
            code: selectedText,
        };

        try {
            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestData),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const result = await response.text();

            // Show the response in a new tab
            const doc = await vscode.workspace.openTextDocument({
                content: result,
                language: 'plaintext',
            });
            await vscode.window.showTextDocument(doc);
        } catch (error) {
            console.error(error);
            vscode.window.showErrorMessage('Failed to process the code. Check the console for details.');
        }
    });

    // Add the command to the subscriptions
    context.subscriptions.push(disposable);
}

export function deactivate() {
    console.log('Your extension has been deactivated.');
}
