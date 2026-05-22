/* ============================================================
   departments.js — Centralized Department Configuration
   public/js/departments.js
   ============================================================ */

window.COLLEGE_DEPARTMENTS = [
    "Computer Science and Engineering",
    "Data Science",
    "Artificial Intelligence",
    "Cyber Security",
    "Information Technology",
    "Electronics & Telecommunication",
    "Electrical Engineering",
    "Civil Engineering",
    "Mechanical Engineering",
    "Chemical Engineering",
    "Basic Science and Humanities (BSHD)",
    "MBA",
    "MCA"
];

function populateDepartmentSelects() {
    // Array of common IDs used for department selects across the portal
    var selectIds = [
        'department', 'branch', 'sBranch', 'inp-branch', 'reg-branch'
    ];

    selectIds.forEach(function(id) {
        var el = document.getElementById(id);
        // Only target actual <select> elements, not readonly inputs
        if (el && el.tagName.toLowerCase() === 'select') {
            // Check if there's already a placeholder option we want to keep
            var firstOption = el.options.length > 0 ? el.options[0] : null;
            var hasPlaceholder = firstOption && firstOption.value === "";
            
            // Clear existing options
            el.innerHTML = '';
            
            // Re-add placeholder if it existed
            if (hasPlaceholder) {
                el.appendChild(firstOption);
            } else {
                var placeholder = document.createElement('option');
                placeholder.value = "";
                placeholder.textContent = "Select Department / Branch";
                el.appendChild(placeholder);
            }

            // Populate from centralized list
            window.COLLEGE_DEPARTMENTS.forEach(function(dept) {
                var opt = document.createElement('option');
                opt.value = dept;
                opt.textContent = dept;
                el.appendChild(opt);
            });
        }
    });
}

// Auto-run on DOMContentLoaded
window.addEventListener('DOMContentLoaded', populateDepartmentSelects);
