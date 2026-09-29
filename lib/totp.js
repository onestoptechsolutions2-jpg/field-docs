import {createHmac,randomBytes} from 'crypto';
const B32='ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function genSecret(){const b=randomBytes(20);let bits='',out='';for(const byte of b)bits+=byte.toString(2).padStart(8,'0');for(let i=0;i+5<=bits.length;i+=5)out+=B32[parseInt(bits.slice(i,i+5),2)];return out}
function b32decode(s){s=(s||'').replace(/=+$/,'').toUpperCase();let bits='';for(const c of s){const v=B32.indexOf(c);if(v<0)continue;bits+=v.toString(2).padStart(5,'0')}const bytes=[];for(let i=0;i+8<=bits.length;i+=8)bytes.push(parseInt(bits.slice(i,i+8),2));return Buffer.from(bytes)}
function hotp(key,counter){const buf=Buffer.alloc(8);buf.writeBigInt64BE(BigInt(counter));const h=createHmac('sha1',key).update(buf).digest();const o=h[h.length-1]&0xf;
 const code=((h[o]&0x7f)<<24|(h[o+1]&0xff)<<16|(h[o+2]&0xff)<<8|(h[o+3]&0xff))%1e6;return String(code).padStart(6,'0')}
export function verifyTotp(secret,code){if(!/^\d{6}$/.test(String(code||'').trim()))return false;const key=b32decode(secret),t=Math.floor(Date.now()/30000);
 for(const d of [-1,0,1])if(hotp(key,t+d)===String(code).trim())return true;return false}
export const otpauth=(email,secret)=>`otpauth://totp/FieldDocs:${encodeURIComponent(email)}?secret=${secret}&issuer=FieldDocs&digits=6&period=30`;
