// Shared, deliberately small Markdown renderer. Raw HTML is always text.
export const journalEscape=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export function journalInline(value){
 const escaped=journalEscape(value),tokens=[];
 const linked=escaped.replace(/\[([^\]\n]+)\]\((https?:\/\/[^\s)]+)\)/g,(_,label,url)=>{
  tokens.push(`<a href="${url}" rel="noopener noreferrer">${label}</a>`);return '\u0000'+(tokens.length-1)+'\u0000';
 });
 return linked.replace(/`([^`\n]+)`/g,'<code>$1</code>').replace(/\*\*([^*\n]+)\*\*/g,'<strong>$1</strong>').replace(/\*([^*\n]+)\*/g,'<em>$1</em>').replace(/\u0000(\d+)\u0000/g,(_,i)=>tokens[Number(i)]||'');
}
export function journalMarkdown(text){
 const lines=String(text||'').replace(/\r/g,'').split('\n');let html='',paragraph=[],list=[],code=null;
 const flush=()=>{if(paragraph.length){html+='<p>'+journalInline(paragraph.join('\n')).replaceAll('\n','<br>')+'</p>';paragraph=[];}if(list.length){html+='<ul>'+list.map(x=>'<li>'+journalInline(x)+'</li>').join('')+'</ul>';list=[];}};
 for(const line of lines){
  if(line.startsWith('```')){flush();if(code!==null){html+='<pre><code>'+journalEscape(code.join('\n'))+'</code></pre>';code=null;}else code=[];continue;}
  if(code!==null){code.push(line);continue;}
  if(!line.trim()){flush();continue;}
  const heading=line.match(/^(#{1,3}) (.+)$/);if(heading){flush();const level=Math.min(4,heading[1].length+1);html+=`<h${level}>${journalInline(heading[2])}</h${level}>`;continue;}
  if(line.startsWith('> ')){flush();html+='<blockquote>'+journalInline(line.slice(2))+'</blockquote>';continue;}
  if(line.startsWith('- ')){if(paragraph.length)flush();list.push(line.slice(2));continue;}
  if(list.length)flush();paragraph.push(line);
 }
 flush();if(code!==null)html+='<pre><code>'+journalEscape(code.join('\n'))+'</code></pre>';return html;
}
