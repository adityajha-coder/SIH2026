import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

const AWS_REGION = process.env.AWS_REGION || "ap-south-1";
const AWS_BUCKET_NAME = process.env.AWS_BUCKET_NAME || "sih2026-evidence-vault";
const hasAwsCredentials = Boolean(process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);

let s3Client = null;

if (hasAwsCredentials) {
    s3Client = new S3Client({
        region: AWS_REGION,
        credentials: {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        },
        ...(process.env.AWS_ENDPOINT && {
            endpoint: process.env.AWS_ENDPOINT,
            forcePathStyle: true, // Needed for MinIO/LocalStack
        }),
    });
}

export const storageService = {
    async getUploadPresignedUrl({ fileKey, mimeType, maxSizeBytes = 25 * 1024 * 1024, expirySeconds = 900 }) {
        if (!hasAwsCredentials || !s3Client) {
            // Local fallback simulation
            return {
                uploadUrl: `http://localhost:3001/v1/mock-storage/upload?key=${encodeURIComponent(fileKey)}&mockSig=valid`,
                method: "PUT",
                headers: {
                    "Content-Type": mimeType,
                },
                expiresInSeconds: expirySeconds,
                isMock: true,
            };
        }

        const command = new PutObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: fileKey,
            ContentType: mimeType,
        });

        const uploadUrl = await getSignedUrl(s3Client, command, { expiresIn: expirySeconds });

        return {
            uploadUrl,
            method: "PUT",
            headers: {
                "Content-Type": mimeType,
            },
            expiresInSeconds: expirySeconds,
            isMock: false,
        };
    },

    async getDownloadPresignedUrl({ fileKey, expirySeconds = 1800 }) {
        if (!hasAwsCredentials || !s3Client) {
            return {
                downloadUrl: `http://localhost:3001/v1/mock-storage/download?key=${encodeURIComponent(fileKey)}`,
                expiresInSeconds: expirySeconds,
                isMock: true,
            };
        }

        const command = new GetObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: fileKey,
        });

        const downloadUrl = await getSignedUrl(s3Client, command, { expiresIn: expirySeconds });

        return {
            downloadUrl,
            expiresInSeconds: expirySeconds,
            isMock: false,
        };
    },

    async deleteObject({ fileKey }) {
        if (!hasAwsCredentials || !s3Client) {
            return { success: true, isMock: true };
        }

        const command = new DeleteObjectCommand({
            Bucket: AWS_BUCKET_NAME,
            Key: fileKey,
        });

        await s3Client.send(command);
        return { success: true, isMock: false };
    },
};
