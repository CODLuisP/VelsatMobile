export interface DocItem {
  id: string;
  name: string;
  icon: any;
  estado?: string;
  deviceID?: string;
  expiry: string;
  imageUri: string | null;           // URI local del dispositivo
  cloudflareImageUrl: string | null; // URL pública en Cloudflare
  cloudflareImageId: string | null;  // ID en Cloudflare (para eliminar)
}

export interface Vehicle {
  id: string;
  plate: string;
  name: string;
  documents: DocItem[];
  expanded: boolean;
}