import { Element, Node, isTag } from 'domhandler';
import * as esprima from 'esprima';
import { parseDocument } from 'htmlparser2';
import { JSXElement } from '../typings/esprima_extend';
import {
  isClassName,
  isExportNamedDeclaration,
  isFunctionDeclaration,
  isId,
  isJSXElement,
  isReturnStatement,
} from './utils';

type Params = {
  filetype: 'html' | 'jsx';
};

export interface Extractor {
  extractClassName(contents: string): string[];
  extractId(contents: string): string[];
}

class ExtractorImpl implements Extractor {
  private _classNames: string[];
  private _ids: string[];
  private _filetype: 'html' | 'jsx';

  constructor({ filetype }: Params) {
    this._classNames = [];
    this._ids = [];
    this._filetype = filetype;
  }

  extractClassName(contents: string): string[] {
    if (this._filetype === 'html') {
      const root = parseDocument(contents);
      this._extractClassNameFromHtml(root.children);
    } else {
      const result = esprima.parseModule(contents, { jsx: true });

      result.body.map((value) => {
        if (
          isExportNamedDeclaration(value) &&
          isFunctionDeclaration(value.declaration)
        ) {
          value.declaration.body.body.map((value) => {
            if (isReturnStatement(value) && isJSXElement(value.argument)) {
              const args = value.argument as JSXElement;
              this._extractClassNameFromJsx([args]);
            }
          });
        }
      });
    }

    return this._classNames;
  }

  extractId(contents: string): string[] {
    if (this._filetype === 'html') {
      const root = parseDocument(contents);
      this._extractIdFromHtml(root.children);
    } else {
      const result = esprima.parseModule(contents, { jsx: true });

      result.body.map((value) => {
        if (
          isExportNamedDeclaration(value) &&
          isFunctionDeclaration(value.declaration)
        ) {
          value.declaration.body.body.map((value) => {
            if (isReturnStatement(value) && isJSXElement(value.argument)) {
              const args = value.argument as JSXElement;
              this._extractIdFromJsx([args]);
            }
          });
        }
      });
    }
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

  private _extractClassNameFromJsx(children: JSXElement[]): void {
    children.forEach((element) => {
      if (!isJSXElement(element)) {
        return;
      }

      const attributes = element.openingElement.attributes;
      attributes
        .filter(isClassName)
        .map(({ value }) => `${value.value}`.replace(/ /g, '.'))
        .forEach((className) => this._classNames.push(`.${className}`));

      this._extractClassNameFromJsx(element.children);
    });
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

  private _extractIdFromJsx(children: JSXElement[]): void {
    children.forEach((element) => {
      if (!isJSXElement(element)) {
        return;
      }

      const attributes = element.openingElement.attributes;
      attributes
        .filter(isId)
        .forEach((attr) => this._ids.push(`#${attr.value.value}`));

      this._extractIdFromJsx(element.children);
    });
  }
}

export function createExtractor(params: Params) {
  return new ExtractorImpl(params);
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
