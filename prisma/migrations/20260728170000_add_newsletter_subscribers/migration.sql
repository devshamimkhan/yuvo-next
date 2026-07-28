-- CreateEnum
CREATE TYPE "SubscriberStatus" AS ENUM (subscribed, unsubscribed);

-- CreateTable
CREATE TABLE `NewsletterSubscriber` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(191) NOT NULL,
    `status` ENUM("subscribed", "unsubscribed") NOT NULL DEFAULT subscribed,
    `subscribedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `NewsletterSubscriber_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
