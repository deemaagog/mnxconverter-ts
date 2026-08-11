import {
  DOMParser,
  type Document,
  type Element,
  type Node,
} from '@xmldom/xmldom';
import * as xpath from 'xpath';

export type { Document, Element, Node };

/**
 * Convert a simple tag / path selector used by this library into an XPath
 * expression with CSS querySelector-like descendant semantics.
 *
 * Supported forms (as used in musicxml.ts):
 * - tag names: "part", "measure", "part-list"
 * - path segments: "attributes/transpose"
 */
const selectorToXPath = (selector: string): string => `.//${selector}`;

const isElementNode = (value: unknown): value is Element =>
  typeof value === 'object' &&
  value !== null &&
  (value as { nodeType?: number }).nodeType === 1;

/**
 * Parse an XML string into a Document.
 * Fatal parse errors are thrown (caught by callers and mapped to domain errors).
 */
export const parseXml = (xmlString: string): Document => {
  const parser = new DOMParser({
    // Match prior "parse throws → NotationImportError" behavior without console noise.
    onError(level, message) {
      if (level === 'warning') {
        return;
      }
      throw new Error(message);
    },
  });
  return parser.parseFromString(xmlString, 'text/xml');
};

/** Document element, or throw if the document has no root. */
export const getDocumentElement = (xml: Document): Element => {
  if (!xml.documentElement) {
    throw new Error('XML document has no document element');
  }
  return xml.documentElement;
};

/** First matching element under `context`, or null. */
export const querySelector = (
  context: Node,
  selector: string
): Element | null => {
  // `xpath` types target lib.dom; cast at this boundary only.
  const result: unknown = xpath.select1(
    selectorToXPath(selector),
    context as never
  );
  return isElementNode(result) ? result : null;
};

/** All matching elements under `context` (document order). */
export const querySelectorAll = (
  context: Node,
  selector: string
): Element[] => {
  const result: unknown = xpath.select(
    selectorToXPath(selector),
    context as never
  );
  if (!Array.isArray(result)) {
    return [];
  }
  return result.filter(isElementNode);
};

/**
 * Evaluate an XPath expression and return the first element, or null.
 * Replaces document.evaluate(..., XPathResult.FIRST_ORDERED_NODE_TYPE, ...).
 */
export const selectOne = (
  expression: string,
  context: Node
): Element | null => {
  const result: unknown = xpath.select1(expression, context as never);
  return isElementNode(result) ? result : null;
};

/** Evaluate an XPath expression and return all matching elements. */
export const selectAll = (expression: string, context: Node): Element[] => {
  const result: unknown = xpath.select(expression, context as never);
  if (!Array.isArray(result)) {
    return [];
  }
  return result.filter(isElementNode);
};

/** Child nodes as a plain array (xmldom NodeList has no forEach). */
export const childNodesOf = (node: Node): Node[] =>
  Array.from(node.childNodes as unknown as ArrayLike<Node>);
