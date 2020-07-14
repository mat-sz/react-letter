import {
  allowedTags,
  allowedCssProperties,
  removeWithContents
} from './constants';

export interface SanitizerOptions {
  /**
   * Wrapper element id.
   */
  id?: string;

  /**
   * Removes all HTML tags from the contents.
   */
  dropAllHtmlTags?: boolean;

  /**
   * Replaces CSS url() and src= attribute values with return values of this function.
   */
  rewriteExternalResources?: (url: string) => string;

  /**
   * Replaces href= attribute values with return values of this function.
   */
  rewriteExternalLinks?: (url: string) => string;

  /**
   * Allowed schemas, default: ['http', 'https', 'mailto'].
   */
  allowedSchemas?: string[];

  /**
   * Remove wrapper <div> from the output, default: false.
   */
  noWrapper?: boolean;
}

function prependIdToSelectorText(selectorText: string, id: string) {
  return selectorText
    .split(',')
    .map(selector => selector.trim())
    .map(selector => {
      const s = selector
        .replace(/\./g, '.' + id + '_')
        .replace(/#/g, '#' + id + '_');
      if (s.toLowerCase().startsWith('body')) {
        return '#' + id + ' ' + s.substring(4);
      } else {
        return '#' + id + ' ' + s;
      }
    })
    .join(',');
}

function sanitizeCssValue(
  cssValue: string,
  allowedSchemas: string[],
  rewriteExternalResources?: (url: string) => string
) {
  return cssValue
    .trim()
    .replace(/expression\((.*?)\)/g, '')
    .replace(/url\(["']?(.*?)["']?\)/g, (match, url) => {
      let quote = '';
      if (match.startsWith('url("')) {
        quote = '"';
      } else if (match.startsWith("url('")) {
        quote = "'";
      }

      if (allowedSchemas.includes(url.split(':')[0])) {
        if (rewriteExternalResources) {
          return 'url(' + quote + rewriteExternalResources(url) + quote + ')';
        } else {
          return match;
        }
      } else {
        return '';
      }
    });
}

function sanitizeCssStyle(
  style: CSSStyleDeclaration,
  allowedSchemas: string[],
  rewriteExternalResources?: (url: string) => string
) {
  const properties: string[] = [];

  for (let i = 0; i < style.length; i++) {
    const name = style.item(i);
    properties.push(name);
  }
  for (let name of properties) {
    if (allowedCssProperties.includes(name)) {
      const value = style.getPropertyValue(name);
      const priority = style.getPropertyPriority(name);
      style.setProperty(
        name,
        sanitizeCssValue(value, allowedSchemas, rewriteExternalResources),
        priority
      );
    } else {
      style.removeProperty(name);
    }
  }
}

function sanitizeCssRule(
  rule: CSSStyleRule,
  id: string,
  allowedSchemas: string[],
  rewriteExternalResources?: (url: string) => string
) {
  rule.selectorText = prependIdToSelectorText(rule.selectorText, id);
  sanitizeCssStyle(rule.style, allowedSchemas, rewriteExternalResources);
}

function sanitizeHtml(
  input: string,
  {
    dropAllHtmlTags = false,
    rewriteExternalLinks,
    rewriteExternalResources,
    id = 'msg_' +
      String.fromCharCode(
        ...new Array(24)
          .fill(undefined)
          .map(_ => ((Math.random() * 25) % 25) + 65)
      ),
    allowedSchemas = ['http', 'https', 'mailto'],
    noWrapper = false
  }: SanitizerOptions
) {
  const doc = new DOMParser().parseFromString(input, 'text/html');

  // Remove comments.
  const commentIter = doc.createNodeIterator(
    doc.documentElement,
    NodeFilter.SHOW_COMMENT
  );

  let node: Node | null;
  while ((node = commentIter.nextNode())) {
    node.parentNode?.removeChild(node);
  }

  const removeTags = [...removeWithContents];
  if (dropAllHtmlTags) {
    removeTags.push('style');
  }

  // Remove disallowed tags.
  const disallowedList = doc.querySelectorAll(removeTags.join(', '));
  disallowedList.forEach(element => element.remove());

  // Move styles from head to body.
  const styleList = doc.querySelectorAll('head > style');
  styleList.forEach(element => {
    doc.body.appendChild(element);
  });

  // Filter other tags.
  const toRemove: Element[] = [];
  const elementIter = doc.createNodeIterator(
    doc.body,
    NodeFilter.SHOW_ELEMENT,
    {
      acceptNode: () => {
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  while ((node = elementIter.nextNode())) {
    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'body' || tagName === 'html') {
      continue;
    }

    if (dropAllHtmlTags) {
      if (node.textContent) {
        const textNode = doc.createTextNode(node.textContent);
        node.parentNode?.replaceChild(textNode, node);
      } else {
        node.parentNode?.removeChild(node);
      }

      continue;
    }

    if (tagName in allowedTags) {
      const allowedAttributes = allowedTags[tagName];
      for (let attribute of element.getAttributeNames()) {
        if (!allowedAttributes.includes(attribute)) {
          element.removeAttribute(attribute);
        } else if (attribute === 'class') {
          element.setAttribute(
            attribute,
            element
              .getAttribute(attribute)
              ?.split(' ')
              .map(className => id + '_' + className)
              .join(' ') ?? ''
          );
        } else if (attribute === 'id') {
          element.setAttribute(
            attribute,
            id + '_' + (element.getAttribute(attribute) ?? '')
          );
        } else if (attribute === 'href' || attribute === 'src') {
          const value = element.getAttribute(attribute) ?? '';
          if (!allowedSchemas.includes(value.split(':')[0])) {
            element.removeAttribute(attribute);
          } else if (attribute === 'href' && rewriteExternalLinks) {
            element.setAttribute(attribute, rewriteExternalLinks(value));
          } else if (attribute === 'src' && rewriteExternalResources) {
            element.setAttribute(attribute, rewriteExternalResources(value));
          }
        }
      }

      // Sanitize CSS.
      sanitizeCssStyle(element.style, allowedSchemas, rewriteExternalResources);

      // Add rel="noopener noreferrer" to <a>
      if (tagName === 'a') {
        element.setAttribute('rel', 'noopener noreferrer');
      }
    } else {
      element.insertAdjacentHTML('afterend', element.innerHTML);
      toRemove.push(element);
    }
  }

  for (let element of toRemove) {
    try {
      element.parentNode?.removeChild(element);
      if (!element.parentNode) {
        element.outerHTML = '';
      }
    } catch {
      element.outerHTML = '';
    }
  }

  // Prepend wrapper ID.
  const bodyStyleList = doc.querySelectorAll('body style');
  bodyStyleList.forEach(element => {
    const styleElement = element as HTMLStyleElement;
    const stylesheet = styleElement.sheet as CSSStyleSheet;
    const newRules: CSSRule[] = [];

    if (!stylesheet.cssRules || !stylesheet.cssRules.item) {
      styleElement.textContent = '';
      return;
    }

    for (let i = 0; i < stylesheet.cssRules.length; i++) {
      const rule = stylesheet.cssRules.item(i) as CSSStyleRule;

      if (rule.type === rule.STYLE_RULE) {
        sanitizeCssRule(rule, id, allowedSchemas, rewriteExternalResources);
        newRules.push(rule);
      } else if (rule.type === rule.MEDIA_RULE && 'cssRules' in rule) {
        const mediaRule = rule as CSSMediaRule;
        let newRulesMedia: CSSRule[] = [];

        for (let i = 0; i < mediaRule.cssRules.length; i++) {
          const rule = mediaRule.cssRules.item(i) as CSSStyleRule;

          if (rule.type === rule.STYLE_RULE) {
            sanitizeCssRule(rule, id, allowedSchemas, rewriteExternalResources);
            newRulesMedia.push(rule);
          }
        }

        while (mediaRule.cssRules.length > 0) {
          mediaRule.deleteRule(0);
        }

        for (let rule of newRulesMedia) {
          mediaRule.insertRule(rule.cssText, mediaRule.cssRules.length);
        }

        newRules.push(mediaRule);
      }
    }

    styleElement.textContent = newRules.map(rule => rule.cssText).join('\n');
  });

  // Wrap body inside of a div with the generated ID.
  if (noWrapper) {
    return doc.body.innerHTML;
  } else {
    const div = doc.createElement('div');
    div.id = id;
    div.innerHTML = doc.body.innerHTML;
    return div.outerHTML;
  }
}

function sanitizeText(text: string) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

export function sanitize(
  html: string,
  text?: string,
  options?: SanitizerOptions
) {
  let contents = html ?? '';
  if (contents?.length === 0 && text) {
    contents = sanitizeText(text)
      .split('\n')
      .map(line => '<p>' + line + '</p>')
      .join('\n');
  }

  return sanitizeHtml(contents, options ?? {});
}
