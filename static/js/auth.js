const token = localStorage.getItem("token");

async function loadCurrentUser(){
    if(!token){
        return;
    }
    try{
        const response = await fetch("/api/me", {headers:{Authorization: "Bearer " + token}});
        if(response.status !== 200){
            return;
        }
        const user = await response.json();
        const element = document.getElementById("current-user");
        if(element){
            element.innerText = user.username;
        }
    }catch(error){
        console.error(error);
    }
}

async function login() {
    const username = document.getElementById("username").value;
    const password = document.getElementById("password").value;
    const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type":
                    "application/json"
                },
                body: JSON.stringify({
                    username,
                    password
                })
            });

    const data = await response.json();
    if(data.status){
        localStorage.setItem("token", data.token);
        window.location = "/dashboard";
    }else{
        document.getElementById("message").innerText = data.message;
    }
}

function logout(){
    localStorage.removeItem("token");
    window.location = "/";
}

document.addEventListener("DOMContentLoaded", loadCurrentUser);

function checkAuth(){
    const token = localStorage.getItem("token");
    if(!token){
        window.location = "/";
    }
}