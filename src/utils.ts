import {
  Declaration,
  Directive,
  ExportNamedDeclaration,
  Expression,
  FunctionDeclaration,
  ModuleDeclaration,
  ReturnStatement,
  Statement,
} from 'estree';
import { JSXAttribute, JSXElement } from '../typings/esprima_extend';

export function isExportNamedDeclaration(
  declaration: Directive | Statement | ModuleDeclaration,
): declaration is ExportNamedDeclaration {
  return declaration.type === 'ExportNamedDeclaration';
}

export function isFunctionDeclaration(
  declaration?: Declaration | null,
): declaration is FunctionDeclaration {
  return declaration?.type === 'FunctionDeclaration';
}

export function isJSXElement(
  expression?: Expression | JSXElement | null,
): expression is JSXElement {
  return expression?.type === 'JSXElement';
}

export function isReturnStatement(
  statement: Statement,
): statement is ReturnStatement {
  return statement.type === 'ReturnStatement';
}

export function isClassName(attr: JSXAttribute): boolean {
  return attr.name.name === 'className' || attr.name.name === 'class';
}

export function isId(attr: JSXAttribute): boolean {
  return attr.name.name === 'id';
}
