import Markdown from 'markdown-it';

/**
 * Compare two date strings and return 1 (a > b), -1 (a < b), 0 (elsewise).
 */
export const compareDateString = (a: string, b: string) => {
  const aDate = new Date(a),
    bDate = new Date(b);

  return aDate > bDate ? 1 : aDate < bDate ? -1 : 0;
};

/**
 * Convert a markdown string to HTML.
 */
export function mdToHTML(mdstr: string, options?: { openInNewTab?: boolean }) {
  const md = Markdown();

  if (options?.openInNewTab) {
    const defaultRender =
      md.renderer.rules.link_open ||
      // @ts-ignore
      function (tokens, idx, options, env, self) {
        return self.renderToken(tokens, idx, options);
      };
    // @ts-ignore
    md.renderer.rules.link_open = function (tokens, idx, options, env, self) {
      tokens[idx].attrSet('target', '_blank');
      return defaultRender(tokens, idx, options, env, self);
    };
  }

  return md.render(mdstr);
}

/**
 * Convert a markdown string to HTML segments.
 */
export function mdToHTMLSegments(mdstr: string, sep = '---') {
  const parts = mdstr.split(sep);

  return parts.map((v) => mdToHTML(v, { openInNewTab: true }));
}

/**
 * Try to copy text to clipboard.
 */
export async function copyToClipboard(text: string) {
  if (!navigator.clipboard) {
    return Promise.reject();
  }
  return await navigator.clipboard.writeText(text);
}
