import {
  ArrowDownToLine,
  ArrowUpToLine,
  ChevronDown,
  ChevronUp,
  XCircle,
} from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ITerminalAddon } from 'xterm';
import { Terminal } from 'xterm';
import { CanvasAddon } from 'xterm-addon-canvas';
import { FitAddon } from 'xterm-addon-fit';
import { SearchAddon } from 'xterm-addon-search';
import { WebLinksAddon } from 'xterm-addon-web-links';

import 'xterm/css/xterm.css';
import { HighlightAddon } from './highlight-addon';
import useAddon from './hooks/useAddon';
import useDebounceInput from './hooks/useDebounceInput';
import useThrottle from './hooks/useThrottle';
import './index.less';

const defaultSearchOptions = {
  regex: false,
  wholeWord: false,
  caseSensitive: false,
  incremental: false,
  decorations: {
    matchForegroundColor: '#000000',
    matchBackground: '#f6c8ac',
    matchBorder: 'none',
    matchOverviewRuler: 'none',
    activeMatchBackground: '#babfb1',
    activeMatchBorder: 'none',
    activeMatchColorOverviewRuler: 'none',
  },
};

const defaultTerminalOptions = {
  cursorBlink: false,
  convertEol: false,
  scrollback: Number.MAX_SAFE_INTEGER,
  drawBoldTextInBrightColors: false,
  allowProposedApi: true,
  allowTransparency: true,
  fontSize: 13,
  fontFamily: 'Roboto Mono,Andale Mono,Consolas,Courier New,monospace',
  lineHeight: 20 / 17,
  fastScrollSensitivity: 35,
};

const defaultHighlightOptions = [
  {
    keyword: '[error]',
    ignoreSensitive: true,
    decorations: {
      matchForegroundColor: 'red',
      matchBackground: '#24292e',
    },
  },
  {
    keyword: '[warn]',
    ignoreSensitive: true,
    decorations: {
      matchForegroundColor: 'yellow',
      matchBackground: '#24292e',
    },
  },
  {
    keyword: '[debug]',
    ignoreSensitive: true,
    decorations: {
      matchForegroundColor: 'cyan',
      matchBackground: '#24292e',
    },
  },
];

interface IProps {
  code: string;
  theme?: 'dark' | 'light';
}

