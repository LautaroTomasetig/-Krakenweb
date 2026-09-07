import { createError, readBody } from "h3";
import { requireAdmin } from "../../utils/require-admin";
import { saveGallery, type GalleryItem } from "../../utils/gallery-store";
export default defineEventHandler(async event => { requireAdmin(event);const items=(await readBody<{items?:GalleryItem[]}>(event))?.items;if(!Array.isArray(items)||!items.length||items.length>8||items.some(item=>!item.src||!item.title||!item.description||!["image","video"].includes(item.type)))throw createError({statusCode:400,statusMessage:"Datos de galería inválidos."});return saveGallery(items.map((item,index)=>({...item,number:String(index+1).padStart(2,"0"),featured:index===0}))); });
