function setCookie(name, value, days) {
    const date = new Date();
    date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
    const expires = `expires=${date.toUTCString()}`;
    document.cookie = `${name}=${value}; ${expires}; path=/`;
}

document.addEventListener('DOMContentLoaded', function () {
    if (document.cookie.includes('token')) {
        window.location.href = 'index.html';
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
                setCookie('token', data.token, 1);
                window.location.href = 'index.html';
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