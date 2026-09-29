import {scryptSync,randomBytes,timingSafeEqual} from 'crypto';
export const hashPw=p=>{const s=randomBytes(16).toString('hex');return s+':'+scryptSync(p,s,32).toString('hex')};
export const checkPw=(p,h)=>{const [s,k]=h.split(':');return timingSafeEqual(scryptSync(p,s,32),Buffer.from(k,'hex'))};
