import React, { useRef, useState, useEffect } from 'react';
import { extract, LetterparserNode } from 'letterparser';
import sanitizeHtml from 'sanitize-html';

export interface LetterProps {
  message: string | LetterparserNode;
}

export const Letter: React.FC<LetterProps> = ({ message }) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [html, setHtml] = useState<string>();
  const [subject, setSubject] = useState<string>();

  useEffect(() => {
    const mail = extract(message);
    setSubject(mail.subject);

    let contents = mail.html ?? '';
    if (contents?.length === 0 && mail.text) {
      contents = sanitizeHtml(mail.text, {
        allowedTags: [],
        allowedAttributes: {}
      })
        .split('\n')
        .map(line => '<p>' + line + '</p>')
        .join('\n');
    }

    setHtml(
      sanitizeHtml(contents, {
        allowedTags: [
          'a',
          'b',
          'br',
          'center',
          'div',
          'font',
          'h1',
          'h2',
          'h3',
          'h4',
          'h5',
          'h6',
          'hr',
          'img',
          'label',
          'li',
          'ol',
          'p',
          'span',
          'strong',
          'style',
          'table',
          'tbody',
          'td',
          'th',
          'thead',
          'tr',
          'u',
          'ul'
        ],
        allowedAttributes: {
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
        }
      })
    );
  }, [message, setHtml, setSubject, iframeRef]);

  return (
    <div>
      <iframe srcDoc={html} title={subject} />
    </div>
  );
};
