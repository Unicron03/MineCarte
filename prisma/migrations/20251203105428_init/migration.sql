/*
  Warnings:

  - The `category` column on the `cards` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "card_category" AS ENUM ('MOB', 'EQUIPMENT', 'ARTIFACT');

-- DropForeignKey
ALTER TABLE "collection" DROP CONSTRAINT "collection_user_id_fkey";

-- DropForeignKey
ALTER TABLE "deck_cards" DROP CONSTRAINT "deck_cards_deck_id_fkey";

-- DropForeignKey
ALTER TABLE "decks" DROP CONSTRAINT "decks_user_id_fkey";

-- DropForeignKey
ALTER TABLE "inventory" DROP CONSTRAINT "inventory_user_id_fkey";

-- DropForeignKey
ALTER TABLE "point" DROP CONSTRAINT "point_user_id_fkey";

-- DropForeignKey
ALTER TABLE "stat" DROP CONSTRAINT "stat_user_id_fkey";

-- AlterTable
ALTER TABLE "cards" DROP COLUMN "category",
ADD COLUMN     "category" "card_category" NOT NULL DEFAULT 'MOB';

-- AddForeignKey
ALTER TABLE "collection" ADD CONSTRAINT "collection_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "decks" ADD CONSTRAINT "decks_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deck_cards" ADD CONSTRAINT "deck_cards_deck_id_fkey" FOREIGN KEY ("deck_id") REFERENCES "decks"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inventory" ADD CONSTRAINT "inventory_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "point" ADD CONSTRAINT "point_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stat" ADD CONSTRAINT "stat_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE CASCADE ON UPDATE CASCADE;
