const fs=require('fs'),ts=require('typescript'),vm=require('vm'),assert=require('node:assert/strict');
const cache={};function load(name){if(cache[name])return cache[name];const module={exports:{}};const js=ts.transpileModule(fs.readFileSync('lib/'+name+'.ts','utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;vm.runInNewContext(js,{module,exports:module.exports,require:p=>load(p.replace('./','')),URL,Date,Error,Number,Set});return cache[name]=module.exports;}
const {driveFile,validateAssetLink}=load('assets'),{validatePost,seedPosts}=load('marketing'),{postToRow,normalizePost,postFields}=load('post-storage');
const url='https://drive.google.com/file/d/file_123/view?resourcekey=key123';
assert.equal(driveFile(url).download,'https://drive.google.com/uc?export=download&id=file_123&resourcekey=key123');
assert.equal(driveFile('https://drive.google.com/open?id=abc').preview,'https://drive.google.com/file/d/abc/preview');
for(const bad of ['javascript:alert(1)','https://drive.google.com.evil.com/file/d/x/view','https://drive.google.com/drive/folders/abc'])assert.throws(()=>validateAssetLink(bad));
const seed=seedPosts()[0];assert.throws(()=>validatePost({...seed,completedAt:new Date().toISOString()}));
const done=validatePost({...seed,assetUrl:url,assetType:'video',coverUrl:'https://drive.google.com/file/d/cover/view',completedAt:'2026-09-27T05:00:00Z'});
assert.equal(done.status,'Planned');assert.equal(done.completedAt,'2026-09-27T05:00:00Z');
const row=postToRow(done);assert.equal(row.asset_url,url);assert.equal(row.completed_at,done.completedAt);assert.equal(row.posted_time,null);assert.equal(row.contentType,undefined);assert.ok(postFields.includes('assetUrl:asset_url'));assert.equal(normalizePost({...done,postedTime:'12:30:00'}).postedTime,'12:30');assert.equal(normalizePost({...done,postedTime:null}).postedTime,'');
console.log('PASS: Drive links, resource keys, unsafe/folder URL rejection, Done validation, publication independence, and database round-trip fields.');
const {accountName,entryIdentity,manilaTimestamp}=load('entry-details');
assert.equal(accountName('ella',['Ella','Reg']),'Ella');
const identity=entryIdentity(undefined,'ella-uid','Ella','Planned',false,'2026-09-27T05:00:00Z');assert.equal(identity.owners[0],'Ella');assert.equal(identity.createdBy,'ella-uid');
const edited=entryIdentity({...identity,owners:['Ella']},'reg-uid','Reg','For posting',true,'2026-09-27T06:00:00Z');assert.equal(edited.owners[0],'Ella');assert.equal(edited.createdBy,'ella-uid');assert.equal(edited.createdAt,identity.createdAt);assert.equal(edited.completedAt,'2026-09-27T06:00:00Z');
const caption='New PC build ✨🔥\nReady na! 🖥️';const entry=validatePost({...seed,caption,status:'For posting'});assert.equal(postToRow(entry).caption,caption);assert.match(manilaTimestamp('2026-09-27T05:15:00Z'),/1:15 PM/);
console.log('PASS: server-derived owner, edit identity preservation, emoji caption, For posting status, AM/PM Manila timestamp.');
