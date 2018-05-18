/**
 * Functions that generate html strings.
 */

/**
 * Make an attribute list from an object.
 *
 * @param {Object} obj
 * @return {String}
 * Usage: toAttributes({"a": 1, "b": 2}) => 'a="1" b="2"'
 */
function toAttributes(obj) {
  const keys = Object.keys(obj);
  if (keys.length === 0) {
    return "";
  }

  return " " + keys.map(k => {
    return `${k}='${obj[k]}'`;
  }).join(" ");
}

/**
 * Creates a function to generate an html string with the provided element name.
 *
 * @param {String} elem - html element; ex. 'div'
 * @return {Function() -> string} a function that takes optional map with element attributes
 * followed by optional strings and returns a string representing an html element wrapping the
 * argument strings.
 *
 * Usage:
 * let ul = makeGenerator('ul');
 * let li = makeGenerator('li');
 * ul({class: 'nav'}, li(1), li(2)) => "<ul class='nav'><li>1</li><li>2</li></ul>"
 */
function makeGenerator(elem) {
  // Return function;
  return function() {
    let attrs = {};
    let children = arguments;

    if (typeof arguments[0] === 'object') {
      attrs = arguments[0];
      children = Array.prototype.slice.call(arguments, 1);
    }

    let openTag = `<${elem}${toAttributes(attrs)}>` ;
    let str = [openTag].concat(...children);
    str.push(`</${elem}>`);
    return str.join("");
  };
}

export const a = makeGenerator("a");
export const abbr = makeGenerator("abbr");
export const address = makeGenerator("address");
export const area = makeGenerator("area");
export const article = makeGenerator("article");
export const aside = makeGenerator("aside");
export const audio = makeGenerator("audio");
export const b = makeGenerator("b");
export const base = makeGenerator("base");
export const bdi = makeGenerator("bdi");
export const bdo = makeGenerator("bdo");
export const blockquote = makeGenerator("blockquote");
export const body = makeGenerator("body");
export const br = makeGenerator("br");
export const button = makeGenerator("button");
export const canvas = makeGenerator("canvas");
export const caption = makeGenerator("caption");
export const cite = makeGenerator("cite");
export const code = makeGenerator("code");
export const col = makeGenerator("col");
export const colgroup = makeGenerator("colgroup");
export const datalist = makeGenerator("datalist");
export const dd = makeGenerator("dd");
export const del = makeGenerator("del");
export const details = makeGenerator("details");
export const dfn = makeGenerator("dfn");
export const dialog = makeGenerator("dialog");
export const div = makeGenerator("div");
export const dl = makeGenerator("dl");
export const dt = makeGenerator("dt");
export const em = makeGenerator("em");
export const embed = makeGenerator("embed");
export const fieldset = makeGenerator("fieldset");
export const figcaption = makeGenerator("figcaption");
export const figure = makeGenerator("figure");
export const footer = makeGenerator("footer");
export const form = makeGenerator("form");
export const h1 = makeGenerator("h1");
export const h2 = makeGenerator("h2");
export const h3 = makeGenerator("h3");
export const h4 = makeGenerator("h4");
export const h5 = makeGenerator("h5");
export const head = makeGenerator("head");
export const header = makeGenerator("header");
export const hr = makeGenerator("hr");
export const html = makeGenerator("html");
export const i = makeGenerator("i");
export const iframe = makeGenerator("iframe");
export const img = makeGenerator("img");
export const input = makeGenerator("input");
export const ins = makeGenerator("ins");
export const kbd = makeGenerator("kbd");
export const keygen = makeGenerator("keygen");
export const label = makeGenerator("label");
export const legend = makeGenerator("legend");
export const li = makeGenerator("li");
export const link = makeGenerator("link");
export const main = makeGenerator("main");
export const map = makeGenerator("map");
export const mark = makeGenerator("mark");
export const menu = makeGenerator("menu");
export const menuitem = makeGenerator("menuitem");
export const meta = makeGenerator("meta");
export const meter = makeGenerator("meter");
export const nav = makeGenerator("nav");
export const object = makeGenerator("object");
export const ol = makeGenerator("ol");
export const optgroup = makeGenerator("optgroup");
export const option = makeGenerator("option");
export const output = makeGenerator("output");
export const p = makeGenerator("p");
export const param = makeGenerator("param");
export const picture = makeGenerator("picture");
export const pre = makeGenerator("pre");
export const progress = makeGenerator("progress");
export const q = makeGenerator("q");
export const rp = makeGenerator("rp");
export const rt = makeGenerator("rt");
export const s = makeGenerator("s");
export const samp = makeGenerator("samp");
export const script = makeGenerator("script");
export const section = makeGenerator("section");
export const select = makeGenerator("select");
export const small = makeGenerator("small");
export const source = makeGenerator("source");
export const span = makeGenerator("span");
export const strike = makeGenerator("strike");
export const strong = makeGenerator("strong");
export const style = makeGenerator("style");
export const sub = makeGenerator("sub");
export const summary = makeGenerator("summary");
export const sup = makeGenerator("sup");
export const table = makeGenerator("table");
export const tbody = makeGenerator("tbody");
export const td = makeGenerator("td");
export const textarea = makeGenerator("textarea");
export const tfoot = makeGenerator("tfoot");
export const th = makeGenerator("th");
export const thead = makeGenerator("thead");
export const time = makeGenerator("time");
export const title = makeGenerator("title");
export const tr = makeGenerator("tr");
export const track = makeGenerator("track");
export const u = makeGenerator("u");
export const ul = makeGenerator("ul");
export const video = makeGenerator("video");
export const wbr = makeGenerator("wbr");
