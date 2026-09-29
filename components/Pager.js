import Link from 'next/link';
export default function Pager({page,hasNext,makeHref}){
 if(page===1&&!hasNext)return null;
 return <div className="row noprint" style={{margin:'12px 0',alignItems:'center'}}>
  {page>1?<Link className="btn" href={makeHref(page-1)}>‹ Prev</Link>:<button className="btn" disabled>‹ Prev</button>}
  <span className="mut">Page {page}</span>
  {hasNext?<Link className="btn" href={makeHref(page+1)}>Next ›</Link>:<button className="btn" disabled>Next ›</button>}
 </div>}
