import type { IBufferLine, IDecorationOptions, ITerminalAddon, Terminal } from 'xterm';

export interface IHighlightOptions {
  keyword: string;
  ignoreSensitive?: boolean;
  decorations: {
    matchForegroundColor?: string;
    matchBackground?: string;
  };
}

export class HighlightAddon implements ITerminalAddon {
  private _terminal: Terminal | undefined;
  private _cacheDecorations = new Map();
  private _highlightTimeout = 0;

  public activate(terminal: Terminal): void {
    this._terminal = terminal;
  }

  private _getLineProperty(line: IBufferLine) {
    let index = 0;
    let cell = line.getCell(index);
    let width = 0;
    let isAllBgDefault = true;
    let isAllFgDefault = true;
    while (cell) {
      if (!cell.isBgDefault()) {
        isAllBgDefault = false;
      }
      if (!cell.isFgDefault()) {
        isAllFgDefault = false;
      }
      width += cell.getWidth();
      cell = line.getCell(index);
      index++;
    }
    return {
      width: width,
      isAllBgDefault: isAllBgDefault,
      isAllFgDefault: isAllFgDefault,
    };
  }

  private _decoration(
    line: IBufferLine,
    lineIndex: number,
    matchOption?: IHighlightOptions,
  ) {
    if (!this._terminal) {
      return;
    }
    if (!(matchOption && matchOption.decorations)) {
      return;
    }
    const terminal = this._terminal;
    const { width, isAllBgDefault, isAllFgDefault } = this._getLineProperty(line);
    if (!isAllBgDefault || !isAllFgDefault) {
      return;
    }
    const marker = terminal.registerMarker(
      -terminal.buffer.active.baseY - terminal.buffer.active.cursorY + lineIndex,
    );
    if (marker) {
      const decorationOptions: IDecorationOptions = {
        marker: marker,
        x: 0,
        width: width,
        backgroundColor: matchOption.decorations.matchBackground,
        foregroundColor: matchOption.decorations.matchForegroundColor,
        layer: 'bottom',
      };
      const decoration = terminal.registerDecoration(decorationOptions);
      if (decoration) {
        decoration.onDispose(() => {
          marker.dispose();
        });
        this._cacheDecorations.set(lineIndex, decoration);
      }
    }
  }

  private _clearDecoration() {
    this._cacheDecorations.forEach((decoration) => {
      decoration.dispose();
    });
    this._cacheDecorations.clear();
  }

  private _updateHighlight(options: IHighlightOptions[]) {
    if (!this._terminal) {
      return;
    }
    if (!Array.isArray(options)) {
      return;
    }
    this._clearDecoration();
    const terminal = this._terminal;
    let lineIndex = 0;
    let line = terminal.buffer.active.getLine(lineIndex);
    let prevMatch: IHighlightOptions | undefined;
    const _loop = () => {
      const nextLine = terminal.buffer.active.getLine(lineIndex + 1);
      const lineWrapsToNext = nextLine ? nextLine.isWrapped : false;
      const string = line?.translateToString(!lineWrapsToNext);
      if (string) {
        if (line?.isWrapped && prevMatch) {
          this._decoration(line, lineIndex, prevMatch);
        } else {
          const matchOption = options.find((option) => {
            const keyword = option.keyword || '';
            if (option.ignoreSensitive) {
              const lowerString = string.toLowerCase();
              return (
                lowerString.includes(keyword.toLowerCase()) ||
                lowerString.includes(keyword)
              );
            }
            return string.includes(keyword);
          });
          prevMatch = matchOption;
          // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
          this._decoration(line!, lineIndex, matchOption);
        }
      }
      lineIndex++;
      line = nextLine;
    };
    while (line) {
      _loop();
    }
  }

  public highlight(options: IHighlightOptions[]) {
    if (!this._terminal) {
      return;
    }
    if (!Array.isArray(options)) {
      return;
    }
    this._cacheDecorations = new Map();
    const terminal = this._terminal;
    terminal.onWriteParsed(() => {
      clearTimeout(this._highlightTimeout);
      this._highlightTimeout = window.setTimeout(() => {
        this._updateHighlight(options);
      }, 0);
    });

    terminal.onResize(() => {
      clearTimeout(this._highlightTimeout);
      this._highlightTimeout = window.setTimeout(() => {
        this._updateHighlight(options);
      }, 0);
    });
  }

  public dispose() {
    clearTimeout(this._highlightTimeout);
    this._cacheDecorations.clear();
  }
}
