const hideAlert=()=>{
    const el=document.querySelector(".alert")
    if(el) el.parentElement.removeChild(el)
}

const showAlert=(type,msg)=>{
    hideAlert()
    const markup=`<div class="alert alert--${type}">${msg}</div>`
    document.querySelector('body').insertAdjacentHTML('afterbegin',markup)
    window.setTimeout(hideAlert,5000)
}

const login=async(email,password)=>{
    console.log(email,password)
    try
    {
        const result=await axios({
        method:"POST",
        url:"http://127.0.0.1:3000/api/v1/users/login",
        data:{
            email,
            password
        }
        })
        console.log(result.data.status)
        if(result.data.status==="success"){
            showAlert("success","Successfully LoggedIn!!")
            window.setTimeout(()=>{
                location.assign("/")
            },1500)
        }
    }catch(err){
        showAlert("error",err.response.data.message)
    }
}

document.querySelector(".form--login").addEventListener("submit",e=>{
    e.preventDefault()
    console.log("Hello")
    const email=document.getElementById("email").value
    const password=document.getElementById("password").value
    login(email,password)
})

