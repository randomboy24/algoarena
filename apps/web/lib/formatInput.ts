/**
 * Format input string by converting \n literal strings to actual newlines
 * This is used to display test case inputs with proper line breaks
 */
export function formatInputForDisplay(input: string): string {
  return input.replace(/\\n/g, "\n");
}

/**
 * Parse input string split by \n and return array of lines
 */
export function parseInputLines(input: string): string[] {
  return input.split("\\n");
}
