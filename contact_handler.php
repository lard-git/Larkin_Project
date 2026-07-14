<?php
// Enable error reporting for testing
error_reporting(E_ALL);
ini_set('display_errors', 1);

// Configuration - CHANGE THIS
$email_to = ""; // CHANGE THIS IF NEEDED
$email_from = "info@larkinpng.com"; // SAME HERE
$email_subject = "Website Contact Form Submission";

// Start session
session_start();


// DEBUG: Log session
error_log("Session ID: " . session_id());

// Generate CSRF token
if (empty($_SESSION['csrf_token'])) {
    $_SESSION['csrf_token'] = bin2hex(random_bytes(32));
    error_log("New CSRF token generated: " . $_SESSION['csrf_token']);
} else {
    error_log("Existing CSRF token: " . $_SESSION['csrf_token']);
}

// If requesting token only
if (isset($_GET['get_token'])) {
    header('Content-Type: application/json');
    echo json_encode(['csrf_token' => $_SESSION['csrf_token']]);
    exit;
}

// Handle form submission
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['email'])) {
    
    header('Content-Type: application/json');
    
    // DEBUG: Log received token
    error_log("Received CSRF token: " . ($_POST['csrf_token'] ?? 'NOT SET'));
    error_log("Session CSRF token: " . $_SESSION['csrf_token']);
    
    // Rate limiting
    if (!isset($_SESSION['last_submission'])) {
        $_SESSION['last_submission'] = 0;
    }
    
    if (time() - $_SESSION['last_submission'] < 30) {
        echo json_encode([
            'success' => false,
            'message' => 'Please wait 30 seconds between submissions.'
        ]);
        exit;
    }
    
    // CSRF check with better error message
    if (!isset($_POST['csrf_token']) || $_POST['csrf_token'] !== $_SESSION['csrf_token']) {
        error_log("CSRF validation failed. Received: " . ($_POST['csrf_token'] ?? 'NULL') . " Expected: " . $_SESSION['csrf_token']);
        echo json_encode([
            'success' => false,
            'message' => 'Security validation failed. Please refresh the page.'
        ]);
        exit;
    }
    
    // Get and sanitize data
    $name = trim(strip_tags($_POST['name'] ?? ''));
    $email = trim(filter_var($_POST['email'] ?? '', FILTER_SANITIZE_EMAIL));
    $subject = trim(strip_tags($_POST['subject'] ?? 'No Subject'));
    $message = trim(strip_tags($_POST['message'] ?? ''));
    
    // Validate
    if (empty($name) || empty($email) || empty($message)) {
        echo json_encode([
            'success' => false,
            'message' => 'Please fill in all required fields.'
        ]);
        exit;
    }
    
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        echo json_encode([
            'success' => false,
            'message' => 'Please enter a valid email address.'
        ]);
        exit;
    }
    
    if (strlen($message) < 5) {
        echo json_encode([
            'success' => false,
            'message' => 'Your message is too short. Please provide more details.'
        ]);
        exit;
    }
    
    // Build email message
    $email_message = "Contact Form Submission\n";
    $email_message .= "========================\n\n";
    $email_message .= "Name: $name\n";
    $email_message .= "Email: $email\n";
    $email_message .= "Subject: $subject\n";
    $email_message .= "Message:\n$message\n";
    $email_message .= "\n------------------------\n";
    $email_message .= "IP: " . $_SERVER['REMOTE_ADDR'] . "\n";
    $email_message .= "Time: " . date('Y-m-d H:i:s') . "\n";
    
    // Email headers
    $headers = "From: " . $email_from . "\r\n";
    $headers .= "Reply-To: " . $email . "\r\n";
    $headers .= "Content-Type: text/plain; charset=UTF-8\r\n";
    
    // Send email
    $mail_sent = mail($email_to, $email_subject, $email_message, $headers);
    
    // Update last submission time
    $_SESSION['last_submission'] = time();
    
    if ($mail_sent) {
        echo json_encode([
            'success' => true,
            'message' => 'Thank you for contacting us!'
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Sorry, there was an error sending your message. Please try again.'
        ]);
    }
    exit;
}

// If accessed directly without POST
http_response_code(404);
echo "Page not found.";
?>