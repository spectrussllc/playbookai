import { useState, useEffect, useRef, useCallback } from "react";

/* ═══════════════════════════════════════════════════════════════════════════
   PLAYBOOKAI PRO — Complete Platform (Fixed)
   Root cause fixed: all sub-components hoisted to module scope.
   Components that had useState (LocationModal, ShareModal, ReviewsView)
   are now proper top-level components receiving props — no hook violations.
═══════════════════════════════════════════════════════════════════════════ */

async function dbGet(k){try{const v=localStorage.getItem(k);return v?JSON.parse(v):null;}catch{return null;}}
async function dbSet(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch{}}

const SEED_LOCS=[
  {id:"loc1",name:"Downtown Flagship",address:"142 Main St, Chattanooga, TN 37402",phone:"(423) 555-0101",manager:"James Whitfield",active:true},
  {id:"loc2",name:"Northside",address:"890 Hixson Pike, Chattanooga, TN 37343",phone:"(423) 555-0182",manager:"Dana Cruz",active:true},
  {id:"loc3",name:"East Ridge",address:"3301 Ringgold Rd, East Ridge, TN 37412",phone:"(423) 555-0234",manager:"Marcus Webb",active:true},
  {id:"loc4",name:"Hamilton Place",address:"2100 Hamilton Place Blvd, Chattanooga, TN 37421",phone:"(423) 555-0390",manager:"Priya Nair",active:true},
];
const SEED_SOPS=[
  {id:"s1",title:"Opening Shift Checklist",role:"Location Manager",industry:"Auto Services",locations:["loc1","loc2","loc3","loc4"],status:"active",created:"2025-02-01",version:2,acks:{loc1:["James Whitfield"],loc2:["Dana Cruz"],loc3:["Marcus Webb"],loc4:["Priya Nair"]},
   body:"PURPOSE\nEnsure every location opens consistently and customer-ready by 8:00 AM.\n\nSCOPE\nAll Location Managers and Assistant Managers.\n\nSTEP-BY-STEP PROCEDURE\n\nOpening Sequence (7:30-8:00 AM)\n\n1. ARRIVE 30 minutes before opening.\n2. DISARM security using your personal code.\n3. WALK the exterior and note any damage or hazards.\n4. UNLOCK all entry points and verify rear exit.\n5. TURN ON all lights and exterior signage.\n6. CHECK all equipment — computers, POS, phone system.\n7. INSPECT waiting area — clean, stocked, presentable.\n8. VERIFY bays are clear and tools are organized.\n9. CONFIRM all staff arrivals before opening.\n10. OPEN registers and verify opening cash balance.\n11. POST opening confirmation on team chat.\n\nEXCEPTION HANDLING\n- Equipment failure: Tag out of service. Notify owner if operations are impacted.\n- Staff no-show: Contact within 10 min. Notify owner at 15 min.\n- Security incident: Do not enter. Call 911 then owner.\n\nDOCUMENTATION\nComplete and sign Opening Checklist form. No exceptions.\n\nACKNOWLEDGMENT\nAll managers must re-acknowledge on each update."},
  {id:"s2",title:"Customer Complaint Protocol",role:"All Staff",industry:"Auto Services",locations:["loc1","loc2","loc3","loc4"],status:"active",created:"2025-02-10",version:1,acks:{loc1:["James Whitfield"],loc2:["Dana Cruz"],loc3:[],loc4:["Priya Nair"]},
   body:"PURPOSE\nResolve customer complaints consistently and convert dissatisfied customers into loyal ones.\n\nSCOPE\nEvery team member who interacts with customers.\n\nCORE RULE\nNever argue. Never deflect. Never make promises you cannot keep.\n\nSTEP-BY-STEP PROCEDURE\n\nPhase 1: De-escalation (First 60 Seconds)\n1. STOP what you are doing and give full attention.\n2. LISTEN without interrupting — let them finish.\n3. ACKNOWLEDGE with empathy before doing anything else.\n4. NEVER say: That is our policy, or I cannot do that.\n\nPhase 2: Assessment\n5. ASK clarifying questions to understand the full issue.\n6. DETERMINE if this is a service, product, or expectation issue.\n7. CHECK customer history in POS before offering any resolution.\n\nPhase 3: Resolution\n8. SERVICE ERRORS — Offer to redo the service at no charge.\n9. PRODUCT ISSUES — Exchange within 30 days if unused.\n10. ESCALATE to manager if resolution exceeds $50 in value.\n\nPhase 4: Close and Document\n11. CONFIRM customer satisfaction before they leave.\n12. LOG the complaint within 1 hour of the incident.\n13. FOLLOW UP — Manager calls within 24 hours for escalated cases.\n\nDOCUMENTATION\nComplaint Log — complete within 1 hour.\n\nACKNOWLEDGMENT\nRe-acknowledge annually or whenever this SOP is updated."},
  {id:"s3",title:"New Hire Onboarding (5-Day)",role:"Location Manager",industry:"Auto Services",locations:["loc1","loc2","loc3","loc4"],status:"active",created:"2025-01-20",version:3,acks:{loc1:["James Whitfield"],loc2:["Dana Cruz"],loc3:["Marcus Webb"],loc4:["Priya Nair"]},
   body:"PURPOSE\nGet every new team member fully operational within 5 days without requiring owner involvement.\n\nSCOPE\nLocation Manager responsible for all new hires at their location.\n\nPRE-ARRIVAL (Day Before)\n- Workspace set up and clean\n- Login credentials created in all systems\n- PlaybookAI access granted with role SOPs assigned\n- Team notified of new hire name and start date\n\nDAY 1 — ORIENTATION\n- Welcome walk and full facility tour\n- Team introductions\n- Safety briefing — exits, first aid, incident reporting\n- Complete I-9, W-4, and any state-required forms\n- PlaybookAI walkthrough — show how to read and acknowledge SOPs\n\nDAYS 2-3 — ROLE TRAINING\n- Shadow experienced team member for full shift\n- Review and acknowledge all role-specific SOPs\n- Practice key tasks with direct supervision\n\nDAY 4 — SUPERVISED SOLO\n- New hire performs duties independently, manager observes\n- Correct any errors in real-time — do not wait until end of shift\n\nDAY 5 — SIGN-OFF\n- Complete New Hire Competency Checklist\n- New hire signs SOP Acknowledgment form\n- Schedule 30-day check-in on calendar\n- Notify owner that onboarding is complete\n\nACKNOWLEDGMENT\nManager must sign off the Day 5 checklist before new hire works unsupervised."},
];
const SEED_STAFF={loc1:["James Whitfield","Tyler Marsh","Keisha Brown","Connor O'Neill"],loc2:["Dana Cruz","Alexis Turner","Reuben Hart"],loc3:["Marcus Webb","Sofia Lin","Devon Parks","Amara Osei"],loc4:["Priya Nair","Brett Langley","Mei Tanaka"]};

function genReviews(){
  const T=[
    {text:"Absolutely the best experience at any auto shop. Transparent, efficient, price exactly as quoted.",rating:5,platform:"google"},
    {text:"Good service but waited 45 minutes past my appointment. Work was solid, communication needs work.",rating:3,platform:"yelp"},
    {text:"Marcus and his team went above and beyond. Called with updates twice and caught an issue I didn't know about.",rating:5,platform:"google"},
    {text:"Disappointed. Charged for a part I didn't need — confirmed by a second opinion. Lost my trust completely.",rating:1,platform:"yelp"},
    {text:"Clean waiting area, friendly staff, quick turnaround. Treated my car like their own.",rating:5,platform:"facebook"},
    {text:"Average experience. Nothing stood out. Prices were fair. Might return for routine work.",rating:3,platform:"tripadvisor"},
    {text:"Third visit and it keeps getting better. Staff remembered my name and car history.",rating:5,platform:"google"},
    {text:"Car came back with a scratch that wasn't there before. Manager was dismissive when I brought it up.",rating:2,platform:"yelp"},
    {text:"Fast and honest. Told me I didn't need the service I came in for and saved me $200.",rating:5,platform:"google"},
    {text:"Scheduling is a nightmare. Took 3 calls to reach someone. Fix the booking system.",rating:2,platform:"facebook"},
    {text:"Outstanding from start to finish. Explained everything clearly, no upselling, car ready ahead of schedule.",rating:5,platform:"google"},
    {text:"Consistent quality on both visits. Priya at front desk is especially helpful and professional.",rating:4,platform:"yelp"},
  ];
  const N=["Sarah T.","Mike R.","Jennifer L.","David K.","Amanda W.","Chris P.","Lisa M.","Robert J.","Emily C.","Jason B.","Maria H.","Tom A."];
  const L=["loc1","loc2","loc3","loc4"];
  const DA=[0,1,1,2,3,4,5,6,7,8,10,12];
  return T.map((t,i)=>{const d=new Date();d.setDate(d.getDate()-DA[i]);return{id:`r${i}`,...t,author:N[i],date:d.toISOString(),locationId:L[i%4],responded:i%4===0,aiResponse:null};});
}

const SEED_ALERTS=[
  {id:"a1",type:"negative_review",title:"New 1-Star Review — Yelp",body:'David K. left a 1-star review at East Ridge: "Charged for a part I did not need..."',locationId:"loc3",severity:"high",read:false,timestamp:new Date(Date.now()-7200000).toISOString()},
  {id:"a2",type:"negative_review",title:"New 2-Star Review — Yelp",body:'Robert J. left a 2-star review at Downtown Flagship: "Car came back with a scratch..."',locationId:"loc1",severity:"high",read:false,timestamp:new Date(Date.now()-86400000).toISOString()},
  {id:"a3",type:"ack_reminder",title:"SOP Acknowledgment Overdue",body:"Customer Complaint Protocol: East Ridge has 0% acknowledgment — 4 staff pending.",locationId:"loc3",severity:"medium",read:false,timestamp:new Date(Date.now()-172800000).toISOString()},
  {id:"a4",type:"positive_review",title:"New 5-Star Review — Google",body:'Maria H. left a 5-star review at Hamilton Place: "Outstanding service from start to finish..."',locationId:"loc4",severity:"low",read:true,timestamp:new Date(Date.now()-259200000).toISOString()},
  {id:"a5",type:"sop_update",title:"SOP Updated — Action Required",body:"Opening Shift Checklist (v2) updated. All managers must re-acknowledge by end of week.",locationId:null,severity:"medium",read:true,timestamp:new Date(Date.now()-432000000).toISOString()},
];

