import splitLines from 'split-lines';

export class ServerResult {

    user_log: string;
    validation_errors: { [line_num: number]: string };
    request_log: string; //Not being used except for system logging purposes
    // TODO: this will be needed for the lemmatisation command
    atf_content: string;

    // TODO this will also need a lemmatised atf when we tackle lemmatisation
    // TODO request_log is probably useless for the user, but we should record
    // everything that happens in a logger for reference
    constructor(oracc_log: string, request_log: string){
        this.validation_errors = this.get_validation_errors(oracc_log);
        this.user_log = this.get_user_log();
        this.request_log = request_log;
        this.atf_content = ""; //placeholder
    }

    get_validation_errors(log: string){
        /* Process the oracc log and extract error line numbers and error
        messages to build a dictionary the front end can use.
        The purpose of this is to show different styling in those line numbers
        and potentially a tooltip that shows the error message.
        */
        const validation_errors: { [line_num: number]: string } = {};
        //TODO process lines containing ":" and build error log dictionary
        const lines = splitLines(log);
            for (const line in lines){
                // Check if this is an error line or the error summary
                if (line.includes(':')){
                    // TODO wrap in try/catch in case we get an error when
                    // trying to access [1] and [0]
                    const line_number = Number(line.split(':')[1]);
                    const error_message = line.split(':').reverse[0];
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
                    // Save summary line as line 0
                    validation_errors[0] = line;
                }
            }
        return validation_errors;
    }

    get_user_log(){
        /* This method will build the log they user will see in the VS code
           console */
        let user_log = "";
        for (const line_num in this.validation_errors) {
            // dict key 0 contains the summary, so skip
            if (Number(line_num) != 0){
                const error_msg = this.validation_errors[line_num];
                //TODO check if \n is valid here or we need <br>
                user_log += "Line " + line_num + ": " + error_msg + ".\n";
            }
        }
        // Add summary line at the end
        user_log += this.validation_errors[0];
        return user_log;
    }
}
