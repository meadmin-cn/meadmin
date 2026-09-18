import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { gzipSync } from 'node:zlib';
import { createHash } from 'node:crypto';
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
function pack(files) {const blocks=[];for(const [name,content] of Object.entries(files)){const body=Buffer.from(content);const h=Buffer.alloc(512);h.write('package/'+name);h.write(body.length.toString(8).padStart(11,'0')+'\0',124);h.write('0',156);h.fill(32,148,156);h.write(h.reduce((a,b)=>a+b,0).toString(8).padStart(6,'0')+'\0 ',148);blocks.push(h,body,Buffer.alloc((512-body.length%512)%512));}return gzipSync(Buffer.concat([...blocks,Buffer.alloc(1024)]));}
function execute(root,args){return new Promise(resolve=>{const p=spawn(process.execPath,[fileURLToPath(new URL('../dist/index.js',import.meta.url)),'update',...args],{cwd:root,stdio:['ignore','pipe','pipe']});let text='';p.stdout.on('data',b=>text+=b);p.stderr.on('data',b=>text+=b);p.on('exit',code=>resolve({code,text}));});}
test('命令级：本机registry下载校验，dry-run不写项目，非交互拒绝覆盖',async()=>{
 const root=mkdtempSync(join(tmpdir(),'meadmin-command-'));mkdirSync(join(root,'node_modules/@meadmin/core'),{recursive:true});
 writeFileSync(join(root,'package.json'),JSON.stringify({name:'business',dependencies:{'@meadmin/core':'1.0.0'}}));writeFileSync(join(root,'node_modules/@meadmin/core/package.json'),JSON.stringify({name:'@meadmin/core',version:'1.0.0',main:'index.js'}));writeFileSync(join(root,'node_modules/@meadmin/core/index.js'),'');writeFileSync(join(root,'app.ts'),'old');
 const archives=Object.fromEntries(['1.0.0','1.1.0'].map(v=>[v,pack({'package.json':JSON.stringify({name:'create-meadminjs',version:v}),'template/meadmin/packageTemplate.json':JSON.stringify({name:'meadmin',dependencies:{'@meadmin/core':v}}),'template/meadmin/app.ts':v==='1.0.0'?'old':'new','template/meadmin/meadmin.sql':"CREATE TABLE t(id text PRIMARY KEY); INSERT INTO t(id) VALUES ('x');"})]));
 let origin;const server=createServer((req,res)=>{if(req.url==='/create-meadminjs'){res.setHeader('content-type','application/json');res.end(JSON.stringify({versions:Object.fromEntries(Object.entries(archives).map(([v,body])=>[v,{dist:{tarball:origin+'/'+v,integrity:'sha512-'+createHash('sha512').update(body).digest('base64')}}]))}));}else{const buffer=archives[req.url.slice(1)];res.end(buffer);}});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));origin='http://127.0.0.1:'+server.address().port;
 try {let result=await execute(root,['--dry-run','--registry',origin]);assert.equal(result.code,0,result.text);assert.match(result.text,/1\.0\.0.*1\.1\.0/);assert.equal(readFileSync(join(root,'app.ts'),'utf8'),'old');assert(!existsSync(join(root,'.meadmin')));assert(!existsSync(join(root,'update.sql')));
 result=await execute(root,['--registry',origin]);assert.equal(result.code,1);assert.match(result.text,/交互式终端/);assert.equal(readFileSync(join(root,'app.ts'),'utf8'),'old');
 } finally {await new Promise(resolve=>server.close(resolve));}
});
