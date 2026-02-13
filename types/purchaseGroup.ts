export type PurchasingGroup = {
  id: number;
  name: string;
  supervisor: string | null;
  workTag: string;
  comments: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  loans?: any[];
  purchases?: any[];
  print3DOrders?: any[];
  laserOrders?: any[];
  pcbOrders?: any[];
  orders?: any[];
};

export type PurchasingGroupPayload = {
  name: string;
  supervisor?: string | null;
  workTag: string;
  comments?: string | null;
};
