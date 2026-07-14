document.addEventListener('DOMContentLoaded', function() {
    console.log('Contact form loaded');
    
    const form = document.getElementById('contact-form');
    const successDiv = document.getElementById('form-success');
    const errorDiv = document.getElementById('form-error');
    const errorMessage = document.getElementById('error-message');
    const submitBtn = form.querySelector('button[type="submit"]');
    const csrfInput = document.getElementById('csrf_token');
    
    // Auto-detect environment
    const BASE_URL = window.location.origin + '/';
    console.log('Base URL:', BASE_URL);
    
    // Get CSRF token
    function getToken() {
        console.log('Fetching CSRF token...');
        
        fetch(BASE_URL + 'contact_handler.php?get_token=1')
            .then(response => {
                if (!response.ok) {
                    throw new Error('HTTP error! status: ' + response.status);
                }
                return response.json();
            })
            .then(data => {
                if (data.csrf_token) {
                    csrfInput.value = data.csrf_token;
                    console.log('CSRF token set');
                }
            })
            .catch(error => {
                console.error('Error fetching token:', error);
                csrfInput.value = 'test-token-' + Date.now();
            });
    }
    
    getToken();
    
    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        successDiv.style.display = 'none';
        errorDiv.style.display = 'none';
        
        submitBtn.disabled = true;
        submitBtn.textContent = 'Sending...';
        
        const formData = new FormData(form);
        
        fetch(BASE_URL + 'contact_handler.php', {
            method: 'POST',
            body: formData
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Server error: ' + response.status);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                successDiv.style.display = 'block';
                form.reset();
                getToken(); // Get new token for next submission
            } else {
                errorMessage.textContent = data.message || 'Something went wrong.';
                errorDiv.style.display = 'block';
                if (data.message && data.message.includes('Security validation')) {
                    getToken(); // Refresh token if CSRF error
                }
            }
        })
        .catch(error => {
            console.error('Error:', error);
            errorMessage.textContent = 'Network error. Please check your connection.';
            errorDiv.style.display = 'block';
        })
        .finally(() => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Send Message';
        });
    });
});