-- AlterTable
CREATE SEQUENCE "answer_index_seq";
ALTER TABLE "Answer" ALTER COLUMN "index" SET DEFAULT nextval('answer_index_seq');
ALTER SEQUENCE "answer_index_seq" OWNED BY "Answer"."index";
