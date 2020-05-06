import React from 'react';
import { render } from '@testing-library/react';

import { Letter } from './Letter';

describe('Letter', () => {
  it('sanitizes the HTML passed to it', () => {
    const { container } = render(
      <Letter html="<b>test</b><test>test</test><script>test</script>" />
    );
    const element = container.firstChild?.firstChild as HTMLElement;

    expect(element.innerHTML).toBe('<b>test</b>test');
  });

  it('falls back to text if HTML is empty', () => {
    const { container } = render(<Letter html="" text="test" />);
    const element = container.firstChild?.firstChild as HTMLElement;

    expect(element.innerHTML).toBe('<p>test</p>');
  });

  it('uses the provided className (div)', () => {
    const { container } = render(<Letter html="test" className="test" />);
    const element = container.firstChild as HTMLElement;

    expect(element.className).toBe('test');
  });

  it('uses the provided className (iframe)', () => {
    const { container } = render(
      <Letter html="test" className="test" useIframe={true} />
    );
    const element = container.firstChild as HTMLElement;

    expect(element.className).toBe('test');
  });

  it('uses iframe instead of div when useIframe is true', () => {
    const { container } = render(
      <Letter html="test" className="test" useIframe={true} />
    );
    const element = container.firstChild?.firstChild as HTMLElement;

    expect(element.tagName).toBe('IFRAME');
  });

  it('uses supplied iframe title', () => {
    const { container } = render(
      <Letter
        html="test"
        className="test"
        useIframe={true}
        iframeTitle="test"
      />
    );
    const element = container.firstChild?.firstChild as HTMLElement;

    expect(element.title).toBe('test');
  });

  it('passes rewriteExternalResources to sanitizer', () => {
    const { container } = render(
      <Letter
        html="<img src='https://maliciouswebsite.example.com' />"
        rewriteExternalResources={() => 'https://example.com'}
      />
    );
    const element = container.firstChild?.firstChild
      ?.firstChild as HTMLImageElement;

    expect(element.src).toBe('https://example.com/');
  });

  it('passes rewriteExternalLinks to sanitizer', () => {
    const { container } = render(
      <Letter
        html="<a href='https://maliciouswebsite.example.com'>test</a>"
        rewriteExternalLinks={() => 'https://example.com'}
      />
    );
    const element = container.firstChild?.firstChild
      ?.firstChild as HTMLAnchorElement;

    expect(element.href).toBe('https://example.com/');
  });

  it('passes allowedSchemas to sanitizer', () => {
    const { container } = render(
      <Letter html="<img src='cid:test'>" allowedSchemas={['cid']} />
    );
    const element = container.firstChild?.firstChild
      ?.firstChild as HTMLImageElement;

    expect(element.src).toBe('cid:test');
  });
});
