/**
 * Extract the project code from an ATF file.
 *
 * @param atfText The contents of the ATF file
 * @returns The code of the Oracc project the file refers to
 */
export function getProjectCode(atfText: string): string {
    const tag = "#project:";
    for (const line of atfText.split(/\r?\n/)) {
        if (line.startsWith(tag)) {
            return line.slice(tag.length).trim();
        }
    }
}
