# PDF Generation System

Complete guide to the PDF generation system in the Student Portal.

## Overview

The Student Portal uses TCPDF library to generate three types of PDF documents:
1. **Virtual ID Cards** - Student identification cards with QR codes
2. **Payment Receipts** - Official payment confirmation documents
3. **Performance Reports** - Academic transcripts with marks and GPA

## Architecture

```
┌─────────────────┐
│  Frontend       │
│  (React)        │
└────────┬────────┘
         │ HTTP Request
         ▼
┌─────────────────┐
│  API Endpoint   │
│  (PHP)          │
├─────────────────┤
│ • Validate auth │
│ • Fetch data    │
│ • Call generator│
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ PDF Generator   │
│ (TCPDF)         │
├─────────────────┤
│ • Initialize    │
│ • Add content   │
│ • Embed images  │
│ • Generate QR   │
│ • Save temp     │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Temp Storage   │
│  (24hr cleanup) │
└────────┬────────┘
         │ Download
         ▼
┌─────────────────┐
│  User Browser   │
└─────────────────┘
```

## TCPDF Library

### Why TCPDF?

**Advantages**:
- ✅ Pure PHP implementation (no external dependencies)
- ✅ Full UTF-8 and Unicode support
- ✅ Built-in QR code and barcode generation
- ✅ Extensive image format support (JPEG, PNG, GIF)
- ✅ Active maintenance and security updates
- ✅ LGPL v3 license (free for commercial use)
- ✅ Comprehensive documentation

**Alternatives Considered**:
- ❌ FPDF: Limited UTF-8 support, no QR codes
- ❌ mPDF: Higher memory usage, slower
- ❌ Dompdf: CSS rendering inconsistencies

### Installation

```bash
cd backend
composer require tecnickcom/tcpdf
```

**Verify Installation**:
```bash
php -r "require 'vendor/autoload.php'; echo 'TCPDF installed successfully';"
```

### Requirements

**PHP Extensions**:
- `gd` - Image processing
- `mbstring` - Multi-byte string support
- `zlib` - Compression support

**Check Extensions**:
```bash
php -m | grep -E 'gd|mbstring|zlib'
```

**Enable Extensions** (if missing):
Edit `php.ini` and uncomment:
```ini
extension=gd
extension=mbstring
extension=zlib
```

**Memory Limit**:
```ini
memory_limit = 256M
```

## Core Components

### 1. PDF Generator Helper

**File**: `backend/includes/pdf_generator.php`

**Functions**:

#### initializePDF()
```php
function initializePDF(string $orientation = 'P', string $format = 'A4'): TCPDF
```

Creates and configures TCPDF instance with institution branding.

**Parameters**:
- `$orientation`: 'P' (Portrait) or 'L' (Landscape)
- `$format`: Page size ('A4', 'Letter', or custom [width, height] in mm)

**Returns**: Configured TCPDF object

**Configuration**:
- Sets default fonts (Helvetica, 10pt)
- Configures margins (15mm left/right, 27mm top)
- Sets institution header/footer
- Enables auto page breaks

---

#### generateIDCard()
```php
function generateIDCard(array $studentData): string
```

Generates virtual ID card PDF.

**Parameters**:
```php
$studentData = [
    'student_id' => 'STU2024001',
    'full_name' => 'John Doe',
    'department' => 'BCA',
    'semester' => 5,
    'enrollment_date' => '2024-07-01',
    'profile_image' => '/path/to/image.jpg',
    'valid_until' => '2027-06-30'
];
```

**Returns**: Path to temporary PDF file

**Features**:
- Credit card size (85.6mm × 53.98mm)
- Institution logo
- Student photo
- QR code with verification data
- Barcode with student ID

---

#### generateReceipt()
```php
function generateReceipt(array $paymentData): string
```

Generates payment receipt PDF.

**Parameters**:
```php
$paymentData = [
    'receipt_number' => 'RCP20241114015',
    'student_name' => 'John Doe',
    'student_id' => 'STU2024001',
    'department' => 'BCA',
    'semester' => 5,
    'fee_type' => 'Tuition Fee',
    'fee_name' => 'Semester 5 Tuition',
    'base_amount' => 25000.00,
    'late_fine' => 500.00,
    'total_amount' => 25500.00,
    'payment_date' => '2024-11-14',
    'payment_method' => 'online',
    'transaction_id' => 'TXN123456789'
];
```

