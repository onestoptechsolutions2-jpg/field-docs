import {publicKey} from '@/lib/push';
export const dynamic='force-dynamic';
export async function GET(){return Response.json({key:await publicKey()})}