const ONBOARDING_EMAILS=[
  {day:0,label:"Welcome",subject:"Welcome to PlaybookAI — here's how to get the most out of day 1",body:"Hi [First Name],\n\nWelcome to PlaybookAI. You are in the right place.\n\nHere's what to do in the next 30 minutes:\n\nSTEP 1 — Build your first SOP\nHead to the Generator tab. Pick the process that causes the most inconsistency. Opening Shift Checklist and Customer Complaint Protocol are what most operators build first.\n\nSTEP 2 — Assign it to your locations\nOnce generated, assign the SOP to each location and role that needs it. Your managers can see and acknowledge it immediately.\n\nSTEP 3 — Check Review Intelligence\nSee what your customers are saying across Google, Yelp, Facebook, and TripAdvisor — all in one place.\n\nTalk soon,\nThe PlaybookAI Team"},
  {day:1,label:"Day 1",subject:"The one SOP that prevents 80% of location problems",body:"Hi [First Name],\n\nIf you could only build one SOP, it would be the Opening Shift Checklist.\n\nMost location inconsistencies trace back to how the day starts. A manager who opens correctly sets the tone for every customer interaction that day.\n\nBuild it now — 90 seconds in the Generator. Assign to all locations. Done.\n\nTomorrow: the SOP that directly reduces your refund rate.\n\n— PlaybookAI Team"},
  {day:3,label:"Day 3",subject:"This SOP will cut your refund rate",body:"Hi [First Name],\n\nRefunds and one-star reviews usually share the same root cause: a complaint not handled correctly in the first 60 seconds.\n\nThe Customer Complaint Protocol SOP fixes that. One operator saw a 60% drop in escalated complaints within 45 days of implementing it across four locations.\n\nBuild it in the Generator. Two minutes.\n\n— PlaybookAI Team"},
  {day:5,label:"Day 5",subject:"Your managers are waiting for this (they just don't know it)",body:"Hi [First Name],\n\nGood managers don't resist SOPs — they want them. Documentation removes ambiguity, protects them from blame, and gives them something to train new staff with.\n\nCheck the Acknowledgment Tracker and see which locations are on track.\n\n— PlaybookAI Team"},
  {day:7,label:"Day 7",subject:"Are your reviews hurting you right now?",body:"Hi [First Name],\n\nThe Review Intelligence tab shows every recent review across all platforms in one feed, with per-location breakdowns and unresponded negatives flagged.\n\nUnresponded negative reviews reduce conversion by up to 18%. PlaybookAI drafts the response for you — ready to copy and paste.\n\n— PlaybookAI Team"},
  {day:10,label:"Day 10",subject:"You're 3 days from the end of your trial",body:"Hi [First Name],\n\nYour 14-day free trial ends in 3 days.\n\nIf you have built at least 5 SOPs and assigned them, you already feel the difference. If not — today is the day.\n\nOperator plan starts at $297/mo. No contract. Cancel anytime.\n\n— PlaybookAI Team"},
  {day:13,label:"Day 13",subject:"Last one (then I'll leave you alone)",body:"Hi [First Name],\n\nOne honest question: when you're not at a location, do you know with certainty that it's running the way you'd run it?\n\nNot hope. Not assume. Know.\n\nIf the answer is no, that gap is costing you money every single week.\n\nPlaybookAI is $297/mo. For most operators it replaces one re-do or one bad-hire cost in the first 30 days.\n\n— PlaybookAI Team\n\nP.S. Reply with 'extend' for a free 7-day extension."},
];

const INDUSTRIES=["Auto Services","Fitness & Gym","Food Service / Restaurant","Home Services","Retail","Healthcare / Medspa","Childcare","Real Estate / Property Management","Logistics","Other"];
const ROLES=["Location Manager","Assistant Manager","Front Desk / Reception","Sales Associate","Technician / Specialist","Kitchen Staff","Trainer / Coach","Maintenance","All Staff"];
const TONES=["Formal & Procedural","Direct & Casual","Detailed & Comprehensive","Short & Scannable"];

const fmtDate=d=>new Date(d).toLocaleDateString("en-US",{month:"short",day:"numeric",year:"numeric"});
const fmtTime=d=>{const diff=Math.floor((Date.now()-new Date(d))/60000);if(diff<60)return diff+"m ago";if(diff<1440)return Math.floor(diff/60)+"h ago";return Math.floor(diff/1440)+"d ago";};
const avgRat=arr=>arr.length?(arr.reduce((a,b)=>a+b,0)/arr.length).toFixed(1):"0.0";
const pIcon=p=>({google:"🔵",yelp:"🔴",facebook:"🟦",tripadvisor:"🟢"}[p]||"⚪");
const pName=p=>({google:"Google",yelp:"Yelp",facebook:"Facebook",tripadvisor:"TripAdvisor"}[p]||p);
const sevColor=s=>({high:"var(--rust)",medium:"var(--amber)",low:"var(--green)"}[s]||"var(--dim)");
const aIcon=t=>({negative_review:"⚠",positive_review:"⭐",ack_reminder:"📋",sop_update:"🔄"}[t]||"🔔");

/* ── STARS (module-level component) ── */
function Stars({n,size}){
  return <span>{Array.from({length:5},(_,i)=><span key={i} style={{color:i<Math.round(n)?"#e8a020":"#3a3840",fontSize:size||"0.85rem"}}>★</span>)}</span>;
}

/* ── SOP BODY (module-level, no hooks) ── */
function SopBody({text}){
  if(!text)return null;
  return(
    <div className="sop-body">
      {text.split("\n").map((line,i)=>{
        if(/^[A-Z][A-Z\s&\/\-()]{3,}$/.test(line.trim())&&line.trim().length<65)return<h2 key={i}>{line}</h2>;
        if(/^(Phase \d|Step \d|Day \d|Pre-|Post-)/.test(line.trim())&&line.length<80)return<h3 key={i}>{line}</h3>;
        return<span key={i}>{line}{"\n"}</span>;
      })}
    </div>
  );
}

/* ── LOCATION MODAL (module-level, has useState — safe here) ── */
function LocationModal({data,staff,setStaff,onSave,onClose}){
  const isEdit=!!data;
  const [form,setForm]=useState(isEdit?{...data}:{id:"loc"+Date.now(),name:"",address:"",phone:"",manager:"",active:true});
  const [ns,setNs]=useState("");
  const ls=staff[form.id]||[];
  function add(){if(!ns.trim())return;setStaff(p=>({...p,[form.id]:[...(p[form.id]||[]),ns.trim()]}));setNs("");}
  function rem(n){setStaff(p=>({...p,[form.id]:(p[form.id]||[]).filter(x=>x!==n)}));}
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><div className="modal-title">{isEdit?"Edit Location":"Add Location"}</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          {["name","address","phone","manager"].map(f=>(
            <div key={f} className="form-group">
              <label className="form-label">{f.charAt(0).toUpperCase()+f.slice(1)}</label>
              <input className="form-input" value={form[f]||""} placeholder={"Enter "+f} onChange={e=>setForm(p=>({...p,[f]:e.target.value}))}/>
            </div>
          ))}
          <div className="form-group">
            <label className="form-label">Staff Members</label>
            <div style={{display:"flex",gap:"0.45rem",marginBottom:"0.45rem"}}>
              <input className="form-input" value={ns} placeholder="Add staff name" onChange={e=>setNs(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
              <button className="btn btn-ghost btn-sm" onClick={add}>Add</button>
            </div>
            <div className="chips">{ls.map(n=><div key={n} className="chip selected" style={{display:"flex",alignItems:"center",gap:"0.3rem"}} onClick={()=>rem(n)}>{n} ✕</div>)}</div>
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Cancel</button>
          <button className="btn btn-primary btn-sm" onClick={()=>onSave(form,isEdit)}>Save</button>
        </div>
      </div>
    </div>
  );
}

/* ── SHARE MODAL (module-level, no hooks) ── */
function ShareModal({sop,getLocName,onExportPDF,onClose,showToast}){
  const link="https://app.playbookai.com/sop/"+sop.id+"?v="+(sop.version||1)+"&share=true";
  return(
    <div className="modal-overlay" onClick={e=>e.target===e.currentTarget&&onClose()}>
      <div className="modal">
        <div className="modal-header"><div className="modal-title">Share SOP</div><button className="modal-close" onClick={onClose}>✕</button></div>
        <div className="modal-body">
          <div style={{fontSize:"0.82rem",color:"var(--mid)",lineHeight:1.6}}>Share this link for read-only access. Recipients can view and acknowledge without a full account.</div>
          <div>
            <div className="form-label" style={{marginBottom:"0.35rem"}}>Shareable Link</div>
            <div className="share-box">
              <div className="share-url">{link}</div>
              <button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(link);showToast("Link copied!");}}>Copy</button>
            </div>
          </div>
          <div style={{fontSize:"0.74rem",color:"var(--dim)"}}>Read-only · Version {sop.version||1} · Never expires</div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
          <button className="btn btn-primary btn-sm" onClick={()=>{onExportPDF(sop);onClose();}}>Export PDF Instead</button>
        </div>
      </div>
    </div>
  );
}

