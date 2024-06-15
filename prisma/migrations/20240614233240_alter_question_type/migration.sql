-- AlterTable
ALTER TABLE "QuestionType" ADD COLUMN     "paltaQId" TEXT,
ALTER COLUMN "questionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "QuestionType" ADD CONSTRAINT "QuestionType_paltaQId_fkey" FOREIGN KEY ("paltaQId") REFERENCES "PaltaQ"("id") ON DELETE CASCADE ON UPDATE CASCADE;
