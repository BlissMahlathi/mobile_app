# Barcode Scanning & Display Testing Guide

## Features Implemented

### 1. **Scan Cards** 
- Camera-based barcode scanning using `expo-barcode-scanner`
- Supports multiple barcode formats (EAN-13, EAN-8, Code39, Code128, UPC-A, UPC-E, QR codes, etc.)
- Visual scan frame with instructions
- Preview scanned data before saving

### 2. **Display Scannable Barcodes**
- Real barcode rendering using `react-native-barcode-builder`
- High contrast (black on white) for optimal scanning
- Brightness boost reminder for better scannability
- Shows barcode type and data

### 3. **Card Management**
- Cards with barcodes show a "Scannable" badge
- Small barcode icon on card thumbnail
- Easy access to full-screen barcode view
- Share card details

## How to Test

### Testing Barcode Scanning

1. **Navigate to Wallet** → Tap "Scan Card" button
2. **Grant Camera Permission** when prompted
3. **Scan a Barcode**:
   - Point camera at any product barcode, loyalty card, or QR code
   - Position within the green frame
   - Wait for automatic detection
4. **Save the Card**:
   - Review the scanned data
   - Tap "Save Card" to add to wallet
   - Or "Scan Again" to retry

### Testing Barcode Display

1. **Open a Scanned Card** from the wallet list
2. **View the Barcode**:
   - Full-size, scannable barcode rendered
   - Barcode type displayed (e.g., CODE128, EAN13)
   - Numeric/alphanumeric data shown below
3. **Use at Shops/Gates**:
   - Tap "Boost" to see brightness reminder
   - Show screen to scanner at checkout or gate
   - Scanner should read the barcode successfully

### Test Scenarios

#### Scenario 1: Student ID Card
1. Scan your student ID barcode
2. Rename to "University ID"
3. Use at library gate or cafeteria

#### Scenario 2: Loyalty Card
1. Scan loyalty card (e.g., grocery store, coffee shop)
2. Show at checkout for discounts
3. Share card details with family member

#### Scenario 3: Discount/Coupon
1. Scan promotional barcode
2. Save for later use
3. Display at shop when making purchase

## Supported Barcode Formats

### 1D Barcodes (Linear)
- **CODE128** - Most common, supports alphanumeric
- **CODE39** - Older standard, alphanumeric
- **EAN-13** - European Article Number (retail products)
- **EAN-8** - Shorter EAN for small products
- **UPC-A** - Universal Product Code (US/Canada)
- **UPC-E** - Compressed UPC

### 2D Barcodes
- **QR Code** - Quick Response, can store URLs, text
- **PDF417** - Used on driver's licenses, tickets
- **Data Matrix** - Small, high-density codes

## Tips for Best Results

### Scanning
- ✅ Ensure good lighting
- ✅ Hold phone steady
- ✅ Keep barcode flat and in focus
- ✅ Position barcode within green frame
- ❌ Avoid shadows or glare on barcode

### Display
- ✅ Maximize screen brightness
- ✅ Clean your screen
- ✅ Hold phone steady when scanning
- ✅ Ensure scanner has clear view
- ❌ Don't tilt screen too much

## Troubleshooting

### "Camera Permission Denied"
**Solution**: Go to device Settings → App Permissions → Camera → Enable

### "Barcode Won't Scan" (when capturing)
**Possible Causes**:
- Poor lighting → Use flashlight or move to brighter area
- Damaged barcode → Try different angle or lighting
- Unsupported format → Check supported formats above

### "Saved Barcode Won't Scan at Shop"
**Possible Causes**:
- Screen brightness too low → Increase to maximum
- Screen dirty → Clean with soft cloth
- Wrong format → Some scanners are format-specific
- Barcode damaged in original → Rescan from source

## Storage in Database

Scanned cards are stored with:
```sql
- barcode_data: The actual barcode value (text/numbers)
- barcode_type: The barcode format (e.g., "org.iso.Code128")
- card_type: Category (loyalty, student-id, discount)
- name: Custom name for the card
- created_at: Timestamp
```

## Next Steps / Enhancements

- [ ] Add manual barcode entry for damaged codes
- [ ] Support for digital wallet passes (Apple Wallet, Google Pay)
- [ ] Barcode expiration dates and reminders
- [ ] Card usage statistics and tracking
- [ ] Backup/restore cards to cloud