**Returns**: Path to temporary PDF file

**Features**:
- A4 size
- Institution header
- Receipt number and date
- Fee breakdown table
- Payment details
- Official seal/signature area

---

#### generatePerformanceReport()
```php
function generatePerformanceReport(array $studentData, array $marksData): string
```

Generates academic performance report PDF.

**Parameters**:
```php
$studentData = [
    'student_id' => 'STU2024001',
    'full_name' => 'John Doe',
    'department' => 'BCA',
    'program' => 'Bachelor of Computer Applications',
    'enrollment_date' => '2024-07-01',
    'current_semester' => 5
];

$marksData = [
    [
        'semester' => 1,
        'subjects' => [
            [
                'subject_code' => 'BCA101',
                'subject_name' => 'Programming Fundamentals',
                'credit_hours' => 4,
                'internal_marks' => 25,
                'external_marks' => 65,
                'total_marks' => 90,
                'letter_grade' => 'A+',
                'grade_point' => 4.00,
                'credit_points' => 16.00
            ]
        ],
        'gpa' => 3.75,
        'cgpa' => 3.75
    ]
];
```

**Returns**: Path to temporary PDF file

**Features**:
- Multi-page A4 document
- Student header on each page
- Semester-wise marks tables
- GPA/CGPA calculations
- Overall summary

---

#### embedQRCode()
```php
function embedQRCode(TCPDF $pdf, string $data, int $x, int $y, int $size): void
```

Embeds QR code in PDF at specified position.

**Parameters**:
- `$pdf`: TCPDF instance
- `$data`: Data to encode (JSON string recommended)
- `$x`: X coordinate in mm
- `$y`: Y coordinate in mm
- `$size`: QR code size in mm

**Example**:
```php
$qrData = json_encode([
    'student_id' => 'STU2024001',
    'verification_url' => 'https://portal.university.edu/verify/STU2024001'
]);

embedQRCode($pdf, $qrData, 10, 10, 30);
```

---

#### cleanupTempFiles()
```php
function cleanupTempFiles(int $olderThanHours = 24): void
```

Deletes temporary PDF files older than specified hours.

**Parameters**:
- `$olderThanHours`: Age threshold in hours (default: 24)

**Usage**:
```php
// Manual cleanup
cleanupTempFiles(24);

// Cron job (daily at 2 AM)
0 2 * * * php /path/to/backend/includes/cleanup_temp_files.php
```

---

#### outputPDFDownload()
```php
function outputPDFDownload(string $filePath, string $filename): void
```

Sends PDF file to browser with download headers.

**Parameters**:
- `$filePath`: Path to PDF file
- `$filename`: Download filename

**Headers Set**:
```php
Content-Type: application/pdf
Content-Disposition: attachment; filename="$filename"
Content-Length: <file_size>
```

## Customization

### Institution Branding

Edit `backend/includes/pdf_generator.php`:

```php
// Institution Information
define('INSTITUTION_NAME', 'Your University Name');
define('INSTITUTION_ADDRESS', '123 University Ave, City, State 12345');
define('INSTITUTION_PHONE', '+1 (555) 123-4567');
define('INSTITUTION_EMAIL', 'info@university.edu');
define('INSTITUTION_WEBSITE', 'www.university.edu');

// Logo
define('INSTITUTION_LOGO', __DIR__ . '/../assets/logo.png');
define('LOGO_WIDTH', 30); // mm

// Colors (RGB)
define('PRIMARY_COLOR', [41, 128, 185]);    // Blue
define('SECONDARY_COLOR', [52, 73, 94]);    // Dark gray
define('ACCENT_COLOR', [46, 204, 113]);     // Green
define('HEADER_BG_COLOR', [236, 240, 241]); // Light gray
```

### Logo Requirements

**Format**: PNG with transparent background  
**Size**: 200×200 pixels minimum  
**Location**: `backend/assets/logo.png`

**Optimization**:
```bash
# Resize logo
convert logo.png -resize 200x200 logo_optimized.png

# Compress
pngquant logo_optimized.png --output logo.png
```

### Fonts

**Default Font**: Helvetica (built-in)

