import { dsvFormat } from 'd3-dsv';

/**
 * Read file content as text or base64 (without prelude) string.
 */
export async function readFile(
  file: File | Blob,
  format: 'text' | 'base64' = 'text',
): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    try {
      const reader = new FileReader();
      if (format === 'text') {
        reader.addEventListener('loadend', () => {
          resolve(reader.result?.toString() || '');
        });
        reader.readAsText(file);
      } else if (format === 'base64') {
        reader.addEventListener('loadend', () => {
          const regex = /data:.*base64,/;
          const base64 = (reader.result as string).replace(regex, '');
          resolve((base64 as string) || '');
        });
        reader.readAsDataURL(file);
      }
    } catch (e) {
      reject(e);
    }
  });
}

/**
 * Parse csv string to array of objects.
 */
export const parseCSV = (csv: string, header?: string[], delim = ',') => {
  const content = header ? `${header.join(delim)}\n${csv}` : csv;

  return dsvFormat(delim).parse(content);
};

/**
 * Create a download link and click it to download the file.
 */
export const downloadFileByURL = (url: string, filename: string, target?: string) => {
  const downloadElement = document.createElement('a');
  downloadElement.style.display = 'none';
  downloadElement.href = url;
  if (target) {
    downloadElement.target = '_blank';
  }
  downloadElement.rel = 'noopener noreferrer';
  if (filename) {
    downloadElement.download = filename;
  }
  document.body.appendChild(downloadElement);
  downloadElement.click();
  document.body.removeChild(downloadElement);
};

/**
 * Convert byte to other size unit.
 */
export const convertSizeUnit = (
  byte: number,
  unit: 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB',
) => {
  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const index = units.indexOf(unit);
  let size = byte;
  for (let i = 0; i < index; i++) {
    size /= 1024;
  }
  return size;
};
