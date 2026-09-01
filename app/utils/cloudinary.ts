const CLOUD_NAME = "pqsgxuv5";
const UPLOAD_PRESET = "preset_productos";

export async function uploadProductImage(file: File) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
    method: "POST",
    body: formData,
  });
  if (!response.ok) throw new Error("No se pudo subir la imagen a Cloudinary");
  const data = await response.json() as { secure_url?: string };
  if (!data.secure_url) throw new Error("Cloudinary no devolvió la URL de la imagen");
  return data.secure_url;
}
