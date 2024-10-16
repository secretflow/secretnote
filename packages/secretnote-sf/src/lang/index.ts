// Multilingual support

import { l10n, L10nLang } from '@difizen/mana-l10n';

import bundleENUS from './bundle.l10n.en-US.json';
import bundleZHCN from './bundle.l10n.zh-CN.json';

l10n.loadLangBundles({
  'zh-CN': bundleZHCN,
  'en-US': bundleENUS,
});
l10n.changeLang(L10nLang.zhCN);
