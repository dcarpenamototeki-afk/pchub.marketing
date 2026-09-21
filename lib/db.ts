import { env } from 'cloudflare:workers';
export function db(){const binding=(env as unknown as {DB:D1Database}).DB;if(!binding)throw Error('Database unavailable');return binding;}
