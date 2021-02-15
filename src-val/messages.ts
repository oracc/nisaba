//import { AdmZip } from 'adm-zip';
var AdmZip = require('adm-zip'); // It seems this has to be imported old-style
import { createClient } from 'soap';
import { request } from 'http';

/*
1. Create a client to send message
2. Gather all the information for the message from the text (start with hardcoded)
3. Create the message
4. Figure out address, port etc and send message
5. Get and print response
*/

// export function validate(project: string, text: string) {
//     let serverAddress = "http://build-oracc.museum.upenn.edu:8085?wsdl";
//     createClient(serverAddress, function(error, client) {
//         console.log(error);
//         console.log(typeof(client));
//         console.log(client.describe());
//     });
// }
let sampleText = `
&X001001 = JCS 48, 089
#project: cams/gkab
#atf: lang akk-x-stdbab
#atf: use unicode
#atf: use math
@tablet
@obverse

1.	[MU] 1.03-KAM {iti}AB GE₆ U₄ 2-KAM
#lem: šatti[year]N; n; Ṭebetu[1]MN; mūša[at night]AV; ūm[day]N; n

2.	[{m}]{d}60--EN-šu₂-nu a-lid
#lem: Anu-belšunu[1]PN; alid[born]AJ +.

$ single ruling
# I've added various things for test purposes

3.	U₄!-BI? 20* [(ina)] 9.30 ina(DIŠ) MAŠ₂!(BAR)
#lem: ūmišu[day]N; Šamaš[1]DN; ina[in]PRP; n; +ina[in]PRP$; Suhurmašu[Goatfish]CN
#note: Note to line.

4.	<30> <(ina)> 12 GU U₄-ME-šu₂ GID₂-MEŠ{{ir-ri-ku}}
#lem: Sin[1]DN; ina[at]PRP; n; Gula[1]'CN; ūmūšu[day]N; +arāku[be(come) long]V$irrikū +.; irrikū[be(come) long]V

5.	[GU₄].U₄ ina MAŠ₂ GENNA ina MIN<(MAŠ₂)>
#lem: Šihṭu[Mercury]CN; ina[in]PRP; Suhurmašu[Goatfish]CN +.; Kayyamanu[Saturn]CN; ina[in]PRP; Suhurmašu[Goatfish]CN

6.	[AN] ina ALLA <<ALLA>>
#lem: Ṣalbatanu[Mars]CN; ina[in]PRP; Alluttu[Crab]CN +.

7.    $BI x X |DU.DU| |GA₂×AN| |DU&DU| |LAGAB&LAGAB| DU@g GAN₂@t 4(BAN₂)@v
#lem: u; u; X; X; X; X; X; X; X; n

$ (a loose dollar line)

@reverse
$ reverse blank

@translation parallel en project
@obverse
1.	Year 63, Ṭebetu (Month X), night of day 2:^1^

@note ^1^ A note to the translation.

2.	Anu-belšunu was born.
3.	That day, the Sun was 9;30˚ in the Goat.
4.	The Moon was 12˚ in the Bucket: his days will be long.
5.	Jupiter was at the head of the Scorpion: someone will take the prince's hand.
6.	[The child] was born in the Bucket in the region of Venus: he will have sons.
7.	Mercury was in the Goat; Saturn was in the Goat;
8.	Mars was in the Crab.
`;

export function validate(project: string, text: string) {
    let headers = {
        'Connection': 'close',
        'MIME-Version': '1.0',
        'Content-Type': 'multipart/related; charset="utf-8"; type="application/xop+xml"; start="<SOAP-ENV:Envelope>"; start-info="application/soap+xml"; boundary="==========boundary========"',
    }
    let options = {
        host: "build-oracc.museum.upenn.edu",
        port: 8085,
        method: 'POST',
        headers: headers,
    }
    let req = request(options);
    req.on('response', (res) => {
        console.log("DONE");
        
        // console.log(`STATUS: ${res.statusCode}`);
        // console.log(`HEADERS: ${JSON.stringify(res.headers)}`);
        // res.setEncoding('utf8');
        // res.on('data', (chunk) => {
        //     console.log(`BODY: ${chunk}`);
        // });
    });
    // Time out after 5 seconds
    req.setTimeout(5000, () => {
        console.log("No response from server within limit, giving up.");
        req.destroy();
    });
    // DEBUG
    req.on('error', (err) => {
        console.log(`ERROR! ${err.message}`);
    })
    let body = `--==========boundary========
MIME-Version: 1.0
Content-ID: <SOAP-ENV:Envelope>
Content-Transfer-Encoding: binary
Content-Type: application/xop+xml; charset="utf-8"; type="application/soap+xml"

<?xml version="1.0" encoding="UTF-8"?>
           <SOAP-ENV:Envelope
               xmlns:SOAP-ENV="http://www.w3.org/2003/05/soap-envelope"
               xmlns:SOAP-ENC="http://www.w3.org/2003/05/soap-encoding"
               xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
               xmlns:xsd="http://www.w3.org/2001/XMLSchema"
               xmlns:xop="http://www.w3.org/2004/08/xop/include"
               xmlns:xmime5="http://www.w3.org/2005/05/xmlmime"
               xmlns:osc-data="http://oracc.org/wsdl/ows.xsd"
               xmlns:osc-meth="http://oracc.org/wsdl/ows.wsdl">
               <SOAP-ENV:Body>
                   <osc-meth:Request>
                       <osc-data:keys>
                           <osc-data:key>atf</osc-data:key>
                           <osc-data:key>cams/gkab</osc-data:key>
                           <osc-data:key>00atf/belsunu.atf</osc-data:key>
                       </osc-data:keys>
                       <osc-data:data>
                           <osc-data:item xmime5:contentType="*/*">
                               <xop:Include href="cid:request_zip"/>
                           </osc-data:item>
                       </osc-data:data>
                   </osc-meth:Request>
               </SOAP-ENV:Body>
           </SOAP-ENV:Envelope>
--==========boundary========`;
let zip = new AdmZip();
// text.length does not account for the encoding, so using that will allocate
// less memory that required and truncate the text in the zip!
zip.addFile('00atf/belsunu.atf', Buffer.alloc(Buffer.byteLength(text), text));
let encodedText = zip.toBuffer();
let secondPart = `
Content-Type: */*
MIME-Version: 1.0
Content-ID: <request_zip>
Content-Transfer-Encoding: binary

${encodedText}
--==========boundary========--`;
body += secondPart;
// We probably don't need this? It's to convert all line endings to \r\n because reasons (see Nammu)
body = body.replace("\r\n", "\n").replace("\n", "\r\n");
//console.log(body);
// This is what it should be? Or perhaps only part of the body
// req.setHeader('Content-Length', Buffer.byteLength(body));
// This is what Nammu sends
req.setHeader('Content-Length', 2779);
// console.log(`length: ${Buffer.byteLength(body)}`);
req.write(body);
console.log(JSON.stringify(req.getHeaders()));
req.end();
console.log('Sent message');
}


validate('aaa', sampleText);