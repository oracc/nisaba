import * as assert from 'assert';
import * as fs from 'fs';
import * as path from 'path';
import * as vscode from 'vscode';
import * as nisaba from '../../extension';

suite('Extension Test Suite', () => {
    vscode.window.showInformationMessage('Start all tests.');
    test('All commands registered on activation', async () => {
        // Find all commands we register in package.json
        const package_json = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json')).toString());
        const ourCommandNames = package_json.contributes.commands.map(cmd => cmd.command);
        // Activate our extension
        const context: vscode.ExtensionContext = {
            subscriptions: [],
        } as any;
        nisaba.activate(context);
        // Make sure all commands registerd in `package.json` are found
        await vscode.commands.getCommands(true).then(
            async all_commands => {
                // Filter only the commands we provide
                const registered_cmds = all_commands.filter(cmd => cmd.startsWith('ucl-rsdg'));
                return assert(registered_cmds.length == ourCommandNames.length &&
                    registered_cmds.every(cmd => ourCommandNames.includes(cmd)));
            }
        );
        // Deactivate extension to stop logger
        nisaba.deactivate();
    });

    test('All commands activate extension', async () => {
        // Find all commands we register in package.json...
        const package_json = JSON.parse(fs.readFileSync(path.join(__dirname, '../../../package.json')).toString());
        const ourCommandNames = package_json.contributes.commands.map(cmd => cmd.command);
        // ...and all the activation events (commands which activate the extension)
        const activationEvents = package_json.activationEvents;
        assert(ourCommandNames.every(
          cmdName => activationEvents.includes(`onCommand:${cmdName}`)));
    });
});
