-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('customer', 'admin') NOT NULL DEFAULT 'customer';