**Custom Fonts**:
1. Convert TTF to TCPDF format:
```bash
php vendor/tecnickcom/tcpdf/tools/tcpdf_addfont.php \
  -i path/to/font.ttf \
  -t TrueTypeUnicode
```

2. Place generated files in `vendor/tecnickcom/tcpdf/fonts/`

3. Use in PDF:
```php
$pdf->SetFont('customfont', '', 12);
```

### Layout Customization

#### ID Card Layout

Edit `generateIDCard()` function:

```php
// Change dimensions
$pdf = new TCPDF('L', 'mm', [85.6, 53.98]); // Landscape, credit card size

// Adjust element positions
$pdf->SetXY(10, 10); // Logo position
$pdf->SetXY(50, 15); // Name position
$pdf->SetXY(10, 40); // QR code position
```

#### Receipt Layout

```php
// Add institution seal
$pdf->Image('assets/seal.png', 150, 250, 30, 30);

// Modify table styling
$pdf->SetFillColor(236, 240, 241); // Header background
$pdf->SetTextColor(0, 0, 0);       // Text color
$pdf->SetDrawColor(200, 200, 200); // Border color
$pdf->SetLineWidth(0.3);           // Border width
```

#### Performance Report Layout

```php
// Add watermark
$pdf->SetAlpha(0.1);
$pdf->Image('assets/watermark.png', 50, 100, 100, 100);
$pdf->SetAlpha(1);

// Customize grade table
$pdf->SetFont('helvetica', 'B', 10); // Bold headers
$pdf->SetFont('helvetica', '', 9);   // Regular content
```

## API Endpoints

### Student ID Card

**Endpoint**: `GET /api/student/download_id_card.php`

**Implementation**:
```php
<?php
require_once '../../includes/auth.php';
require_once '../../includes/pdf_generator.php';
require_once '../../config/database.php';

// Verify authentication
$user = verifyAuth();
if (!$user || $user['role'] !== 'student') {
    http_response_code(403);
    echo json_encode(['error' => 'Forbidden']);
    exit();
}

// Fetch student data
$stmt = $db->prepare("
    SELECT s.*, CONCAT(s.first_name, ' ', s.last_name) as full_name
    FROM students s
    WHERE s.user_id = :user_id
");
$stmt->execute(['user_id' => $user['user_id']]);
$studentData = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$studentData) {
    http_response_code(404);
    echo json_encode(['error' => 'Student not found']);
    exit();
}

// Generate PDF
try {
    $pdfPath = generateIDCard($studentData);
    $filename = "ID_Card_{$studentData['student_id']}.pdf";
    outputPDFDownload($pdfPath, $filename);
} catch (Exception $e) {
    error_log("PDF generation error: " . $e->getMessage());
    http_response_code(500);
    echo json_encode(['error' => 'PDF generation failed']);
}
?>
```

### Payment Receipt

**Endpoint**: `GET /api/student/download_receipt.php?payment_id=15`

**Implementation**: Similar to ID card, but fetches payment data

### Performance Report

**Endpoint**: `GET /api/student/download_performance_report.php?semester=5`

**Implementation**: Fetches marks data grouped by semester

## Temporary File Management

### Storage Location

```
backend/uploads/temp/
├── id_card_1731600000_abc123.pdf
├── receipt_1731600100_def456.pdf
└── report_1731600200_ghi789.pdf
```

### Naming Convention

```
{type}_{timestamp}_{random}.pdf
```

**Example**:
```php
$filename = sprintf(
    'id_card_%d_%s.pdf',
    time(),
    bin2hex(random_bytes(8))
);
```

### Cleanup Script

**File**: `backend/includes/cleanup_temp_files.php`

```php
<?php
$tempDir = __DIR__ . '/../uploads/temp/';
$maxAge = 24 * 3600; // 24 hours in seconds

$files = glob($tempDir . '*.pdf');
$now = time();
$deletedCount = 0;

foreach ($files as $file) {
    if (is_file($file)) {
        $fileAge = $now - filemtime($file);
        if ($fileAge > $maxAge) {
            unlink($file);
            $deletedCount++;
        }
    }
}

error_log("Cleanup: Deleted $deletedCount temp PDF files");
?>
```

### Cron Job Setup

**Linux/Mac**:
```bash
# Edit crontab
crontab -e

# Add line (runs daily at 2 AM)
0 2 * * * php /full/path/to/backend/includes/cleanup_temp_files.php
```

