export class ServerResult  {

    user_log: string;
    validation_errors: { [line_num: number]: string };
    // TODO: check if this is needed for the lemmatisation command
    atf_content: string;

    constructor(oracc_log: string, request_log: string){
        this.user_log = this.get_user_log(request_log);
        this.validation_errors = this.get_validation_errors(oracc_log);
    }

    get_user_log(log: string){
        //TODO extract user log
        return log;
    }

    get_validation_errors(log: string){
        const validation_errors: { [line_num: number]: string } = {};
        //TODO process lines containing ":" and build error log dictionary
        console.log(log);
        return validation_errors;
    }
}
