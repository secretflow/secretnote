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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

export async function readFile(file: File): Promise<string> {
  return await new Promise<string>((resolve, reject) => {
    try {
      const reader = new FileReader();
      reader.addEventListener('loadend', () => {
        resolve(reader.result?.toString() || '');
      });
      reader.readAsText(file);
    } catch (e) {
      reject(e);
    }
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
      return true;
    })
    .catch(() => {
      // ignore
    });
};

export const downloadFileByUrl = (url: string, filename: string, target?: string) => {
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
