import { Element, Node, isTag } from 'domhandler';
import { parseDocument } from 'htmlparser2';

export interface Extractor {
  extractClassName(contents: string): string[];
  extractId(contents: string): string[];
}

class ExtractorImpl implements Extractor {
  private _classNames: string[];
  private _ids: string[];

  constructor() {
    this._classNames = [];
    this._ids = [];
  }

  extractClassName(contents: string): string[] {
    const root = parseDocument(contents);

    this._extractClassNameFromHtml(root.children);

    return this._classNames;
  }

  extractId(contents: string): string[] {
    const root = parseDocument(contents);

    this._extractIdFromHtml(root.children);

    return this._ids;
  }

  private _extractClassNameFromHtml(children: Element[] | Node[]): void {
    const elements = children.flatMap((child) => (isTag(child) ? [child] : []));
    if (elements.length === 0) {
      return;
    }

    const classNames = getClassNames(elements);
    this._classNames = this._classNames.concat(classNames);

    this._extractClassNameFromHtml(
      elements.flatMap((element) => element.children),
    );
  }

  private _extractIdFromHtml(children: Element[] | Node[]): void {
    const elements = children.flatMap((child) => (isTag(child) ? [child] : []));
    if (elements.length === 0) {
      return;
    }

    const ids = getIds(elements);
    this._ids = this._ids.concat(ids);

    this._extractIdFromHtml(elements.flatMap((element) => element.children));
  }
}

export function createExtractor() {
  return new ExtractorImpl();
}

function getClassNames(elements: Element[]): string[] {
  const classNames = elements
    .map((child) => child.attribs.class)
    .filter((className) => !!className)
    .map((className) => `.${className.replace(/ /g, '.')}`);

  return classNames;
}

function getIds(elements: Element[]): string[] {
  const ids = elements
    .map((child) => child.attribs.id)
    .filter((id) => !!id)
    .map((id) => `#${id}`);

  return ids;
}
