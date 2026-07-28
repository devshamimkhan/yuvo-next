-- CreateTable
CREATE TABLE `Product` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `sku` VARCHAR(191) NOT NULL,
    `category` VARCHAR(191) NOT NULL,
    `price` DECIMAL(10, 2) NOT NULL,
    `comparePrice` DECIMAL(10, 2) NULL,
    `stock` INTEGER NOT NULL DEFAULT 0,
    `status` ENUM('active', 'draft', 'archived') NOT NULL DEFAULT 'draft',
    `imageUrl` VARCHAR(191) NULL,
    `galleryImages` JSON NULL,
    `shortDescription` VARCHAR(500) NULL,
    `description` TEXT NULL,
    `rating` DOUBLE NULL,
    `shipping` VARCHAR(191) NULL,
    `kitItems` JSON NULL,
    `features` JSON NULL,
    `faqs` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Product_sku_key`(`sku`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
