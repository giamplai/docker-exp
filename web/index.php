<?php
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);
?>

<h1>Hello TEST!</h1>
<h4>Attempting MySQL connection from php...</h4>
<?php
// $host = 'mariadb';
$host = 'mysql';
$user = 'root';
$pass = '';
$conn = new mysqli($host, $user, $pass);


try {
    
    if ($conn->connect_error) {
        die("Connection failed: " . $conn->connect_error);
    } 
    echo "Connected to MySQL successfully!";
}catch(Exception $e) {
    
}

 phpinfo();