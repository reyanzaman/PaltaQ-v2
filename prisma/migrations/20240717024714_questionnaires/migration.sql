-- CreateTable
CREATE TABLE "PreQuestionnaire" (
    "id" SERIAL NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "currentAge" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "curiosity" INTEGER NOT NULL,
    "questionsAtAge4" INTEGER NOT NULL,
    "questionsYesterday" INTEGER NOT NULL,
    "enjoyStudies" INTEGER NOT NULL,
    "confidentStudies" INTEGER NOT NULL,
    "motivatedStudies" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PreQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PostQuestionnaire" (
    "id" SERIAL NOT NULL,
    "isCompleted" BOOLEAN NOT NULL DEFAULT false,
    "userId" TEXT NOT NULL,
    "universityId" TEXT NOT NULL,
    "section" TEXT NOT NULL,
    "currentAge" INTEGER NOT NULL,
    "gender" TEXT NOT NULL,
    "curiosity" INTEGER NOT NULL,
    "questionsAtAge4" INTEGER NOT NULL,
    "questionsYesterday" INTEGER NOT NULL,
    "enjoyStudies" INTEGER NOT NULL,
    "confidentStudies" INTEGER NOT NULL,
    "motivatedStudies" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PostQuestionnaire_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PreQuestionnaire_userId_key" ON "PreQuestionnaire"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PostQuestionnaire_userId_key" ON "PostQuestionnaire"("userId");

-- AddForeignKey
ALTER TABLE "PreQuestionnaire" ADD CONSTRAINT "PreQuestionnaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PostQuestionnaire" ADD CONSTRAINT "PostQuestionnaire_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
