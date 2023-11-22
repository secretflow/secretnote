import type { ColorRegistry } from '@difizen/mana-app';
import { ColorContribution, singleton } from '@difizen/mana-app';

@singleton({ contrib: ColorContribution })
export class SecretNoteColorContribution implements ColorContribution {
  registerColors(colors: ColorRegistry): void {
    colors.register({
      id: 'secretnote.sidebar.background',
      defaults: { dark: '#f4f6f8', light: '#f4f6f8' },
      description: '',
    });

    colors.register({
      id: 'secretnote.text.color',
      defaults: { dark: '#40566c', light: '#40566c' },
      description: '',
    });

    colors.register({
      id: 'secretnote.li.hover.background',
      defaults: { dark: '#e5ebf1', light: '#e5ebf1' },
      description: '',
    });

    colors.register({
      id: 'secretnote.icon.color',
      defaults: { dark: '#40566c', light: '#40566c' },
      description: '',
    });

    colors.register({
      id: 'secretnote.icon.hover.color',
      defaults: { dark: '#182431', light: '#182431' },
      description: '',
    });

    colors.register({
      id: 'secretnote.divider.color',
      defaults: { dark: '#d6dee6', light: '#d6dee6' },
      description: '',
    });
  }
}
