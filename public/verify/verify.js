window.BASE_URL = window.BASE_URL || window.location.origin + window.location.pathname.split('/public/')[0];
const API_BASE = window.BASE_URL + '/public/index.php/api';

document.addEventListener('DOMContentLoaded', () => {
    
    // Auto-check if URL has ?cert=...
    const params = new URLSearchParams(window.location.search);
    const certNumber = params.get('cert');
    if (certNumber) {
        document.getElementById('certInput').value = certNumber;
        verifyQR();
    }

    // Drag and Drop Logic
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        if (e.dataTransfer.files.length) {
            handleFileUpload(e.dataTransfer.files[0]);
        }
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length) {
            handleFileUpload(e.target.files[0]);
        }
    });
});

/* ── CLIENT-SIDE CRYPTOGRAPHIC CHECKSUM ─────────────────────────── */
async function handleFileUpload(file) {
    if (file.type !== "application/pdf") {
        alert("Please upload a PDF file.");
        return;
    }

    document.querySelector('.upload-text').textContent = 'Calculating Hash...';
    
    try {
        const arrayBuffer = await file.arrayBuffer();
        const hashBuffer = await crypto.subtle.digest('SHA-256', arrayBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        // Extract ID from filename as a hint
        const idHint = extractIdFromFilename(file.name);
        if (idHint && !document.getElementById('certInput').value) {
            document.getElementById('certInput').value = idHint;
        }

        verifyHashOnServer(hashHex);
        
    } catch (e) {
        console.error(e);
        alert("Could not calculate hash. Please use a modern browser.");
        document.querySelector('.upload-text').textContent = 'Click to Upload PDF';
    }
}

/* ── API COMMUNICATION ─────────────────────────── */
function verifyHashOnServer(hashString) {
    secureFetch(API_BASE + '/certificate/verify-hash', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
            hash: hashString,
            certificate_number: document.getElementById('certInput').value.trim()
        })
    })
    .then(r => r.json())
    .then(res => {
        document.querySelector('.upload-text').textContent = 'Click to Upload PDF';

        const status = res.status || (res.data && res.data.status);

        if (res.success && status === 'authentic') {
            document.getElementById('mainPanel').style.display = 'none';
            showAuthentic(res.data, "This certificate is original and has not been modified since it was issued by JDCOEM DigiSecure.");
            document.getElementById('valHash').textContent = hashString;
            loadTimeline(res.data.application_id);
        } else if (res.success && status === 'modified') {
            document.getElementById('mainPanel').style.display = 'none';
            showModified(res.data, hashString);
            loadTimeline(res.data.certificate_number);
        } else {
            document.getElementById('mainPanel').style.display = 'none';
            showTampered(hashString);
        }
    })
    .catch(err => {
        console.error(err);
        alert("Verification Server Error.");
        document.querySelector('.upload-text').textContent = 'Click to Upload PDF';
    });
}

function verifyQR() {
    const appNo = document.getElementById('certInput').value.trim();
    if (!appNo) return;

    secureFetch(API_BASE + '/application/status?application_number=' + encodeURIComponent(appNo))
    .then(r => r.json())
    .then(res => {
        if (res.success && res.data) {
            document.getElementById('mainPanel').style.display = 'none';
            // It's a valid ID!
            showAuthentic({
                student_name: res.data.student_name || res.data.name || 'Unknown',
                certificate_number: res.data.certificate_number || res.data.application_number || appNo,
                department: res.data.department || res.data.branch || 'N/A',
                generated_at: res.data.updated_at || res.data.created_at
            }, "Record found. For strict integrity guarantees, upload the PDF document directly.");
            document.getElementById('valHash').textContent = 'Upload PDF to verify mathematical hash';
            loadTimeline(appNo);
        } else {
            document.getElementById('mainPanel').style.display = 'none';
            document.getElementById('tamperedBox').style.display = 'block';
            document.getElementById('tamperMsg').textContent = "This Certificate Number does not exist in our database.";
        }
    })
    .catch(() => {
        alert("Network Error fetching status.");
    });
}

function loadTimeline(appId) {
    if (!appId) return;

    secureFetch(`${API_BASE}/application/timeline?id=${appId}`)
    .then(r => r.json())
    .then(res => {
        if (res.success && res.data) {
            const container = document.getElementById('timelineContainer');
            const data = res.data;
            
            let html = '';
            
            // 1. Submitted
            if (data.submitted && data.submitted.status) {
                html += renderTimelineItem('Student', 'Application Submitted', '', data.submitted.time);
            }

            // 2. Clerk
            if (data.clerk_approved && data.clerk_approved.status) {
                html += renderTimelineItem('Clerk', 'Clerk Action: APPROVED', data.clerk_approved.remarks, data.clerk_approved.time);
            }

            // 3. HOD
            if (data.hod_approved && data.hod_approved.status) {
                html += renderTimelineItem('HOD', 'HOD Action: APPROVED', data.hod_approved.remarks, data.hod_approved.time);
            }

            // 4. Principal
            if (data.principal_approved && data.principal_approved.status) {
                html += renderTimelineItem('Principal', 'Principal Action: APPROVED', data.principal_approved.remarks, data.principal_approved.time);
            }

            container.innerHTML = html;
        }
    })
    .catch(console.error);
}

