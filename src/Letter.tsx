import React, { useState, useEffect } from 'react';
import { extract, LetterparserNode } from 'letterparser';

import { RawLetter, RawLetterProps } from './RawLetter';

export interface LetterProps extends Omit<RawLetterProps, 'text' | 'html'> {
  /**
   * The e-mail contents to use, either as a raw RFC 822 message or output from letterparser.
   */
  message: string | LetterparserNode;
}

export const Letter: React.FC<LetterProps> = props => {
  const { message } = props;
  const [html, setHtml] = useState<string>('');
  const [text, setText] = useState<string>();
  const [subject, setSubject] = useState<string>();

  useEffect(() => {
    const mail = extract(message);
    setSubject(mail.subject);
    setHtml(mail.html ?? '');
    setText(mail.text);
  }, [message, setHtml, setText, setSubject]);

  return <RawLetter html={html} text={text} iframeTitle={subject} {...props} />;
};
