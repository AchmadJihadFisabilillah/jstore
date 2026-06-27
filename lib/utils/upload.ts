import { writeFile, mkdir } from "fs/promises";
import path from "path";
import crypto from "crypto";

export async function uploadFileLocally(
  file: File,
  folder: "qris" | "proofs"
): Promise<{ url: string; size: number; mimeType: string; originalName: string }> {
  const bytes = await file.arrayBuffer();
  const buffer = Buffer.from(bytes);

  const originalName = file.name;
  const ext = path.extname(originalName) || ".jpg"; // fallback extension
  const fileName = `${crypto.randomUUID()}${ext}`;
  
  // Storage directory: public/uploads/qris or public/uploads/proofs
  const uploadDir = path.join(process.cwd(), "public", "uploads", folder);
  
  // Ensure directory exists
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    // Ignore error if directory already exists
  }

  const filePath = path.join(uploadDir, fileName);
  await writeFile(filePath, buffer);

  return {
    url: `/uploads/${folder}/${fileName}`,
    size: file.size,
    mimeType: file.type,
    originalName,
  };
}
