import type { LanguageBundles } from '@difizen/mana-l10n';
import { l10n, L10nLang } from '@difizen/mana-l10n';

import lang_en_us from './bundle.l10n.en-US.json';
import lang_zh_cn from './bundle.l10n.zh-CN.json';

export const langBundles: LanguageBundles = {
  'zh-CN': lang_zh_cn,
  'en-US': lang_en_us,
};

l10n.loadLangBundles(langBundles);
l10n.changeLang(L10nLang.zhCN);