function renderTimelineItem(actor, action, remark, time) {
    const formattedTime = time ? new Date(time).toLocaleString('en-IN', {
        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hour12: true
    }) : '--';

    return `
        <div class="timeline-item">
            <div class="timeline-actor">${actor} <span class="timeline-action">— ${action}</span></div>
            ${remark ? `<div class="timeline-remark">"${remark}"</div>` : ''}
            <div class="timeline-time">${formattedTime}</div>
        </div>
    `;
}

/* ── UI HELPERS ─────────────────────────── */
function showAuthentic(data, msg) {
    const box = document.getElementById('authenticBox');
    box.style.display = 'block';
    box.classList.add('authentic');
    document.getElementById('authMsg').textContent = msg;

    if (!data) return;

    const DOC_TYPES = {
        'admission': 'Admission Letter',
        'idcard': 'Identity Card',
        'bonafide': 'Bonafide Certificate',
        'leaving': 'Transfer Certificate',
        'character': 'Character Certificate',
        'noc': 'No Objection Certificate',
        'transcript': 'Official Transcript',
        'fee_receipt': 'Fee Receipt'
    };

    document.getElementById('valName').textContent = data.student_name || 'N/A';
    document.getElementById('valType').textContent = DOC_TYPES[data.adm_type] || data.adm_type || 'Certificate';
    document.getElementById('valCert').textContent = data.certificate_number || 'N/A';
    
    // Status Pill
    const status = data.status || 'approved';
    const pill = document.getElementById('valStatusPill');
    pill.textContent = status.charAt(0).toUpperCase() + status.slice(1).replace('_', ' ');
    pill.className = 'status-pill';

    if (data.generated_at) {
        document.getElementById('valDate').textContent = new Date(data.generated_at).toLocaleString('en-IN', {
            day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true
        });
    } else {
        document.getElementById('valDate').textContent = 'N/A';
    }

    document.getElementById('valVerifiedAt').textContent = new Date().toLocaleString('en-IN', {
        day:'numeric', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit', hour12:true
    });
}

function showTampered(calculatedHash) {
    const box = document.getElementById('tamperedBox');
    box.style.display = 'block';
    box.classList.add('tampered');
    const msg = document.getElementById('tamperMsg');
    if (calculatedHash) {
        msg.innerHTML = `The Cryptographic Hash of this file does not match any record.<br><br>
                         <div style="font-size:12px; color:var(--text-3); background:rgba(0,0,0,0.2); padding:10px; border-radius:6px; word-break:break-all; font-family:monospace;">
                            CALCULATED HASH:<br>${calculatedHash}
                         </div><br>
                         The document has been mathematically proven to be altered, forged, or is an older document not yet in our secure registry.`;
    }
}

function showModified(data, calculatedHash) {
    const box = document.getElementById('modifiedBox');
    if (!box) {
        // Fallback to authentic if box missing, but let's check
        showAuthentic(data, "Record found, but file has metadata modifications.");
        return;
    }
    box.style.display = 'block';
    box.classList.add('modified');
    
    document.getElementById('modName').textContent = data.student_name || 'N/A';
    document.getElementById('modCert').textContent = data.certificate_number || 'N/A';
    document.getElementById('modHash').textContent = calculatedHash;
}

function resetUI() {
    document.getElementById('mainPanel').style.display = 'block';
    
    document.getElementById('authenticBox').classList.remove('authentic');
    document.getElementById('authenticBox').style.display = 'none';

    document.getElementById('tamperedBox').classList.remove('tampered');
    document.getElementById('tamperedBox').style.display = 'none';

    const modBox = document.getElementById('modifiedBox');
    if (modBox) {
        modBox.classList.remove('modified');
        modBox.style.display = 'none';
    }
    
    document.getElementById('certInput').value = '';
    document.getElementById('timelineContainer').style.display = 'none';
    document.getElementById('timelineContainer').innerHTML = '';
}

function extractIdFromFilename(filename) {
    if (!filename) return null;

    // Pattern 1: CERT-2026-000091
    const certMatch = filename.match(/CERT-\d{4}-\d+/i);
    if (certMatch) return certMatch[0].toUpperCase();

    // Pattern 2: RECOVERED-175
    const recMatch = filename.match(/RECOVERED-\d+/i);
    if (recMatch) return recMatch[0].toUpperCase();

    // Pattern 3: certificate_175_1776282630
    const legacyMatch = filename.match(/certificate_(\d+)_/i);
    if (legacyMatch) return legacyMatch[1]; // Just return numeric Application ID hint

    return null;
}
