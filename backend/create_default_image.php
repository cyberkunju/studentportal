<?php
// Create default profile image
$img = imagecreatetruecolor(300, 300);
$bg = imagecolorallocate($img, 41, 128, 185);
$text = imagecolorallocate($img, 255, 255, 255);
imagefill($img, 0, 0, $bg);

// Add text
$font = 5;
imagestring($img, $font, 100, 140, 'STUDENT', $text);

// Save image
$outputPath = __DIR__ . '/uploads/profiles/default.jpg';
imagejpeg($img, $outputPath, 90);
imagedestroy($img);

echo "Default profile image created at: $outputPath\n";

// Also create a copy for student001
copy($outputPath, __DIR__ . '/uploads/profiles/student001.jpg');
echo "Profile image for student001 created\n";
?>
