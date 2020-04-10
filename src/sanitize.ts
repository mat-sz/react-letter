const allowedTags = {
  a: ['class', 'href', 'id', 'style', 'target'],
  b: ['class', 'id', 'style'],
  br: ['class', 'id', 'style'],
  center: ['class', 'id', 'style'],
  div: ['align', 'class', 'dir', 'id', 'style'],
  font: ['class', 'color', 'face', 'id', 'size', 'style'],
  h1: ['align', 'class', 'dir', 'id', 'style'],
  h2: ['align', 'class', 'dir', 'id', 'style'],
  h3: ['align', 'class', 'dir', 'id', 'style'],
  h4: ['align', 'class', 'dir', 'id', 'style'],
  h5: ['align', 'class', 'dir', 'id', 'style'],
  h6: ['align', 'class', 'dir', 'id', 'style'],
  hr: ['align', 'size', 'width'],
  img: [
    'align',
    'border',
    'class',
    'height',
    'hspace',
    'id',
    'src',
    'style',
    'usemap',
    'vspace',
    'width'
  ],
  label: ['class', 'id', 'style'],
  li: ['class', 'dir', 'id', 'style', 'type'],
  ol: ['class', 'dir', 'id', 'style', 'type'],
  p: ['align', 'class', 'dir', 'id', 'style'],
  span: ['class', 'id', 'style'],
  strong: ['class', 'id', 'style'],
  style: [],
  table: [
    'align',
    'bgcolor',
    'border',
    'cellpadding',
    'cellspacing',
    'class',
    'dir',
    'frame',
    'id',
    'rules',
    'style',
    'width'
  ],
  tbody: ['class', 'id', 'style'],
  td: [
    'abbr',
    'align',
    'bgcolor',
    'class',
    'colspan',
    'dir',
    'height',
    'id',
    'lang',
    'rowspan',
    'scope',
    'style',
    'valign',
    'width'
  ],
  th: [
    'abbr',
    'align',
    'bgcolor',
    'class',
    'colspan',
    'dir',
    'height',
    'id',
    'lang',
    'rowspan',
    'scope',
    'style',
    'valign',
    'width'
  ],
  thead: ['class', 'id', 'style'],
  tr: ['align', 'bgcolor', 'class', 'dir', 'id', 'style', 'valign'],
  u: ['class', 'id', 'style'],
  ul: ['class', 'dir', 'id', 'style']
} as { [k: string]: string[] };

const removeWithContents = [
  'script',
  'iframe',
  'textarea',
  'title',
  'noscript',
  'noembed'
];

function prependIdToSelectorText(selectorText: string, id: string) {
  return selectorText
    .split(',')
    .map(selector => selector.trim())
    .map(selector => {
      const s = selector
        .replace(/\./g, '.' + id + '_')
        .replace(/\#/g, '#' + id + '_');
      if (s.toLowerCase().startsWith('body')) {
        return '#' + id + ' ' + s.substring(4);
      } else {
        return '#' + id + ' ' + s;
      }
    })
    .join(',');
}

function sanitizeHtml(input: string, dropAllTags?: boolean) {
  const doc = new DOMParser().parseFromString(input, 'text/html');
  const id =
    'msg_' +
    String.fromCharCode(
      ...new Array(24)
        .fill(undefined)
        .map(_ => ((Math.random() * 25) % 25) + 65)
    );

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
  if (dropAllTags) {
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
    if (dropAllTags) {
      if (node.textContent) {
        const textNode = doc.createTextNode(node.textContent);
        node.parentNode?.replaceChild(textNode, node);
      }

      continue;
    }

    const element = node as HTMLElement;
    const tagName = element.tagName.toLowerCase();
    if (tagName === 'body') {
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
        }
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
    const newRules: CSSStyleRule[] = [];

    for (let i = 0; i < stylesheet.cssRules.length; i++) {
      const rule = stylesheet.cssRules.item(i) as CSSStyleRule;

      if (rule.type === rule.STYLE_RULE) {
        rule.selectorText = prependIdToSelectorText(rule.selectorText, id);
        newRules.push(rule);
      } else if (rule.type === rule.MEDIA_RULE && 'cssRules' in rule) {
        const mediaRule = rule as CSSMediaRule;

        for (let i = 0; i < mediaRule.cssRules.length; i++) {
          const rule = mediaRule.cssRules.item(i) as CSSStyleRule;

          if (rule.selectorText) {
            rule.selectorText = prependIdToSelectorText(rule.selectorText, id);
          }
        }

        newRules.push(rule);
      }
    }

    styleElement.textContent = newRules.map(rule => rule.cssText).join('\n');
  });

  // Wrap body inside of a div with the generated ID.
  const div = doc.createElement('div');
  div.id = id;
  div.innerHTML = doc.body.innerHTML;
  return div.outerHTML;
}

export function sanitize(html: string, text?: string) {
  let contents = html ?? '';
  if (contents?.length === 0 && text) {
    contents = sanitizeHtml(text, true)
      .split('\n')
      .map(line => '<p>' + line + '</p>')
      .join('\n');
  }

  return sanitizeHtml(contents);
}
