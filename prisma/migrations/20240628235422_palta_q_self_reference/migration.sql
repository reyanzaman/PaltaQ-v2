-- AlterTable
ALTER TABLE "PaltaQ" ADD COLUMN     "parentId" TEXT,
ALTER COLUMN "questionId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "PaltaQ_parentId_idx" ON "PaltaQ"("parentId");

-- AddForeignKey
ALTER TABLE "PaltaQ" ADD CONSTRAINT "PaltaQ_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "PaltaQ"("id") ON DELETE SET NULL ON UPDATE CASCADE;
