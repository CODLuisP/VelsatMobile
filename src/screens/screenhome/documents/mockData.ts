import {
  CreditCard,
  Stethoscope,
  Shield,
  Award,
  Wrench,
  FileText,
} from 'lucide-react-native';
import { DocItem, Vehicle } from './types';

// ─── Mock Data ────────────────────────────────────────────────────────────────

export const initialDriverDocs: DocItem[] = [
  { id: 'd1', name: 'Licencia de conducir', icon: CreditCard,  expiry: '15/08/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
  { id: 'd2', name: 'Examen médico',         icon: Stethoscope, expiry: '01/04/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
  { id: 'd3', name: 'SOAT personal',         icon: Shield,      expiry: '10/02/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
  { id: 'd4', name: 'Certificación SENATI',  icon: Award,       expiry: '20/12/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
];

export const initialVehicles: Vehicle[] = [
  {
    id: 'v1', plate: 'ABC-123', name: 'Volvo FH 500', expanded: false,
    documents: [
      { id: 'v1d1', name: 'SOAT',                icon: Shield,   expiry: '30/06/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
      { id: 'v1d2', name: 'Revisión Técnica',     icon: Wrench,   expiry: '15/03/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
      { id: 'v1d3', name: 'Tarjeta de propiedad', icon: FileText, expiry: '01/01/2030', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
    ],
  },
  {
    id: 'v2', plate: 'XYZ-789', name: 'Scania R450', expanded: false,
    documents: [
      { id: 'v2d1', name: 'SOAT',                icon: Shield, expiry: '10/01/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
      { id: 'v2d2', name: 'Revisión Técnica',     icon: Wrench, expiry: '20/09/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
      { id: 'v2d3', name: 'Certificado de gases', icon: Award,  expiry: '20/09/2025', imageUri: null, cloudflareImageUrl: null, cloudflareImageId: null },
    ],
  },
];