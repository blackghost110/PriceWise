export interface CreateStorePayload {
  name: string;
  street: string;
  number: string;
  postalCode: number;
  city: string;
  textColor?: string;
  bgColor?: string;
  gradientColor?: string | null;
}
