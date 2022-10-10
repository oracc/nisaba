import { EOL } from 'os';

/**
 * Extract the project code from an ATF file.
 *
 * @param atfText The contents of the ATF file
 * @returns The code of the Oracc project the file refers to
 * @throws An error if there is not exactly 1 distinct #project tag in the file
 */
export function getProjectCode(atfText: string): string {
    const tag = "#project:";
    const codes = atfText.split(EOL)
                    .filter(line => line.startsWith(tag))
                    .map(line => line.slice(tag.length).trim());
    if ((new Set(codes)).size == 1) {
        return codes[0];
    }
    if (codes.length == 0) {
        throw 'Project code not found in ATF';
    }
    throw 'Multiple project codes found in ATF';
}
