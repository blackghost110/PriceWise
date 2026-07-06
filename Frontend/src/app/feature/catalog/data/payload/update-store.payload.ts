export interface UpdateStorePayload {
  name: string;
  street: string;
  number: string;
  postalCode: string;
  city: string;
  textColor?: string;
  bgColor?: string;
  gradientColor?: string | null;
}