const LogView = (props: IProps) => {
  const [terminalInstance, setTerminalInstance] = useState<Terminal>();
  const [searchValue, setSearchValue] = useState('');
  const [searchResult, setSearchResult] = useState({ resultIndex: -1, resultCount: 0 });
  const domRef = useRef<HTMLDivElement>(null);
  const mountedRef = useRef(false);
  const theme = props.theme || 'dark';
  const renderedCodeRef = useRef<string[]>([]);

  // init terminal
  useEffect(() => {
    const instance = new Terminal({
      ...defaultTerminalOptions,
      theme:
        theme === 'dark'
          ? {
              selectionBackground: '#fff',
              selectionForeground: '#fff',
              background: '#24292e',
              foreground: '#b5bbc6',
            }
          : {
              selectionBackground: '#b7d7fb',
              selectionForeground: '#000',
              background: '#fff',
              foreground: '#000',
            },
    });
    setTerminalInstance(instance);
    return () => {
      instance.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (domRef.current) {
      if (terminalInstance) {
        terminalInstance.open(domRef.current);
        mountedRef.current = true;
      }
    }
    return () => {
      if (terminalInstance) {
        terminalInstance.clear();
        mountedRef.current = false;
      }
    };
  }, [terminalInstance]);

  // init addons
  useAddon(terminalInstance, CanvasAddon, !!terminalInstance);
  useAddon(terminalInstance, WebLinksAddon, !!terminalInstance);
  const fitInstance = useAddon(
    terminalInstance,
    FitAddon,
    !!terminalInstance,
  ) as FitAddon;
  const searcherInstance = useAddon(
    terminalInstance,
    SearchAddon,
    !!terminalInstance,
    useCallback((terminal: Terminal, addon: ITerminalAddon) => {
      const searchAddon = addon as SearchAddon;
      if (searchAddon && searchAddon.onDidChangeResults) {
        searchAddon.onDidChangeResults((e) => {
          setSearchResult(
            e || {
              resultIndex: -1,
              resultCount: 0,
            },
          );
        });
      }
    }, []),
  ) as SearchAddon;
  useAddon(
    terminalInstance,
    HighlightAddon,
    !!terminalInstance,
    (terminal, instance) => {
      const hInstance = instance as HighlightAddon;
      if (hInstance) {
        hInstance.highlight(defaultHighlightOptions);
      }
    },
  );

  // init data
  useEffect(() => {
    if (terminalInstance) {
      if (props.code === '') {
        terminalInstance.clear();
        renderedCodeRef.current = [];
        return;
      } else {
        const code = props.code.replaceAll('\n', '\r\n');
        terminalInstance.write(code);
        renderedCodeRef.current.push(code);
      }
    }
  }, [terminalInstance, props.code]);

  // auto fit
  const throttleFit = useThrottle(() => {
    if (mountedRef.current && fitInstance && fitInstance.fit) {
      fitInstance.fit();
    }
  }, 3000);

  useEffect(() => {
    const resizeObserver = new ResizeObserver(throttleFit);
    const dom = domRef.current;
    if (dom) {
      resizeObserver.observe(dom);
    }
    return () => {
      if (dom) {
        resizeObserver.unobserve(dom);
        resizeObserver.disconnect();
      }
    };
  }, [fitInstance, throttleFit]);

  // search
  const onSearchChange = useDebounceInput((value: string) => {
    if (searcherInstance) {
      searcherInstance.findNext(value, defaultSearchOptions);
    }
  }, 800);

  const onSearchClear = useCallback(() => {
    if (searcherInstance) {
      searcherInstance.findNext('', defaultSearchOptions);
    }
  }, [searcherInstance]);

  const onSearchPre = useCallback(
    (value: string) => {
      if (searcherInstance) {
        searcherInstance.findPrevious(value, defaultSearchOptions);
      }
    },
    [searcherInstance],
  );

  const onSearchNext = useCallback(
    (value: string) => {
      if (searcherInstance) {
        searcherInstance.findNext(value, defaultSearchOptions);
      }
    },
    [searcherInstance],
  );

  const onScrollTop = useCallback(() => {
    if (terminalInstance) {
      terminalInstance.scrollToTop();
    }
  }, [terminalInstance]);

  const onScrollBottom = useCallback(() => {
    if (terminalInstance) {
      terminalInstance.scrollToBottom();
    }
  }, [terminalInstance]);

  const render = (
    <div className={`terminal-viewer ${theme}`}>
      <div className="terminal-viewer-header">
        <div className="terminal-viewer-input-wrapper">
          <input
            placeholder="Search..."
            className="terminal-viewer-input"
            value={searchValue}
            type="text"
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                onSearchNext(searchValue);
              }
            }}
            onChange={(e) => {
              setSearchValue(e.target.value);
              onSearchChange(e);
            }}
          />
          <div className="terminal-viewer-input-suffix">
            {searchValue && (
              <span className="input-suffix-search-result">
                {searchResult.resultCount}
              </span>
            )}
            <span
              className="input-suffix-clear"
              onClick={() => {
                setSearchValue('');
                onSearchClear();
              }}
            >
              <XCircle size={16} />
            </span>
            <span
              className="input-suffix-search-tool"
              onClick={() => onSearchPre(searchValue)}
            >
              <ChevronUp size={16} />
            </span>
            <span
              className="input-suffix-search-tool"
              onClick={() => onSearchNext(searchValue)}
            >
              <ChevronDown size={16} />
            </span>
          </div>
        </div>
      </div>
      <div className="terminal-viewer-body" ref={domRef} />
      <div className="terminal-viewer-toolbar">
        <div className="terminal-viewer-toolbar-button" onClick={onScrollTop}>
          <ArrowUpToLine size={16} />
        </div>
        <div className="terminal-viewer-toolbar-button" onClick={onScrollBottom}>
          <ArrowDownToLine size={16} />
        </div>
      </div>
    </div>
  );
  return render;
};

export { LogView };
