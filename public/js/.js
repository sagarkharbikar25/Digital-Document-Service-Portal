const urlParams = new URLSearchParams(window.location.search);
const mode = urlParams.get("mode");

/* change page title when in track mode */

if(mode === "track"){
const title = document.querySelector(".page-title");
if(title) title.innerText = "Track Application Status";
}


/* ================================
   LOAD STUDENT APPLICATIONS
================================ */

async function loadApplications(){

try{

const data = await apiRequest("/applications/my");

console.log("Applications:",data);

if(!data || !data.success) return;

const table = document.getElementById("applicationsTable");

if(!table) return;

table.innerHTML = "";


/* no applications */

if(!data.data || data.data.length === 0){

table.innerHTML = `
<tr>
<td colspan="6" style="text-align:center;">
No applications found
</td>
</tr>
`;

return;

}


/* render rows */

data.data.forEach(app => {

let actionButton = "-";

if(app.status === "approved" && app.certificate_number){

actionButton = `
<button class="download-btn"
onclick="downloadCertificate('${app.certificate_number}')">
Download
</button>
`;

}

const createdDate = app.created_at
? new Date(app.created_at).toLocaleDateString()
: "-";

const row = `
<tr>

<td>${app.application_number || "-"}</td>

<td>${app.certificate_type || "-"}</td>

<td>${app.purpose || "-"}</td>

<td>
<span class="status ${app.status}">
${formatStatus(app.status)}
</span>
</td>

<td>${createdDate}</td>

<td>${actionButton}</td>

</tr>
`;

table.innerHTML += row;

});


/* update timeline using latest application */

const latestApp = data.data[0];

if(latestApp && latestApp.status){

resetTimeline();
updateTimeline(latestApp.status);

}


}catch(err){

console.error("Track error:",err);

}

}

document.addEventListener("DOMContentLoaded",loadApplications);



/* ================================
   STATUS FORMAT
================================ */

function formatStatus(status){

switch(status){

case "pending":
return "Pending (Clerk Review)"

case "clerk_approved":
return "Clerk Approved"

case "hod_approved":
return "HOD Approved"

case "approved":
return "Certificate Ready"

case "rejected":
return "Rejected"

default:
return status
}

}



/* ================================
   RESET TIMELINE
================================ */

function resetTimeline(){

const steps = [
"step-submitted",
"step-clerk",
"step-hod",
"step-principal",
"step-download"
]

steps.forEach(id=>{
const el = document.getElementById(id);
if(el){
el.classList.remove("done","active");
}
})

}



/* ================================
   TIMELINE UPDATE
================================ */

function updateTimeline(status){

const submitted = document.getElementById("step-submitted")
const clerk = document.getElementById("step-clerk")
const hod = document.getElementById("step-hod")
const principal = document.getElementById("step-principal")
const download = document.getElementById("step-download")

if(!submitted) return;

submitted.classList.add("done")


if(status === "pending"){
clerk.classList.add("active")
}


if(status === "clerk_approved"){
clerk.classList.add("done")
hod.classList.add("active")
}


if(status === "hod_approved"){
clerk.classList.add("done")
hod.classList.add("done")
principal.classList.add("active")
}


if(status === "approved"){
clerk.classList.add("done")
hod.classList.add("done")
principal.classList.add("done")
download.classList.add("done")
}


if(status === "rejected"){
clerk.classList.add("done")
hod.classList.add("done")
principal.classList.add("done")
}

}



/* ================================
   DOWNLOAD CERTIFICATE
================================ */

function downloadCertificate(cerNumber){

if(!cerNumber){
alert("Certificate not available");
return;
}

window.open(
CONFIG.API_BASE + "/certificate/download?certificate_number=" + cerNumber,
"_blank"
)

}