export function uuid(): string {
  let res = '';
  const template = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';

  for (let i = 0, len = template.length; i < len; i += 1) {
    const s = template[i];
    const r = (Math.random() * 16) | 0;
    const v = s === 'x' ? r : s === 'y' ? (r & 0x3) | 0x8 : s;
    res += v.toString(16);
  }
  return res;
}

export const getSearchParams = (...key: string[]) => {
  const searchParams = new URLSearchParams(window.location.search);
  const res: string[] = [];
  key.forEach((k) => {
    res.push(searchParams.get(k) || '');
  });
  return res;
};

export const compareDateString = (a: string, b: string) => {
  const aDate = new Date(a);
  const bDate = new Date(b);
  if (aDate > bDate) {
    return 1;
  }
  if (aDate < bDate) {
    return -1;
  }
  return 0;
};
