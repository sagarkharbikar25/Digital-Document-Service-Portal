
document.addEventListener("DOMContentLoaded", () => {

    /* session check */

    if(!localStorage.getItem("userEmail")){
        window.location.href = "login.html";
    }

    /* show email */

    const email = localStorage.getItem("userEmail");

    const emailBox = document.getElementById("userEmail");

    if(emailBox){
        emailBox.innerText = email;
    }

});


/* form submit */

const form = document.getElementById("applicationForm");

if(form){
    form.addEventListener("submit", submitApplication);
}


async function submitApplication(e){

    e.preventDefault();

    const document_name = document.getElementById("document_name").value;

    const reason = document.getElementById("reason").value;

    try{

        const result = await apiRequest("/applications","POST",{

            document_name: document_name,
            reason: reason

        });

        console.log("Application Response:", result);

        if(result.success){

            alert("Application submitted successfully");

            /* get application id from backend */

            const applicationId = result.data?.id;

            /* redirect to upload page */

            if(applicationId){

                window.location.href =
                "upload.html?application_id=" + applicationId;

            }else{

                /* fallback (old behavior) */

                window.location.href = "upload.html";

            }

        }else{

            alert(result.message || "Failed to submit application");

        }

    }catch(err){

        console.error(err);

        alert("Server error");

    }

}