import type { DefaultTheme } from 'styled-components';
import styled, { ThemeProvider, css } from 'styled-components';

export const defaultTokens: DefaultTheme = {
  name: 'default',
  colors: {
    text: '#323232',
    link: '#0060e6',
    strong: '#e83e8c',
    emphasis: '#237ac1',
    border: '#e7e7e7',
    container: {
      border: '#b8b8b8',
      text: '#424242',
      background: '#f6f6f6',
    },
    highlight: '#fbe54e',
  },
  typography: {
    text: {
      fontFamily:
        "Inter, Noto Sans SC, Noto Sans, -apple-system, BlinkMacSystemFont, Helvetica Neue, Segoe UI, Roboto, Arial, sans-serif, 'Apple Color Emoji', Segoe UI Emoji, Segoe UI Symbol, Noto Color Emoji",
    },
    code: {
      fontFamily:
        'Fira Code, Inconsolata, PT Mono, SFMono-Regular, Consolas, Liberation Mono, Menlo, monospace',
    },
    math: {
      fontFamily: 'KaTeX_Main, CMU Serif, Cambria, Times New Roman, Times, serif',
    },
  },
};

export const typesetting = css`
  * {
    overflow-wrap: break-word;
  }

  h1 {
    line-height: 1.5;
    font-size: 2.5rem;
    margin: 1.5rem 0 0rem;

    & + h2 {
      margin-top: 0;
    }
  }

  h2 {
    line-height: 1.5;
    font-size: 1.6rem;
    margin: 1.5rem 0 0rem;
  }

  h3 {
    line-height: 1.4;
    font-size: 1.4rem;
    margin: 1rem 0 0;
  }

  h4 {
    line-height: 1.4;
    font-size: 1.2rem;
    margin: 0.5rem 0 0;
  }

  h5 {
    font-size: 1rem;
    margin: 0;
    font-weight: 500;
  }

  h6 {
    font-size: 1rem;
    margin: 0;
    font-style: italic;
    font-weight: 500;
  }

  em {
    font-weight: 500;
    color: ${(props) => props.theme.colors.emphasis};
  }

  strong {
    font-weight: 700;
    color: ${(props) => props.theme.colors.strong};
  }

  p,
  pre,
  ul,
  ol {
    margin: 0;
  }

  pre,
  code {
    font-family: ${(props) => props.theme.typography.code.fontFamily};
  }

  code {
    color: ${(props) => props.theme.colors.strong};
  }

  a {
    font-weight: 500;

    text-decoration: none;
    color: ${(props) => props.theme.colors.link};

    &:hover,
    &:focus {
      text-decoration: underline;
      color: ${(props) => props.theme.colors.link};
    }

    & code {
      color: ${(props) => props.theme.colors.link};
    }
  }

  img {
    /* max-height: 80vh; */
    max-width: 80%;
    padding: 1rem;
    align-self: center;
  }

  p img {
    display: inline-block;
    padding: 0;
  }

  figure {
    display: flex;
    flex-flow: column nowrap;
    align-items: center;
    gap: 0.5rem;

    margin: 1rem 1.5rem;

    @media screen and (max-width: 768px) {
      margin: 1rem 0;
    }

    figcaption {
      display: flex;
      flex-flow: column nowrap;
      gap: 0.5rem;
    }
  }

  blockquote {
    margin: 0;
    padding: 1rem 1rem 1rem 1.5rem;

    border-radius: 3px;
    border-inline-start: 4px solid ${(props) => props.theme.colors.container.border};

    color: ${(props) => props.theme.colors.container.text};
    background-color: ${(props) => props.theme.colors.container.background};
  }

  ul,
  ol {
    display: flex;
    flex-flow: column nowrap;

    padding-inline-start: 1.6rem;
    gap: 0.6rem;

    ul,
    ol {
      gap: 0.4rem;
    }
  }

  // toctree
  li > a + ul {
    margin-top: 0.5rem;
  }

  dl {
    margin: 0;

    display: flex;
    flex-flow: column nowrap;
    gap: 0.5rem;

    dt {
      font-weight: 600;
      margin: 0;
    }

    dd {
      margin-inline-start: 1.5rem;
    }
  }

  hr {
    border: 0.8px solid #abb1bf;
    align-self: stretch;
    margin: 0.5rem 1.5rem;
  }

  table {
    empty-cells: show;
    border: 1px solid ${(props) => props.theme.colors.border};
    border-collapse: collapse;
    border-spacing: 0;

    tbody {
      overflow: auto;
    }

    th,
    td {
      padding: 6px 12px;
      text-align: left;
      border: 1px solid ${(props) => props.theme.colors.border};
    }

    th {
      font-weight: 500;
      white-space: nowrap;
      background-color: ${(props) => props.theme.colors.container.background};
    }

    tbody tr {
      transition: all 0.3s;

      &:hover {
        background: rgba(60, 90, 100, 0.04);
      }
    }

    p,
    span {
      margin: 0;
    }
  }

  p {
    &.caption,
    &.sidebar-title,
    &.topic-title {
      font-weight: 600;
      font-size: 1.5rem;
      margin-top: 1rem;
    }
  }

  article > article {
    border-radius: 5px;
    padding: 6px 12px;
    margin: 12px;
    border: 1px solid #eee;
  }

  article:first-child {
    margin-left: 0;
  }

  article:last-child {
    margin-right: 0;
  }
`;

export const RootCSS = styled.div`
  font-family: ${(props) => props.theme.typography.text.fontFamily};
  color: ${(props) => props.theme.colors.text};

  * {
    box-sizing: border-box;
  }

  ${typesetting}
`;

const imports = `
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@100;300;400;500;600;700;800;900&family=Noto+Sans:ital,wght@0,300;0,400;0,500;0,600;0,700;0,900;1,300;1,400;1,500;1,600;1,700;1,900&family=Roboto+Mono:ital,wght@0,300;0,400;0,500;0,700;1,300;1,400;1,500;1,700&display=swap');
@import url('https://rsms.me/inter/inter.css');
@import url('https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css');
`;

export const ThemingRoot = ({ children }: React.PropsWithChildren) => (
  <ThemeProvider theme={defaultTokens}>
    <style>{imports}</style>
    <RootCSS>{children}</RootCSS>
  </ThemeProvider>
);