**Windows Task Scheduler**:
1. Open Task Scheduler
2. Create Basic Task: "PDF Cleanup"
3. Trigger: Daily at 2:00 AM
4. Action: Start a program
5. Program: `C:\xampp\php\php.exe`
6. Arguments: `C:\xampp\htdocs\studentportal\backend\includes\cleanup_temp_files.php`

**Manual Cleanup**:
```bash
php backend/includes/cleanup_temp_files.php
```

## Performance Optimization

### Memory Management

**Recommended Settings** (`php.ini`):
```ini
memory_limit = 256M
max_execution_time = 60
upload_max_filesize = 10M
post_max_size = 10M
```

**Monitor Memory Usage**:
```php
$memoryBefore = memory_get_usage();
$pdfPath = generateIDCard($studentData);
$memoryAfter = memory_get_usage();
$memoryUsed = ($memoryAfter - $memoryBefore) / 1024 / 1024; // MB
error_log("PDF generation used {$memoryUsed}MB");
```

### Image Optimization

**Resize Images Before Embedding**:
```php
function optimizeImage($imagePath, $maxWidth = 800, $maxHeight = 800) {
    list($width, $height) = getimagesize($imagePath);
    
    if ($width <= $maxWidth && $height <= $maxHeight) {
        return $imagePath; // No resize needed
    }
    
    $ratio = min($maxWidth / $width, $maxHeight / $height);
    $newWidth = $width * $ratio;
    $newHeight = $height * $ratio;
    
    $image = imagecreatefromjpeg($imagePath);
    $resized = imagecreatetruecolor($newWidth, $newHeight);
    imagecopyresampled($resized, $image, 0, 0, 0, 0, $newWidth, $newHeight, $width, $height);
    
    $tempPath = sys_get_temp_dir() . '/' . uniqid() . '.jpg';
    imagejpeg($resized, $tempPath, 85);
    
    imagedestroy($image);
    imagedestroy($resized);
    
    return $tempPath;
}
```

### Caching (Future Enhancement)

**Cache Frequently Generated PDFs**:
```php
function getCachedPDF($cacheKey, $generator, $ttl = 3600) {
    $cacheFile = __DIR__ . '/../cache/' . md5($cacheKey) . '.pdf';
    
    if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $ttl) {
        return $cacheFile; // Return cached version
    }
    
    $pdfPath = $generator(); // Generate new PDF
    copy($pdfPath, $cacheFile); // Cache it
    return $pdfPath;
}
```

## Troubleshooting

### Common Issues

#### 1. PDF Won't Open

**Symptoms**: "File is damaged" or "Cannot open PDF"

**Causes**:
- Insufficient memory
- Corrupted image files
- Invalid UTF-8 characters

**Solutions**:
```php
// Increase memory limit
ini_set('memory_limit', '256M');

// Validate images
if (!file_exists($imagePath) || !is_readable($imagePath)) {
    throw new Exception("Image not found: $imagePath");
}

// Sanitize text
$text = mb_convert_encoding($text, 'UTF-8', 'UTF-8');
```

#### 2. Missing Images

**Symptoms**: Blank spaces where images should be

**Causes**:
- Incorrect file paths
- Permission issues
- Unsupported image format

**Solutions**:
```php
// Use absolute paths
$imagePath = realpath(__DIR__ . '/../uploads/profiles/' . $filename);

// Check permissions
if (!is_readable($imagePath)) {
    chmod($imagePath, 0644);
}

// Convert to supported format
$image = imagecreatefromstring(file_get_contents($imagePath));
$tempPath = sys_get_temp_dir() . '/temp.jpg';
imagejpeg($image, $tempPath);
```

#### 3. QR Code Not Scanning

**Symptoms**: QR code appears but won't scan

**Causes**:
- Invalid JSON data
- QR code too small
- Low error correction level

**Solutions**:
```php
// Validate JSON
$qrData = json_encode($data, JSON_UNESCAPED_SLASHES);
if (json_last_error() !== JSON_ERROR_NONE) {
    throw new Exception("Invalid QR data");
}

// Increase size
embedQRCode($pdf, $qrData, 10, 10, 40); // 40mm instead of 30mm

// Use higher error correction
$pdf->write2DBarcode($qrData, 'QRCODE,H', 10, 10, 40, 40);
```

