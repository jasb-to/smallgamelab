import type { MetadataRoute } from "next";
export default function manifest(): MetadataRoute.Manifest {
  return {name:"The Long Run — Small Game Lab",short_name:"The Long Run",description:"A five-chapter arcade adventure starring Mara Vale.",start_url:"/games",display:"standalone",background_color:"#08090b",theme_color:"#d94b2b",orientation:"landscape",icons:[{src:"/icon.svg",sizes:"any",type:"image/svg+xml",purpose:"maskable"}]};
}
