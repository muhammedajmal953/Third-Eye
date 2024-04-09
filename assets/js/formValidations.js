function validateSignupForm() {
    let username = document.getElementById("username").value.trim();
    let email = document.getElementById("email").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let password = document.getElementById("password").value
    let usernameVal=document.getElementById("usernameVal")
    let emailVal = document.getElementById("emailVal");
    let phoneVal = document.getElementById("phoneVal");
    let passwordVal = document.getElementById("passwordVal");
    let confirmPassword = document.getElementById("confirmPassword").value
    let confirmPassVal=document.getElementById("confirmPassVal")

    
    let usernameRegex = /^[^\s]{5,20}$/; 
    let emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,})+$/;
    let phoneRegex = /^\d{10}$/;
    let passwordRegex = /(?=.*[a-zA-Z])(?=.*\d)(?=.*[^a-zA-Z0-9\s]).{8,}/; 
 
    if (!usernameRegex.test(username)) {
        usernameVal.textContent="Please enter a valid username without spaces."
        return false

    }else{
      usernameVal.textContent=""
    }

    if (!emailRegex.test(email)) {
        emailVal.textContent = "Please enter a valid email address. with out spaces";
        return false

    } else {
        emailVal.textContent = "";
    }

    if (!phoneRegex.test(phone)) {
        phoneVal.textContent = "Please enter a valid 10-digit phone number.";
        return false
        
    } else {
        phoneVal.textContent = "";
        
    }

    if (!passwordRegex.test(password)) {
        passwordVal.textContent = "Password must be at least 8 characters at least have one special character,one number and a special character";
        return false

    } else {
        passwordVal.textContent = "";
    }

    if (confirmPassword !== password) {
        confirmPassVal.textContent = "two passwords must be same";
        return false

    } else {
        confirmPassVal.textContent = "";
    }
   

  return true
}


function validateLoginForm() {
    var username = document.getElementById("username").value.trim();
    var password = document.getElementById("password").value.trim();
  

    
    var usernameRegex = /^[^\s]{5,50}$/; 
    var passwordRegex = /^[^\s]{8,}$/; 

    if (!usernameRegex.test(username)) {
        alert("Please enter a valid username without spaces. It should be between 5-20 characters.");
        return false;
    }

    if (!passwordRegex.test(password)) {
        alert("Please enter a valid password without spaces. It should be at least 8 characters long.");
        return false;
    }

   
    return true; 
}
