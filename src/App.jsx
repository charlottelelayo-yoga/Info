import { useState, useEffect } from "react";
import { supabase } from "./supabase.js";

const fontLink = document.createElement("link");
fontLink.rel = "stylesheet";
fontLink.href = "https://fonts.googleapis.com/css2?family=DM+Sans:ital,wght@0,400;0,500;0,600;1,400&family=DM+Serif+Display&display=swap";
document.head.appendChild(fontLink);

const ADMIN_PASSWORD = "yoga2025";
const C = {
  teal:"#5bb8b0",tealLight:"#e6f7f6",tealMid:"#a8deda",
  bg:"#f4fafa",card:"rgba(255,255,255,0.92)",
  text:"#1e3a38",muted:"#7aa09e",border:"rgba(91,184,176,0.18)",
  red:"#e07070",redLight:"#fdeaea",
  amber:"#d4924a",amberLight:"#fdf0e0",
  green:"#4aaa7a",greenLight:"#e4f5ec",
  purple:"#9b7fc2",purpleLight:"#f0eafa",
};

const fmt = d => new Date(d).toLocaleDateString("en-GB",{day:"2-digit",month:"short",year:"numeric"});
const todayStr = () => new Date().toISOString().split("T")[0];
const inOneYear = () => { const d=new Date(); d.setFullYear(d.getFullYear()+1); return d.toISOString().split("T")[0]; };
const isExp = d => new Date(d) < new Date();
const daysLeft = d => Math.ceil((new Date(d)-new Date())/86400000);
const DAYS = ["Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday"];

const S = {
  wrap:{fontFamily:"'DM Sans',sans-serif",minHeight:"100vh",background:C.bg,color:C.text},
  hdr:{background:"rgba(255,255,255,0.95)",backdropFilter:"blur(12px)",borderBottom:`1px solid ${C.border}`,padding:"14px 20px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:20},
  logo:{fontFamily:"'DM Serif Display',serif",fontSize:"1.2rem",color:C.teal},
  nav:{display:"flex",gap:3,background:"rgba(91,184,176,0.08)",borderRadius:12,padding:3},
  navBtn:a=>({background:a?"#fff":"transparent",color:a?C.teal:C.muted,border:"none",borderRadius:10,padding:"6px 11px",fontSize:"0.82rem",fontWeight:a?600:400,cursor:"pointer",fontFamily:"inherit",boxShadow:a?"0 1px 4px rgba(91,184,176,0.15)":"none",whiteSpace:"nowrap"}),
  page:{maxWidth:480,margin:"0 auto",padding:"16px 14px 48px"},
  card:{background:C.card,borderRadius:16,padding:"16px 18px",marginBottom:12,border:`1px solid ${C.border}`,boxShadow:"0 2px 12px rgba(91,184,176,0.07)"},
  lbl:{fontSize:"0.7rem",fontWeight:600,color:C.muted,letterSpacing:"0.08em",textTransform:"uppercase",display:"block",marginBottom:5},
  inp:{width:"100%",border:`1.5px solid ${C.tealMid}`,borderRadius:10,padding:"10px 13px",fontSize:"0.95rem",fontFamily:"inherit",background:"#fff",boxSizing:"border-box",outline:"none",color:C.text,marginBottom:10},
  btnMain:{width:"100%",background:C.teal,color:"#fff",border:"none",borderRadius:12,padding:"12px",fontSize:"0.95rem",fontWeight:600,cursor:"pointer",fontFamily:"inherit",marginTop:4},
  btnGhost:{width:"100%",background:"transparent",color:C.teal,border:`1.5px solid ${C.tealMid}`,borderRadius:12,padding:"11px",fontSize:"0.95rem",cursor:"pointer",fontFamily:"inherit",marginTop:8},
  btnSm:(bg,col)=>({background:bg||C.teal,color:col||"#fff",border:"none",borderRadius:8,padding:"6px 12px",fontSize:"0.8rem",fontWeight:500,cursor:"pointer",fontFamily:"inherit"}),
  err:{color:C.red,fontSize:"0.84rem",marginTop:2,marginBottom:6},
  ok:{color:C.green,fontSize:"0.84rem",marginTop:4},
  overlay:{position:"fixed",inset:0,background:"rgba(10,40,38,0.45)",backdropFilter:"blur(6px)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:20},
  modal:{background:"#fff",borderRadius:20,padding:26,width:"100%",maxWidth:360,boxShadow:"0 24px 60px rgba(30,80,78,0.18)",maxHeight:"90vh",overflowY:"auto"},
};

function Modal({title,onClose,children}){
  return <div style={S.overlay}><div style={S.modal}>
    <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
      <div style={{fontWeight:600,fontSize:"1rem"}}>{title}</div>
      <button onClick={onClose} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"1.3rem",lineHeight:1}}>×</button>
    </div>
    {children}
  </div></div>;
}

function AbsenceBanner({banner}){
  if(!banner?.active || !banner?.message) return null;
  return (
    <div style={{background:"#fff8ed",borderBottom:`1px solid #f0d890`,padding:"10px 20px",textAlign:"center"}}>
      <span style={{fontSize:"0.9rem",color:"#8a6a20"}}>
        🌴 {banner.message}
        {banner.date_from && banner.date_to && <span style={{fontWeight:600}}> · {fmt(banner.date_from)} – {fmt(banner.date_to)}</span>}
        {banner.resume_date && <span> · Back {fmt(banner.resume_date)}</span>}
      </span>
    </div>
  );
}

