import * as assert from 'assert';
import { EOL } from 'os';

/**
 * Extract the project code from an ATF file.
 *
 * @param atfText The contents of the ATF file
 * @returns The code of the Oracc project the file refers to
 */
export function getProjectCode(atfText: string): string {
    const tag = "#project:";
    const codes = atfText.split(EOL)
                    .filter(line => line.startsWith(tag))
                    .map(line => line.slice(tag.length).trim());
    assert(codes.length == 1);
    return codes[0];
}
