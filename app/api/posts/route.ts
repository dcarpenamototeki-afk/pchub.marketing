import {db} from '../../../lib/db';
import {seedPosts,validatePost} from '../../../lib/marketing';
export async function GET(){try{const database=db();await database.batch(seedPosts().map(p=>database.prepare('INSERT OR IGNORE INTO posts (id,data) VALUES (?,?)').bind(p.id,JSON.stringify(p))));const result=await database.prepare('SELECT data FROM posts').all<{data:string}>();return Response.json(result.results.map(r=>JSON.parse(r.data)),{headers:{'Cache-Control':'no-store'}});}catch(e){console.error(e);return Response.json({error:'Could not load the shared workspace. Please retry.'},{status:503});}}
export async function POST(request:Request){
 if(request.headers.get('origin')!==new URL(request.url).origin)return Response.json({error:'Invalid origin'},{status:403});
 let post;try{post=validatePost(await request.json());}catch(e){return Response.json({error:e instanceof Error?e.message:'Invalid post'},{status:400});}
 try{await db().prepare('INSERT INTO posts (id,data) VALUES (?,?) ON CONFLICT(id) DO UPDATE SET data=excluded.data').bind(post.id,JSON.stringify(post)).run();return Response.json(post);}catch(e){console.error(e);return Response.json({error:'Could not save. Your edits are still here; please retry.'},{status:503});}
}
