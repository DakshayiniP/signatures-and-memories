/*
  IMPORTANT: replace API_URL with your deployed Google Apps Script Web App URL.
  The static site works without it using local storage mode.
*/
const API_URL = "PASTE_YOUR_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";
let entries = JSON.parse(localStorage.getItem("dakshayiniWall") || "[]");
let currentFilter = "all";

const emoji = {heartfelt:"❤️", funny:"😂", advice:"🚀"};

function initials(name){ return name.trim().split(/\s+/).slice(0,2).map(x=>x[0]).join("").toUpperCase(); }
function render(){
 const wall=document.getElementById("wall");
 const list=entries.filter(x=>currentFilter==="all" || x.vibe===currentFilter);
 wall.innerHTML=list.map(x=>`
   <article class="card">
    <div class="top"><div class="avatar">${initials(x.name)}</div><div class="person"><strong>${escapeHtml(x.name)}</strong><small>${escapeHtml(x.team||"Walmart")}</small></div><div class="badge">${emoji[x.vibe]||"♥"}</div></div>
    <div class="message">${escapeHtml(x.message).replace(/\n/g,"<br>")}</div>
    ${x.photo ? `<img class="photo" src="${x.photo}" alt="Shared memory">` : ""}
   </article>`).join("") || `<div class="card"><strong>No memories here yet.</strong><div class="message">Be the first to leave one. <span style="color:#e44c90;">♥</span></div></div>`;
 document.getElementById("messageCount").textContent=entries.length;
 document.getElementById("photoCount").textContent=entries.filter(x=>x.photo).length;
}
function escapeHtml(s){return String(s).replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#039;"}[c]));}
function openModal(){document.getElementById("modal").classList.add("open");document.getElementById("name").focus()}
function closeModal(){document.getElementById("modal").classList.remove("open")}
document.querySelectorAll(".filter").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".filter").forEach(x=>x.classList.remove("active"));b.classList.add("active");currentFilter=b.dataset.filter;render()}));
document.getElementById("modal").addEventListener("click",e=>{if(e.target.id==="modal")closeModal()});
document.getElementById("autographForm").addEventListener("submit", async e=>{
 e.preventDefault();
 const status=document.getElementById("status");
 const file=document.getElementById("photo").files[0];
 if(file && file.size>2*1024*1024){status.textContent="Please choose an image smaller than 2 MB.";return;}
 status.textContent="Adding your autograph… ✨";
 const finish=photoData=>{
   const item={name:document.getElementById("name").value.trim(),team:document.getElementById("team").value.trim(),message:document.getElementById("message").value.trim(),vibe:document.getElementById("vibe").value,photo:photoData||""};
   entries.unshift(item); localStorage.setItem("dakshayiniWall",JSON.stringify(entries)); render();
   status.textContent="Thank you! Your autograph is on the wall. ♥";
   setTimeout(()=>{document.getElementById("autographForm").reset();closeModal()},900);
 };
 if(file){
   const reader=new FileReader();
   reader.onload=()=>submitToBackend(reader.result,finish);
   reader.readAsDataURL(file);
 } else submitToBackend("",finish);
});
async function submitToBackend(photo,finish){
 const item={name:document.getElementById("name").value.trim(),team:document.getElementById("team").value.trim(),message:document.getElementById("message").value.trim(),vibe:document.getElementById("vibe").value,photo};
 if(API_URL.startsWith("http")){
   try{ await fetch(API_URL,{method:"POST",body:JSON.stringify(item),mode:"no-cors"}); }
   catch(err){console.warn("Backend submission failed",err);}
 }
 finish(photo);
}
render();
