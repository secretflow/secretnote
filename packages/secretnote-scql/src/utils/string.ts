import Markdown from 'markdown-it';
/**
 * Generate a random UUID.
 */
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

/**
 * Compare two date strings and return 1 if a > b, -1 if a < b, 0 elsewise.
 */
export const compareDateString = (a: string, b: string) => {
  const aDate = new Date(a),
    bDate = new Date(b);

  return aDate > bDate ? 1 : aDate < bDate ? -1 : 0;
};

/**
 * Convert a markdown string to HTML.
 */
export function mdToHTML(
  mdstr: string,
  options?: { openInNewTab?: boolean; ignoreDivider?: boolean },
) {
  const md = Markdown();

  if (options?.openInNewTab) {
    const defaultRender =
      md.renderer.rules.link_open ||
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };
    // let the user open links in a new tab
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      tokens[idx].attrSet('target', '_blank');
      return defaultRender(tokens, idx, options, env, self);
    };
  }

  return md.render(mdstr);
}

/**
 * Convert a markdown string to HTML segments separated by '---'.
 */
export function mdToHTMLSegments(mdstr: string) {
  const parts = mdstr.split('---');

  return parts.map((v) => mdToHTML(v, { openInNewTab: true }));
}
