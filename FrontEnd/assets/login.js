document.addEventListener('DOMContentLoaded', function () {
    if (document.cookie.includes('token')) {
        window.location.href = 'http://127.0.0.1:5500/OpenClassroom/5_Sophie-Bluel/FrontEnd/index.html';
    }
    const form = document.getElementById('login-form');
    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;

        if (validateEmail(email) && validatePassword(password)) {
            const data = {
                email: email,
                password: password
            };

            fetch('http://localhost:5678/api/users/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                if (response.status == 200) {
                    return response.json();
                } else {
                    throw new Error('Login failed');
                }
            })
            .then(data => {
                console.log('Success:', data);
                document.cookie = `token=${data.token}`;
                window.location.href = ' http://127.0.0.1:5500/OpenClassroom/5_Sophie-Bluel/FrontEnd/index.html';
            })
            .catch((error) => {
                console.error('Error:', error);
                alert('Login failed. Please try again.');
            });
        } else {
            alert('Please enter a valid email and password.');
        }
    });

    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    function validatePassword(password) {
        return password.length >= 6;
    }
});