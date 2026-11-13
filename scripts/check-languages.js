// Dependency-free behavior tests with a small DOM fixture built from the real HTML.
// Native dialog focus trapping, actual font rendering and layout need browser QA.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const code = fs.readFileSync(path.join(root, 'script.js'), 'utf8');
const dictionary = fs.readFileSync(path.join(root, 'translations.js'), 'utf8');
function fixture(saved, blocked = false) {
  const events = new Map();
  function element() {
    const attributes = {};
    const classes = new Set();
    return { dataset: {}, textContent: '', value: '', content: '', open: false,
      setAttribute(k,v) { attributes[k] = v; }, getAttribute(k) { return attributes[k]; },
      addEventListener(name, fn) { events.set(this.id + ':' + name, fn); },
      classList: { remove: k => classes.delete(k), toggle(k, on) { on ? classes.add(k) : classes.delete(k); } },
      focus() { this.focused = true; }, showModal() { this.open = true; }, close() { this.open = false; }
    };
  }
  const nodes = {};
  for (const id of ['.menu-toggle','#navigation','#year','#language-dialog','#language-form','#language-switcher',
    'script[type="application/ld+json"]','meta[name="description"]','meta[property="og:title"]',
    'meta[property="og:description"]','meta[property="og:image:alt"]']) {
    nodes[id] = element(); nodes[id].id = id;
  }
  nodes['.menu-toggle'].setAttribute('aria-expanded','false');
  nodes['#language-form'].elements = { language: { value: 'en' } };
  nodes['script[type="application/ld+json"]'].textContent = html.match(/<script type="application\/ld\+json">(.*?)<\/script>/s)[1];
  const groups = { '[data-i18n]': [], '[data-i18n-alt]': [], '[data-i18n-aria-label]': [] };
  for (const match of html.matchAll(/data-i18n(?:-alt|-aria-label)?="[^"]+"/g)) {
    const [, attr, key] = match[0].match(/([^=]+)="([^"]+)"/);
    const node = element(); node.setAttribute(attr,key);
    if (attr === 'data-i18n') node.dataset.i18n = key;
    groups['['+attr+']'].push(node);
  }
  const document = { documentElement: {}, title: '',
    querySelector: selector => nodes[selector] || null,
    querySelectorAll: selector => groups[selector] || [],
    createElement: element,
    head: { append(node) { nodes['meta[property="og:locale"]'] = node; } },
    addEventListener(name,fn) { events.set('document:'+name,fn); }
  };
  const storage = new Map(saved ? [['adam-tailors-language',saved]] : []);
  const context = vm.createContext({document,window:{},Date,localStorage:{
    getItem(k) { if(blocked)throw Error('blocked'); return storage.get(k)||null; },
    setItem(k,v) { if(blocked)throw Error('blocked');storage.set(k,v); }
  }});
  vm.runInContext(dictionary,context);
  const dictionaries = context.window.translations;
  const keys = Object.keys(dictionaries.en).sort();
  for (const lang of ['en','ar','ti']) {
    assert.deepEqual(Object.keys(dictionaries[lang]).sort(),keys);
    for (const value of Object.values(dictionaries[lang])) assert.equal(typeof value,'string');
    for (const group of Object.values(groups)) for(const node of group) {
      const key = node.dataset.i18n || node.getAttribute('data-i18n-alt') || node.getAttribute('data-i18n-aria-label');
      assert.ok(dictionaries[lang][key],`${lang} missing ${key}`);
    }
  }
  vm.runInContext(code,context);
  function fire(id,event,payload={}) { events.get(id+':'+event)(payload); }
  return {nodes,document,storage,fire,groups};
}
let f=fixture();
assert.equal(f.document.documentElement.lang,'en');
assert.equal(f.nodes['#language-dialog'].open,true);
assert.equal(f.nodes['#language-form'].elements.language.value,'en');
assert.equal(f.nodes['#language-switcher'].value,'en');
let cancelled=false;f.fire('#language-dialog','cancel',{preventDefault(){cancelled=true;}});assert.ok(cancelled);
f.nodes['#language-form'].elements.language.value='ar';f.fire('#language-form','change');
assert.equal(f.document.documentElement.dir,'rtl');assert.equal(f.document.documentElement.lang,'ar');
assert.equal(f.storage.size,0); // Previewing a choice is saved only by Continue.
f.fire('#language-form','submit',{preventDefault(){}});
assert.equal(f.nodes['#language-dialog'].open,false);assert.ok(f.nodes['#language-switcher'].focused);
assert.equal(f.storage.get('adam-tailors-language'),'ar');
f=fixture(f.storage.get('adam-tailors-language'));assert.equal(f.nodes['#language-dialog'].open,false);
assert.equal(f.document.documentElement.lang,'ar');assert.equal(f.document.documentElement.dir,'rtl');
f.nodes['#language-switcher'].value='ti';f.fire('#language-switcher','change');
assert.equal(f.document.documentElement.lang,'ti');assert.equal(f.document.documentElement.dir,'ltr');
assert.ok(f.document.title.includes('ስፌት'));assert.equal(f.storage.get('adam-tailors-language'),'ti');
f=fixture('ti');assert.equal(f.document.documentElement.lang,'ti');assert.equal(f.nodes['#language-dialog'].open,false);
f.nodes['#language-switcher'].value='en';f.fire('#language-switcher','change');
assert.equal(f.document.title,'Adam Tailors | Tailoring and Alterations in Salford');
f.fire('.menu-toggle','click');assert.equal(f.nodes['.menu-toggle'].getAttribute('aria-expanded'),'true');
f.fire('document','keydown',{key:'Escape'});assert.equal(f.nodes['.menu-toggle'].getAttribute('aria-expanded'),'false');
for(const saved of [null,'invalid']) {
 f=fixture(saved,true);assert.equal(f.document.documentElement.lang,'en');
 f.nodes['#language-form'].elements.language.value='ti';f.fire('#language-form','change');
 f.fire('#language-form','submit',{preventDefault(){}});assert.equal(f.nodes['#language-dialog'].open,false);
}
console.log('PASS: complete translation keys; first visit; chooser preview/Continue; header switching; remembered Arabic/Tigrinya; RTL/LTR; metadata; storage failure; menu Escape.');
