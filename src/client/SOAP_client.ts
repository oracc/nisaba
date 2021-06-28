import * as path from 'path';


export class SOAPClient {
    url: string;
    port: string;
    url_dir: string;
    method: string;
    atf_filename: string;
    atf_text: string;
    atf_path: string;

    constructor(atf_path: string, atf_text: string){
        this.atf_text = atf_text;
        this.port = "8085";
        this.url = "http://build-oracc.museum.upenn.edu"
        this.method = "POST";
        this.atf_path = atf_path;
        this.atf_filename = path.basename(atf_path);

    }
}
