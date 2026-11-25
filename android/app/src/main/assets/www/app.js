// MAAN Video Editing App — browser editor prototype.
// Add your own Supabase URL and anon key to enable email/password accounts.
const SUPABASE_URL = ""; // e.g. https://xxxx.supabase.co
const SUPABASE_ANON_KEY = "";
let supabaseClient=null, signupMode=false, guest=false, currentUrl=null, duration=0, rotation=0, fitMode="contain", activeTool="trim";
const $=id=>document.getElementById(id);
const video=$("video"), stage=$("stage");
if(SUPABASE_URL && SUPABASE_ANON_KEY && window.supabase) supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_ANON_KEY);
function showApp(label){$("auth").classList.add("hidden");$("app").classList.remove("hidden");$("userLabel").textContent=label;guest=label==="Guest mode";}
function showAuth(){ $("app").classList.add("hidden");$("auth").classList.remove("hidden");}
$("switchAuth").onclick=()=>{signupMode=!signupMode;$("authTitle").textContent=signupMode?"Create account":"Welcome back";$("authAction").textContent=signupMode?"Sign up":"Login";$("switchAuth").textContent=signupMode?"I already have an account":"Create a new account";$("authMsg").textContent="";};
$("authAction").onclick=async()=>{
 const email=$("email").value.trim(),password=$("password").value;
 if(!email||!password){$("authMsg").textContent="Enter your email and password.";return;}
 if(!supabaseClient){$("authMsg").textContent="Cloud login is not configured yet. Use Guest mode, or connect Supabase in app.js.";return;}
 $("authMsg").textContent="Please wait…";
 const result=signupMode?await supabaseClient.auth.signUp({email,password}):await supabaseClient.auth.signInWithPassword({email,password});
 if(result.error){$("authMsg").textContent=result.error.message;return;}
 if(signupMode && !result.data.session){$("authMsg").textContent="Account created. Check your email to confirm, then log in.";return;}
 showApp(email);
};
$("guestBtn").onclick=()=>showApp("Guest mode");
$("logout").onclick=async()=>{if(supabaseClient&&!guest)await supabaseClient.auth.signOut();showAuth();};
$("videoFile").onchange=e=>{
 const file=e.target.files[0];if(!file)return;
 if(!file.type.startsWith("video/")){alert("Please choose a video file.");return;}
 if(currentUrl)URL.revokeObjectURL(currentUrl);currentUrl=URL.createObjectURL(file);
 video.src=currentUrl;video.classList.remove("hidden");stage.querySelector(".empty-state").classList.add("hidden");
 $("fileName").textContent=file.name;video.onloadedmetadata=()=>{duration=video.duration;$("trimStart").value=0;$("trimEnd").value=duration.toFixed(1);$("trimEnd").max=duration;$("trimStart").max=duration;$("timeLabel").textContent=`00:00 / ${fmt(duration)}`;};
 $("playBtn").disabled=$("resetBtn").disabled=$("exportBtn").disabled=false;
};
function fmt(s){if(!Number.isFinite(s))return"00:00";return `${String(Math.floor(s/60)).padStart(2,"0")}:${String(Math.floor(s%60)).padStart(2,"0")}`;}
video.ontimeupdate=()=>{$("timeLabel").textContent=`${fmt(video.currentTime)} / ${fmt(duration)}`;};
$("playBtn").onclick=()=>{if(video.paused){video.play();$("playBtn").textContent="Ⅱ Pause";}else{video.pause();$("playBtn").textContent="▶ Play";}};
$("resetBtn").onclick=()=>{video.pause();video.currentTime=0;video.playbackRate=1;rotation=0;video.style.transform="";video.style.filter="none";video.style.objectFit="contain";$("playBtn").textContent="▶ Play";};
const toolHtml={
trim:`<h3>Trim video</h3><label>Start time (seconds)<input id="trimStart" type="number" min="0" step=".1" value="0"></label><label>End time (seconds)<input id="trimEnd" type="number" min="0" step=".1" value="0"></label><p class="hint">Choose the part to keep. The exported clip starts and ends at these times.</p>`,
filters:`<h3>Color filters</h3><label>Choose look<select id="filterSelect"><option value="none">Original</option><option value="contrast(1.2) saturate(1.35)">Vivid</option><option value="grayscale(1)">Black & white</option><option value="sepia(.8)">Vintage</option><option value="brightness(1.15) saturate(.8)">Bright</option><option value="contrast(1.25) saturate(.8) hue-rotate(180deg)">Cool</option></select></label><p class="hint">Filter preview is applied to the player. Export uses the selected filter.</p>`,
speed:`<h3>Playback speed</h3><label>Speed<select id="speedSelect"><option value=".5">0.5× Slow</option><option value=".75">0.75×</option><option value="1" selected>1× Normal</option><option value="1.25">1.25×</option><option value="1.5">1.5×</option><option value="2">2× Fast</option></select></label><p class="hint">Speed affects playback and export duration.</p>`,
rotate:`<h3>Rotate video</h3><button id="rotateBtn" class="ghost">↻ Rotate 90°</button><p class="hint">Rotate the preview and exported video.</p>`,
crop:`<h3>Fit / Fill</h3><label>Frame fit<select id="fitSelect"><option value="contain">Fit (show full video)</option><option value="cover">Fill (crop edges)</option></select></label><p class="hint">Fill may crop the edges to cover the preview frame.</p>`,
export:`<h3>Export settings</h3><p class="hint">Choose output resolution below, then press Export video. Export is processed on your device.</p>`
};
function selectTool(name){activeTool=name;document.querySelectorAll(".tool").forEach(b=>b.classList.toggle("active",b.dataset.tool===name));$("toolContent").innerHTML=toolHtml[name];bindTool();}
function bindTool(){
 if(activeTool==="filters")$("filterSelect").onchange=e=>video.style.filter=e.target.value;
 if(activeTool==="speed")$("speedSelect").onchange=e=>video.playbackRate=Number(e.target.value);
 if(activeTool==="rotate")$("rotateBtn").onclick=()=>{rotation=(rotation+90)%360;video.style.transform=`rotate(${rotation}deg)`;};
 if(activeTool==="crop")$("fitSelect").onchange=e=>{fitMode=e.target.value;video.style.objectFit=fitMode;};
}
document.querySelectorAll(".tool").forEach(b=>b.onclick=()=>selectTool(b.dataset.tool));
function getTrim(){let s=Number($("trimStart")?.value||0),e=Number($("trimEnd")?.value||duration);if(!Number.isFinite(s)||!Number.isFinite(e)||s<0||e>duration||e<=s)throw Error("Set a valid start and end time within the video duration.");return{s,e};}
$("exportBtn").onclick=async()=>{
 if(!video.src)return;$("exportMsg").textContent="Preparing export…";$("exportBtn").disabled=true;
 try{const {s,e}=getTrim();await exportClip(s,e);}catch(err){$("exportMsg").textContent=err.message;$("exportBtn").disabled=false;}
};
async function exportClip(start,end){
 if(!HTMLCanvasElement.prototype.captureStream || !window.MediaRecorder)throw Error("This browser does not support video export. Try latest Chrome on Android or desktop.");
 const q=Number($("quality").value),vw=video.videoWidth||1280,vh=video.videoHeight||720,scale=Math.min(1,q/Math.max(vw,vh));
 const canvas=document.createElement("canvas");canvas.width=Math.max(2,Math.round(vw*scale/2)*2);canvas.height=Math.max(2,Math.round(vh*scale/2)*2);
 const ctx=canvas.getContext("2d"),stream=canvas.captureStream(30);
 let sourceStream=null,audioTracks=[];
 try{sourceStream=video.captureStream?video.captureStream():video.mozCaptureStream();if(sourceStream)audioTracks=sourceStream.getAudioTracks();}catch(_){}
 audioTracks.forEach(t=>stream.addTrack(t));
 const mime=["video/webm;codecs=vp9,opus","video/webm;codecs=vp8,opus","video/webm"].find(x=>MediaRecorder.isTypeSupported(x));
 if(!mime)throw Error("No supported export format found in this browser.");
 const chunks=[],rec=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:Math.min(8000000,q*5000)});
 rec.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
 const done=new Promise((resolve,reject)=>{rec.onstop=resolve;rec.onerror=()=>reject(Error("Export failed."));});
 const oldTime=video.currentTime,oldRate=video.playbackRate,oldFilter=video.style.filter,oldTransform=video.style.transform,oldFit=video.style.objectFit;
 const speed=oldRate;video.pause();video.currentTime=start;await new Promise(r=>{video.onseeked=()=>r();});
 const filter=oldFilter||"none";const rot=rotation*Math.PI/180;
 function draw(){if(video.ended||video.currentTime>=end){if(rec.state!=="inactive")rec.stop();return;}
 ctx.save();ctx.clearRect(0,0,canvas.width,canvas.height);ctx.translate(canvas.width/2,canvas.height/2);ctx.rotate(rot);
 const rw=(rotation%180===0)?canvas.width:canvas.height,rh=(rotation%180===0)?canvas.height:canvas.width;
 const factor=fitMode==="cover"?Math.max(rw/vw,rh/vh):Math.min(rw/vw,rh/vh);
 ctx.filter=filter;ctx.drawImage(video,-vw*factor/2,-vh*factor/2,vw*factor,vh*factor);ctx.restore();
 if(rec.state==="recording")requestAnimationFrame(draw);
 }
 rec.start(200);await video.play();draw();
 await new Promise(resolve=>{const check=()=>{if(video.currentTime>=end||video.ended){video.pause();if(rec.state!=="inactive")rec.stop();resolve();}else requestAnimationFrame(check);};check();});
 await done;video.pause();video.currentTime=oldTime;video.playbackRate=oldRate;video.style.filter=oldFilter;video.style.transform=oldTransform;video.style.objectFit=oldFit;stream.getTracks().forEach(t=>t.stop());
 const blob=new Blob(chunks,{type:mime}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=`MAAN-Edited-${Date.now()}.webm`;a.click();setTimeout(()=>URL.revokeObjectURL(url),60000);
 $("exportMsg").textContent="Export complete. Your video download has started.";$("exportBtn").disabled=false;
}
selectTool("trim");

if('serviceWorker' in navigator)window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').catch(()=>{}));