#### 4. Slow Generation

**Symptoms**: PDF takes > 5 seconds to generate

**Causes**:
- Large images
- Complex layouts
- Insufficient resources

**Solutions**:
```php
// Optimize images first
$optimizedImage = optimizeImage($profileImage, 400, 400);

// Disable compression for speed
$pdf->SetCompression(false);

// Use simpler fonts
$pdf->SetFont('helvetica', '', 10); // Instead of custom fonts
```

#### 5. Memory Exhausted

**Symptoms**: "Allowed memory size exhausted" error

**Causes**:
- Large images
- Multiple PDFs in same request
- Memory leaks

**Solutions**:
```php
// Increase limit
ini_set('memory_limit', '512M');

// Free memory after generation
unset($pdf);
gc_collect_cycles();

// Process in batches
foreach ($students as $student) {
    generateIDCard($student);
    gc_collect_cycles(); // Force garbage collection
}
```

## Testing

### Unit Tests

```php
// Test ID card generation
function testIDCardGeneration() {
    $studentData = [
        'student_id' => 'TEST001',
        'full_name' => 'Test Student',
        'department' => 'BCA',
        'semester' => 1,
        'enrollment_date' => '2024-01-01',
        'profile_image' => __DIR__ . '/test_image.jpg',
        'valid_until' => '2027-01-01'
    ];
    
    $pdfPath = generateIDCard($studentData);
    
    assert(file_exists($pdfPath), "PDF file should exist");
    assert(filesize($pdfPath) > 0, "PDF file should not be empty");
    
    unlink($pdfPath); // Cleanup
}
```

### Integration Tests

```bash
# Test ID card download
curl -X GET "http://localhost:8000/api/student/download_id_card.php" \
  -H "Authorization: Bearer $TOKEN" \
  --output test_id_card.pdf

# Verify PDF
file test_id_card.pdf
# Output: test_id_card.pdf: PDF document, version 1.7

# Test with PDF reader
xdg-open test_id_card.pdf  # Linux
open test_id_card.pdf      # Mac
start test_id_card.pdf     # Windows
```

### Performance Tests

```php
// Measure generation time
$start = microtime(true);
$pdfPath = generateIDCard($studentData);
$duration = microtime(true) - $start;

assert($duration < 2.0, "ID card should generate in < 2 seconds");
```

## Security Considerations

### Input Validation

```php
// Validate student data
function validateStudentData($data) {
    $required = ['student_id', 'full_name', 'department'];
    foreach ($required as $field) {
        if (empty($data[$field])) {
            throw new Exception("Missing required field: $field");
        }
    }
    
    // Sanitize text
    $data['full_name'] = htmlspecialchars($data['full_name'], ENT_QUOTES, 'UTF-8');
    
    return $data;
}
```

### File Access Control

```php
// Verify user owns the resource
function verifyOwnership($userId, $paymentId, $db) {
    $stmt = $db->prepare("
        SELECT student_id FROM payments p
        JOIN students s ON p.student_id = s.id
        WHERE p.id = :payment_id AND s.user_id = :user_id
    ");
    $stmt->execute(['payment_id' => $paymentId, 'user_id' => $userId]);
    
    if (!$stmt->fetch()) {
        http_response_code(403);
        echo json_encode(['error' => 'Access denied']);
        exit();
    }
}
```

### Temporary File Security

```php
// Use secure random filenames
$filename = sprintf(
    '%s_%d_%s.pdf',
    $type,
    time(),
    bin2hex(random_bytes(16)) // 32 character random string
);

// Set restrictive permissions
chmod($pdfPath, 0600); // Owner read/write only
```

## Best Practices

1. **Always validate input data** before PDF generation
2. **Use absolute paths** for images and assets
3. **Optimize images** before embedding (resize, compress)
4. **Set memory limits** appropriately (256MB minimum)
5. **Clean up temp files** regularly (24-hour cron job)
6. **Test PDFs** in multiple readers (Adobe, Chrome, Firefox)
7. **Log errors** for debugging
8. **Use transactions** when fetching data from multiple tables
9. **Cache frequently generated PDFs** (future enhancement)
10. **Monitor performance** and optimize slow operations

---

**Document Version**: 1.0  
**Last Updated**: November 15, 2025
