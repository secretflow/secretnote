import { useEffect, useState, useRef } from 'react';
import type { Terminal, ITerminalAddon } from 'xterm';

type Callback = (terminal: Terminal, addon: ITerminalAddon) => void;

function useAddon(
  terminal: Terminal | undefined,
  Addon: new () => ITerminalAddon,
  loadable: boolean,
  callback?: Callback,
) {
  const [addonInstance, setAddonInstance] = useState<ITerminalAddon>();
  const ref = useRef(callback);

  useEffect(() => {
    ref.current = callback;
  });

  useEffect(() => {
    const addon = new Addon();
    if (loadable && terminal) {
      terminal.loadAddon(addon);
      setAddonInstance(addon);
      if (ref.current instanceof Function) {
        ref.current(terminal, addon);
      }
    }
    return function () {
      setAddonInstance(undefined);
      addon.dispose();
    };
  }, [terminal, Addon, loadable]);

  return addonInstance;
}

export default useAddon;
