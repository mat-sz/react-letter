const allowedTags = {
  a: ['class', 'href', 'id', 'style', 'target', 'name'],
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

const removeWithContents = ['script', 'iframe', 'textarea', 'title'];

function prependIdToSelectorText(selectorText: string, id: string) {
  return selectorText
    .split(',')
    .map(selector => selector.trim())
    .map(selector => {
      if (selector.toLowerCase().startsWith('body')) {
        return '#' + id + ' ' + selector.substring(4);
      } else {
        return '#' + id + ' ' + selector;
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
  const allList = doc.querySelectorAll('body *');
  allList.forEach(element => {
    if (dropAllTags) {
      if (element.textContent) {
        const textNode = doc.createTextNode(element.textContent);
        element.parentNode?.replaceChild(textNode, element);
      }
      return;
    }

    const tagName = element.tagName.toLowerCase();
    if (tagName in allowedTags) {
      const allowedAttributes = allowedTags[tagName];
      for (let attribute of element.getAttributeNames()) {
        if (!allowedAttributes.includes(attribute)) {
          element.removeAttribute(attribute);
        }
      }
    } else {
      element.outerHTML = element.innerHTML;
    }
  });

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
