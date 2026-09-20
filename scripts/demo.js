import { mkdir,writeFile } from 'node:fs/promises';
import { bundle } from '../tests/fixtures/repos.js';
import { main } from '../src/cli.js';
await mkdir('work/demo',{recursive:true});await writeFile('work/demo/bundle.json',JSON.stringify(bundle(100)));
await main(['analyze','--input','work/demo/bundle.json','--fixture','--root','work/demo']);
await main(['build','--root','work/demo','--output','work/demo/site','--fixture']);
