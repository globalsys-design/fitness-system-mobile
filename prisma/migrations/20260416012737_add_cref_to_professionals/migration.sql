-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "activityLevel" TEXT,
ADD COLUMN     "availability" JSONB,
ADD COLUMN     "ethnicity" TEXT,
ADD COLUMN     "healthInsurance" TEXT,
ADD COLUMN     "maritalStatus" TEXT,
ADD COLUMN     "objective" TEXT,
ADD COLUMN     "passwordHash" TEXT,
ADD COLUMN     "phoneDdi" TEXT,
ADD COLUMN     "profession" TEXT;

-- AlterTable
ALTER TABLE "professionals" ADD COLUMN     "city" TEXT,
ADD COLUMN     "cref" TEXT,
ADD COLUMN     "state" TEXT;

-- CreateTable
CREATE TABLE "exercises" (
    "id" TEXT NOT NULL,
    "professionalId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "muscleGroups" TEXT[],
    "videoUrl" TEXT,
    "thumbnail" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "exercises_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "exercises" ADD CONSTRAINT "exercises_professionalId_fkey" FOREIGN KEY ("professionalId") REFERENCES "professionals"("id") ON DELETE CASCADE ON UPDATE CASCADE;
