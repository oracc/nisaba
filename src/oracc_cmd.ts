import * as child_process from 'child_process';
import { homedir } from 'os';
import * as process from 'process';
import { promisify } from 'util';
import * as vscode from 'vscode';

const execFile = promisify(child_process.execFile);

// Thin wrapper around `execFile` which prepares the environment where we want to be running
// the commands in.
function run_cmd(file: string,
                 args: string[] = [],
                 options: Object = {
                     cwd: homedir(),
                     env: {
                         ...process.env,
                         ...{PATH: '/usr/local/oracc/bin:' + process.env.PATH},
                     },
                 }) {
    return execFile(file, args, options);
}

// Run the `oracc` command with the given action.  This assumes the command is being run on
// the server.
export async function run_oracc(action: string) {
    try {
        const { stdout } = await run_cmd('oraccc', [action]);
        vscode.window.showWarningMessage(`${stdout}`);
    } catch (err) {
        // If the `oracc` command cannot be spawned because it doesn't exist (and also if it
        // isn't readable/executable from the user?), the error code is 'ENOENT'.  Instead,
        // if the process itself throws a "no such file or directory" error, then `code ===
        // 2`, which is different.  XXX: we could also use `os.hostname()` to check the
        // machine where the command is being run, and decide what to do, if necessary.
        if (err.code === 'ENOENT') {
            vscode.window.showErrorMessage(`\`oracc\` command not found. Make sure to be running the command on the Oracc server. ${err}`);
            return;
        }
        vscode.window.showErrorMessage(`Could not run \`oracc ${action}\`: ${err}`);
        return;
    }
}
