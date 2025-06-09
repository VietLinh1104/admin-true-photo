// File: app/api/multipart-upload/[endpoint]/route.ts
import { NextResponse } from 'next/server';
import {
  S3Client,
  UploadPartCommand,
  ListPartsCommand,
  CreateMultipartUploadCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

const { R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_KEY_ID, R2_BUCKET_NAME } = process.env;
if (!R2_ACCOUNT_ID || !R2_ACCESS_KEY_ID || !R2_SECRET_KEY_ID || !R2_BUCKET_NAME) {
  throw new Error('Missing R2 environment variables');
}

const R2 = new S3Client({
  region: 'auto',
  endpoint: `https://${R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_KEY_ID,
  },
});
const BUCKET = R2_BUCKET_NAME;

export async function POST(
  request: Request,
  context: { params: Promise<{ endpoint: string }> }
) {
  const { endpoint } = await context.params;
  const body = await request.json();

  try {
    switch (endpoint) {
      case 'create-multipart-upload': {
        const { file, contentType } = body;
        const filename = file.name;
        const cmd = new CreateMultipartUploadCommand({
          Bucket: BUCKET,
          Key: `resources/${filename}`,
          ContentType: contentType,
        });
        const resp = await R2.send(cmd);
        return NextResponse.json({ uploadId: resp.UploadId, key: resp.Key });
      }

      case 'prepare-upload-parts': {
        const { partData } = body;
        const { key, uploadId, parts } = partData;
        const presignedUrls: Record<number, string> = {};
        for (const part of parts) {
          const cmd = new UploadPartCommand({ Bucket: BUCKET, Key: key, PartNumber: part.number, UploadId: uploadId });
          presignedUrls[part.number] = await getSignedUrl(R2, cmd, { expiresIn: 3600 });
        }
        return NextResponse.json({ presignedUrls });
      }

      case 'list-parts': {
        const { key, uploadId } = body;
        const cmd = new ListPartsCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId });
        const resp = await R2.send(cmd);
        return NextResponse.json(resp.Parts || []);
      }

      case 'complete-multipart-upload': {
        const { key, uploadId, parts } = body;
        const cmd = new CompleteMultipartUploadCommand({
          Bucket: BUCKET,
          Key: key,
          UploadId: uploadId,
          MultipartUpload: { Parts: parts },
        });
        const resp = await R2.send(cmd);
        return NextResponse.json(resp);
      }

      case 'abort-multipart-upload': {
        const { key, uploadId } = body;
        const cmd = new AbortMultipartUploadCommand({ Bucket: BUCKET, Key: key, UploadId: uploadId });
        const resp = await R2.send(cmd);
        return NextResponse.json(resp);
      }

      case 'sign-part': {
        const { key, uploadId, partNumber } = body;
        const cmd = new UploadPartCommand({ Bucket: BUCKET, Key: key, PartNumber: Number(partNumber), UploadId: uploadId });
        const url = await getSignedUrl(R2, cmd, { expiresIn: 3600 });
        return NextResponse.json({ url });
      }

      case 'delete': {
        const { key } = body;
        const cmd = new DeleteObjectCommand({ Bucket: BUCKET, Key: key });
        const resp = await R2.send(cmd);
        return NextResponse.json({ success: true, message: 'File deleted successfully', data: resp });
      }

      default:
        return new Response(JSON.stringify({ error: 'Endpoint not found' }), { status: 404 });
    }
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), { status: 500 });
  }
}