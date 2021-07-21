import { isNull } from 'option-t/lib/Nullable/Nullable';
import { isUndefined } from 'option-t/lib/Undefinable/Undefinable';
import { window as vscodeWindow, workspace as vscodeWorkspace } from 'vscode';
import { createExtractor } from './extractor';
import { Formatter } from './formatter';

const supportedFormats = ['html'];

export async function runCSSExtractor(): Promise<void> {
  const editor = vscodeWindow.activeTextEditor;

  const extractor = createExtractor();
  const formatter = new Formatter();

  if (isUndefined(editor) || isNull(extractor) || isNull(formatter)) {
    return;
  }

  const document = editor.document;
  const content = document.getText();

  const isSupportedLanguage = supportedFormats.includes(document.languageId);
  if (!isSupportedLanguage) {
    vscodeWindow.showErrorMessage('eCSStractor: not supported format.');
  }

  const selectors = [
    ...extractor.extractId(content),
    ...extractor.extractClassName(content),
  ];

  const source = formatter.convertSelectorsToRulesets(
    formatter.removeDuplicatesSelector(selectors),
  );

  vscodeWindow.showTextDocument(
    await vscodeWorkspace.openTextDocument({
      content: formatter.format(source),
      language: 'css',
    }),
  );
}
