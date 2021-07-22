import { SimpleLiteral } from 'estree';

type JSXAttribute = {
  type: 'JSXAttribute';
  name: JSXIdentifier;
  value: SimpleLiteral;
};

type JSXIdentifier = { name: string; type: 'JSXIdentifier' };

type JSXOpeningElement = {
  type: 'JSXOpeningElement';
  name: JSXIdentifier;
  selfClosing: boolean;
  attributes: JSXAttribute[];
};

type JSXClosingElement = {
  type: 'JSXClosingElement';
  name: JSXIdentifier;
};

export declare type JSXElement = {
  type: 'JSXElement';
  openingElement: JSXOpeningElement;
  children: JSXElement[];
  closingElement: JSXClosingElement | null;
};
