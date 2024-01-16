import { Tesseract } from "tesseract.js";
const cv = require('./engine/opencv');

// Read image from which text needs to be extracted
const img = cv.imread("testeasy.jpg");

// Convert the image to gray scale
const gray = img.cvtColor(cv.COLOR_BGR2GRAY);

// Performing OTSU threshold
const thresh1 = gray.threshold(0, 255, cv.THRESH_OTSU | cv.THRESH_BINARY_INV);

// Specify structure shape and kernel size.
// Kernel size increases or decreases the area
// of the rectangle to be detected.
// A smaller value like (10, 10) will detect
// each word instead of a sentence.
const rect_kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(18, 18));

// Applying dilation on the threshold image
const dilation = thresh1.dilate(rect_kernel);

// Finding contours
const contours = dilation.findContours(cv.RETR_EXTERNAL, cv.CHAIN_APPROX_NONE);

// A text file is created and flushed
const fs = require('fs');
fs.writeFileSync("recognized.txt", "");

// Looping through the identified contours
// Then rectangular part is cropped and passed on
// to Tesseract.js for extracting text from it
// Extracted text is then written into the text file
for (let i = 0; i < contours.length; i++) {
    const cnt = contours[i];
    const rect = cnt.boundingRect();
    const x = rect.x;
    const y = rect.y;
    const w = rect.width;
    const h = rect.height;

    // Cropping the text block for giving input to OCR
    const cropped = img.getRegion(new cv.Rect(x, y, w, h));

    // Apply OCR on the cropped image
    Tesseract.recognize(
        cropped.cvtColor(cv.COLOR_BGR2RGB).toBuffer(),
        'eng',
        { logger: info => console.log(info) }
    ).then(({ data: { text } }) => {
        // Open the file in append mode
        fs.appendFileSync("recognized.txt", text + "\n");
    });
}