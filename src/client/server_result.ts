import * as os from 'os';

export class ServerResult {

    validation_errors: { [line_num: number]: string };
    summary_line: string; // This is the last line that shows in the log
                          // by the Oracc server
    request_log: string; // Not being used except for system logging purposes
    atf_content: string; // The lemmatisation results (undefined if validating)

    constructor(oracc_log: string, request_log?: string, atf?: string){
        this.summary_line = "";
        this.validation_errors = this.get_validation_errors(oracc_log);
        this.request_log = request_log;
        this.atf_content = atf;
    }

    get_validation_errors(oracc_log: string){
        /* Process the oracc log and extract error line numbers and error
        messages to build a dictionary the front end can use.
        The purpose of this is to show different styling in those line numbers
        and potentially a tooltip that shows the error message.
        */
        // TODO for some reason the keys are being converted to string, why?
        const validation_errors: { [line_num: number]: string } = {};
        // Oracc server always uses \n and has an extra one at the end
        const lines = oracc_log.trim().split('\n');
        for (const line of lines){
            // Check if this is an error line or the error summary
            if (line.includes(':')){
                // TODO wrap in try/catch in case we get an error when
                // trying to access [1]. That'd mean the oracc log is
                // not well formed.
                const line_number = Number(line.split(':')[1]);
                // Sometimes error messages contain ":", so we can't take the
                // last element in the split array. We need to join all
                // elements after the 2nd occurrence of ":".
                const position = line.split(":", 2).join(":").length;
                const error_message = line.substr(position + 1);
                //Note more than one error can exist per line
                if (line_number in validation_errors){
                    // TODO We can do this in a more elegant way with the
                    // values being string[] rather than everything in one
                    // string.
                    validation_errors[line_number] += ". " + error_message;
                }
                else {
                    validation_errors[line_number] = error_message;
                }
            }
            else {
                // Save summary line
                this.summary_line = line;
            }
        }
        return validation_errors;
    }

    /**
     * Build the log the user will see in the VS Code console.
     * @param filepath The path of the ATF file, to be shown with each message
     * @returns Each message with the filename prepended (for easy navigation)
     * and a summary line
     */
    get_user_log(filepath: string){
        if (!this.contains_errors()){
            return "ATF validation returned no errors.";
        }
        else {
            let user_log = Object.entries(this.validation_errors)
                .map(([line_num, error_msg]) =>`${filepath}:${line_num}:${os.EOL}${error_msg}.`)
                .join(os.EOL)
            // Add summary line at the end
            user_log += os.EOL + this.summary_line;
            return user_log;
        }
    }

    contains_errors(): boolean {
        return Object.keys(this.validation_errors).length != 0
    }

    contains_lemmata(): boolean {
        return this.atf_content !== undefined;
    }
}