/* ── REVIEWS VIEW (module-level, has useState — safe here) ── */
function ReviewsView({reviews,reviewFilter,setReviewFilter,locations,getLocName,genRespId,generateReviewResponse,showToast}){
  const [filterLoc,setFilterLoc]=useState("all");
  const [sortBy,setSortBy]=useState("recent");
  const ps=p=>{const f=p==="all"?reviews:reviews.filter(r=>r.platform===p);return{count:f.length,avg:avgRat(f.map(r=>r.rating)),neg:f.filter(r=>r.rating<=2).length};};
  let base=reviewFilter==="all"?reviews:reviews.filter(r=>r.platform===reviewFilter);
  let display=filterLoc==="all"?base:base.filter(r=>r.locationId===filterLoc);
  if(sortBy==="lowest")display=[...display].sort((a,b)=>a.rating-b.rating);
  else if(sortBy==="highest")display=[...display].sort((a,b)=>b.rating-a.rating);
  else display=[...display].sort((a,b)=>new Date(b.date)-new Date(a.date));
  return(
    <div>
      <div className="rev-sum-grid">
        {["all","google","yelp","facebook","tripadvisor"].map(p=>{const s=ps(p);return(
          <div key={p} className={"rev-sum-card"+(reviewFilter===p?" active":"")} onClick={()=>setReviewFilter(p)}>
            <div style={{fontSize:"1.1rem",marginBottom:"0.25rem"}}>{p==="all"?"⭐":pIcon(p)}</div>
            <div className="rev-sum-rating">{s.avg}</div>
            <div className="rev-sum-name">{p==="all"?"All":pName(p)}</div>
            <div style={{fontSize:"0.64rem",color:"var(--dim)",fontFamily:"'IBM Plex Mono'"}}>{s.count} reviews</div>
            {s.neg>0&&<div style={{fontSize:"0.6rem",color:"var(--rust)",marginTop:"0.15rem",fontWeight:700}}>{s.neg} neg</div>}
          </div>
        );})}
      </div>
      <div style={{display:"flex",gap:"0.55rem",marginBottom:"1rem",flexWrap:"wrap",alignItems:"center"}}>
        <div className="chips">
          {["all",...locations.map(l=>l.id)].map(id=>(
            <div key={id} className={"chip"+(filterLoc===id?" selected":"")} onClick={()=>setFilterLoc(id)}>{id==="all"?"All Locations":getLocName(id)}</div>
          ))}
        </div>
        <div style={{marginLeft:"auto",display:"flex",gap:"0.4rem"}}>
          {["recent","lowest","highest"].map(s=>(
            <button key={s} className="btn btn-ghost btn-sm" style={{color:sortBy===s?"var(--white)":"var(--dim)",borderColor:sortBy===s?"var(--mid)":"var(--border)"}} onClick={()=>setSortBy(s)}>{s.charAt(0).toUpperCase()+s.slice(1)}</button>
          ))}
        </div>
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:"0.7rem"}}>
        {display.map(r=>(
          <div key={r.id} className={"rev-card"+(r.rating<=2?" neg":"")}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.5rem",gap:"0.8rem"}}>
              <div><div className="rev-author">{r.author}</div><Stars n={r.rating}/></div>
              <div style={{textAlign:"right",flexShrink:0}}>
                <div className="rev-date">{fmtTime(r.date)}</div>
                <div style={{fontSize:"0.68rem",color:"var(--dim)",marginTop:"0.2rem"}}>{pIcon(r.platform)} {pName(r.platform)}</div>
                <div style={{fontSize:"0.66rem",fontFamily:"'Barlow Condensed'",fontWeight:700,textTransform:"uppercase",background:"var(--steel3)",border:"1px solid var(--border)",color:"var(--mid)",padding:"0.12rem 0.45rem",display:"inline-block",marginTop:"0.2rem"}}>{getLocName(r.locationId)}</div>
              </div>
            </div>
            <div className="rev-text" style={{marginBottom:"0.7rem"}}>{r.text}</div>
            {r.aiResponse&&<div className="ai-resp"><div className="ai-resp-lbl">AI-Drafted Response</div>{r.aiResponse}</div>}
            <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",flexWrap:"wrap",gap:"0.45rem",marginTop:"0.3rem"}}>
              <div style={{display:"flex",gap:"0.45rem",flexWrap:"wrap"}}>
                <button className="btn btn-ghost btn-sm" disabled={genRespId===r.id} onClick={()=>generateReviewResponse(r)}>{genRespId===r.id?"Drafting...":r.aiResponse?"Regenerate":"Draft AI Response"}</button>
                {r.aiResponse&&<button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(r.aiResponse);showToast("Response copied.");}}>Copy</button>}
              </div>
              {r.rating<=2&&!r.responded&&!r.aiResponse&&<span style={{fontSize:"0.7rem",color:"var(--rust)",fontWeight:600}}>Needs Response</span>}
              {(r.responded||r.aiResponse)&&<span style={{fontSize:"0.65rem",fontFamily:"'Barlow Condensed'",fontWeight:700,textTransform:"uppercase",color:"var(--green)",background:"var(--greenbg)",padding:"0.13rem 0.45rem"}}>Responded</span>}
            </div>
          </div>
        ))}
        {display.length===0&&<div className="empty"><div className="empty-icon">💬</div><div className="empty-title">No Reviews</div><div className="empty-sub">No reviews match the current filters.</div></div>}
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   CSS
══════════════════════════════════════════════════════════════ */
const CSS=`
@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,400;0,600;0,700;0,800;0,900;1,700&family=Barlow:wght@300;400;500;600;700&family=IBM+Plex+Mono:wght@400;500;600&display=swap');
:root{
  --ink:#0f0e0c;--amber:#e8a020;--amberd:#c4841a;--amberbg:rgba(232,160,32,0.09);
  --rust:#c44a2a;--rustbg:rgba(196,74,42,0.1);--steel:#1e2230;--steel2:#252836;--steel3:#2e3245;
  --mid:#8a8478;--dim:#5a5450;--white:#fdfaf4;
  --green:#3d9a6a;--greenbg:rgba(61,154,106,0.1);
  --border:#2e3240;--border2:rgba(46,50,64,0.5);
  --sw:232px;
}
*{margin:0;padding:0;box-sizing:border-box;}
html,body{height:100%;overflow:hidden;}
body{font-family:'Barlow',sans-serif;background:var(--steel);color:var(--white);}
.app{display:flex;height:100vh;overflow:hidden;}
.sidebar{width:var(--sw);min-width:var(--sw);background:#090908;border-right:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;z-index:50;}
.sb-logo{padding:1.2rem 1.3rem;border-bottom:1px solid var(--border);font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.4rem;text-transform:uppercase;letter-spacing:0.04em;display:flex;align-items:center;gap:0.4rem;}
.sb-logo span{color:var(--amber);}
.sb-badge{background:var(--amber);color:var(--ink);font-size:0.52rem;font-weight:900;padding:0.16rem 0.42rem;font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;letter-spacing:0.06em;margin-left:0.25rem;}
.sb-sec{padding:0.9rem 1rem 0.28rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.6rem;text-transform:uppercase;letter-spacing:0.22em;color:var(--dim);}
.nav-item{display:flex;align-items:center;gap:0.6rem;padding:0.58rem 0.85rem;margin:0.06rem 0.35rem;border-radius:2px;cursor:pointer;font-size:0.84rem;font-weight:500;color:var(--mid);transition:all 0.13s;user-select:none;border-left:2px solid transparent;}
.nav-item:hover{background:var(--steel2);color:var(--white);}
.nav-item.active{background:var(--amberbg);color:var(--amber);border-left-color:var(--amber);margin-left:calc(0.35rem - 2px);}
.nav-icon{font-size:0.9rem;width:17px;text-align:center;flex-shrink:0;}
.nbadge{margin-left:auto;background:var(--rust);color:#fff;font-size:0.58rem;font-weight:700;padding:0.12rem 0.42rem;font-family:'Barlow Condensed',sans-serif;border-radius:1px;min-width:18px;text-align:center;}
.nbadge-a{background:var(--amber);color:var(--ink);}
.sb-div{height:1px;background:var(--border);margin:0.4rem 0.7rem;}
.sb-scroll{flex:1;overflow-y:auto;padding:0.35rem;}
.sb-scroll::-webkit-scrollbar{width:2px;}
.sb-scroll::-webkit-scrollbar-thumb{background:var(--border);}
.sb-mini{padding:0.5rem 0.65rem;margin-bottom:1px;cursor:pointer;border-radius:2px;transition:background 0.12s;border-left:2px solid transparent;}
.sb-mini:hover{background:var(--steel2);}
.sb-mini.active{background:var(--amberbg);border-left-color:var(--amber);}
.sb-mini-t{font-size:0.75rem;font-weight:600;color:var(--white);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.sb-mini-s{font-size:0.62rem;color:var(--dim);margin-top:0.1rem;font-family:'IBM Plex Mono',monospace;}
.main{flex:1;display:flex;flex-direction:column;overflow:hidden;min-width:0;}
.topbar{background:var(--steel2);border-bottom:1px solid var(--border);padding:0 1.2rem;height:52px;display:flex;align-items:center;justify-content:space-between;flex-shrink:0;gap:0.8rem;}
.tb-left{display:flex;align-items:center;gap:0.7rem;min-width:0;}
.tb-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;text-transform:uppercase;letter-spacing:0.05em;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;}
.tb-crumb{font-size:0.72rem;color:var(--dim);font-family:'IBM Plex Mono',monospace;white-space:nowrap;}
.tb-right{display:flex;gap:0.45rem;align-items:center;flex-shrink:0;}
.menu-btn{background:transparent;border:1px solid var(--border);color:var(--mid);width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:1rem;transition:all 0.13s;flex-shrink:0;}
.menu-btn:hover{border-color:var(--amber);color:var(--amber);}
.notif-btn{position:relative;background:transparent;border:1px solid var(--border);color:var(--mid);width:34px;height:34px;display:flex;align-items:center;justify-content:center;cursor:pointer;font-size:0.95rem;transition:all 0.13s;}
.notif-btn:hover{border-color:var(--amber);color:var(--amber);}
.notif-dot{position:absolute;top:5px;right:5px;width:7px;height:7px;border-radius:50%;background:var(--rust);border:1.5px solid var(--steel2);}
.btn{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.8rem;text-transform:uppercase;letter-spacing:0.06em;padding:0.44rem 0.9rem;border:none;cursor:pointer;transition:all 0.13s;display:inline-flex;align-items:center;gap:0.32rem;white-space:nowrap;}
.btn-primary{background:var(--amber);color:var(--ink);}
.btn-primary:hover{background:var(--amberd);transform:translateY(-1px);}
.btn-primary:disabled{background:var(--border);color:var(--dim);transform:none;cursor:not-allowed;}
.btn-ghost{background:transparent;color:var(--mid);border:1px solid var(--border);}
.btn-ghost:hover{border-color:var(--mid);color:var(--white);}
.btn-green{background:var(--green);color:#fff;}
.btn-green:hover{background:#2d8059;}
.btn-danger{background:transparent;color:var(--rust);border:1px solid var(--border);}
.btn-danger:hover{border-color:var(--rust);background:var(--rustbg);}
.btn-sm{padding:0.3rem 0.65rem;font-size:0.72rem;}
.content{flex:1;overflow-y:auto;padding:1.5rem;}
.content::-webkit-scrollbar{width:4px;}
.content::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
.stat-grid{display:grid;grid-template-columns:repeat(4,1fr);gap:0.8rem;margin-bottom:1.5rem;}
.stat-card{background:var(--steel2);border:1px solid var(--border);padding:1rem 1.2rem;position:relative;overflow:hidden;}
.stat-card::before{content:'';position:absolute;top:0;left:0;width:3px;height:100%;background:var(--amber);}
.stat-card.link{cursor:pointer;transition:border-color 0.13s;}
.stat-card.link:hover{border-color:rgba(232,160,32,0.4);}
.stat-num{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:2rem;color:var(--amber);line-height:1;margin-bottom:0.22rem;}
.stat-label{font-size:0.68rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--dim);font-weight:600;}
.stat-sub{font-size:0.7rem;color:var(--mid);margin-top:0.25rem;}
.badge{display:inline-block;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.6rem;text-transform:uppercase;letter-spacing:0.07em;padding:0.18rem 0.48rem;}
.badge-active{background:var(--greenbg);color:var(--green);}
.badge-draft{background:var(--amberbg);color:var(--amber);}
.badge-pending{background:rgba(90,84,80,0.25);color:var(--dim);}
.tbl{width:100%;border-collapse:collapse;}
.tbl th{text-align:left;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.64rem;text-transform:uppercase;letter-spacing:0.13em;color:var(--dim);padding:0.5rem 0.85rem;border-bottom:1px solid var(--border);}
.tbl td{padding:0.72rem 0.85rem;border-bottom:1px solid var(--border2);font-size:0.83rem;vertical-align:middle;}
.tbl tbody tr{cursor:pointer;transition:background 0.1s;}
.tbl tbody tr:hover td{background:rgba(255,255,255,0.022);}
.tbl-name{font-weight:600;color:var(--white);}
.tbl-sub{color:var(--mid);font-size:0.76rem;}
.tbl-mono{color:var(--dim);font-size:0.72rem;font-family:'IBM Plex Mono',monospace;}
.prog{display:flex;align-items:center;gap:0.45rem;}
.prog-bar{height:3px;background:var(--border);flex:1;max-width:65px;}
.prog-fill{height:100%;transition:width 0.4s;}
.prog-lbl{font-size:0.7rem;color:var(--dim);font-family:'IBM Plex Mono',monospace;width:26px;text-align:right;}
.sec-hdr{display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem;}
.sec-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:0.85rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--mid);}
.gen-wrap{display:grid;grid-template-columns:320px 1fr;gap:1rem;height:calc(100vh - 52px - 3rem);min-height:0;}
.gen-form{background:var(--steel2);border:1px solid var(--border);padding:1.3rem;display:flex;flex-direction:column;gap:0.9rem;overflow-y:auto;}
.gen-form::-webkit-scrollbar{width:3px;}
.gen-form::-webkit-scrollbar-thumb{background:var(--border);}
.gen-out{background:var(--steel2);border:1px solid var(--border);display:flex;flex-direction:column;overflow:hidden;}
.form-group{display:flex;flex-direction:column;gap:0.32rem;}
.form-label{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--mid);}
.form-input,.form-select,.form-textarea{background:var(--steel);border:1px solid var(--border);color:var(--white);font-family:'Barlow',sans-serif;font-size:0.83rem;padding:0.52rem 0.75rem;outline:none;transition:border-color 0.13s;width:100%;}
.form-input:focus,.form-select:focus,.form-textarea:focus{border-color:var(--amber);background:rgba(232,160,32,0.03);}
.form-input::placeholder,.form-textarea::placeholder{color:var(--dim);}
.form-select{appearance:none;cursor:pointer;}
.form-select option{background:var(--steel);}
.form-textarea{resize:vertical;min-height:68px;}
.out-bar{padding:0.8rem 1.1rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.out-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:0.82rem;text-transform:uppercase;letter-spacing:0.06em;color:var(--amber);}
.out-body{flex:1;overflow-y:auto;padding:1.1rem 1.2rem;font-family:'IBM Plex Mono',monospace;font-size:0.76rem;line-height:1.72;color:#b8b0a8;white-space:pre-wrap;}
.out-body::-webkit-scrollbar{width:3px;}
.out-body::-webkit-scrollbar-thumb{background:var(--border);}
.out-empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;gap:0.7rem;color:var(--dim);text-align:center;padding:2rem;}
.out-empty-icon{font-size:2.5rem;opacity:0.22;}
.out-empty-txt{font-family:'Barlow Condensed',sans-serif;font-size:0.9rem;text-transform:uppercase;letter-spacing:0.1em;}
@keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
.cursor{display:inline-block;width:6px;height:11px;background:var(--amber);animation:blink 1s infinite;vertical-align:middle;margin-left:1px;}
@keyframes pulse{0%,100%{opacity:0.4}50%{opacity:1}}
.gen-ind{display:flex;align-items:center;gap:0.45rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.76rem;text-transform:uppercase;letter-spacing:0.1em;color:var(--amber);animation:pulse 1.4s infinite;}
.chips{display:flex;flex-wrap:wrap;gap:0.3rem;}
.chip{font-size:0.68rem;font-family:'Barlow Condensed',sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;padding:0.2rem 0.55rem;cursor:pointer;border:1px solid var(--border);color:var(--dim);transition:all 0.12s;background:transparent;}
.chip:hover{border-color:var(--amber);color:var(--amber);}
.chip.selected{background:var(--amber);color:var(--ink);border-color:var(--amber);}
.sop-detail{max-width:780px;}
.sop-dtitle{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.75rem;text-transform:uppercase;line-height:1.0;margin-bottom:0.65rem;}
.sop-meta{display:flex;gap:1.1rem;flex-wrap:wrap;margin-bottom:0.65rem;}
.sop-meta-item{font-size:0.72rem;color:var(--dim);font-family:'IBM Plex Mono',monospace;display:flex;align-items:center;gap:0.3rem;}
.dot-a{width:5px;height:5px;border-radius:50%;background:var(--amber);flex-shrink:0;}
.sop-body{font-size:0.88rem;line-height:1.78;color:#bab0a8;white-space:pre-wrap;}
.sop-body h2{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--amber);margin:1.3rem 0 0.4rem;padding-bottom:0.25rem;border-bottom:1px solid var(--border);}
.sop-body h3{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.85rem;text-transform:uppercase;color:var(--white);margin:0.9rem 0 0.25rem;}
.ack-panel{background:var(--steel2);border:1px solid var(--border);padding:1rem 1.3rem;margin-top:1.6rem;display:flex;align-items:center;justify-content:space-between;gap:0.9rem;flex-wrap:wrap;}
.loc-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;}
.loc-card{background:var(--steel2);border:1px solid var(--border);padding:1.3rem;transition:border-color 0.15s;}
.loc-card:hover{border-color:rgba(232,160,32,0.3);}
.loc-name{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;text-transform:uppercase;}
.loc-addr{font-size:0.75rem;color:var(--dim);margin-top:0.22rem;line-height:1.5;}
.loc-meta{display:flex;gap:1.3rem;margin-top:0.75rem;flex-wrap:wrap;}
.loc-meta-item{font-size:0.72rem;color:var(--mid);}
.loc-meta-item strong{color:var(--white);display:block;font-size:0.82rem;}
.staff-chip{font-size:0.68rem;background:var(--steel3);border:1px solid var(--border);color:var(--mid);padding:0.18rem 0.5rem;font-family:'IBM Plex Mono',monospace;}
.ack-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1rem;}
.ack-card{background:var(--steel2);border:1px solid var(--border);padding:1.2rem;}
.ack-card-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:0.9rem;text-transform:uppercase;color:var(--white);margin-bottom:0.25rem;}
.ack-card-sub{font-size:0.7rem;color:var(--dim);margin-bottom:0.85rem;font-family:'IBM Plex Mono',monospace;}
.ack-row{display:flex;align-items:center;justify-content:space-between;padding:0.4rem 0;border-bottom:1px solid var(--border2);font-size:0.8rem;}
.ack-row:last-child{border-bottom:none;}
.ack-yes{color:var(--green);font-size:0.68rem;font-weight:700;font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;}
.ack-no{color:var(--rust);font-size:0.68rem;font-weight:700;font-family:'Barlow Condensed',sans-serif;text-transform:uppercase;cursor:pointer;}
.ack-no:hover{text-decoration:underline;}
.rev-sum-grid{display:grid;grid-template-columns:repeat(5,1fr);gap:0.65rem;margin-bottom:1.2rem;}
.rev-sum-card{background:var(--steel2);border:1px solid var(--border);padding:0.85rem 0.9rem;text-align:center;cursor:pointer;transition:all 0.13s;border-top:2px solid transparent;}
.rev-sum-card:hover{border-top-color:rgba(232,160,32,0.4);}
.rev-sum-card.active{border-top-color:var(--amber);background:var(--amberbg);}
.rev-sum-rating{font-family:'Barlow Condensed',sans-serif;font-weight:900;font-size:1.5rem;color:var(--amber);line-height:1;}
.rev-sum-name{font-size:0.64rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--dim);font-family:'Barlow Condensed',sans-serif;font-weight:700;margin-top:0.18rem;}
.rev-card{background:var(--steel2);border:1px solid var(--border);padding:1.1rem 1.3rem;border-left:3px solid transparent;transition:border-color 0.13s;}
.rev-card:hover{border-left-color:rgba(232,160,32,0.4);}
.rev-card.neg{border-left-color:var(--rust)!important;}
.rev-author{font-weight:600;font-size:0.86rem;color:var(--white);}
.rev-date{font-size:0.68rem;color:var(--dim);font-family:'IBM Plex Mono',monospace;}
.rev-text{font-size:0.83rem;line-height:1.65;color:#b0a898;}
.ai-resp{background:rgba(232,160,32,0.05);border:1px solid rgba(232,160,32,0.18);border-left:3px solid var(--amber);padding:0.75rem 0.9rem;margin-top:0.65rem;font-size:0.8rem;line-height:1.6;color:#c8c0a8;font-style:italic;}
.ai-resp-lbl{font-family:'Barlow Condensed',sans-serif;font-size:0.62rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--amber);font-weight:700;margin-bottom:0.3rem;font-style:normal;}
.alert-panel{position:fixed;top:52px;right:0;width:340px;height:calc(100vh - 52px);background:var(--steel2);border-left:1px solid var(--border);z-index:100;display:flex;flex-direction:column;overflow:hidden;}
@keyframes slideInR{from{transform:translateX(100%)}to{transform:translateX(0)}}
.alert-panel{animation:slideInR 0.22s cubic-bezier(0.4,0,0.2,1);}
.alert-ph{padding:1rem 1.2rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.alert-ph-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:0.95rem;text-transform:uppercase;letter-spacing:0.06em;}
.alert-scroll{flex:1;overflow-y:auto;padding:0.6rem;}
.alert-scroll::-webkit-scrollbar{width:3px;}
.alert-scroll::-webkit-scrollbar-thumb{background:var(--border);}
.alert-item{padding:0.85rem;margin-bottom:0.5rem;background:var(--steel);border:1px solid var(--border);border-left:3px solid;cursor:pointer;transition:background 0.12s;}
.alert-item:hover{background:rgba(255,255,255,0.03);}
.alert-item.unread{background:rgba(232,160,32,0.04);}
.alert-title{font-size:0.8rem;font-weight:600;color:var(--white);line-height:1.4;}
.alert-body{font-size:0.74rem;color:var(--mid);line-height:1.5;margin:0.3rem 0;}
.alert-time{font-size:0.65rem;color:var(--dim);font-family:'IBM Plex Mono',monospace;}
.alert-footer{padding:1rem 1.2rem;border-top:1px solid var(--border);flex-shrink:0;}
.alert-footer-title{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.7rem;text-transform:uppercase;letter-spacing:0.12em;color:var(--dim);margin-bottom:0.7rem;}
.toggle-row{display:flex;align-items:center;justify-content:space-between;padding:0.35rem 0;border-bottom:1px solid var(--border2);}
.toggle-row:last-child{border-bottom:none;}
.toggle-label{font-size:0.78rem;color:var(--mid);}
.tog{position:relative;width:32px;height:18px;cursor:pointer;}
.tog input{opacity:0;width:0;height:0;}
.tog-sl{position:absolute;inset:0;background:var(--border);transition:0.2s;border-radius:18px;}
.tog-sl:before{content:'';position:absolute;width:12px;height:12px;left:3px;bottom:3px;background:#fff;transition:0.2s;border-radius:50%;}
.tog input:checked+.tog-sl{background:var(--amber);}
.tog input:checked+.tog-sl:before{transform:translateX(14px);}
.settings-section{background:var(--steel2);border:1px solid var(--border);padding:1.3rem;margin-bottom:1rem;}
.settings-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:0.88rem;text-transform:uppercase;letter-spacing:0.07em;color:var(--white);margin-bottom:0.25rem;}
.settings-sub{font-size:0.78rem;color:var(--dim);margin-bottom:1.1rem;line-height:1.5;}
.settings-row{display:flex;align-items:center;justify-content:space-between;padding:0.6rem 0;border-bottom:1px solid var(--border2);}
.settings-row:last-child{border-bottom:none;}
.settings-row-label{font-size:0.84rem;color:var(--white);font-weight:500;}
.settings-row-sub{font-size:0.72rem;color:var(--dim);margin-top:0.12rem;}
.email-timeline{position:relative;padding-left:2.5rem;max-width:860px;}
.email-timeline::before{content:'';position:absolute;left:0.6rem;top:0;bottom:0;width:2px;background:var(--border);}
.email-node{position:relative;margin-bottom:1.2rem;}
.email-dot{position:absolute;left:-2.5rem;top:1rem;width:22px;height:22px;border-radius:50%;background:var(--steel2);border:2px solid var(--border);display:flex;align-items:center;justify-content:center;font-size:0.6rem;font-family:'IBM Plex Mono',monospace;color:var(--dim);}
.email-dot.first{border-color:var(--amber);background:var(--amberbg);color:var(--amber);}
.email-card{background:var(--steel2);border:1px solid var(--border);transition:border-color 0.13s;}
.email-card:hover{border-color:rgba(232,160,32,0.3);}
.email-hdr{padding:0.9rem 1.1rem;display:flex;align-items:center;justify-content:space-between;cursor:pointer;gap:0.8rem;}
.email-hdr:hover{background:rgba(255,255,255,0.02);}
.email-day{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.65rem;text-transform:uppercase;letter-spacing:0.1em;background:var(--amberbg);color:var(--amber);border:1px solid rgba(232,160,32,0.2);padding:0.18rem 0.55rem;white-space:nowrap;flex-shrink:0;}
.email-subj{font-weight:600;font-size:0.85rem;color:var(--white);flex:1;}
.email-body-expanded{padding:0 1.1rem 1.1rem;border-top:1px solid var(--border);}
.email-body-text{font-size:0.81rem;line-height:1.75;color:#b8b0a8;white-space:pre-wrap;padding-top:0.9rem;font-family:'IBM Plex Mono',monospace;}
.modal-overlay{position:fixed;inset:0;background:rgba(9,9,8,0.78);z-index:200;display:flex;align-items:center;justify-content:center;padding:1.2rem;}
.modal{background:var(--steel2);border:1px solid var(--border);width:100%;max-width:500px;max-height:88vh;overflow-y:auto;display:flex;flex-direction:column;}
.modal-header{padding:1.1rem 1.3rem;border-bottom:1px solid var(--border);display:flex;align-items:center;justify-content:space-between;flex-shrink:0;}
.modal-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1rem;text-transform:uppercase;letter-spacing:0.06em;}
.modal-close{background:none;border:none;color:var(--dim);cursor:pointer;font-size:1.1rem;line-height:1;padding:0.2rem;}
.modal-close:hover{color:var(--white);}
.modal-body{padding:1.3rem;display:flex;flex-direction:column;gap:0.9rem;}
.modal-footer{padding:0.9rem 1.3rem;border-top:1px solid var(--border);display:flex;gap:0.5rem;justify-content:flex-end;flex-shrink:0;}
.share-box{background:var(--steel);border:1px solid var(--border);padding:0.65rem 0.85rem;display:flex;align-items:center;justify-content:space-between;gap:0.7rem;}
.share-url{font-family:'IBM Plex Mono',monospace;font-size:0.72rem;color:var(--amber);flex:1;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;}
.insight{background:var(--amberbg);border:1px solid rgba(232,160,32,0.2);border-left:3px solid var(--amber);padding:0.9rem 1.1rem;margin-bottom:1.2rem;}
.insight-lbl{font-family:'Barlow Condensed',sans-serif;font-weight:700;font-size:0.62rem;text-transform:uppercase;letter-spacing:0.15em;color:var(--amber);margin-bottom:0.3rem;}
.insight-txt{font-size:0.81rem;line-height:1.6;color:#c8c0a0;}
.toast{position:fixed;bottom:1.5rem;right:1.5rem;background:var(--steel2);border:1px solid var(--border);border-left:3px solid var(--green);padding:0.7rem 1rem;font-size:0.82rem;color:var(--white);z-index:999;font-weight:500;max-width:300px;}
@keyframes slideIn{from{transform:translateX(14px);opacity:0}to{transform:translateX(0);opacity:1}}
.toast{animation:slideIn 0.17s ease;}
.toast.warn{border-left-color:var(--amber);}
.toast.err{border-left-color:var(--rust);}
.empty{display:flex;flex-direction:column;align-items:center;justify-content:center;height:45vh;gap:0.8rem;color:var(--dim);text-align:center;}
.empty-icon{font-size:2.8rem;opacity:0.2;}
.empty-title{font-family:'Barlow Condensed',sans-serif;font-weight:800;font-size:1.05rem;text-transform:uppercase;letter-spacing:0.08em;color:var(--mid);}
.empty-sub{font-size:0.83rem;max-width:240px;line-height:1.6;}
@media(max-width:768px){
  .stat-grid{grid-template-columns:1fr 1fr;}
  .loc-grid,.ack-grid{grid-template-columns:1fr;}
  .rev-sum-grid{grid-template-columns:repeat(3,1fr);}
  .gen-wrap{grid-template-columns:1fr;height:auto;}
  .gen-out{min-height:350px;}
  .alert-panel{width:100%;border-left:none;}
  .content{padding:1rem;}
  .topbar{padding:0 0.9rem;}
  .sb-overlay{position:fixed;inset:0;background:rgba(9,9,8,0.6);z-index:55;}
}
@media(max-width:480px){
  .rev-sum-grid{grid-template-columns:repeat(2,1fr);}
  .tbl th:nth-child(n+4),.tbl td:nth-child(n+4){display:none;}
}
::-webkit-scrollbar{width:4px;}
::-webkit-scrollbar-track{background:transparent;}
::-webkit-scrollbar-thumb{background:var(--border);border-radius:2px;}
`;

