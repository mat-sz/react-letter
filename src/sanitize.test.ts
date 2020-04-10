import { sanitize } from './sanitize';

describe('sanitizer', () => {
  it('wraps contents in a div', () => {
    expect(
      sanitize('<a>test</a>', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><a>test</a></div>');
  });

  it('removes non-whitelisted tags while preserving their contents', () => {
    expect(sanitize('<b>test</b><test>test</test>', '', { id: 'test' })).toBe(
      '<div id="test"><b>test</b>test</div>'
    );

    expect(
      sanitize(
        '<b>test</b><table><test>test</test><thead><tr><th>test</th></tr></thead></table>',
        '',
        { id: 'test' }
      )
    ).toBe(
      '<div id="test"><b>test</b>test<table><thead><tr><th>test</th></tr></thead></table></div>'
    );
  });

  it('removes blacklisted tags and their contents', () => {
    expect(
      sanitize('<b>test</b><script>test</script>', '', { id: 'test' })
    ).toBe('<div id="test"><b>test</b></div>');
    expect(
      sanitize('<b>test</b><noscript>test</noscript>', '', { id: 'test' })
    ).toBe('<div id="test"><b>test</b></div>');
    expect(
      sanitize('<b>test</b><noembed>test</noembed>', '', { id: 'test' })
    ).toBe('<div id="test"><b>test</b></div>');
    expect(
      sanitize('<b>test</b><iframe>test</iframe>', '', { id: 'test' })
    ).toBe('<div id="test"><b>test</b></div>');
    expect(
      sanitize('<b>test</b><textarea>test</textarea>', '', { id: 'test' })
    ).toBe('<div id="test"><b>test</b></div>');
    expect(sanitize('<b>test</b><title>test</title>', '', { id: 'test' })).toBe(
      '<div id="test"><b>test</b></div>'
    );
  });

  it('rewrites URLs on <a> elements', () => {
    expect(
      sanitize('<a href="https://example.com/"></a>', '', {
        id: 'test',
        rewriteExternalLinks: (url: String) => './redirect?url=' + url
      })
    ).toBe(
      '<div id="test"><a href="./redirect?url=https://example.com/"></a></div>'
    );
  });

  it('rewrites URLs on CSS url()', () => {
    expect(
      sanitize(
        '<a style="background: url(\'https://example.com/image.jpg\')"></a>',
        '',
        {
          id: 'test',
          rewriteExternalResources: (url: String) => './redirect?url=' + url
        }
      )
    ).toBe(
      '<div id="test"><a style="background: url(./redirect?url=https://example.com/image.jpg);"></a></div>'
    );
  });

  it('formats raw text', () => {
    expect(
      sanitize('', 'test', {
        id: 'test'
      })
    ).toBe('<div id="test"><p>test</p></div>');
    expect(
      sanitize('', 'test\ntest', {
        id: 'test'
      })
    ).toBe('<div id="test"><p>test</p>\n<p>test</p></div>');
  });

  // Seems like the jest implementation of DOMParser doesn't do well with <style> tags.
  it('moves styles from <head> to <body>', () => {
    expect(
      sanitize('<html><head><style></style></head><body></body></html>', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><style></style></div>');
  });

  it('removes comments', () => {
    expect(
      sanitize('<div><!-- hello --></div>', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><div></div></div>');
  });
});
