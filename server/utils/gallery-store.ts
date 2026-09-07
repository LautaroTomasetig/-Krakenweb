import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "./firebase.js";
export type GalleryItem = { number:string; title:string; description:string; type:"video"|"image"; src:string; alt:string; poster?:string; position?:string; featured?:boolean };
const ref = doc(db, "site", "gallery");
export const defaultGallery:GalleryItem[]=[
  {number:"01",title:"La precisión en marcha",description:"Tecnología que trabaja al ritmo de cada proyecto.",type:"video",src:"/img/krakenvid.mp4",alt:"Máquinas trabajando en una planta industrial",featured:true},
  {number:"02",title:"Manos que saben",description:"Experiencia técnica detrás de cada terminación.",type:"image",src:"/img/pintura.JPG",alt:"Interior de la planta industrial Kraken Group",position:"35% center"},
  {number:"03",title:"Del plano a la pieza",description:"Cada detalle controlado antes de entregar.",type:"image",src:"/img/diseño.JPG",alt:"Operario trabajando con maquinaria industrial"},
  {number:"04",title:"Un equipo en movimiento",description:"Personas y procesos alineados para producir mejor.",type:"image",src:"/img/equipo.JPG",alt:"Planta y maquinaria industrial Kraken Group",position:"72% center"},
  {number:"05",title:"Listos para entregar",description:"El resultado final preparado para entrar en operación.",type:"image",src:"/img/final.JPG",alt:"Detalle de producción industrial Kraken Group",position:"center 65%"},
];
export async function loadGallery(){const snapshot=await getDoc(ref);const items=snapshot.data()?.items;return Array.isArray(items)&&items.length?items as GalleryItem[]:defaultGallery}
export async function saveGallery(items:GalleryItem[]){await setDoc(ref,{items});return items}
