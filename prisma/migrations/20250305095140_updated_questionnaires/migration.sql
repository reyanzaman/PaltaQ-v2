/*
  Warnings:

  - You are about to drop the column `comments` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `confidentStudies` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `curiosity` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `currentAge` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `enjoyStudies` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `gender` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `motivatedStudies` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `questionsNow` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `universityId` on the `PostQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `confidentStudies` on the `PreQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `curiosity` on the `PreQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `currentAge` on the `PreQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `enjoyStudies` on the `PreQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `motivatedStudies` on the `PreQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `questionsAtAge4` on the `PreQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `questionsYesterday` on the `PreQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `section` on the `PreQuestionnaire` table. All the data in the column will be lost.
  - You are about to drop the column `universityId` on the `PreQuestionnaire` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PostQuestionnaire" DROP COLUMN "comments",
DROP COLUMN "confidentStudies",
DROP COLUMN "curiosity",
DROP COLUMN "currentAge",
DROP COLUMN "enjoyStudies",
DROP COLUMN "gender",
DROP COLUMN "motivatedStudies",
DROP COLUMN "questionsNow",
DROP COLUMN "section",
DROP COLUMN "universityId",
ADD COLUMN     "askAvoid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askGPT" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askMyself" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askPeer" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askResearch" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askTeacher" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cgpa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "courageToAsk" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "curiousToKnow" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "desireToLearn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dontEnjoyStudying" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "easierToMemorize" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "extraCurricular" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "interestPaltaQ" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "leisureTime" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "motivatedToAsk" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesAskGroup" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesAskMyself" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesAskStudents" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesAvoid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesMemorize" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesResearch" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "opinionAskingQues" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "opinionMemorizing" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "opinionPracticing" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "quesHelpsUnderstand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "quesionsAsked" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "questionArises" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "questionExample" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studentId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studyCuriosity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studyMotivation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studyTime" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "subjectILike" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "suggestionsPaltaQ" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whyChildrenAskQuestions" TEXT NOT NULL DEFAULT '';

-- AlterTable
ALTER TABLE "PreQuestionnaire" DROP COLUMN "confidentStudies",
DROP COLUMN "curiosity",
DROP COLUMN "currentAge",
DROP COLUMN "enjoyStudies",
DROP COLUMN "motivatedStudies",
DROP COLUMN "questionsAtAge4",
DROP COLUMN "questionsYesterday",
DROP COLUMN "section",
DROP COLUMN "universityId",
ADD COLUMN     "age" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "askAvoid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askGPT" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askMyself" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askPeer" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askResearch" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "askTeacher" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "cgpa" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "courageToAsk" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "curiousToKnow" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "desireToLearn" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "dontEnjoyStudying" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "easierToMemorize" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "extraCurricular" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "leisureTime" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "maritalStatus" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "motivatedToAsk" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesAskGroup" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesAskMyself" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesAskStudents" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesAvoid" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesMemorize" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "multQuesResearch" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "opinionAskingQues" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "opinionMemorizing" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "opinionPracticing" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "quesHelpsUnderstand" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "quesionsAsked" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "questionArises" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "questionExample" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "schoolLocation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studentId" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studyCuriosity" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studyMotivation" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "studyTime" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "subjectILike" TEXT NOT NULL DEFAULT '',
ADD COLUMN     "whyChildrenAskQuestions" TEXT NOT NULL DEFAULT '';
