// utils/cloudinary.js

const CLOUD_NAME = "pqsgxuv5"; // Reemplaza con tu Cloud Name
const UPLOAD_PRESET = "preset_productos"; // Reemplaza con tu Upload Preset (Unsigned)

export const subirImagenCloudinary = async (file) => {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("upload_preset", UPLOAD_PRESET);

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
      {
        method: "POST",
        body: formData,
      }
    );

    if (!response.ok) {
      throw new Error("Error al subir la imagen a Cloudinary");
    }

    const data = await response.json();
    // Retornamos la URL pública optimizada que nos da Cloudinary
    return data.secure_url; 
  } catch (error) {
    console.error("Error en subirImagenCloudinary:", error);
    throw error;
  }
};