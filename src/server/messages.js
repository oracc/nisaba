"use strict";
exports.__esModule = true;
exports.validate = void 0;
var AdmZip = require('adm-zip'); // It seems this has to be imported old-style
var http_1 = require("http");
var mime_1 = require("./mime");
var xml2js_1 = require("xml2js");
/*
1. Gather all the information for the message from the text (start with hardcoded)
3. Create the message
4. Figure out address, port etc and send message
5. Parse response to get ID
6. Poll server (GET at /p/<responseID>) until done
7. Send "response" message to server
8. Unpack response to get validation results
*/
var sampleText = "\n&X001001 = JCS 48, 089\n#project: cams/gkab\n#atf: lang akk-x-stdbab\n#atf: use unicode\n#atf: use math\n@tablet\n@obverse\n\n1.\t[MU] 1.03-KAM {iti}AB GE\u2086 U\u2084 2-KAM\n#lem: \u0161atti[year]N; n; \u1E6Cebetu[1]MN; m\u016B\u0161a[at night]AV; \u016Bm[day]N; n\n\n2.\t[{m}]{d}60--EN-\u0161u\u2082-nu a-lid\n#lem: Anu-bel\u0161unu[1]PN; alid[born]AJ +.\n\n$ single ruling\n# I've added various things for test purposes\n\n3.\tU\u2084!-BI? 20* [(ina)] 9.30 ina(DI\u0160) MA\u0160\u2082!(BAR)\n#lem: \u016Bmi\u0161u[day]N; \u0160ama\u0161[1]DN; ina[in]PRP; n; +ina[in]PRP$; Suhurma\u0161u[Goatfish]CN\n#note: Note to line.\n\n4.\t<30> <(ina)> 12 GU U\u2084-ME-\u0161u\u2082 GID\u2082-ME\u0160{{ir-ri-ku}}\n#lem: Sin[1]DN; ina[at]PRP; n; Gula[1]'CN; \u016Bm\u016B\u0161u[day]N; +ar\u0101ku[be(come) long]V$irrik\u016B +.; irrik\u016B[be(come) long]V\n\n5.\t[GU\u2084].U\u2084 ina MA\u0160\u2082 GENNA ina MIN<(MA\u0160\u2082)>\n#lem: \u0160ih\u1E6Du[Mercury]CN; ina[in]PRP; Suhurma\u0161u[Goatfish]CN +.; Kayyamanu[Saturn]CN; ina[in]PRP; Suhurma\u0161u[Goatfish]CN\n\n6.\t[AN] ina ALLA <<ALLA>>\n#lem: \u1E62albatanu[Mars]CN; ina[in]PRP; Alluttu[Crab]CN +.\n\n7.    $BI x X |DU.DU| |GA\u2082\u00D7AN| |DU&DU| |LAGAB&LAGAB| DU@g GAN\u2082@t 4(BAN\u2082)@v\n#lem: u; u; X; X; X; X; X; X; X; n\n\n$ (a loose dollar line)\n\n@reverse\n$ reverse blank\n\n@translation parallel en project\n@obverse\n1.\tYear 63, \u1E6Cebetu (Month X), night of day 2:^1^\n\n@note ^1^ A note to the translation.\n\n2.\tAnu-bel\u0161unu was born.\n3.\tThat day, the Sun was 9;30\u02DA in the Goat.\n4.\tThe Moon was 12\u02DA in the Bucket: his days will be long.\n5.\tJupiter was at the head of the Scorpion: someone will take the prince's hand.\n6.\t[The child] was born in the Bucket in the region of Venus: he will have sons.\n7.\tMercury was in the Goat; Saturn was in the Goat;\n8.\tMars was in the Crab.\n";
function validate(filename, project, text) {
    var responseID;
    // First create the body of the message, since we'll need some information
    // from it to create the headers
    var zip = new AdmZip();
    // text.length does not account for the encoding, so using that will allocate
    // less memory that required and truncate the text in the zip!
    zip.addFile("00atf/" + filename, Buffer.alloc(Buffer.byteLength(text), text));
    var encodedText = zip.toBuffer();
    var fullMessage = mime_1.createMultipart(filename, project, encodedText);
    var body = fullMessage.toString({ noHeaders: true });
    var boundary = fullMessage.contentType().params.boundary;
    var headers = {
        'Connection': 'close',
        'MIME-Version': '1.0',
        // TODO: What if boundary contains a "? Do we need to escape it?
        'Content-Type': "multipart/related; charset=\"utf-8\"; type=\"application/xop+xml\"; start=\"<SOAP-ENV:Envelope>\"; start-info=\"application/soap+xml\"; boundary=\"" + boundary + "\""
    };
    var options = {
        host: "build-oracc.museum.upenn.edu",
        port: 8085,
        method: 'POST',
        headers: headers
    };
    var req = http_1.request(options);
    req.on('response', function (res) {
        console.log("DONE");
        // DEBUG
        console.log("STATUS: " + res.statusCode);
        console.log("HEADERS: " + JSON.stringify(res.headers));
        res.setEncoding('utf8');
        if (res.statusCode !== 200) {
            console.error("Request failed! Status: " + res.statusCode);
            res.resume(); // Apparently needed to free up memory if we don't read the data?
        }
        // Parse the response to get the response ID
        res.on('data', function (chunk) {
            responseID = getResponseCode(chunk);
            console.log(responseID);
            // Wait until the server has prepared the response
            if (commandSuccessful(responseID, options.host)) {
                // Send Response message
                // let ourResponse = createResponseMessage(responseID);
                // TODO continue...
            }
        });
    });
    // Time out after 5 seconds
    req.setTimeout(5000, function () {
        console.log("No response from server within limit, giving up.");
        req.destroy();
    });
    // DEBUG
    req.on('error', function (err) {
        console.log("ERROR! " + err.message);
    });
    // We probably don't need this? It's to convert all line endings to \r\n because reasons (see Nammu)
    body = body.replace("\r\n", "\n").replace("\n", "\r\n");
    //console.log(body);
    // This is what it should be? Or perhaps only part of the body
    req.setHeader('Content-Length', Buffer.byteLength(body));
    // This is what Nammu sends
    // req.setHeader('Content-Length', 2779);
    console.log("byte length: " + Buffer.byteLength(body));
    console.log("length: " + body.length);
    req.write(body);
    console.log(JSON.stringify(req.getHeaders()));
    req.end();
    console.log('Sent message');
    console.log(fullMessage.toString());
}
exports.validate = validate;
function getResponseCode(xmlResponse) {
    var code;
    xml2js_1.parseString(xmlResponse, function (err, res) {
        var response = res['SOAP-ENV:Envelope']['SOAP-ENV:Body'][0]['osc-meth:RequestResponse'][0];
        code = response['osc-data:keys'][0]['osc-data:key'][0];
    });
    return code;
}
function commandSuccessful(responseID, url) {
    var queryURL = url + "/p/" + responseID;
    var done = false;
    var attempts = 0;
    while (!done && attempts < 10) {
        attempts += 1;
        http_1.request({ host: queryURL, timeout: 5000 }, function (res) {
            res.on('data', function (chunk) {
                if (chunk === 'done') {
                    done = true;
                }
                else if (chunk === 'err_stat') {
                    // TODO: Raise this properly
                    console.error('Error getting response from server.');
                }
            });
        });
    }
    return done;
}
validate('belsunu.atf', 'cams/gkab', sampleText);
