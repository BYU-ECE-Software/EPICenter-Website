export type Equipment = {
  id: number;
  name: string;
  serialNumber: string;
  location: string | null;
  status: "AVAILABLE" | "ON_LOAN" | "MAINTENANCE" | "RETIRED";
};

export type EquipmentPayload = {
  name: string;
  serialNumber: string;
  location?: string | null;
  status?: Equipment["status"];
};
