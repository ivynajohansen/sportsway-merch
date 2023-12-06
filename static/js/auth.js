var csrfToken = document.querySelector('meta[name="csrf-token"]').getAttribute('content');

document.addEventListener('DOMContentLoaded', function () {
    var loginForm = document.getElementById('login_form');

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();

        var username = document.getElementById('username').value;
        var password = document.getElementById('password').value;
        var formData = {
            username: username,
            password: password
        };

        // Make a POST request using the Fetch API
        fetch('http://192.168.1.15:8000/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRF-Token': csrfToken
            },
            body: JSON.stringify(formData)
        })
        .then(response => {
            if (response.status === 200) {
                window.location.href = '/mfp/company-target';
            } else {
                return response.json();
            }
        })
        .then(data => {
            if (data && data.message) {
                document.querySelector('.error-message').textContent = data.message;
            } else {
                throw new Error('Unexpected response format');
            }
        })
        .catch(error => {
            console.error('Error:', error.message);
        });
    });
});

