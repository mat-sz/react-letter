import React, { useMemo } from 'react';

import { sanitize } from './sanitize';

export interface RawLetterProps {
  /**
   * The HTML to use and sanitize.
   */
  html: string;

  /**
   * Fallback text if HTML is empty.
   */
  text?: string;

  /**
   * Should the HTML be wrapped in an iframe. Default: false.
   */
  useIframe?: boolean;

  /**
   * Iframe title, usually set to subject of the message.
   */
  iframeTitle?: string;

  /**
   * The result of this function will be used to rewrite the URLs for url(...) in CSS and src attributes in HTML.
   */
  rewriteExternalResources?: (url: string) => string;

  /**
   * The result of this function will be used to rewrite the URLs for href attributes in HTML.
   */
  rewriteExternalLinks?: (url: string) => string;

  /**
   * Class name of the wrapper div.
   */
  className?: string;
}

export const RawLetter: React.FC<RawLetterProps> = ({
  html,
  text,
  useIframe,
  iframeTitle,
  className,
  rewriteExternalLinks,
  rewriteExternalResources
}) => {
  const sanitizedHtml = useMemo(
    () =>
      sanitize(html, text, { rewriteExternalLinks, rewriteExternalResources }),
    [html, text, rewriteExternalLinks, rewriteExternalResources]
  );

  if (useIframe) {
    return (
      <div className={className}>
        <iframe srcDoc={sanitizedHtml} title={iframeTitle} />
      </div>
    );
  } else {
    return (
      <div
        className={className}
        dangerouslySetInnerHTML={{ __html: sanitizedHtml }}
      />
    );
  }
};
