-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" TEXT NOT NULL DEFAULT 'viewer',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "MonthlyPermitLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "permitsIssued" INTEGER NOT NULL DEFAULT 0,
    "permitsReceived" INTEGER NOT NULL DEFAULT 0,
    "permitsClosed" INTEGER NOT NULL DEFAULT 0,
    "permitsWithFaults" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FaultTypeLog" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "year" INTEGER NOT NULL,
    "month" TEXT NOT NULL,
    "faultType" TEXT NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "MonthlyPermitLog_year_month_department_key" ON "MonthlyPermitLog"("year", "month", "department");

-- CreateIndex
CREATE UNIQUE INDEX "FaultTypeLog_year_month_faultType_key" ON "FaultTypeLog"("year", "month", "faultType");
