let errorMessage, successMessage;
let spinner;

document.addEventListener('DOMContentLoaded', function() {
    errorMessage = document.getElementById('error-message');
    successMessage = document.getElementById('success-message');
    spinner = document.getElementById('spinner');
    button_text = document.getElementById('btn-text');
})

function displaySuccessMessage(message) {
    errorMessage.style.display = 'none';
    successMessage.innerText = message;
    successMessage.style.display = 'block';

    // Hide the error message after 2 seconds
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 3000);
}

function displayErrorMessage(message) {
    successMessage.style.display = 'none';
    errorMessage.innerText = message;
    errorMessage.style.display = 'block';
    

    // Hide the error message after 2 seconds
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 3000);
}

function enableSpinner() {
    saveButton.disabled = true;
    revertButton.disabled = true;
    button_text.style.display = 'none';
    spinner.style.display = 'inline-block';
}

function disableSpinner(){
    saveButton.disabled = false;
    revertButton.disabled = false;

    button_text.style.display = 'inline-block';
    spinner.style.display = 'none';
}



