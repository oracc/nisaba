// import * as assert from 'assert';
import * as vscode from 'vscode';
import * as fs from 'fs';
import * as os from 'os';
import * as tmp from 'tmp';
import * as assert from 'assert';
import * as nisabaLogger from '../../logger';

const nisabaOutputChannel = vscode.window.createOutputChannel("Nisaba");

// Create temporary file and initialise logger with it.
const tmpobj = tmp.fileSync();
nisabaLogger.initLogging(nisabaOutputChannel, tmpobj.name);

// Log messages to the temporary file.
const messages = [
    ['debug', 'This is a debug message'],
    ['info', 'This is an info'],
    ['warn', 'This is a warning'],
    ['error', 'This is an error']
]
messages.forEach(([level, message]) => nisabaLogger.log(level, message))

suite('Logging Test Suite', () => {
    test('Log test', async () => {
        const text = fs.readFileSync(tmpobj.name).toString().split(os.EOL);
        for (let i = 0; i < text.length; i++) {
            // Skip empty lines
            if (text[i]) {
                const message = new RegExp('\\[nisaba\\] ' + messages[i][0] + ': ' + messages[i][1]);
                assert.match(text[i], message);
            }
        }
    });
});
