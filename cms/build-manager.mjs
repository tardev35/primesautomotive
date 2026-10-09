import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const root = new URL('./', import.meta.url);
const read = (name) => JSON.parse(readFileSync(new URL(name, root), 'utf8'));
const clean = (field) => {
  const result = {};
  for (const key of ['name','label','type','required','choices','default_value','min','max','step','rows','instructions']) {
    if (field[key] !== undefined) result[key] = field[key];
  }
  result.label = result.label.replace(' (ACF Pro)', '');
  if (field.type === 'gallery') result.instructions = 'เลือกรูปจาก Media Library ได้หลายภาพ ไม่ต้องใช้ ACF Pro';
  if (field.sub_fields) result.sub_fields = field.sub_fields.map(clean);
  return result;
};
const vehicle = read('acf-vehicle-fields.json');
const content = read('acf-content-fields.json');
const schema = { cars: vehicle[0].fields.map(clean) };
for (const group of content) schema[group.location[0][0].value] = group.fields.map(clean);
const seed = [...read('content-seed.json').records, ...read('car-seed.json').records.map(r => ({...r, post_type:'cars'}))];
for (const [name,data] of [['schema.json',schema],['seed.json',seed]]) {
  writeFileSync(new URL('prom-drive-manager/'+name,root), JSON.stringify(data,null,2)+'\n');
}
console.log('Generated standalone schema + 12 draft seeds in', fileURLToPath(new URL('prom-drive-manager/',root)));
