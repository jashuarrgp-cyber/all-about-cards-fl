-- CreateEnum
CREATE TYPE "TimeClockEventType" AS ENUM ('CLOCK_IN', 'CLOCK_OUT', 'BREAK_START', 'BREAK_END');

-- CreateTable
CREATE TABLE "TimeClockEvent" (
    "seq" SERIAL NOT NULL,
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "TimeClockEventType" NOT NULL,
    "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registerId" TEXT,
    "note" TEXT,
    "recordedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TimeClockEvent_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TimeClockEvent_seq_key" ON "TimeClockEvent"("seq");

-- CreateIndex
CREATE INDEX "TimeClockEvent_userId_seq_idx" ON "TimeClockEvent"("userId", "seq");

-- CreateIndex
CREATE INDEX "TimeClockEvent_occurredAt_idx" ON "TimeClockEvent"("occurredAt");

-- CreateIndex
CREATE INDEX "TimeClockEvent_type_idx" ON "TimeClockEvent"("type");

-- AddForeignKey
ALTER TABLE "TimeClockEvent" ADD CONSTRAINT "TimeClockEvent_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TimeClockEvent" ADD CONSTRAINT "TimeClockEvent_recordedById_fkey" FOREIGN KEY ("recordedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

