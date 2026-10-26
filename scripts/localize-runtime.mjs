import { parse } from 'acorn';

const languages = ['pl', 'ru', 'uk', 'en'];
const crossLanguage = new Set(['LANG_CONFIG', 'bannerTexts']);

// These records are consumed in the current document language. Language-picker
// and browser-language suggestion records must retain every destination.
export function localizeRuntime(source, locale, {service,hasReviews=true}={}) {
  if (!languages.includes(locale)) throw new Error(`Unsupported runtime locale: ${locale}`);
  const ast = parse(source, {ecmaVersion:'latest',sourceType:'script'});
  const edits=[];
  function visit(node,parent) {
    if (!node || typeof node!=='object') return;
    const reviewFunctions=['initReviewsSlider','initInteractiveStars','initReviewModal'];
    if (!hasReviews && ((node.type==='FunctionDeclaration' && reviewFunctions.includes(node.id.name)) ||
      (node.type==='ExpressionStatement' && node.expression.type==='CallExpression' && reviewFunctions.includes(node.expression.callee.name)))) {
      edits.push({start:node.start,end:node.end,text:''});return;
    }
    if (node.type==='ObjectExpression' && node.properties.length===4) {
      const properties=node.properties;
      const keys=properties.map(p=>!p.computed && p.type==='Property' ? p.key.name || p.key.value : null);
      const name=parent?.type==='VariableDeclarator' ? parent.id.name : '';
      if (languages.every(lang=>keys.includes(lang)) && !crossLanguage.has(name)) {
        const keep=properties.filter((p,index)=>keys[index]===locale || keys[index]==='pl');
        const text=name==='INTENT_VARIANTS' && service!==undefined
          ? '{'+keep.map(p=>JSON.stringify(p.key.name || p.key.value)+':{'+p.value.properties.filter(v=>(v.key.name || v.key.value)===service).map(v=>source.slice(v.start,v.end)).join(',')+'}').join(',')+'}'
          : '{'+keep.map(p=>source.slice(p.start,p.end)).join(',')+'}';
        edits.push({start:node.start,end:node.end,text});
        return;
      }
    }
    for(const value of Object.values(node)) {
      if(Array.isArray(value))value.forEach(child=>visit(child,node));
      else if(value && typeof value==='object')visit(value,node);
    }
  }
  visit(ast,null);
  for(const edit of edits.sort((a,b)=>b.start-a.start)) source=source.slice(0,edit.start)+edit.text+source.slice(edit.end);
  return source;
}
