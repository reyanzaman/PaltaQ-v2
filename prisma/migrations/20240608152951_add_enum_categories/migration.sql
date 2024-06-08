/*
  Warnings:

  - Changed the type of `category` on the `Question` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('General', 'Topic', 'Palta');

-- AlterTable
ALTER TABLE "Question" DROP COLUMN "category",
ADD COLUMN     "category" "QuestionCategory" NOT NULL;
