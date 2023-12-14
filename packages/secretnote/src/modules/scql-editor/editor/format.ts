import * as monaco from 'monaco-editor';
import { format } from 'sql-formatter';

monaco.languages.registerDocumentFormattingEditProvider('sql', {
  provideDocumentFormattingEdits(model) {
    const formatted = format(model.getValue());
    return [
      {
        range: model.getFullModelRange(),
        text: formatted,
      },
    ];
  },
});

// define a range formatting provider
// select some codes and right click those codes
// you contextmenu will have an "Format Selection" action
monaco.languages.registerDocumentRangeFormattingEditProvider('sql', {
  provideDocumentRangeFormattingEdits(model, range) {
    const formatted = format(model.getValueInRange(range));
    return [
      {
        range: range,
        text: formatted,
      },
    ];
  },
});
