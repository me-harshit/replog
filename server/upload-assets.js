require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

// Initialize S3 Client
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

const filesToUpload = [
    "C:\\Users\\harsh\\Downloads\\History.jpeg",
    "C:\\Users\\harsh\\Downloads\\Today.jpeg",
    "C:\\Users\\harsh\\Downloads\\Dashboard.jpeg",
    "C:\\Users\\harsh\\Downloads\\Reports.jpeg",
    "C:\\Users\\harsh\\Downloads\\Settings-Profile.jpeg",
    "C:\\Users\\harsh\\Downloads\\Settings-Workout.jpeg"
];

async function uploadImages() {
    console.log("🚀 Starting upload to S3...");
    const bucketName = process.env.AWS_BUCKET_NAME;

    for (const filePath of filesToUpload) {
        try {
            if (!fs.existsSync(filePath)) {
                console.error(`❌ File not found: ${filePath}`);
                continue;
            }

            const fileContent = fs.readFileSync(filePath);
            const fileName = path.basename(filePath);
            const s3Key = `AppImages/${fileName}`;

            const command = new PutObjectCommand({
                Bucket: bucketName,
                Key: s3Key,
                Body: fileContent,
                ContentType: 'image/jpeg', // Standardized for your .jpeg files
            });

            await s3.send(command);
            
            const publicUrl = `https://${bucketName}.s3.${process.env.AWS_REGION}.amazonaws.com/${s3Key}`;
            console.log(`✅ Uploaded ${fileName}`);
            console.log(`🔗 URL: ${publicUrl}\n`);
            
        } catch (error) {
            console.error(`❌ Error uploading ${filePath}:`, error.message);
        }
    }
    console.log("🎉 All uploads complete!");
}

uploadImages();