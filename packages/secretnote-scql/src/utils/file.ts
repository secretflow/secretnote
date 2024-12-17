import { FileReader as CsvFileReader } from '@kanaries/web-data-loader';
import { dsvFormat } from 'd3-dsv';

const getBlob = (url: string, method = 'GET'): Promise<Blob> => {
  return new Promise((resolve) => {
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    xhr.responseType = 'blob';
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(xhr.response);
      }
    };
    xhr.send();
  });
};

const saveAs = (blob: Blob, filename: string) => {
  const nav = window.navigator as any;
  if (nav.msSaveOrOpenBlob) {
    nav.msSaveBlob(blob, filename);
  } else {
    const link = document.createElement('a');
    const body = document.querySelector('body');

    if (body) {
      link.href = window.URL.createObjectURL(blob);
      link.download = filename;

      link.style.display = 'none';
      body.appendChild(link);

      link.click();
      body.removeChild(link);

      window.URL.revokeObjectURL(link.href);
    }
  }
};

/**
 * Read file as text or base64 string.
 */
export async function readFile(
  file: File,
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
          // remove base64 prelude added by the browser
          const base64 = (reader.result as string).replace(/data:.*base64,/, '');
          resolve(base64 || '');
        });
        reader.readAsDataURL(file);
      }
    } catch (e) {
      reject(e);
    }
  });
}

export async function readCSVFile(file: File): Promise<unknown> {
  return await CsvFileReader.csvReader({
    file: file,
    config: {
      type: 'reservoirSampling',
      size: 400,
    },
    onLoading: (value) => {
      // eslint-disable-next-line no-console
      console.log(`upload progress ${(value * 100).toFixed(2) + '%'}`);
    },
  });
}

export const parseCSV = (csv: string, header?: string[]) => {
  const DELIMITER = ',';
  const content = header ? `${header.join(DELIMITER)}\n${csv}` : csv;
  return dsvFormat(DELIMITER).parse(content);
};

export const downloadFileByBlob = (url: string, filename = '', method = 'GET') => {
  getBlob(url, method)
    .then((blob: Blob) => {
      saveAs(blob, filename);
      return;
    })
    .catch(() => {
      //
    });
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

/**
 * Normalize a extension name, guarantee it starts with a dot.
 */
export function normalizeExtension(extension: string): string {
  return extension.length > 0 && extension.indexOf('.') !== 0
    ? `.${extension}`
    : extension;
}
