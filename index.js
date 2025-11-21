// Hide splash after 2 seconds
setTimeout(() => {
    document.getElementById("splash").style.display = "none";
    document.getElementById("main").classList.remove("hidden");
}, 2000);

// Button actions
document.getElementById("signupBtn").addEventListener("click", function(){
    window.location.href = "signup.html";
});

document.getElementById("loginBtn").addEventListener("click", function(){
    window.location.href = "login.html";
});
