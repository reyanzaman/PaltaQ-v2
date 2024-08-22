-- DropForeignKey
ALTER TABLE "PreQuestionnaire" DROP CONSTRAINT "PreQuestionnaire_classId_fkey";

-- AddForeignKey
ALTER TABLE "PreQuestionnaire" ADD CONSTRAINT "PreQuestionnaire_classId_fkey" FOREIGN KEY ("classId") REFERENCES "ClassEnrollment"("id") ON DELETE CASCADE ON UPDATE CASCADE;
