import { ul, li } from '../js/html';

describe('html generation', () => {

  it('should generate a list', () => {
    const lst = ul(li("one"), li("two"));
    expect(lst).toBe("<ul><li>one</li><li>two</li></ul>");
  });

  it('should generate a list with attributes', () => {
    const lst = ul({'class': 'nav', 'data-attr': 'number-list'}, li({'class': 'selected'}, 'one'), li('two'));
    expect(lst).toBe("<ul class='nav' data-attr='number-list'><li class='selected'>one</li><li>two</li></ul>");
  });

  it('should allow calculated content', () => {
    const data = [1,2,3];
    const lst = ul(...data.map(n => { return li(n); }));
    expect(lst).toBe("<ul><li>1</li><li>2</li><li>3</li></ul>");
  });
});
