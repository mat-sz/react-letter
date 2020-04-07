import React, { useRef, useState, useEffect } from 'react';
import { extract, LetterparserNode } from 'letterparser';

import { sanitize } from './sanitize';

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
    setHtml(sanitize(mail.html ?? '', mail.text));
  }, [message, setHtml, setSubject, iframeRef]);

  return (
    <div>
      <iframe srcDoc={html} title={subject} />
    </div>
  );
};
