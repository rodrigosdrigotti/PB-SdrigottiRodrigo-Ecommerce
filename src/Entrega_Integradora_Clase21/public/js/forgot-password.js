const form = document.getElementById('forgotPassword')

form.addEventListener('submit', e => {
    e.preventDefault()

    const data = new FormData(form)

    const obj = {}

    data.forEach((value, key) => (obj[key] = value))

    const fetchParams = {
        url: '/api/auth/forgot-password',
        headers: {
            'Content-type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify(obj),
    }

    fetch(fetchParams.url, {
        headers: fetchParams.headers,
        method: fetchParams.method,
        body: fetchParams.body
    })
    .then(response => response.json())
    //.then( () => window.location.href = "/api/products" )
    .then(responseData => {
        if (responseData.status === 'success') { 
            window.location.href = '/api/login'; 
        } else {
            // Inicio de sesión no exitoso
            console.log("Cambio de Contraseña fallida")
            Swal.fire({
                icon: "error",
                title: "Oops...",
                text: "No se ha podido cambiar la Contraseña",
              });
        }
    })
    .catch(error => console.log(error))
})