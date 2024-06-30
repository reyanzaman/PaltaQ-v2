-- AlterTable
ALTER TABLE "PaltaQ" ADD COLUMN     "mainQuestionID" TEXT,
ALTER COLUMN "questionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PaltaQ" ADD CONSTRAINT "PaltaQ_mainQuestionID_fkey" FOREIGN KEY ("mainQuestionID") REFERENCES "Question"("id") ON DELETE SET NULL ON UPDATE CASCADE;
