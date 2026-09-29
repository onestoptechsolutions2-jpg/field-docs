export const GET=()=>new Response(null,{status:302,headers:{Location:'/login','Set-Cookie':'sid=; Path=/; Max-Age=0'}});
