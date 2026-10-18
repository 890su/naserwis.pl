// Resize/encode the approved image_gen originals without changing their content.
import sharp from 'sharp';
import {readFile, writeFile} from 'node:fs/promises';
const input='outputs/imagegen/no-internet-red-v2-2026-10-18';
const output='public/assets/redesign';
for(const name of ['no-internet-pl','no-internet-ru','no-internet-uk','no-internet-en','rj45-installation','no-internet-led-off']){
 for(const width of [640,1200]){
  for(const format of name.endsWith('led-off')?['webp']:['avif','webp']){
   await sharp(`${input}/${name}.png`).resize({width}).toFormat(format,{quality:format==='avif'?65:85}).toFile(`${output}/${name}-20261018-${width}.${format}`);
  }
 }
}
const provenance=JSON.parse(await readFile(input+'/prompts.json','utf8'));
provenance.status='Approved homepage illustrations, 18 October 2026';
provenance.production={prefix:'/assets/redesign/',version:'20261018',widths:[640,1200],formats:['avif','webp'],animation:'Generated LED-off frame, clipped to the Internet LED; CSS opacity only'};
await writeFile(output+'/home-tasks-20261018.json',JSON.stringify(provenance,null,2)+'\n');
console.log('Prepared localized fault illustrations, shared RJ45 installation and LED-off overlay.');
