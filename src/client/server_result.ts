import * as os from 'os';

export class ServerResult {

    user_log: string;
    validation_errors: { [line_num: number]: string };
    summary_line: string; // This is the last line that shows in the log
                          // by the Oracc server
    request_log: string; // Not being used except for system logging purposes
    // TODO: this will be needed for the lemmatisation command
    atf_content: string;

    // TODO this will also need a lemmatised atf when we tackle lemmatisation
    // TODO request_log is probably useless for the user, but we should record
    // everything that happens in a logger for reference
    constructor(oracc_log: string, request_log: string = ""){
        this.summary_line = "";
        this.validation_errors = this.get_validation_errors(oracc_log);
        this.user_log = this.get_user_log();
        this.request_log = request_log;
        this.atf_content = ""; //placeholder for lemmatisation

    }

    get_validation_errors(oracc_log: string){
        /* Process the oracc log and extract error line numbers and error
        messages to build a dictionary the front end can use.
        The purpose of this is to show different styling in those line numbers
        and potentially a tooltip that shows the error message.
        */
        // TODO for some reason the keys are being converted to string, why?
        const validation_errors: { [line_num: number]: string } = {};
        const lines = oracc_log.split(os.EOL);
        // Split os.EOL will always add an empty string at the end, so we have
        // to remove it manually
        lines.pop();
        for (const line of lines){
            console.log(line);
            // Check if this is an error line or the error summary
            if (line.includes(':')){
                // TODO wrap in try/catch in case we get an error when
                // trying to access [1]. That'd mean the oracc log is
                // not well formed.
                const line_number = Number(line.split(':')[1]);
                // Sometimes error messages contain ":", so we can't take the
                // last element in the split array. We need to join all
                // elements after the 3rd occurrence of ":".
                const position = line.split(":", 3).join(":").length;
                const error_message = line.substr(position + 2);
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

    get_user_log(){
        /* This method will build the log the user will see in the VS code
           console */
        if (Object.keys(this.validation_errors).length == 0){
            return "ATF validation returned no errors.";
        }
        else {
            let user_log = Object.entries(this.validation_errors)
                // dict key 0 contains the summary, so skip
                .filter(([line_num, error_msg]) => line_num != 0)
                .map(([line_num, error_msg]) =>`Line ${line_num}: ${error_msg}.`)
                .join(os.EOL)
            // Add summary line at the end
            user_log += this.summary_line;
            return user_log;
        }
    }
}
