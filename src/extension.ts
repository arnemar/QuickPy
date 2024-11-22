import { exec } from 'child_process';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';

let currentOutputDecorationType: vscode.TextEditorDecorationType | undefined;
let currentErrorDecorationType: vscode.TextEditorDecorationType | undefined;
let timeout: NodeJS.Timeout | undefined;

const pythonPath = vscode.workspace.getConfiguration('python').get<string>('pythonPath') || 'python3';
const outputColor = vscode.workspace.getConfiguration('pythonLiveExecution').get<string>('outputColor') || 'grey';
const errorColor = vscode.workspace.getConfiguration('pythonLiveExecution').get<string>('errorColor') || 'red';
const envPythonPath = path.join(vscode.workspace.rootPath || '', '.venv', 'bin', 'python');
const effectivePythonPath = fs.existsSync(envPythonPath) ? envPythonPath : pythonPath;

export function activate(context: vscode.ExtensionContext) {
    console.log('Python Live Execution Extension is now active!');

    const textChangeDisposable = vscode.workspace.onDidChangeTextDocument((event) => {
        const editor = vscode.window.activeTextEditor;
        if (editor && event.document === editor.document) {
            updateOutput(editor);
        }
    });

    const selectionChangeDisposable = vscode.window.onDidChangeTextEditorSelection((event) => {
        const editor = event.textEditor;
        updateOutput(editor);
    });

    context.subscriptions.push(textChangeDisposable, selectionChangeDisposable);
}

async function updateOutput(editor: vscode.TextEditor) {
    const debounceDelay = vscode.workspace.getConfiguration('pythonLiveExecution').get<number>('debounceDelay') || 300;

    clearTimeout(timeout);
    timeout = setTimeout(() => {
        const currentLine = editor.selection.active.line;
        const currentLineText = editor.document.lineAt(currentLine).text.trim();

        if (shouldEvaluateLine(currentLineText)) {
            const documentText = editor.document.getText();
            runPythonCode(documentText, editor, currentLine);
        } else {
            clearOutput(editor);
        }
    }, debounceDelay);
}

function shouldEvaluateLine(line: string): boolean {
    const excludedKeywords = new Set(['def', 'for', 'while', 'if', 'elif', 'else']);
    return (
        line.startsWith('print(') || /^\w+\s*\(.*\)$/.test(line)
    );
}

function clearOutput(editor: vscode.TextEditor) {
    if (currentOutputDecorationType) {
        editor.setDecorations(currentOutputDecorationType, []);
        currentOutputDecorationType.dispose();
        currentOutputDecorationType = undefined;
    }
    
    // Only clear error decoration if explicitly needed
    // Remove this if you want errors to persist until resolved
    if (currentErrorDecorationType) {
        editor.setDecorations(currentErrorDecorationType, []);
        currentErrorDecorationType.dispose();
        currentErrorDecorationType = undefined;
    }
}

async function runPythonCode(code: string, editor: vscode.TextEditor, currentLine: number) {
    const tempFilePath = path.join(os.tmpdir(), 'temp.py');
    const lines = code.split('\n');
    const codeToExecute = lines.slice(0, currentLine + 1).join('\n') + '\n';

    try {
        await writeTempFile(tempFilePath, codeToExecute);
    } catch (err) {
        // File write error
        handleOutput('', `File write error: ${(err as Error).message}`, editor, currentLine);
        return;
    }

    try {
        const { stdout, stderr } = await execPromise(`${effectivePythonPath} "${tempFilePath}"`, { 
            shell: "bash",
            env: {
                ...process.env,
                PYTHONIOENCODING: 'utf-8'
            }
        });
        await unlinkTempFile(tempFilePath);

        // Combine stdout and stderr for comprehensive error catching
        handleOutput(stdout, stderr, editor, currentLine);
    } catch (err: any) {
        // Catch execution errors, including non-zero exit codes
        const errorMessage = err.message || err.stderr || 'Unknown execution error';
        handleOutput('', errorMessage, editor, currentLine);
    }
}

function handleOutput(stdout: string, stderr: string, editor: vscode.TextEditor, currentLine: number) {
    // Clear any previous error highlighting
    if (currentErrorDecorationType) {
        editor.setDecorations(currentErrorDecorationType, []);
        currentErrorDecorationType.dispose();
        currentErrorDecorationType = undefined;
    }

    const errorOutput = stderr || (stdout && stdout.includes('Error') ? stdout : '');

    if (errorOutput) {
        // Extract the last line of the error message for display
        const errorLines = errorOutput.trim().split('\n');
        const conciseErrorMessage = errorLines[errorLines.length - 1]; 

        // Extract line number from error message if possible
        const lineMatch = errorOutput.match(/line (\d+)/);
        const errorLine = lineMatch ? parseInt(lineMatch[1], 10) - 1 : currentLine;

        // Highlight and display the concise error
        highlightError(editor, errorLine, errorColor);
        displayInlineOutput(`Error: ${conciseErrorMessage}`, editor, errorLine, errorColor);

        // Show full error in popup for additional context
        vscode.window.showErrorMessage(`Python execution error: ${errorOutput.trim()}`);
        return;
    }

    // Handle standard output
    if (stdout.trim()) {
        const outputLines = stdout.trim().split('\n');
        const lastOutput = outputLines[outputLines.length - 1];
        displayInlineOutput(`Output: ${lastOutput}`, editor, currentLine, outputColor);
    } else {
        displayInlineOutput('<No Output>', editor, currentLine, outputColor);
    }
}


function highlightError(editor: vscode.TextEditor, line: number, color: string) {
    if (line < 0 || line >= editor.document.lineCount) {
        return;
    }

    const range = new vscode.Range(line, 0, line, editor.document.lineAt(line).text.length);
    
    // Create a persistent decoration type
    currentErrorDecorationType = vscode.window.createTextEditorDecorationType({
        backgroundColor: color,
        rangeBehavior: vscode.DecorationRangeBehavior.ClosedClosed // Ensures decoration stays with the line
    });

    editor.setDecorations(currentErrorDecorationType, [{ range }]);
}

function displayInlineOutput(output: string, editor: vscode.TextEditor, currentLine: number, color: string) {
    if (!output.trim()) {return;}

    const currentLineText = editor.document.lineAt(currentLine).text;
    const decorations: vscode.DecorationOptions[] = [{
        range: new vscode.Range(currentLine, currentLineText.length, currentLine, currentLineText.length),
        renderOptions: {
            after: {
                contentText: ` # ${output.trim()}`,
                color: color
            }
        }
    }];

    if (currentOutputDecorationType) {
        editor.setDecorations(currentOutputDecorationType, []);
        currentOutputDecorationType.dispose();
    }

    currentOutputDecorationType = vscode.window.createTextEditorDecorationType({});
    editor.setDecorations(currentOutputDecorationType, decorations);
}

const writeTempFile = promisify(fs.writeFile);
const unlinkTempFile = promisify(fs.unlink);
const execPromise = promisify(exec);

export function deactivate() {
    console.log('Python Live Execution Extension is now deactivated.');
}
