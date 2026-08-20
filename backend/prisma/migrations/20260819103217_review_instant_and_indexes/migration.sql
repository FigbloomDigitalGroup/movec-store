-- AlterTable
ALTER TABLE "Review" ALTER COLUMN "isApproved" SET DEFAULT true;

-- CreateIndex
CREATE INDEX "Notification_type_idx" ON "Notification"("type");

-- CreateIndex
CREATE INDEX "Review_isApproved_idx" ON "Review"("isApproved");
