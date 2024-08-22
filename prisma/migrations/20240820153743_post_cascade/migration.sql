-- DropForeignKey
ALTER TABLE "PostQuestionnaire" DROP CONSTRAINT "PostQuestionnaire_classId_fkey";

-- AddForeignKey
ALTER TABLE "PostQuestionnaire" ADD CONSTRAINT "PostQuestionnaire_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
