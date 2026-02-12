-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('UNFULFILLED', 'ASSIGNED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'FINISHED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "EquipmentStatus" AS ENUM ('AVAILABLE', 'ON_LOAN', 'MAINTENANCE', 'RETIRED');

-- CreateEnum
CREATE TYPE "LoanStatus" AS ENUM ('ONGOING', 'RETURNED', 'OVERDUE');

-- CreateEnum
CREATE TYPE "OrderTypeEnum" AS ENUM ('PRINT_3D', 'LASER_CUTTING', 'PCB_MANUFACTURING', 'ITEM_PURCHASE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "netID" TEXT,
    "byuID" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Print_3D_Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "groupId" INTEGER,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "modelFileURL" TEXT NOT NULL,
    "additionalComments" TEXT,
    "technicianComments" TEXT,
    "filamentColor" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Print_3D_Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Laser_Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "groupId" INTEGER,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "modelFileURL" TEXT NOT NULL,
    "additionalComments" TEXT,
    "technicianComments" TEXT,
    "status" "OrderStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Laser_Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PCB_Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "groupId" INTEGER,
    "studentName" TEXT NOT NULL,
    "studentEmail" TEXT NOT NULL,
    "modelFileURL" TEXT NOT NULL,
    "additionalComments" TEXT,
    "technicianComments" TEXT,
    "PCBSiding" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL,
    "silkscreen" BOOLEAN NOT NULL,
    "boardArea" INTEGER NOT NULL,
    "rubout" BOOLEAN NOT NULL,
    "costEstimateCents" INTEGER NOT NULL,
    "status" "OrderStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PCB_Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Order" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "groupId" INTEGER,
    "item" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "orderType" "OrderTypeEnum"[],
    "status" "OrderStatus" NOT NULL DEFAULT 'UNFULFILLED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Order_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Item" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "priceCents" INTEGER NOT NULL,
    "quantity" INTEGER NOT NULL,
    "photoURL" TEXT,
    "description" TEXT,
    "location" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Item_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Purchase" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "purchasingGroupId" INTEGER,
    "totalCents" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Purchase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PurchasingGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "supervisor" TEXT,
    "workTag" TEXT NOT NULL,
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PurchasingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Equipment" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "serialNumber" TEXT NOT NULL,
    "location" TEXT,
    "pictureURL" TEXT,
    "status" "EquipmentStatus" NOT NULL DEFAULT 'AVAILABLE',
    "comments" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Equipment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Loan" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER,
    "groupId" INTEGER,
    "equipmentId" INTEGER NOT NULL,
    "loanDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "returnDate" TIMESTAMP(3),
    "status" "LoanStatus" NOT NULL DEFAULT 'ONGOING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Loan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_ItemToPurchase" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_ItemToPurchase_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_netID_key" ON "User"("netID");

-- CreateIndex
CREATE UNIQUE INDEX "User_byuID_key" ON "User"("byuID");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_netID_idx" ON "User"("netID");

-- CreateIndex
CREATE INDEX "Print_3D_Order_userId_idx" ON "Print_3D_Order"("userId");

-- CreateIndex
CREATE INDEX "Print_3D_Order_status_idx" ON "Print_3D_Order"("status");

-- CreateIndex
CREATE INDEX "Laser_Order_userId_idx" ON "Laser_Order"("userId");

-- CreateIndex
CREATE INDEX "Laser_Order_status_idx" ON "Laser_Order"("status");

-- CreateIndex
CREATE INDEX "PCB_Order_userId_idx" ON "PCB_Order"("userId");

-- CreateIndex
CREATE INDEX "PCB_Order_status_idx" ON "PCB_Order"("status");

-- CreateIndex
CREATE INDEX "Order_userId_idx" ON "Order"("userId");

-- CreateIndex
CREATE INDEX "Order_orderType_idx" ON "Order"("orderType");

-- CreateIndex
CREATE INDEX "Order_status_idx" ON "Order"("status");

-- CreateIndex
CREATE INDEX "Item_name_idx" ON "Item"("name");

-- CreateIndex
CREATE INDEX "Purchase_userId_idx" ON "Purchase"("userId");

-- CreateIndex
CREATE INDEX "Purchase_purchasingGroupId_idx" ON "Purchase"("purchasingGroupId");

-- CreateIndex
CREATE UNIQUE INDEX "Equipment_serialNumber_key" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "Equipment_serialNumber_idx" ON "Equipment"("serialNumber");

-- CreateIndex
CREATE INDEX "Equipment_status_idx" ON "Equipment"("status");

-- CreateIndex
CREATE INDEX "Loan_userId_idx" ON "Loan"("userId");

-- CreateIndex
CREATE INDEX "Loan_equipmentId_idx" ON "Loan"("equipmentId");

-- CreateIndex
CREATE INDEX "Loan_status_idx" ON "Loan"("status");

-- CreateIndex
CREATE INDEX "Loan_groupId_idx" ON "Loan"("groupId");

-- CreateIndex
CREATE INDEX "_ItemToPurchase_B_index" ON "_ItemToPurchase"("B");

-- AddForeignKey
ALTER TABLE "Print_3D_Order" ADD CONSTRAINT "Print_3D_Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Print_3D_Order" ADD CONSTRAINT "Print_3D_Order_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PurchasingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laser_Order" ADD CONSTRAINT "Laser_Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Laser_Order" ADD CONSTRAINT "Laser_Order_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PurchasingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PCB_Order" ADD CONSTRAINT "PCB_Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PCB_Order" ADD CONSTRAINT "PCB_Order_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PurchasingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PurchasingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Purchase" ADD CONSTRAINT "Purchase_purchasingGroupId_fkey" FOREIGN KEY ("purchasingGroupId") REFERENCES "PurchasingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_equipmentId_fkey" FOREIGN KEY ("equipmentId") REFERENCES "Equipment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Loan" ADD CONSTRAINT "Loan_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "PurchasingGroup"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToPurchase" ADD CONSTRAINT "_ItemToPurchase_A_fkey" FOREIGN KEY ("A") REFERENCES "Item"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_ItemToPurchase" ADD CONSTRAINT "_ItemToPurchase_B_fkey" FOREIGN KEY ("B") REFERENCES "Purchase"("id") ON DELETE CASCADE ON UPDATE CASCADE;
