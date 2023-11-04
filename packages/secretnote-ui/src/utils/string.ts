export function truncate(
  text: string,
  maxLength = 20,
  placeholder = '...',
  keep: 'start' | 'end' = 'start',
) {
  const trimmed = text.trim();
  if (trimmed.length > maxLength) {
    if (keep === 'start') {
      return `${trimmed.slice(0, maxLength)}${placeholder}`;
    } else {
      return `${placeholder}${trimmed.slice(trimmed.length - maxLength)}`;
    }
  }
  return text;
}

export function truncateLines(
  text: string,
  {
    maxWidth = 20,
    maxLines = Infinity,
    placeholder = '...',
  }: { maxWidth?: number; maxLines?: number; placeholder?: string } = {},
) {
  const lines = text.split('\n');
  if (lines.length > maxLines) {
    lines.splice(maxLines, lines.length - maxLines);
    lines[maxLines - 1] = lines[maxLines - 1] + placeholder;
  }
  return lines.map((line) => truncate(line, maxWidth, placeholder)).join('\n');
}

export function wrap(text: string, breakOn: string, maxWidth = 20): string {
  const parts = text.split(breakOn);

  if (!parts.length) {
    return '';
  }

  const lines: string[] = [];

  let currentLine: string = parts.shift()!;
  if (currentLine === undefined) {
    return '';
  }

  parts.forEach((part) => {
    if ((part + breakOn).length > maxWidth) {
      if (currentLine) {
        lines.push(currentLine);
      }
      lines.push(`${breakOn}${part}`);
    } else if ((currentLine + breakOn + part).length > maxWidth) {
      lines.push(currentLine);
      currentLine = `${breakOn}${part}`;
    } else {
      currentLine += `${breakOn}${part}`;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines.join('\n');
}
