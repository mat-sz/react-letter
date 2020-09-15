import { sanitize } from './sanitize';

describe('sanitizer', () => {
  it('wraps contents in a div', () => {
    expect(
      sanitize('<a>test</a>', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><a rel="noopener noreferrer">test</a></div>');
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

  it('removes non-whitelisted attributes', () => {
    expect(
      sanitize('<img onerror="alert(\'XSS\')" src="invalid:" />', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><img></div>');
  });

  it('removes non-whitelisted CSS properties', () => {
    expect(
      sanitize('<a style="pointer-events: all;">test</a>', '', {
        id: 'test'
      })
    ).toBe(
      '<div id="test"><a style="" rel="noopener noreferrer">test</a></div>'
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
    expect(sanitize('<b>test</b><svg><rect /></svg>', '', { id: 'test' })).toBe(
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
      '<div id="test"><a href="./redirect?url=https://example.com/" rel="noopener noreferrer"></a></div>'
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
      '<div id="test"><a style="background: url(./redirect?url=https://example.com/image.jpg);" rel="noopener noreferrer"></a></div>'
    );
  });

  it('removes non-whitelisted URL schemas', () => {
    expect(
      sanitize('<a href="ftp://test.com"></a>', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><a rel="noopener noreferrer"></a></div>');

    expect(
      sanitize(
        '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==" />',
        '',
        {
          id: 'test'
        }
      )
    ).toBe('<div id="test"><img></div>');
  });

  it("doesn't remove whitelisted URL schemas", () => {
    expect(
      sanitize('<a href="http://test.com"></a>', '', {
        id: 'test'
      })
    ).toBe(
      '<div id="test"><a href="http://test.com" rel="noopener noreferrer"></a></div>'
    );

    expect(
      sanitize('<img src="https://example.com/img.png" />', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><img src="https://example.com/img.png"></div>');

    expect(
      sanitize('<a href="mailto:test@example.com"></a>', '', {
        id: 'test'
      })
    ).toBe(
      '<div id="test"><a href="mailto:test@example.com" rel="noopener noreferrer"></a></div>'
    );
  });

  it('allows URL schemas specified in allowedSchemas', () => {
    expect(
      sanitize('<a href="http://test.com"></a>', '', {
        id: 'test',
        allowedSchemas: ['http']
      })
    ).toBe(
      '<div id="test"><a href="http://test.com" rel="noopener noreferrer"></a></div>'
    );

    expect(
      sanitize(
        '<img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg==" />',
        '',
        {
          id: 'test',
          allowedSchemas: ['data']
        }
      )
    ).toBe(
      '<div id="test"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAUAAAAFCAYAAACNbyblAAAAHElEQVQI12P4//8/w38GIAXDIBKE0DHxgljNBAAO9TXL0Y4OHwAAAABJRU5ErkJggg=="></div>'
    );
  });

  it('all schemas specified in allowedSchemas are case-insensitive', () => {
    expect(
      sanitize('<a href="HTTP://test.com"></a>', '', {
        id: 'test',
        allowedSchemas: ['http']
      })
    ).toBe(
      '<div id="test"><a href="HTTP://test.com" rel="noopener noreferrer"></a></div>'
    );

    expect(
      sanitize('<a href="http://test.com"></a>', '', {
        id: 'test',
        allowedSchemas: ['HTTP']
      })
    ).toBe(
      '<div id="test"><a href="http://test.com" rel="noopener noreferrer"></a></div>'
    );

    expect(
      sanitize('<a href="htTP://test.com"></a>', '', {
        id: 'test',
        allowedSchemas: ['HTTP']
      })
    ).toBe(
      '<div id="test"><a href="htTP://test.com" rel="noopener noreferrer"></a></div>'
    );

    expect(
      sanitize('<a href="HTtp://test.com"></a>', '', {
        id: 'test',
        allowedSchemas: ['http']
      })
    ).toBe(
      '<div id="test"><a href="HTtp://test.com" rel="noopener noreferrer"></a></div>'
    );
  });

  it('adds rel="noopener noreferrer" to <a> (and only it)', () => {
    expect(
      sanitize('<a></a>', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><a rel="noopener noreferrer"></a></div>');

    expect(
      sanitize('<img />', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><img></div>');
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

  it('moves styles from <head> to <body>', () => {
    expect(
      sanitize(
        '<html><head><style>p {color: red;}</style></head><body></body></html>',
        '',
        {
          id: 'test'
        }
      )
    ).toBe('<div id="test"><style>#test p {color: red;}</style></div>');
  });

  it('removes comments', () => {
    expect(
      sanitize('<div><!-- hello --></div>', '', {
        id: 'test'
      })
    ).toBe('<div id="test"><div></div></div>');
  });

  it('removes wrapper div when noWrapper is enabled', () => {
    expect(
      sanitize('<div class="foo"></div>', '', {
        noWrapper: true
      })
    ).toBe('<div class="foo"></div>');
  });

  it('prefixes ids and classes in CSS', () => {
    expect(
      sanitize(
        `<style>a {background: red !important;}
.test {background: red;}
#test {background: red;}</style>`,
        '',
        { id: 'test' }
      )
    ).toBe(`<div id="test"><style>#test a {background: red !important;}
#test .test_test {background: red;}
#test #test_test {background: red;}</style></div>`);
  });

  it('preserves CSS priority', () => {
    expect(
      sanitize(
        `<style>a {background: red !important;}
b {background: red;}</style>`,
        '',
        { noWrapper: true }
      )
    ).toBe(`<style>a {background: red !important;}
b {background: red;}</style>`);
  });

  it('drops !important when preserveCssPriority is set to false', () => {
    expect(
      sanitize(
        `<style>a {background: red !important;}
b {background: red;}</style>`,
        '',
        { noWrapper: true, preserveCssPriority: false }
      )
    ).toBe(`<style>a {background: red;}
b {background: red;}</style>`);
  });
});