/* ══════════════════════════════════════════════════════════════
   MAIN APP COMPONENT
══════════════════════════════════════════════════════════════ */
export default function PlaybookAIPro() {
  const [view,setView]         = useState("dashboard");
  const [sops,setSops]         = useState([]);
  const [locations,setLocations] = useState([]);
  const [staff,setStaff]       = useState({});
  const [reviews,setReviews]   = useState([]);
  const [alerts,setAlerts]     = useState([]);
  const [alertSettings,setAlertSettings] = useState({negativeReviews:true,ackReminders:true,positiveReviews:false,weeklyDigest:true,sopUpdates:true,emailAddress:"owner@yourbusiness.com"});
  const [loaded,setLoaded]     = useState(false);
  const [toast,setToast]       = useState(null);
  const [modal,setModal]       = useState(null);
  const [activeSopId,setActiveSopId] = useState(null);
  const [sidebarOpen,setSidebarOpen] = useState(true);
  const [alertPanelOpen,setAlertPanelOpen] = useState(false);
  const [isMobile,setIsMobile] = useState(false);
  const [genForm,setGenForm]   = useState({title:"",industry:"",role:"",locations:[],context:"",tone:"Formal & Procedural"});
  const [generating,setGenerating] = useState(false);
  const [streamText,setStreamText] = useState("");
  const [reviewFilter,setReviewFilter] = useState("all");
  const [genRespId,setGenRespId] = useState(null);
  const [expandedEmail,setExpandedEmail] = useState(null);
  const [filterSop,setFilterSop] = useState("all");
  const outRef = useRef(null);

  useEffect(()=>{
    const check=()=>{const m=window.innerWidth<=768;setIsMobile(m);setSidebarOpen(!m);};
    check();window.addEventListener("resize",check);return()=>window.removeEventListener("resize",check);
  },[]);

  useEffect(()=>{
    (async()=>{
      const s=await dbGet("pba4-sops"),l=await dbGet("pba4-locs"),st=await dbGet("pba4-staff"),r=await dbGet("pba4-revs"),al=await dbGet("pba4-alerts"),as=await dbGet("pba4-aset");
      setSops(s||SEED_SOPS);setLocations(l||SEED_LOCS);setStaff(st||SEED_STAFF);setReviews(r||genReviews());setAlerts(al||SEED_ALERTS);if(as)setAlertSettings(as);
      setLoaded(true);
    })();
  },[]);

  useEffect(()=>{if(loaded)dbSet("pba4-sops",sops);},[sops,loaded]);
  useEffect(()=>{if(loaded)dbSet("pba4-locs",locations);},[locations,loaded]);
  useEffect(()=>{if(loaded)dbSet("pba4-staff",staff);},[staff,loaded]);
  useEffect(()=>{if(loaded)dbSet("pba4-revs",reviews);},[reviews,loaded]);
  useEffect(()=>{if(loaded)dbSet("pba4-alerts",alerts);},[alerts,loaded]);
  useEffect(()=>{if(loaded)dbSet("pba4-aset",alertSettings);},[alertSettings,loaded]);
  useEffect(()=>{if(outRef.current)outRef.current.scrollTop=outRef.current.scrollHeight;},[streamText]);

  const showToast=useCallback((msg,type="ok")=>{setToast({msg,type});setTimeout(()=>setToast(null),3000);},[]);
  const getLocName=useCallback(id=>locations.find(l=>l.id===id)?.name||id,[locations]);
  const getSopAckRate=useCallback(sop=>{
    const all=sop.locations.flatMap(lid=>staff[lid]||[]);
    if(!all.length)return 0;
    return Math.round((sop.locations.flatMap(lid=>sop.acks?.[lid]||[]).length/all.length)*100);
  },[staff]);
  const getLocAckRate=useCallback(locId=>{
    const ls=sops.filter(s=>s.locations.includes(locId)&&s.status==="active");
    if(!ls.length)return 0;
    return Math.round(ls.reduce((a,s)=>a+getSopAckRate(s),0)/ls.length);
  },[sops,getSopAckRate]);

  const navigate=useCallback(v=>{setView(v);if(isMobile)setSidebarOpen(false);},[isMobile]);
  const openSop=useCallback(sop=>{setActiveSopId(sop.id);setView("sopDetail");if(isMobile)setSidebarOpen(false);},[isMobile]);

  const liveSop=sops.find(s=>s.id===activeSopId)||null;
  const negUnresp=reviews.filter(r=>r.rating<=2&&!r.responded&&!r.aiResponse).length;
  const unreadAlerts=alerts.filter(a=>!a.read).length;

  function exportPDF(sop){
    const w=window.open("","_blank");
    w.document.write(`<!DOCTYPE html><html><head><title>${sop.title}</title><style>body{font-family:Georgia,serif;max-width:700px;margin:2rem auto;color:#111;line-height:1.7;}h1{font-size:1.7rem;text-transform:uppercase;margin-bottom:0.25rem;}pre{white-space:pre-wrap;font-family:Georgia,serif;font-size:0.93rem;line-height:1.75;}.meta{color:#666;font-size:0.82rem;margin-bottom:1.4rem;padding-bottom:0.7rem;border-bottom:2px solid #111;}.footer{margin-top:2rem;padding-top:0.7rem;border-top:1px solid #ccc;font-size:0.75rem;color:#888;}@media print{button{display:none!important;}}</style></head><body><button onclick="window.print()" style="margin-bottom:1.2rem;padding:0.45rem 1.1rem;background:#e8a020;border:none;cursor:pointer;font-weight:700;">Print / Save PDF</button><h1>${sop.title}</h1><div class="meta">Role: ${sop.role} | ${sop.industry} | Locations: ${sop.locations.map(l=>getLocName(l)).join(", ")} | v${sop.version||1} | ${fmtDate(sop.created)}</div><pre>${sop.body}</pre><div class="footer">PlaybookAI · ${new Date().toLocaleDateString()}</div></body></html>`);
    w.document.close();showToast("PDF export opened.");
  }

  function toggleAck(sopId,locId,name){
    setSops(prev=>prev.map(s=>{
      if(s.id!==sopId)return s;
      const cur=s.acks?.[locId]||[];const has=cur.includes(name);
      return{...s,acks:{...s.acks,[locId]:has?cur.filter(n=>n!==name):[...cur,name]}};
    }));
    showToast(name+" acknowledgment updated.");
  }

  async function generateSOP(){
    if(!genForm.title||!genForm.industry||!genForm.role||!genForm.locations.length){showToast("Fill in all required fields.","warn");return;}
    setGenerating(true);setStreamText("");
    const prompt=`You are a senior operations consultant for multi-location businesses. Write a complete, professional Standard Operating Procedure.
Title: ${genForm.title}
Industry: ${genForm.industry}
Role: ${genForm.role}
Locations: ${genForm.locations.map(l=>getLocName(l)).join(", ")}
Context: ${genForm.context||"Standard operation"}
Tone: ${genForm.tone}
Structure: PURPOSE / SCOPE / STEP-BY-STEP PROCEDURE / EXCEPTION HANDLING / DOCUMENTATION / ACKNOWLEDGMENT
Use imperative verbs. Be specific. No preamble outside the SOP.`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,stream:true,messages:[{role:"user",content:prompt}]})});
      const reader=res.body.getReader();const dec=new TextDecoder();let full="";
      while(true){const{done,value}=await reader.read();if(done)break;const lines=dec.decode(value,{stream:true}).split("\n").filter(l=>l.startsWith("data: "));for(const line of lines){try{const d=JSON.parse(line.slice(6));if(d.type==="content_block_delta"&&d.delta?.text){full+=d.delta.text;setStreamText(full);}}catch{}}}
      const ns={id:"s"+Date.now(),title:genForm.title,role:genForm.role,industry:genForm.industry,locations:[...genForm.locations],status:"draft",created:new Date().toISOString().split("T")[0],body:full,acks:{},version:1};
      setSops(prev=>[ns,...prev]);showToast("SOP generated and saved.");
    }catch(e){setStreamText("Error: "+e.message);showToast("Generation failed.","err");}
    finally{setGenerating(false);}
  }

  async function generateReviewResponse(review){
    setGenRespId(review.id);
    const prompt=`You are a professional business owner responding to a customer review. Write a concise, authentic response (2-4 sentences max).
Review (${review.rating} stars): "${review.text}"
Location: ${getLocName(review.locationId)} | Platform: ${pName(review.platform)}
Rules: 4-5 stars: thank warmly, mention something specific, invite back. 1-2 stars: apologize sincerely, take accountability, offer to make it right. 3 stars: thank, acknowledge feedback, mention improvement. Sign off as "- The ${getLocName(review.locationId)} Team". Write ONLY the response.`;
    try{
      const res=await fetch("https://api.anthropic.com/v1/messages",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({model:"claude-sonnet-4-20250514",max_tokens:1000,messages:[{role:"user",content:prompt}]})});
      const data=await res.json();const text=data.content?.find(b=>b.type==="text")?.text||"";
      setReviews(prev=>prev.map(r=>r.id===review.id?{...r,aiResponse:text,responded:true}:r));
      showToast("AI response generated.");
    }catch{showToast("Failed.","err");}
    finally{setGenRespId(null);}
  }

  /* ── TITLE MAP ── */
  const titles={dashboard:"Dashboard",generator:"Generate SOP",library:"SOP Library",sopDetail:liveSop?.title||"SOP",locations:"Locations",acknowledgments:"Acknowledgments",reviews:"Review Intelligence",alertsettings:"Alert Settings",onboarding:"Onboarding Emails"};

  /* ════════════════════════════════════════════════════════════
     RENDER
  ════════════════════════════════════════════════════════════ */
  return(
    <>
      <style>{CSS}</style>
      <div className="app">
        {isMobile&&sidebarOpen&&<div className="sb-overlay" onClick={()=>setSidebarOpen(false)}/>}

        <div className="sidebar" style={isMobile?{position:"fixed",top:0,left:0,height:"100%",zIndex:60,transform:sidebarOpen?"translateX(0)":"translateX(-100%)",transition:"transform 0.28s"}:{}}>
          <div className="sb-logo">Playbook<span>AI</span><span className="sb-badge">PRO</span></div>
          <div className="sb-sec">Main</div>
          {[{id:"dashboard",icon:"▦",label:"Dashboard"},{id:"generator",icon:"⚡",label:"Generate SOP"},{id:"library",icon:"📋",label:"SOP Library"}].map(item=>(
            <div key={item.id} className={"nav-item"+(view===item.id||(view==="sopDetail"&&item.id==="library")?" active":"")} onClick={()=>navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}
            </div>
          ))}
          <div className="sb-div"/>
          <div className="sb-sec">Operations</div>
          {[{id:"locations",icon:"📍",label:"Locations"},{id:"acknowledgments",icon:"✅",label:"Acknowledgments"},{id:"reviews",icon:"⭐",label:"Review Intel",badge:negUnresp>0?negUnresp:null}].map(item=>(
            <div key={item.id} className={"nav-item"+(view===item.id?" active":"")} onClick={()=>navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}{item.badge&&<span className="nbadge">{item.badge}</span>}
            </div>
          ))}
          <div className="sb-div"/>
          <div className="sb-sec">Settings</div>
          {[{id:"alertsettings",icon:"🔔",label:"Alert Settings",badge:unreadAlerts>0?unreadAlerts:null,amber:true},{id:"onboarding",icon:"✉",label:"Onboarding Emails"}].map(item=>(
            <div key={item.id} className={"nav-item"+(view===item.id?" active":"")} onClick={()=>navigate(item.id)}>
              <span className="nav-icon">{item.icon}</span>{item.label}{item.badge&&<span className={"nbadge"+(item.amber?" nbadge-a":"")}>{item.badge}</span>}
            </div>
          ))}
          <div className="sb-div"/>
          <div className="sb-sec">Recent SOPs</div>
          <div className="sb-scroll">
            {[...sops].sort((a,b)=>new Date(b.created)-new Date(a.created)).slice(0,8).map(s=>(
              <div key={s.id} className={"sb-mini"+(liveSop?.id===s.id&&view==="sopDetail"?" active":"")} onClick={()=>openSop(s)}>
                <div className="sb-mini-t">{s.title}</div>
                <div className="sb-mini-s">{s.role} · {s.locations.length}loc</div>
              </div>
            ))}
          </div>
        </div>

        <div className="main">
          <div className="topbar">
            <div className="tb-left">
              <button className="menu-btn" onClick={()=>setSidebarOpen(p=>!p)}>☰</button>
              {view==="sopDetail"&&<button className="btn btn-ghost btn-sm" onClick={()=>navigate("library")}>←</button>}
              <div className="tb-title">{titles[view]||""}</div>
              {view==="sopDetail"&&liveSop&&<div className="tb-crumb">v{liveSop.version||1}</div>}
            </div>
            <div className="tb-right">
              {view!=="generator"&&<button className="btn btn-primary" onClick={()=>{setStreamText("");setGenForm({title:"",industry:"",role:"",locations:[],context:"",tone:"Formal & Procedural"});navigate("generator");}}>⚡ New SOP</button>}
              {view==="locations"&&<button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:"location",data:null})}>+ Add</button>}
              {view==="sopDetail"&&liveSop&&<><button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:"share",data:liveSop})}>Share</button><button className="btn btn-ghost btn-sm" onClick={()=>exportPDF(liveSop)}>PDF</button></>}
              <button className="notif-btn" onClick={()=>setAlertPanelOpen(p=>!p)}>🔔{unreadAlerts>0&&<span className="notif-dot"/>}</button>
            </div>
          </div>

          <div className="content" style={view==="generator"?{overflow:"hidden",padding:"1rem",height:"100%",display:"flex",flexDirection:"column"}:{}}>

            {/* DASHBOARD */}
            {view==="dashboard"&&(()=>{
              const activeSOPs=sops.filter(s=>s.status==="active").length;
              const gAck=sops.length?Math.round(sops.reduce((a,s)=>a+getSopAckRate(s),0)/sops.length):0;
              const ar=avgRat(reviews.map(r=>r.rating));
              const recent=[...sops].sort((a,b)=>new Date(b.created)-new Date(a.created)).slice(0,5);
              const recentRevs=[...reviews].sort((a,b)=>new Date(b.date)-new Date(a.date)).slice(0,3);
              return(
                <div>
                  <div className="stat-grid">
                    <div className="stat-card"><div className="stat-num">{sops.length}</div><div className="stat-label">Total SOPs</div><div className="stat-sub">{activeSOPs} published</div></div>
                    <div className="stat-card"><div className="stat-num">{locations.filter(l=>l.active).length}</div><div className="stat-label">Locations</div><div className="stat-sub">{Object.values(staff).flat().length} staff</div></div>
                    <div className="stat-card"><div className="stat-num">{gAck}%</div><div className="stat-label">Avg Acknowledged</div><div className="stat-sub">All active SOPs</div></div>
                    <div className="stat-card link" onClick={()=>navigate("reviews")}>
                      <div className="stat-num" style={{color:parseFloat(ar)<4?"var(--rust)":"var(--amber)"}}>{ar}</div>
                      <div className="stat-label">Avg Review Rating</div>
                      <div className="stat-sub">{negUnresp>0?<span style={{color:"var(--rust)"}}>⚠ {negUnresp} unresponded</span>:"All addressed"}</div>
                    </div>
                  </div>
                  {negUnresp>0&&<div className="insight" style={{cursor:"pointer"}} onClick={()=>navigate("reviews")}><div className="insight-lbl">⚠ Review Alert</div><div className="insight-txt">{negUnresp} negative review{negUnresp!==1?"s":""} need a response. Unresponded negatives reduce conversion by up to 18%. →</div></div>}
                  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(300px,1fr))",gap:"1.3rem"}}>
                    <div>
                      <div className="sec-hdr"><div className="sec-title">Recent SOPs</div><button className="btn btn-ghost btn-sm" onClick={()=>navigate("library")}>View All</button></div>
                      <table className="tbl"><thead><tr><th>Title</th><th>Status</th><th>Ack</th></tr></thead>
                      <tbody>{recent.map(s=><tr key={s.id} onClick={()=>openSop(s)}><td><div className="tbl-name">{s.title}</div><div className="tbl-sub">{s.role}</div></td><td><span className={"badge badge-"+s.status}>{s.status}</span></td><td><div className="prog"><div className="prog-bar"><div className="prog-fill" style={{width:getSopAckRate(s)+"%",background:getSopAckRate(s)===100?"var(--green)":"var(--amber)"}}/></div><span className="prog-lbl">{getSopAckRate(s)}%</span></div></td></tr>)}
                      </tbody></table>
                    </div>
                    <div>
                      <div className="sec-hdr"><div className="sec-title">Recent Reviews</div><button className="btn btn-ghost btn-sm" onClick={()=>navigate("reviews")}>View All</button></div>
                      <div style={{display:"flex",flexDirection:"column",gap:"0.55rem"}}>
                        {recentRevs.map(r=>(
                          <div key={r.id} className={"rev-card"+(r.rating<=2?" neg":"")} style={{cursor:"pointer"}} onClick={()=>navigate("reviews")}>
                            <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.4rem"}}>
                              <div><div className="rev-author">{r.author}</div><Stars n={r.rating} size="0.78rem"/></div>
                              <div style={{textAlign:"right"}}><div className="rev-date">{fmtTime(r.date)}</div><div style={{fontSize:"0.67rem",color:"var(--dim)",marginTop:"0.12rem"}}>{pIcon(r.platform)} {getLocName(r.locationId)}</div></div>
                            </div>
                            <div className="rev-text" style={{fontSize:"0.78rem",WebkitLineClamp:2,display:"-webkit-box",WebkitBoxOrient:"vertical",overflow:"hidden",marginBottom:0}}>{r.text}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* LIBRARY */}
            {view==="library"&&(sops.length===0?(
              <div className="empty"><div className="empty-icon">📋</div><div className="empty-title">No SOPs Yet</div><div className="empty-sub">Generate your first SOP.</div><button className="btn btn-primary" style={{marginTop:"0.5rem"}} onClick={()=>navigate("generator")}>Generate</button></div>
            ):(
              <table className="tbl"><thead><tr><th>Title</th><th>Role</th><th>Status</th><th>Ack</th><th>Ver</th><th>Created</th></tr></thead>
              <tbody>{sops.map(s=><tr key={s.id} onClick={()=>openSop(s)}><td><div className="tbl-name">{s.title}</div><div className="tbl-sub">{s.industry}</div></td><td className="tbl-sub">{s.role}</td><td><span className={"badge badge-"+s.status}>{s.status}</span></td><td><div className="prog"><div className="prog-bar"><div className="prog-fill" style={{width:getSopAckRate(s)+"%",background:getSopAckRate(s)===100?"var(--green)":"var(--amber)"}}/></div><span className="prog-lbl">{getSopAckRate(s)}%</span></div></td><td className="tbl-mono">v{s.version||1}</td><td className="tbl-mono">{fmtDate(s.created)}</td></tr>)}
              </tbody></table>
            ))}

            {/* GENERATOR */}
            {view==="generator"&&(()=>{
              const canGen=genForm.title&&genForm.industry&&genForm.role&&genForm.locations.length;
              return(
                <div className="gen-wrap">
                  <div className="gen-form">
                    <div style={{fontFamily:"'Barlow Condensed'",fontWeight:800,fontSize:"0.85rem",textTransform:"uppercase",letterSpacing:"0.06em",color:"var(--amber)"}}>SOP Details</div>
                    <div className="form-group"><label className="form-label">Title *</label><input className="form-input" placeholder="e.g. Closing Shift Checklist" value={genForm.title} onChange={e=>setGenForm(f=>({...f,title:e.target.value}))}/></div>
                    <div className="form-group"><label className="form-label">Industry *</label><select className="form-select" value={genForm.industry} onChange={e=>setGenForm(f=>({...f,industry:e.target.value}))}><option value="">Select...</option>{INDUSTRIES.map(i=><option key={i}>{i}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Role *</label><select className="form-select" value={genForm.role} onChange={e=>setGenForm(f=>({...f,role:e.target.value}))}><option value="">Select...</option>{ROLES.map(r=><option key={r}>{r}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Locations *</label><div className="chips">{locations.map(l=><div key={l.id} className={"chip"+(genForm.locations.includes(l.id)?" selected":"")} onClick={()=>setGenForm(f=>({...f,locations:f.locations.includes(l.id)?f.locations.filter(x=>x!==l.id):[...f.locations,l.id]}))}>{l.name}</div>)}</div></div>
                    <div className="form-group"><label className="form-label">Tone</label><select className="form-select" value={genForm.tone} onChange={e=>setGenForm(f=>({...f,tone:e.target.value}))}>{TONES.map(t=><option key={t}>{t}</option>)}</select></div>
                    <div className="form-group"><label className="form-label">Context</label><textarea className="form-textarea" placeholder="Specific details, equipment..." value={genForm.context} onChange={e=>setGenForm(f=>({...f,context:e.target.value}))}/></div>
                    <button className="btn btn-primary" style={{width:"100%",justifyContent:"center",padding:"0.7rem",fontSize:"0.9rem"}} onClick={generateSOP} disabled={generating||!canGen}>
                      {generating?<span className="gen-ind"><span style={{width:5,height:5,borderRadius:"50%",background:"var(--amber)",display:"inline-block"}}/>Generating...</span>:"Generate SOP"}
                    </button>
                    {streamText&&!generating&&<button className="btn btn-ghost" style={{width:"100%",justifyContent:"center"}} onClick={()=>{const n=sops[0];if(n)openSop(n);}}>View in Library →</button>}
                  </div>
                  <div className="gen-out">
                    <div className="out-bar">
                      <div className="out-title">{generating?<span className="gen-ind"><span style={{width:5,height:5,borderRadius:"50%",background:"var(--amber)",display:"inline-block"}}/>Generating...</span>:streamText?(genForm.title||"Generated SOP"):"Output Preview"}</div>
                      {streamText&&!generating&&<button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(streamText);showToast("Copied.");}}>Copy</button>}
                    </div>
                    <div className="out-body" ref={outRef}>
                      {!streamText&&!generating?<div className="out-empty"><div className="out-empty-icon">📄</div><div className="out-empty-txt">SOP will appear here</div><div style={{fontSize:"0.75rem",color:"var(--dim)",maxWidth:200,lineHeight:1.6,marginTop:"0.35rem"}}>Fill in the details and click Generate.</div></div>:<>{streamText}{generating&&<span className="cursor"/>}</>}
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* SOP DETAIL */}
            {view==="sopDetail"&&liveSop&&(()=>{
              const rate=getSopAckRate(liveSop);
              return(
                <div className="sop-detail">
                  <div style={{marginBottom:"1.5rem",paddingBottom:"1.3rem",borderBottom:"1px solid var(--border)"}}>
                    <div style={{display:"flex",alignItems:"center",gap:"0.65rem",marginBottom:"0.6rem"}}><span className={"badge badge-"+liveSop.status}>{liveSop.status}</span><span className="tbl-mono">v{liveSop.version||1}</span><span className="tbl-mono">{fmtDate(liveSop.created)}</span></div>
                    <div className="sop-dtitle">{liveSop.title}</div>
                    <div className="sop-meta"><div className="sop-meta-item"><div className="dot-a"/>{liveSop.role}</div><div className="sop-meta-item"><div className="dot-a"/>{liveSop.industry}</div><div className="sop-meta-item"><div className="dot-a"/>{liveSop.locations.length} location{liveSop.locations.length!==1?"s":""}</div></div>
                    <div className="chips" style={{marginTop:"0.55rem"}}>{liveSop.locations.map(lid=><div key={lid} className="chip selected" style={{cursor:"default"}}>{getLocName(lid)}</div>)}</div>
                  </div>
                  <SopBody text={liveSop.body}/>
                  <div className="ack-panel">
                    <div><div style={{fontFamily:"'Barlow Condensed'",fontWeight:700,fontSize:"0.78rem",textTransform:"uppercase",letterSpacing:"0.06em",color:rate===100?"var(--green)":"var(--amber)"}}>{rate}% Acknowledged</div><div style={{fontSize:"0.7rem",color:"var(--dim)",marginTop:"0.15rem"}}>{liveSop.locations.length} location{liveSop.locations.length!==1?"s":""} assigned</div></div>
                    <div style={{flex:1,maxWidth:180,height:4,background:"var(--border)"}}><div style={{width:rate+"%",height:"100%",background:rate===100?"var(--green)":"var(--amber)",transition:"width 0.4s"}}/></div>
                    <div style={{display:"flex",gap:"0.45rem",flexWrap:"wrap"}}>
                      {liveSop.status==="draft"&&<button className="btn btn-green btn-sm" onClick={()=>{setSops(prev=>prev.map(s=>s.id===liveSop.id?{...s,status:"active"}:s));showToast("SOP published.");}}>Publish</button>}
                      <button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:"share",data:liveSop})}>Share</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>exportPDF(liveSop)}>PDF</button>
                      <button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText(liveSop.body);showToast("Copied.");}}>Copy</button>
                      <button className="btn btn-danger btn-sm" onClick={()=>{setSops(prev=>prev.filter(s=>s.id!==liveSop.id));navigate("library");showToast("Deleted.");}}>Delete</button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* ACKNOWLEDGMENTS */}
            {view==="acknowledgments"&&(()=>{
              const display=filterSop==="all"?sops.filter(s=>s.status==="active"):sops.filter(s=>s.id===filterSop);
              return(
                <div>
                  <div className="chips" style={{marginBottom:"1.2rem"}}>
                    <div className={"chip"+(filterSop==="all"?" selected":"")} onClick={()=>setFilterSop("all")}>All Active SOPs</div>
                    {sops.filter(s=>s.status==="active").map(s=><div key={s.id} className={"chip"+(filterSop===s.id?" selected":"")} onClick={()=>setFilterSop(s.id)}>{s.title}</div>)}
                  </div>
                  {display.map(sop=>(
                    <div key={sop.id} style={{marginBottom:"1.4rem"}}>
                      <div className="sec-hdr"><div><div className="sec-title">{sop.title}</div><div style={{fontSize:"0.7rem",color:"var(--dim)",marginTop:"0.12rem",fontFamily:"'IBM Plex Mono'"}}>{sop.role} · {getSopAckRate(sop)}% overall</div></div><button className="btn btn-ghost btn-sm" onClick={()=>openSop(sop)}>View SOP →</button></div>
                      <div className="ack-grid">
                        {sop.locations.map(locId=>{
                          const ls=staff[locId]||[];const acked=sop.acks?.[locId]||[];const rate=ls.length?Math.round((acked.length/ls.length)*100):0;
                          return(
                            <div key={locId} className="ack-card">
                              <div className="ack-card-title">{getLocName(locId)}</div>
                              <div className="ack-card-sub">{acked.length}/{ls.length} acknowledged · {rate}%</div>
                              <div style={{height:3,background:"var(--border)",marginBottom:"0.8rem"}}><div style={{width:rate+"%",height:"100%",background:rate===100?"var(--green)":"var(--amber)",transition:"width 0.4s"}}/></div>
                              {ls.map(name=>{const has=acked.includes(name);return<div key={name} className="ack-row"><span style={{color:"var(--white)",fontSize:"0.8rem",fontWeight:500}}>{name}</span>{has?<span className="ack-yes">Acknowledged</span>:<span className="ack-no" onClick={()=>toggleAck(sop.id,locId,name)}>Pending — Mark Done</span>}</div>;})}
                              {!ls.length&&<div style={{fontSize:"0.72rem",color:"var(--dim)",padding:"0.35rem 0"}}>No staff assigned.</div>}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                  {display.length===0&&<div className="empty"><div className="empty-icon">✅</div><div className="empty-title">No Active SOPs</div><div className="empty-sub">Publish a SOP to start tracking.</div></div>}
                </div>
              );
            })()}

            {/* LOCATIONS */}
            {view==="locations"&&(()=>(
              <div>
                <div className="loc-grid">
                  {locations.map(loc=>{
                    const ls=staff[loc.id]||[];const rate=getLocAckRate(loc.id);
                    const lr=avgRat(reviews.filter(r=>r.locationId===loc.id).map(r=>r.rating));
                    const locSops=sops.filter(s=>s.locations.includes(loc.id)&&s.status==="active");
                    return(
                      <div key={loc.id} className="loc-card">
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:"0.9rem"}}>
                          <div><div className="loc-name">{loc.name}</div><div className="loc-addr">{loc.address}</div></div>
                          <div style={{display:"flex",gap:"0.35rem"}}><span className="badge badge-active">Active</span><button className="btn btn-ghost btn-sm" onClick={()=>setModal({type:"location",data:loc})}>Edit</button></div>
                        </div>
                        <div className="loc-meta">
                          <div className="loc-meta-item"><strong>{ls.length}</strong>Staff</div>
                          <div className="loc-meta-item"><strong>{locSops.length}</strong>SOPs</div>
                          <div className="loc-meta-item"><strong style={{color:rate===100?"var(--green)":"var(--amber)"}}>{rate}%</strong>Ack'd</div>
                          <div className="loc-meta-item"><strong style={{color:parseFloat(lr)<4?"var(--rust)":"var(--amber)"}}>{lr}★</strong>Rating</div>
                        </div>
                        <div className="chips" style={{marginTop:"0.7rem"}}>
                          {ls.slice(0,4).map(n=><div key={n} className="staff-chip">{n}</div>)}
                          {ls.length>4&&<div className="staff-chip">+{ls.length-4}</div>}
                        </div>
                        <div style={{marginTop:"0.9rem",paddingTop:"0.8rem",borderTop:"1px solid var(--border)"}}>
                          <div style={{fontSize:"0.72rem",color:"var(--dim)",display:"flex",justifyContent:"space-between",marginBottom:"0.35rem"}}><span>SOP Acknowledgment</span><span>{rate}%</span></div>
                          <div style={{height:3,background:"var(--border)"}}><div style={{width:rate+"%",height:"100%",background:rate===100?"var(--green)":"var(--amber)",transition:"width 0.4s"}}/></div>
                          <div style={{marginTop:"0.7rem"}}><button className="btn btn-ghost btn-sm" onClick={()=>navigate("acknowledgments")}>View Acknowledgments →</button></div>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{background:"var(--steel2)",border:"1px dashed var(--border)",display:"flex",alignItems:"center",justifyContent:"center",minHeight:200,cursor:"pointer",transition:"border-color 0.13s"}} onClick={()=>setModal({type:"location",data:null})} onMouseEnter={e=>e.currentTarget.style.borderColor="var(--amber)"} onMouseLeave={e=>e.currentTarget.style.borderColor="var(--border)"}>
                    <div style={{textAlign:"center",color:"var(--dim)"}}><div style={{fontSize:"1.8rem",marginBottom:"0.35rem"}}>+</div><div style={{fontFamily:"'Barlow Condensed'",fontWeight:700,fontSize:"0.78rem",textTransform:"uppercase",letterSpacing:"0.1em"}}>Add Location</div></div>
                  </div>
                </div>
              </div>
            ))()}

            {/* REVIEWS — uses the hoisted ReviewsView component */}
            {view==="reviews"&&<ReviewsView reviews={reviews} reviewFilter={reviewFilter} setReviewFilter={setReviewFilter} locations={locations} getLocName={getLocName} genRespId={genRespId} generateReviewResponse={generateReviewResponse} showToast={showToast}/>}

            {/* ALERT SETTINGS */}
            {view==="alertsettings"&&(
              <div style={{maxWidth:680}}>
                <div className="insight" style={{marginBottom:"1.3rem"}}><div className="insight-lbl">How Email Alerts Work</div><div className="insight-txt">PlaybookAI monitors review platforms and SOP activity. When alert conditions are triggered, a notification appears in the bell icon and an email is sent to your configured address.</div></div>
                <div className="settings-section">
                  <div className="settings-title">Alert Email Address</div>
                  <div className="settings-sub">Alerts will be sent here when enabled below.</div>
                  <div className="form-group"><input className="form-input" value={alertSettings.emailAddress} onChange={e=>setAlertSettings(p=>({...p,emailAddress:e.target.value}))} placeholder="your@email.com"/></div>
                </div>
                <div className="settings-section">
                  <div className="settings-title">Review Alerts</div>
                  <div className="settings-sub">Get notified when new reviews are posted across your connected platforms.</div>
                  {[{key:"negativeReviews",label:"Negative Review Alert",sub:"Instant alert for any 1-2 star review"},{key:"positiveReviews",label:"Positive Review Notification",sub:"Get notified for 5-star reviews"},{key:"weeklyDigest",label:"Weekly Review Digest",sub:"Summary of all reviews every Monday"},].map(({key,label,sub})=>(
                    <div key={key} className="settings-row"><div><div className="settings-row-label">{label}</div><div className="settings-row-sub">{sub}</div></div><label className="tog"><input type="checkbox" checked={alertSettings[key]} onChange={e=>setAlertSettings(p=>({...p,[key]:e.target.checked}))}/><span className="tog-sl"/></label></div>
                  ))}
                </div>
                <div className="settings-section">
                  <div className="settings-title">Operations Alerts</div>
                  <div className="settings-sub">Stay on top of SOP compliance and acknowledgments.</div>
                  {[{key:"ackReminders",label:"Acknowledgment Reminder",sub:"Alert when staff haven't acknowledged within 48 hours"},{key:"sopUpdates",label:"SOP Update Notifications",sub:"Notify managers when their assigned SOP is updated"},].map(({key,label,sub})=>(
                    <div key={key} className="settings-row"><div><div className="settings-row-label">{label}</div><div className="settings-row-sub">{sub}</div></div><label className="tog"><input type="checkbox" checked={alertSettings[key]} onChange={e=>setAlertSettings(p=>({...p,[key]:e.target.checked}))}/><span className="tog-sl"/></label></div>
                  ))}
                </div>
                <div style={{display:"flex",gap:"0.6rem"}}>
                  <button className="btn btn-primary" onClick={()=>showToast("Settings saved.")}>Save Settings</button>
                  <button className="btn btn-ghost" onClick={()=>{setAlerts(prev=>prev.map(a=>({...a,read:true})));showToast("Notifications cleared.");}}>Clear All</button>
                </div>
              </div>
            )}

            {/* ONBOARDING EMAILS */}
            {view==="onboarding"&&(
              <div>
                <div className="insight" style={{marginBottom:"1.5rem"}}><div className="insight-lbl">Trial Onboarding Sequence — 7 Emails over 13 Days</div><div className="insight-txt">Fires automatically when a new user starts a free trial. Click any email to expand and copy the full copy.</div></div>
                <div className="email-timeline">
                  {ONBOARDING_EMAILS.map((email,i)=>(
                    <div key={i} className="email-node">
                      <div className={"email-dot"+(i===0?" first":"")}>{email.day===0?"0d":"D"+email.day}</div>
                      <div className="email-card">
                        <div className="email-hdr" onClick={()=>setExpandedEmail(expandedEmail===i?null:i)}>
                          <div className="email-day">{email.day===0?"Immediate":"Day "+email.day}</div>
                          <div style={{flex:1,minWidth:0}}><div className="email-subj">{email.subject}</div></div>
                          <div style={{fontFamily:"'IBM Plex Mono'",fontSize:"0.68rem",color:"var(--dim)",flexShrink:0}}>{expandedEmail===i?"▲":"▼"}</div>
                        </div>
                        {expandedEmail===i&&(
                          <div className="email-body-expanded">
                            <div className="email-body-text">{email.body}</div>
                            <div style={{display:"flex",gap:"0.5rem",marginTop:"0.8rem"}}>
                              <button className="btn btn-ghost btn-sm" onClick={()=>{navigator.clipboard.writeText("Subject: "+email.subject+"\n\n"+email.body);showToast("Email copied.");}}>Copy Email</button>
                              <span style={{fontSize:"0.72rem",color:"var(--dim)",alignSelf:"center",fontFamily:"'IBM Plex Mono'"}}>{email.body.split(" ").length} words</span>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>{/* end .content */}
        </div>{/* end .main */}

        {/* NOTIFICATION PANEL */}
        {alertPanelOpen&&(
          <div className="alert-panel">
            <div className="alert-ph">
              <div className="alert-ph-title">Notifications {unreadAlerts>0&&<span style={{fontSize:"0.65rem",background:"var(--rust)",color:"#fff",padding:"0.12rem 0.4rem",marginLeft:"0.4rem",fontFamily:"'Barlow Condensed'",fontWeight:700}}>{unreadAlerts}</span>}</div>
              <div style={{display:"flex",gap:"0.4rem"}}>
                <button className="btn btn-ghost btn-sm" onClick={()=>{setAlerts(prev=>prev.map(a=>({...a,read:true})));showToast("All read.");}}>Mark Read</button>
                <button className="btn btn-ghost btn-sm" onClick={()=>setAlertPanelOpen(false)}>✕</button>
              </div>
            </div>
            <div className="alert-scroll">
              {alerts.map(a=>(
                <div key={a.id} className={"alert-item"+(a.read?"":" unread")} style={{borderLeftColor:sevColor(a.severity)}} onClick={()=>{setAlerts(prev=>prev.map(x=>x.id===a.id?{...x,read:true}:x));if(a.type.includes("review"))navigate("reviews");}}>
                  <div style={{display:"flex",alignItems:"flex-start",gap:"0.6rem",marginBottom:"0.3rem"}}><span style={{fontSize:"1rem",flexShrink:0}}>{aIcon(a.type)}</span><div className="alert-title">{a.title}</div></div>
                  <div className="alert-body">{a.body}</div>
                  <div style={{display:"flex",alignItems:"center",justifyContent:"space-between"}}><span className="alert-time">{fmtTime(a.timestamp)}</span>{!a.read&&<span style={{width:6,height:6,borderRadius:"50%",background:"var(--amber)",display:"inline-block"}}/>}</div>
                </div>
              ))}
              {alerts.length===0&&<div style={{padding:"2rem",textAlign:"center",color:"var(--dim)",fontSize:"0.82rem"}}>No notifications.</div>}
            </div>
            <div className="alert-footer">
              <div className="alert-footer-title">Quick Toggles</div>
              {[{key:"negativeReviews",label:"Negative alerts"},{key:"ackReminders",label:"Ack reminders"},{key:"weeklyDigest",label:"Weekly digest"}].map(({key,label})=>(
                <div key={key} className="toggle-row"><span className="toggle-label">{label}</span><label className="tog"><input type="checkbox" checked={alertSettings[key]} onChange={e=>setAlertSettings(p=>({...p,[key]:e.target.checked}))}/><span className="tog-sl"/></label></div>
              ))}
              <button className="btn btn-ghost btn-sm" style={{marginTop:"0.7rem",width:"100%",justifyContent:"center"}} onClick={()=>{setAlertPanelOpen(false);navigate("alertsettings");}}>Full Settings →</button>
            </div>
          </div>
        )}

        {/* MODALS */}
        {modal?.type==="location"&&<LocationModal data={modal.data} staff={staff} setStaff={setStaff} onClose={()=>setModal(null)} onSave={(form,isEdit)=>{if(!form.name.trim()){showToast("Name required.","warn");return;}if(isEdit){setLocations(prev=>prev.map(l=>l.id===form.id?form:l));}else{setLocations(prev=>[...prev,form]);if(!staff[form.id])setStaff(prev=>({...prev,[form.id]:[]}));}showToast(isEdit?"Location updated.":"Location added.");setModal(null);}}/>}
        {modal?.type==="share"&&<ShareModal sop={modal.data} getLocName={getLocName} onExportPDF={exportPDF} onClose={()=>setModal(null)} showToast={showToast}/>}

        {toast&&<div className={"toast"+(toast.type==="warn"?" warn":toast.type==="err"?" err":"")}>{toast.msg}</div>}
      </div>
    </>
  );
}