function BannerEditor({banner,onUpdate}){
  const [editing,setEditing]=useState(false);
  const [draft,setDraft]=useState(banner||{});

  useEffect(()=>{ setDraft(banner||{}); },[banner]);

  const save=async()=>{
    await supabase.from('banner').update({
      message:draft.message,
      date_from:draft.date_from||null,
      date_to:draft.date_to||null,
      resume_date:draft.resume_date||null,
    }).eq('id',banner.id);
    onUpdate();
    setEditing(false);
  };

  const toggle=async()=>{
    await supabase.from('banner').update({active:!banner.active}).eq('id',banner.id);
    onUpdate();
  };

  if(!banner) return null;

  return (
    <div style={{...S.card,border:`1.5px solid ${banner.active?"#f0d890":C.border}`,background:banner.active?"#fff8ed":C.card,marginBottom:14}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
        <div>
          <div style={{fontWeight:600,fontSize:"0.9rem"}}>🌴 Absence banner</div>
          <div style={{fontSize:"0.78rem",color:C.muted,marginTop:2}}>{banner.active?"Visible to students":"Hidden"}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          <button onClick={()=>setEditing(!editing)} style={S.btnSm("transparent",C.teal)}>Edit</button>
          <button onClick={toggle} style={S.btnSm(banner.active?C.amber:C.green)}>{banner.active?"Deactivate":"Activate"}</button>
        </div>
      </div>
      {banner.active&&banner.message&&<div style={{marginTop:10,padding:"8px 12px",background:"rgba(240,216,144,0.2)",borderRadius:8,fontSize:"0.82rem",color:"#8a6a20",fontStyle:"italic"}}>
        "{banner.message}{banner.date_from&&banner.date_to?` · ${fmt(banner.date_from)} – ${fmt(banner.date_to)}`:""}{banner.resume_date?` · Back ${fmt(banner.resume_date)}`:""}"
      </div>}
      {editing&&<div style={{marginTop:14,paddingTop:14,borderTop:`1px solid ${C.border}`}}>
        <label style={S.lbl}>Message</label>
        <input style={S.inp} value={draft.message||""} onChange={e=>setDraft({...draft,message:e.target.value})} placeholder="No classes from…"/>
        <div style={{display:"flex",gap:10}}>
          <div style={{flex:1}}><label style={S.lbl}>From</label><input style={S.inp} type="date" value={draft.date_from||""} onChange={e=>setDraft({...draft,date_from:e.target.value})}/></div>
          <div style={{flex:1}}><label style={S.lbl}>To</label><input style={S.inp} type="date" value={draft.date_to||""} onChange={e=>setDraft({...draft,date_to:e.target.value})}/></div>
        </div>
        <label style={S.lbl}>Back on</label>
        <input style={S.inp} type="date" value={draft.resume_date||""} onChange={e=>setDraft({...draft,resume_date:e.target.value})}/>
        <div style={{display:"flex",gap:8,marginTop:4}}>
          <button style={{...S.btnMain,margin:0}} onClick={save}>Save</button>
          <button style={{...S.btnGhost,margin:0}} onClick={()=>setEditing(false)}>Cancel</button>
        </div>
      </div>}
    </div>
  );
}

function ClassCard({cls,isAdmin,onToggleConfirm,onEdit}){
  const [open,setOpen]=useState(false);
  return (
    <div
      onClick={()=>setOpen(!open)}
      style={{background:cls.is_private?"#fff":C.tealLight,borderRadius:12,padding:"12px 14px",marginBottom:8,border:`1px solid ${cls.is_private?C.border:"rgba(91,184,176,0.25)"}`,borderLeft:`3px solid ${cls.type==="sound"?C.purple:C.teal}`,cursor:"pointer"}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,flexWrap:"wrap",marginBottom:2}}>
            <span style={{fontWeight:600,fontSize:"0.93rem"}}>{cls.time} · {cls.title}</span>
            {cls.confirmed&&<span style={{background:C.greenLight,color:C.green,fontSize:"0.67rem",fontWeight:700,padding:"1px 7px",borderRadius:10}}>✓ Confirmed</span>}
          </div>
          <div style={{fontSize:"0.82rem",color:C.muted}}>{cls.location}</div>
          {cls.in_package&&<span style={{background:C.tealLight,color:C.teal,fontSize:"0.67rem",fontWeight:700,padding:"1px 7px",borderRadius:10,marginTop:4,display:"inline-block",border:`1px solid ${C.tealMid}`}}>Included in package</span>}
        </div>
        <span style={{color:C.muted,fontSize:"0.8rem",paddingLeft:8,flexShrink:0}}>{open?"▲":"▼"}</span>
      </div>
      {open&&<div onClick={e=>e.stopPropagation()} style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${C.border}`}}>
        {cls.address&&<div style={{fontSize:"0.82rem",color:C.muted,marginBottom:6}}>📍 {cls.address}</div>}
        {cls.description&&<div style={{fontSize:"0.83rem",color:"#5a7a78",lineHeight:1.6,marginBottom:8,fontStyle:"italic"}}>{cls.description}</div>}
        {cls.note&&!cls.description&&<div style={{fontSize:"0.82rem",color:C.muted,marginBottom:8,fontStyle:"italic"}}>{cls.note}</div>}
        <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
          {cls.contact_whatsapp&&<a href="https://wa.me/66929658549" target="_blank" rel="noreferrer" style={{background:"#25D366",color:"#fff",borderRadius:8,padding:"7px 13px",fontSize:"0.8rem",fontWeight:600,textDecoration:"none"}}>💬 WhatsApp to book</a>}
          {cls.contact_line&&<div style={{background:"#06C755",color:"#fff",borderRadius:8,padding:"7px 13px",fontSize:"0.8rem",fontWeight:600,display:"inline-block"}}>LINE ID: @Isora</div>}
        </div>
        {isAdmin&&<div style={{display:"flex",gap:8,marginTop:10}}>
          <button style={S.btnSm(cls.confirmed?C.amber:C.green)} onClick={()=>onToggleConfirm(cls)}>{cls.confirmed?"Unconfirm":"✓ Confirm"}</button>
          <button style={S.btnSm("transparent",C.teal)} onClick={()=>onEdit(cls)}>Edit</button>
        </div>}
      </div>}
    </div>
  );
}

function EventCard({e,isAdmin,onToggleConfirm,onEdit}){
  const [open,setOpen]=useState(false);
  return (
    <div
      onClick={()=>setOpen(!open)}
      style={{background:C.purpleLight,borderRadius:12,padding:"14px 16px",marginBottom:8,border:"1px solid rgba(155,127,194,0.2)",borderLeft:`3px solid ${C.purple}`,cursor:"pointer"}}
    >
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
        <div style={{flex:1}}>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:3,flexWrap:"wrap"}}>
            <span style={{fontWeight:600,fontSize:"0.95rem"}}>{e.title}</span>
            {e.confirmed&&<span style={{background:C.greenLight,color:C.green,fontSize:"0.67rem",fontWeight:700,padding:"1px 7px",borderRadius:10}}>✓ Confirmed</span>}
          </div>
          <div style={{fontSize:"0.82rem",color:C.muted}}>{fmt(e.date)} · {e.time}</div>
          {e.subtitle&&<div style={{fontSize:"0.78rem",color:C.purple,marginTop:3}}>{e.subtitle}</div>}
          {e.price&&<div style={{fontSize:"0.85rem",fontWeight:600,color:C.text,marginTop:4}}>{e.price}</div>}
        </div>
        <span style={{color:C.muted,fontSize:"0.8rem",paddingLeft:8,flexShrink:0}}>{open?"▲":"▼"}</span>
      </div>
      {open&&<div onClick={e=>e.stopPropagation()} style={{marginTop:12,paddingTop:12,borderTop:"1px solid rgba(155,127,194,0.15)"}}>
        {e.description&&<div style={{fontSize:"0.83rem",color:"#5a7a78",lineHeight:1.65,marginBottom:12,fontStyle:"italic"}}>{e.description}</div>}
        {e.contact_whatsapp&&<a href="https://wa.me/66929658549" target="_blank" rel="noreferrer" style={{display:"inline-block",background:"#25D366",color:"#fff",borderRadius:8,padding:"7px 13px",fontSize:"0.8rem",fontWeight:600,textDecoration:"none",marginBottom:isAdmin?10:0}}>💬 WhatsApp to book</a>}
        {isAdmin&&<div style={{display:"flex",gap:8,marginTop:e.contact_whatsapp?8:0}}>
          <button style={S.btnSm(e.confirmed?C.amber:C.green)} onClick={()=>onToggleConfirm(e)}>{e.confirmed?"Unconfirm":"✓ Confirm"}</button>
          <button style={S.btnSm("transparent",C.teal)} onClick={()=>onEdit(e)}>Edit</button>
        </div>}
      </div>}
    </div>
  );
}

function ScheduleView({schedule,events,isAdmin,onToggleConfirm,onEdit,onToggleEventConfirm,onEditEvent,onAddClass,onAddEvent}){
  const [typeFilter,setTypeFilter]=useState("all");
  const [showStudio,setShowStudio]=useState(true);
  const filtered=schedule.filter(c=>(typeFilter==="all"||c.type===typeFilter)&&(showStudio||c.is_private));
  const filteredEvents=typeFilter==="all"?events:events.filter(e=>e.type===typeFilter);
  const upcoming=filteredEvents.filter(e=>new Date(e.date)>=new Date()).sort((a,b)=>new Date(a.date)-new Date(b.date));
  const byDay=DAYS.map(day=>({day,priv:filtered.filter(c=>c.day===day&&c.is_private),studio:filtered.filter(c=>c.day===day&&!c.is_private)})).filter(d=>d.priv.length>0||d.studio.length>0);
  return <div style={S.page}>
    <div style={{display:"flex",gap:6,flexWrap:"wrap",marginBottom:14,alignItems:"center"}}>
      {[{v:"all",l:"All"},{v:"yoga",l:"🧘 Yoga"},{v:"sound",l:"🔔 Sound"}].map(o=>(
        <button key={o.v} onClick={()=>setTypeFilter(o.v)} style={{background:typeFilter===o.v?C.teal:"rgba(91,184,176,0.08)",color:typeFilter===o.v?"#fff":C.muted,border:`1.5px solid ${typeFilter===o.v?C.teal:C.border}`,borderRadius:20,padding:"5px 12px",fontSize:"0.8rem",fontWeight:typeFilter===o.v?600:400,cursor:"pointer",fontFamily:"inherit"}}>{o.l}</button>
      ))}
      <button onClick={()=>setShowStudio(!showStudio)} style={{background:!showStudio?C.teal:"rgba(91,184,176,0.08)",color:!showStudio?"#fff":C.muted,border:`1.5px solid ${!showStudio?C.teal:C.border}`,borderRadius:20,padding:"5px 12px",fontSize:"0.8rem",cursor:"pointer",fontFamily:"inherit",marginLeft:"auto",fontWeight:!showStudio?600:400}}>
        {showStudio?"Hide studios":"Show studios"}
      </button>
    </div>
    {isAdmin&&<div style={{display:"flex",gap:8,marginBottom:16}}>
      <button style={{...S.btnSm(C.teal),flex:1,padding:"10px"}} onClick={onAddClass}>+ Add class</button>
      <button style={{...S.btnSm(C.purple),flex:1,padding:"10px"}} onClick={onAddEvent}>+ Special event</button>
    </div>}
    {upcoming.length>0&&<div style={{marginBottom:20}}>
      <div style={{fontSize:"0.7rem",fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10}}>Special Events</div>
      {upcoming.map(e=><EventCard key={e.id} e={e} isAdmin={isAdmin} onToggleConfirm={onToggleEventConfirm||(()=>{})} onEdit={onEditEvent||(()=>{})}/>)}
    </div>}
    {byDay.map(({day,priv,studio})=>(
      <div key={day} style={{marginBottom:18}}>
        <div style={{fontSize:"0.75rem",fontWeight:600,color:C.teal,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:8,paddingLeft:2}}>{day}</div>
        {priv.map(c=><ClassCard key={c.id} cls={c} isAdmin={isAdmin} onToggleConfirm={onToggleConfirm||(()=>{})} onEdit={onEdit||(()=>{})}/>)}
        {studio.length>0&&<>
          {priv.length>0&&<div style={{fontSize:"0.7rem",color:C.muted,margin:"2px 0 6px 2px"}}>Also at studios</div>}
          {studio.map(c=><ClassCard key={c.id} cls={c} isAdmin={isAdmin} onToggleConfirm={onToggleConfirm||(()=>{})} onEdit={onEdit||(()=>{})}/>)}
        </>}
      </div>
    ))}
    {byDay.length===0&&<div style={{textAlign:"center",color:C.muted,padding:"40px 0",fontStyle:"italic"}}>No classes to show</div>}
  </div>;
}

function PricingTab(){
  const groupPlans=[
    {id:"single",label:"Drop-in",classes:"1 class",price:"400",perClass:"400 / class",highlight:false,badge:null,desc:"Try a class or drop in when your schedule allows."},
    {id:"five",label:"5-Class Pack",classes:"5 classes · 1 year validity",price:"1,850",perClass:"370 / class",highlight:false,badge:"Save 150 THB",desc:"A regular practice at better value."},
    {id:"ten",label:"10-Class Pack",classes:"10 classes · 1 year validity",price:"3,500",perClass:"350 / class",highlight:true,badge:"Best Value",desc:"For committed practitioners. Maximum savings, maximum flexibility."},
  ];
  const privateSessions=[
    {icon:"🧘",label:"Private Yoga",price:"1,200 THB"},
    {icon:"🔔",label:"Private Sound Healing",price:"1,500 THB"},
    {icon:"✋",label:"Private Reiki",price:"1,500 THB"},
    {icon:"✨",label:"Reiki & Sound",sub:"90 min",price:"1,800 THB"},
  ];
  return <div style={S.page}>
    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"1.3rem",color:C.text,marginBottom:4}}>Group Classes</div>
    <div style={{fontSize:"0.85rem",color:C.muted,marginBottom:18}}>Private group classes in Bangkok · all levels welcome</div>

    {groupPlans.map(p=>(
      <div key={p.id} style={{
        background:"#fff",borderRadius:14,padding:"16px 18px",marginBottom:10,
        border:p.highlight?`2px solid ${C.teal}`:`1px solid ${C.border}`,
        boxShadow:p.highlight?"0 4px 16px rgba(91,184,176,0.12)":"0 1px 4px rgba(91,184,176,0.05)",
        position:"relative"
      }}>
        {p.badge&&<div style={{
          position:"absolute",top:-1,right:16,
          background:p.highlight?C.teal:"rgba(91,184,176,0.12)",
          color:p.highlight?"#fff":C.teal,
          fontSize:"0.68rem",fontWeight:700,padding:"3px 10px",
          borderRadius:"0 0 8px 8px",letterSpacing:"0.06em",textTransform:"uppercase"
        }}>{p.badge}</div>}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginTop:p.badge?8:0}}>
          <div>
            <div style={{fontWeight:700,fontSize:"1rem",color:C.text}}>{p.label}</div>
            <div style={{fontSize:"0.78rem",color:C.muted,marginTop:2}}>{p.classes}</div>
            <div style={{fontSize:"0.83rem",color:C.muted,lineHeight:1.5,marginTop:6,maxWidth:200}}>{p.desc}</div>
          </div>
          <div style={{textAlign:"right",flexShrink:0,marginLeft:12}}>
            <div style={{fontSize:"1.9rem",fontWeight:700,color:p.highlight?C.teal:C.text,lineHeight:1,fontFamily:"'DM Serif Display',serif"}}>{p.price}</div>
            <div style={{fontSize:"0.7rem",color:C.muted,marginTop:3}}>THB</div>
            <div style={{fontSize:"0.72rem",color:p.highlight?C.teal:C.muted,fontWeight:600,marginTop:2}}>{p.perClass}</div>
          </div>
        </div>
      </div>
    ))}

    <a href="https://wa.me/66929658549" target="_blank" rel="noreferrer" style={{display:"block",textAlign:"center",background:C.teal,color:"#fff",borderRadius:12,padding:"12px",fontSize:"0.9rem",fontWeight:600,textDecoration:"none",marginBottom:28}}>
      💬 Book a group class via WhatsApp
    </a>

    <div style={{fontFamily:"'DM Serif Display',serif",fontSize:"1.3rem",color:C.text,marginBottom:4}}>Private Sessions</div>
    <div style={{fontSize:"0.85rem",color:C.muted,marginBottom:14}}>One-on-one · tailored to your needs</div>
    <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:20}}>
      {privateSessions.map((s,i)=>(
        <div key={i} style={{background:"#fff",borderRadius:14,padding:"18px 12px",textAlign:"center",border:`1px solid ${C.border}`,boxShadow:"0 1px 4px rgba(91,184,176,0.05)"}}>
          <div style={{fontSize:"1.6rem",marginBottom:6}}>{s.icon}</div>
          <div style={{fontWeight:600,fontSize:"0.88rem",color:C.text,marginBottom:2}}>{s.label}</div>
          {s.sub&&<div style={{fontSize:"0.72rem",color:C.muted,marginBottom:4}}>{s.sub}</div>}
          <div style={{fontSize:"1.1rem",fontWeight:700,color:C.teal,marginTop:6,fontFamily:"'DM Serif Display',serif"}}>{s.price}</div>
        </div>
      ))}
    </div>

    <a href="https://wa.me/66929658549" target="_blank" rel="noreferrer" style={{display:"block",textAlign:"center",background:"transparent",color:C.teal,border:`1.5px solid ${C.teal}`,borderRadius:12,padding:"11px",fontSize:"0.9rem",fontWeight:600,textDecoration:"none",marginBottom:28}}>
      💬 Book a private session via WhatsApp
    </a>

    <div style={{...S.card,borderLeft:`3px solid ${C.purple}`,marginBottom:10}}>
      <div style={{fontWeight:600,fontSize:"0.95rem",marginBottom:4}}>🎵 Special Events</div>
      <div style={{fontSize:"0.83rem",color:C.muted,lineHeight:1.5}}>Sound healings, workshops & pop-up classes. Pricing varies — check the Schedule tab for upcoming sessions.</div>
    </div>

    <div style={{fontSize:"0.7rem",fontWeight:600,color:C.muted,textTransform:"uppercase",letterSpacing:"0.09em",margin:"20px 0 10px"}}>Also at Studios</div>
    <div style={{display:"flex",gap:10}}>
      <a href="https://aadiyogacenter.com/packageplans" target="_blank" rel="noreferrer" style={{flex:1,background:"#fff",borderRadius:14,textDecoration:"none",textAlign:"center",borderTop:`3px solid ${C.teal}`,border:`1px solid ${C.border}`,borderTopColor:C.teal,padding:"16px 12px",boxShadow:"0 1px 4px rgba(91,184,176,0.05)"}}>
        <div style={{fontSize:"0.95rem",fontWeight:600,color:C.text,marginBottom:4}}>Aadi Yoga</div>
        <div style={{fontSize:"0.75rem",color:C.muted,marginBottom:8}}>Sukhumvit Soi 10</div>
        <div style={{fontSize:"0.78rem",color:C.teal,fontWeight:600}}>View packages →</div>
      </a>
      <a href="https://www.instagram.com/p/DVbhgfYkqRQ/" target="_blank" rel="noreferrer" style={{flex:1,background:"#fff",borderRadius:14,textDecoration:"none",textAlign:"center",border:`1px solid ${C.border}`,borderTopColor:C.teal,borderTop:`3px solid ${C.teal}`,padding:"16px 12px",boxShadow:"0 1px 4px rgba(91,184,176,0.05)"}}>
        <div style={{fontSize:"0.95rem",fontWeight:600,color:C.text,marginBottom:4}}>Isora Wellness</div>
        <div style={{fontSize:"0.75rem",color:C.muted,marginBottom:8}}>Sathorn Soi 12</div>
        <div style={{fontSize:"0.78rem",color:C.teal,fontWeight:600}}>View packages →</div>
      </a>
    </div>
  </div>;
}

function MyClassesTab({students}){
  const [input,setInput]=useState("");
  const [found,setFound]=useState(null);
  const [err,setErr]=useState("");
  const search=()=>{
    const f=students.find(s=>s.name.toLowerCase()===input.trim().toLowerCase());
    f?(setFound(f),setErr("")):(setFound(null),setErr("Name not found — check the spelling!"));
  };
  const getActive=st=>st.packages.filter(p=>!isExp(p.expiry)&&p.credits>0);
  const tot=st=>getActive(st).reduce((a,p)=>a+p.credits,0);
  return <div style={S.page}>
    <div style={S.card}>
      <label style={S.lbl}>Your first name</label>
      <input style={S.inp} value={input} onChange={e=>{setInput(e.target.value);setErr("");setFound(null);}} placeholder="e.g. Juliette" onKeyDown={e=>e.key==="Enter"&&search()}/>
      {err&&<div style={S.err}>{err}</div>}
      <button style={S.btnMain} onClick={search}>Check my classes →</button>
    </div>
    {found&&(()=>{
      const act=getActive(found); const t=tot(found);
      return <div style={S.card}>
        <div style={{fontWeight:600,fontSize:"1.05rem",marginBottom:12}}>{found.name}</div>
        {act.length===0
          ?<div style={{color:C.red,fontStyle:"italic",fontSize:"0.9rem"}}>No active classes — contact your teacher to renew!</div>
          :<>
            <div style={{display:"flex",alignItems:"flex-end",gap:8,marginBottom:14}}>
              <div style={{fontSize:"2.6rem",fontWeight:700,color:t>3?C.teal:t>0?C.amber:C.red,lineHeight:1}}>{t}</div>
              <div style={{color:C.muted,fontSize:"0.9rem",paddingBottom:6}}>classes remaining</div>
            </div>
            {act.sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).map(p=>(
              <div key={p.id} style={{background:C.tealLight,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
                  <span style={{fontWeight:600,fontSize:"0.88rem"}}>{p.credits} / {p.original} classes</span>
                  <span style={{background:daysLeft(p.expiry)<30?C.amberLight:C.greenLight,color:daysLeft(p.expiry)<30?C.amber:C.green,fontSize:"0.7rem",fontWeight:700,padding:"2px 9px",borderRadius:10}}>
                    {daysLeft(p.expiry)<30?`${daysLeft(p.expiry)}d left`:`Expires ${fmt(p.expiry)}`}
                  </span>
                </div>
                <div style={{height:4,background:"rgba(91,184,176,0.15)",borderRadius:4,marginBottom:p.sessions?.length?8:0}}>
                  <div style={{width:`${((p.original-p.credits)/p.original)*100}%`,height:4,background:C.teal,borderRadius:4}}/>
                </div>
                {p.sessions?.length>0&&<details>
                  <summary style={{fontSize:"0.75rem",color:C.muted,cursor:"pointer"}}>Redeemed ({p.sessions.length})</summary>
                  <div style={{display:"flex",flexWrap:"wrap",gap:4,marginTop:6}}>
                    {[...p.sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((s,i)=>(
                      <span key={i} style={{background:"rgba(91,184,176,0.12)",borderRadius:6,padding:"2px 8px",fontSize:"0.73rem",color:C.teal}}>{fmt(s.date)}</span>
                    ))}
                  </div>
                </details>}
              </div>
            ))}
          </>}
      </div>;
    })()}
  </div>;
}

function StudentsPanel({students,onRefresh}){
  const [modal,setModal]=useState(null);
  const [search,setSearch]=useState("");
  const [newName,setNewName]=useState(""); const [newCr,setNewCr]=useState(10); const [newExp,setNewExp]=useState(inOneYear()); const [addMsg,setAddMsg]=useState("");
  const [showArch,setShowArch]=useState({});

  const getActive=st=>st.packages.filter(p=>!isExp(p.expiry)&&p.credits>0);
  const getArchived=st=>st.packages.filter(p=>isExp(p.expiry)||p.credits===0);
  const tot=st=>getActive(st).reduce((a,p)=>a+p.credits,0);
  const filtered=students.filter(s=>s.name.toLowerCase().includes(search.toLowerCase()));

  const addStudent=async()=>{
    if(!newName.trim())return;
    if(students.find(s=>s.name.toLowerCase()===newName.trim().toLowerCase())){setAddMsg("Already exists!");return;}
    const {data:st}=await supabase.from('students').insert({name:newName.trim()}).select().single();
    await supabase.from('packages').insert({student_id:st.id,original:parseInt(newCr),credits:parseInt(newCr),expiry:newExp});
    setNewName("");setNewCr(10);setNewExp(inOneYear());setAddMsg("✓ Added!");setTimeout(()=>setAddMsg(""),2500);
    onRefresh();
  };

  const deduct=async(sid,date)=>{
    const st=students.find(s=>s.id===sid);
    const active=st.packages.filter(p=>!isExp(p.expiry)&&p.credits>0).sort((a,b)=>new Date(a.expiry)-new Date(b.expiry));
    if(!active.length)return;
    const pkg=active[0];
    await supabase.from('packages').update({credits:pkg.credits-1}).eq('id',pkg.id);
    await supabase.from('sessions').insert({package_id:pkg.id,date});
    onRefresh();
  };

  const undoSession=async(session,pkg)=>{
    await supabase.from('sessions').delete().eq('id',session.id);
    await supabase.from('packages').update({credits:pkg.credits+1}).eq('id',pkg.id);
    onRefresh();
  };

  const addPkg=async(sid,cr,exp)=>{
    await supabase.from('packages').insert({student_id:sid,original:parseInt(cr),credits:parseInt(cr),expiry:exp});
    onRefresh();
  };

  const delStudent=async(sid)=>{
    await supabase.from('students').delete().eq('id',sid);
    onRefresh();
  };

  return <div style={S.page}>
    <div style={{position:"relative",marginBottom:14}}>
      <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:C.muted}}>🔍</span>
      <input style={{...S.inp,paddingLeft:36,marginBottom:0}} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search students…"/>
    </div>
    <div style={S.card}>
      <div style={{fontWeight:600,fontSize:"0.95rem",marginBottom:14}}>+ New student</div>
      <label style={S.lbl}>Name</label><input style={S.inp} value={newName} onChange={e=>setNewName(e.target.value)} placeholder="e.g. Sophie"/>
      <div style={{display:"flex",gap:10}}>
        <div style={{flex:1}}><label style={S.lbl}>Classes</label><input style={S.inp} type="number" min={1} value={newCr} onChange={e=>setNewCr(e.target.value)}/></div>
        <div style={{flex:1.6}}><label style={S.lbl}>Expiry</label><input style={S.inp} type="date" value={newExp} onChange={e=>setNewExp(e.target.value)}/></div>
      </div>
      <button style={S.btnMain} onClick={addStudent}>Add student</button>
      {addMsg&&<div style={addMsg.includes("✓")?S.ok:S.err}>{addMsg}</div>}
    </div>
    <div style={{fontSize:"0.72rem",color:C.muted,textTransform:"uppercase",letterSpacing:"0.09em",marginBottom:10,paddingLeft:2}}>{filtered.length} student{filtered.length!==1?"s":""}</div>
    {filtered.map(st=>{
      const act=getActive(st); const arch=getArchived(st); const t=tot(st);
      return <div key={st.id} style={{...S.card,borderLeft:`3px solid ${t===0?C.red:t<=2?C.amber:C.teal}`}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:10}}>
          <div style={{fontWeight:600,fontSize:"1.05rem"}}>{st.name}</div>
          <div style={{fontSize:"2.2rem",fontWeight:700,lineHeight:1,color:t>3?C.teal:t>0?C.amber:C.red}}>{t}<span style={{fontSize:"0.78rem",color:C.muted,fontWeight:400}}> left</span></div>
        </div>
        {act.length===0&&<div style={{fontSize:"0.85rem",color:C.muted,fontStyle:"italic",marginBottom:8}}>No active package</div>}
        {act.sort((a,b)=>new Date(a.expiry)-new Date(b.expiry)).map(p=>(
          <div key={p.id} style={{background:C.tealLight,borderRadius:10,padding:"10px 12px",marginBottom:8}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:6}}>
              <span style={{fontWeight:600,fontSize:"0.88rem"}}>{p.credits} / {p.original} classes</span>
              <span style={{background:daysLeft(p.expiry)<30?C.amberLight:C.greenLight,color:daysLeft(p.expiry)<30?C.amber:C.green,fontSize:"0.7rem",fontWeight:700,padding:"2px 9px",borderRadius:10}}>
                {isExp(p.expiry)?"Expired":daysLeft(p.expiry)<30?`${daysLeft(p.expiry)}d left`:`Exp. ${fmt(p.expiry)}`}
              </span>
            </div>
            <div style={{height:4,background:"rgba(91,184,176,0.15)",borderRadius:4,marginBottom:p.sessions?.length?8:0}}>
              <div style={{width:`${((p.original-p.credits)/p.original)*100}%`,height:4,background:C.teal,borderRadius:4}}/>
            </div>
            {p.sessions?.length>0&&<details>
              <summary style={{fontSize:"0.75rem",color:C.muted,cursor:"pointer",userSelect:"none"}}>Redeemed ({p.sessions.length})</summary>
              <div style={{marginTop:8,display:"flex",flexDirection:"column",gap:4}}>
                {[...p.sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((s,i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",alignItems:"center",background:"rgba(91,184,176,0.12)",borderRadius:6,padding:"4px 8px"}}>
                    <span style={{fontSize:"0.73rem",color:C.teal}}>{fmt(s.date)}</span>
                    <button
                      onClick={()=>setModal({type:"undo",session:s,pkg:p,name:st.name})}
                      style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"0.72rem",padding:"0 2px"}}
                      title="Undo this session"
                    >↩ undo</button>
                  </div>
                ))}
              </div>
            </details>}
          </div>
        ))}
        <div style={{display:"flex",gap:7,flexWrap:"wrap",marginTop:6}}>
          <button style={S.btnSm(C.teal)} onClick={()=>setModal({type:"deduct",sid:st.id,name:st.name,date:todayStr()})} disabled={t===0}>✓ Class done</button>
          <button style={S.btnSm("#4aaa9a")} onClick={()=>setModal({type:"addPkg",sid:st.id,name:st.name,credits:10,expiry:inOneYear()})}>+ Package</button>
          <button style={{...S.btnSm("transparent",C.red),border:"1px solid #f0c0c0"}} onClick={()=>setModal({type:"del",sid:st.id,name:st.name})}>Delete</button>
        </div>
        {arch.length>0&&<div style={{marginTop:8}}>
          <button onClick={()=>setShowArch(p=>({...p,[st.id]:!p[st.id]}))} style={{background:"none",border:"none",color:C.muted,fontSize:"0.75rem",cursor:"pointer",padding:0,fontFamily:"inherit"}}>
            {showArch[st.id]?"▾":"▸"} {arch.length} archived package{arch.length>1?"s":""}
          </button>
          {showArch[st.id]&&arch.map(p=>(
            <div key={p.id} style={{background:"#f5f5f5",borderRadius:8,padding:"10px 12px",marginTop:6,opacity:0.75}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}>
                <span style={{fontSize:"0.82rem",color:C.muted,fontWeight:600}}>{p.original} classes · {isExp(p.expiry)?"expired":"used up"} {fmt(p.expiry)}</span>
                <span style={{fontSize:"0.75rem",color:C.muted}}>{p.original-p.credits} redeemed</span>
              </div>
              {p.sessions?.length>0&&<div style={{display:"flex",flexWrap:"wrap",gap:3,marginTop:4}}>
                {[...p.sessions].sort((a,b)=>new Date(b.date)-new Date(a.date)).map((s,i)=>(
                  <span key={i} style={{background:"#e8e8e8",borderRadius:5,padding:"1px 7px",fontSize:"0.7rem",color:"#999"}}>{fmt(s.date)}</span>
                ))}
              </div>}
            </div>
          ))}
        </div>}
      </div>;
    })}
    {modal?.type==="undo"&&<Modal title="↩ Undo session" onClose={()=>setModal(null)}>
      <div style={{fontSize:"0.9rem",marginBottom:18}}>
        Remove session <strong>{fmt(modal.session.date)}</strong> for <strong>{modal.name}</strong> and restore 1 credit?
      </div>
      <div style={{display:"flex",gap:10}}>
        <button style={{...S.btnMain,margin:0}} onClick={()=>{undoSession(modal.session,modal.pkg);setModal(null);}}>Confirm</button>
        <button style={{...S.btnGhost,margin:0}} onClick={()=>setModal(null)}>Cancel</button>
      </div>
    </Modal>}
    {modal?.type==="deduct"&&<Modal title="✓ Mark class as done" onClose={()=>setModal(null)}>
      <div style={{color:C.muted,fontSize:"0.9rem",marginBottom:14}}>Student: <strong>{modal.name}</strong></div>
      <label style={S.lbl}>Class date</label>
      <input style={S.inp} type="date" value={modal.date} onChange={e=>setModal({...modal,date:e.target.value})}/>
      <div style={{display:"flex",gap:10,marginTop:8}}>
        <button style={{...S.btnMain,margin:0}} onClick={()=>{deduct(modal.sid,modal.date);setModal(null);}}>Confirm</button>
        <button style={{...S.btnGhost,margin:0}} onClick={()=>setModal(null)}>Cancel</button>
      </div>
    </Modal>}
    {modal?.type==="addPkg"&&<Modal title="+ New package" onClose={()=>setModal(null)}>
      <div style={{color:C.muted,fontSize:"0.9rem",marginBottom:14}}>Student: <strong>{modal.name}</strong></div>
      <label style={S.lbl}>Classes</label>
      <select style={S.inp} value={modal.credits} onChange={e=>setModal({...modal,credits:e.target.value})}>
        <option value={1}>1 class — drop-in</option>
        <option value={5}>5 classes</option>
        <option value={10}>10 classes</option>
      </select>
      <label style={S.lbl}>Expiry date</label>
      <input style={S.inp} type="date" value={modal.expiry} onChange={e=>setModal({...modal,expiry:e.target.value})}/>
      <div style={{display:"flex",gap:10,marginTop:8}}>
        <button style={{...S.btnMain,margin:0}} onClick={()=>{addPkg(modal.sid,modal.credits,modal.expiry);setModal(null);}}>Add package</button>
        <button style={{...S.btnGhost,margin:0}} onClick={()=>setModal(null)}>Cancel</button>
      </div>
    </Modal>}
    {modal?.type==="del"&&<Modal title="Delete student" onClose={()=>setModal(null)}>
      <div style={{fontSize:"0.9rem",marginBottom:18}}>Delete <strong>{modal.name}</strong> and all their packages?</div>
      <div style={{display:"flex",gap:10}}>
        <button style={{...S.btnMain,margin:0,background:C.red}} onClick={()=>{delStudent(modal.sid);setModal(null);}}>Delete</button>
        <button style={{...S.btnGhost,margin:0}} onClick={()=>setModal(null)}>Cancel</button>
      </div>
    </Modal>}
  </div>;
}

function ClassEditModal({cls,onSave,onClose}){
  const [v,setV]=useState(cls);
  return <Modal title={v.id?"Edit class":"New class"} onClose={onClose}>
    {[["title","Title"],["time","Time (e.g. 7:00am)"],["location","Location"],["address","Address"],["note","Note"]].map(([k,l])=>(
      <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={v[k]||""} onChange={e=>setV({...v,[k]:e.target.value})}/></div>
    ))}
    <label style={S.lbl}>Description (optional)</label>
    <textarea style={{...S.inp,minHeight:80,resize:"vertical"}} value={v.description||""} onChange={e=>setV({...v,description:e.target.value})} placeholder="Class theme, details…"/>
    <label style={S.lbl}>Day</label>
    <select style={S.inp} value={v.day} onChange={e=>setV({...v,day:e.target.value})}>{DAYS.map(d=><option key={d}>{d}</option>)}</select>
    <label style={S.lbl}>Type</label>
    <select style={S.inp} value={v.type||"yoga"} onChange={e=>setV({...v,type:e.target.value})}><option value="yoga">Yoga</option><option value="sound">Sound Healing</option></select>
    <div style={{display:"flex",gap:10,flexWrap:"wrap",marginBottom:14}}>
      {[["is_private","Private"],["in_package","In package"],["contact_whatsapp","WhatsApp"],["contact_line","Line"]].map(([k,l])=>(
        <label key={k} style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.82rem",cursor:"pointer"}}>
          <input type="checkbox" checked={!!v[k]} onChange={e=>setV({...v,[k]:e.target.checked})}/>{l}
        </label>
      ))}
    </div>
    <div style={{display:"flex",gap:8}}>
      <button style={{...S.btnMain,margin:0}} onClick={()=>onSave(v)}>Save</button>
      <button style={{...S.btnGhost,margin:0}} onClick={onClose}>Cancel</button>
    </div>
  </Modal>;
}

function EventEditModal({evt,onSave,onClose}){
  const [v,setV]=useState(evt);
  return <Modal title={v.id?"Edit event":"New event"} onClose={onClose}>
    {[["title","Title"],["subtitle","Tags (e.g. Breathwork · Meditation · Sound)"],["time","Time"],["price","Price"]].map(([k,l])=>(
      <div key={k}><label style={S.lbl}>{l}</label><input style={S.inp} value={v[k]||""} onChange={e=>setV({...v,[k]:e.target.value})}/></div>
    ))}
    <label style={S.lbl}>Description (optional)</label>
    <textarea style={{...S.inp,minHeight:90,resize:"vertical"}} value={v.description||""} onChange={e=>setV({...v,description:e.target.value})} placeholder="What to expect…"/>
    <label style={S.lbl}>Date</label><input style={S.inp} type="date" value={v.date||""} onChange={e=>setV({...v,date:e.target.value})}/>
    <label style={S.lbl}>Type</label>
    <select style={S.inp} value={v.type||"yoga"} onChange={e=>setV({...v,type:e.target.value})}><option value="yoga">Yoga</option><option value="sound">Sound Healing</option></select>
    <label style={{display:"flex",alignItems:"center",gap:5,fontSize:"0.82rem",cursor:"pointer",marginBottom:14}}>
      <input type="checkbox" checked={!!v.contact_whatsapp} onChange={e=>setV({...v,contact_whatsapp:e.target.checked})}/>WhatsApp button
    </label>
    <div style={{display:"flex",gap:8}}>
      <button style={{...S.btnMain,margin:0}} onClick={()=>onSave(v)}>Save</button>
      <button style={{...S.btnGhost,margin:0}} onClick={onClose}>Cancel</button>
    </div>
  </Modal>;
}

function StudentScreen({schedule,events,students,banner}){
  const [tab,setTab]=useState("schedule");
  const [screen,setScreen]=useState("student");
  if(screen==="login") return <LoginScreen onSuccess={()=>setScreen("admin")} onBack={()=>setScreen("student")}/>;
  if(screen==="admin") return <AdminApp onLogout={()=>setScreen("student")}/>;
  return <div style={S.wrap}>
    <div style={S.hdr}>
      <div style={S.logo}>✦ Yoga Classes</div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={S.nav}>
          <button style={S.navBtn(tab==="schedule")} onClick={()=>setTab("schedule")}>Schedule</button>
          <button style={S.navBtn(tab==="my")} onClick={()=>setTab("my")}>My Classes</button>
          <button style={S.navBtn(tab==="pricing")} onClick={()=>setTab("pricing")}>Pricing</button>
        </div>
        <button onClick={()=>setScreen("login")} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"0.9rem",padding:"4px 6px"}}>⚙</button>
      </div>
    </div>
    <AbsenceBanner banner={banner}/>
    {tab==="schedule"&&<ScheduleView schedule={schedule} events={events} isAdmin={false}/>}
    {tab==="my"&&<MyClassesTab students={students}/>}
    {tab==="pricing"&&<PricingTab/>}
  </div>;
}

function LoginScreen({onSuccess,onBack}){
  const [pw,setPw]=useState(""); const [err,setErr]=useState("");
  const login=()=>{if(pw===ADMIN_PASSWORD)onSuccess();else setErr("Incorrect password");};
  return <div style={S.wrap}>
    <div style={S.hdr}>
      <div style={S.logo}>✦ Teacher</div>
      <button onClick={onBack} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontFamily:"inherit"}}>← Back</button>
    </div>
    <div style={S.page}><div style={S.card}>
      <div style={{fontWeight:600,fontSize:"1rem",marginBottom:16}}>🔐 Teacher login</div>
      <label style={S.lbl}>Password</label>
      <input style={S.inp} type="password" value={pw} onChange={e=>setPw(e.target.value)} placeholder="••••••••" onKeyDown={e=>e.key==="Enter"&&login()}/>
      {err&&<div style={S.err}>{err}</div>}
      <button style={S.btnMain} onClick={login}>Enter</button>
    </div></div>
  </div>;
}

function AdminApp({onLogout}){
  const [tab,setTab]=useState("schedule");
  const [schedule,setSchedule]=useState([]);
  const [events,setEvents]=useState([]);
  const [students,setStudents]=useState([]);
  const [banner,setBanner]=useState(null);
  const [editCls,setEditCls]=useState(null);
  const [editEvt,setEditEvt]=useState(null);

  const load=async()=>{
    const {data:sc}=await supabase.from('schedule').select('*').order('id');
    const {data:ev}=await supabase.from('events').select('*').order('date');
    const {data:st}=await supabase.from('students').select('*').order('name');
    const {data:pk}=await supabase.from('packages').select('*');
    const {data:se}=await supabase.from('sessions').select('*');
    const {data:bn}=await supabase.from('banner').select('*').limit(1).single();
    const enriched=(st||[]).map(s=>({...s,packages:(pk||[]).filter(p=>p.student_id===s.id).map(p=>({...p,sessions:(se||[]).filter(x=>x.package_id===p.id)}))}));
    setSchedule(sc||[]);setEvents(ev||[]);setStudents(enriched);setBanner(bn);
  };

  useEffect(()=>{load();},[]);

  const toggleConfirm=async(cls)=>{
    await supabase.from('schedule').update({confirmed:!cls.confirmed}).eq('id',cls.id);
    load();
  };
  const toggleEventConfirm=async(e)=>{
    await supabase.from('events').update({confirmed:!e.confirmed}).eq('id',e.id);
    load();
  };
  const saveClass=async(cls)=>{
    const {id,...data}={...cls,is_private:cls.is_private||false,in_package:cls.in_package||false,contact_whatsapp:cls.contact_whatsapp||false,contact_line:cls.contact_line||false};
    if(id) await supabase.from('schedule').update(data).eq('id',id);
    else await supabase.from('schedule').insert(data);
    setEditCls(null);load();
  };
  const delClass=async(id)=>{
    await supabase.from('schedule').delete().eq('id',id);
    setEditCls(null);load();
  };
  const saveEvent=async(evt)=>{
    const {id,...data}=evt;
    if(id) await supabase.from('events').update(data).eq('id',id);
    else await supabase.from('events').insert(data);
    setEditEvt(null);load();
  };
  const delEvent=async(id)=>{
    await supabase.from('events').delete().eq('id',id);
    setEditEvt(null);load();
  };

  return <div style={S.wrap}>
    <div style={S.hdr}>
      <div style={S.logo}>✦ Admin</div>
      <div style={{display:"flex",alignItems:"center",gap:8}}>
        <div style={S.nav}>
          <button style={S.navBtn(tab==="schedule")} onClick={()=>setTab("schedule")}>Schedule</button>
          <button style={S.navBtn(tab==="students")} onClick={()=>setTab("students")}>Students</button>
        </div>
        <button onClick={onLogout} style={{background:"none",border:"none",color:C.muted,cursor:"pointer",fontSize:"0.78rem",fontFamily:"inherit"}}>Log out</button>
      </div>
    </div>
    {tab==="schedule"&&<div style={S.page}>
      {banner&&<BannerEditor banner={banner} onUpdate={load}/>}
      <ScheduleView
        schedule={schedule} events={events} isAdmin={true}
        onToggleConfirm={toggleConfirm} onEdit={setEditCls}
        onToggleEventConfirm={toggleEventConfirm} onEditEvent={setEditEvt}
        onAddClass={()=>setEditCls({day:"Monday",time:"",title:"",location:"",address:"",type:"yoga",is_private:true,in_package:false,confirmed:false,contact_whatsapp:true,contact_line:false,note:"",description:""})}
        onAddEvent={()=>setEditEvt({date:todayStr(),time:"",title:"",subtitle:"",price:"",type:"yoga",confirmed:false,contact_whatsapp:true,note:"",description:""})}
      />
    </div>}
    {tab==="students"&&<StudentsPanel students={students} onRefresh={load}/>}
    {editCls&&<ClassEditModal cls={editCls} onSave={saveClass} onClose={()=>setEditCls(null)}/>}
    {editEvt&&<EventEditModal evt={editEvt} onSave={saveEvent} onClose={()=>setEditEvt(null)}/>}
  </div>;
}

export default function Root(){
  const [data,setData]=useState({schedule:[],events:[],students:[],banner:null});

  const load=async()=>{
    const {data:sc}=await supabase.from('schedule').select('*').order('id');
    const {data:ev}=await supabase.from('events').select('*').order('date');
    const {data:st}=await supabase.from('students').select('*').order('name');
    const {data:pk}=await supabase.from('packages').select('*');
    const {data:se}=await supabase.from('sessions').select('*');
    const {data:bn}=await supabase.from('banner').select('*').limit(1).single();
    const enriched=(st||[]).map(s=>({...s,packages:(pk||[]).filter(p=>p.student_id===s.id).map(p=>({...p,sessions:(se||[]).filter(x=>x.package_id===p.id)}))}));
    setData({schedule:sc||[],events:ev||[],students:enriched,banner:bn});
  };

  useEffect(()=>{load();},[]);

  return <StudentScreen {...data}/>;
}
