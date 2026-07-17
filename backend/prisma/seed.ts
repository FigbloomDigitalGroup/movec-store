import { PrismaClient, RoleName, DiscountType, AddressType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHashAdmin = await bcrypt.hash('Admin123!', 12);
  const passwordHashCustomer = await bcrypt.hash('Customer123!', 12);

  // Warehouses
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { id: 'main-warehouse' },
    update: {},
    create: { id: 'main-warehouse', name: 'Main Warehouse', location: 'Nairobi, Kenya' },
  });

  // Roles
  const adminRole = await prisma.role.upsert({
    where: { name: RoleName.ADMIN },
    update: {},
    create: { name: RoleName.ADMIN },
  });
  const customerRole = await prisma.role.upsert({
    where: { name: RoleName.CUSTOMER },
    update: {},
    create: { name: RoleName.CUSTOMER },
  });
  const technicianRole = await prisma.role.upsert({
    where: { name: RoleName.TECHNICIAN },
    update: {},
    create: { name: RoleName.TECHNICIAN },
  });
  const staffRole = await prisma.role.upsert({
    where: { name: RoleName.STAFF },
    update: {},
    create: { name: RoleName.STAFF },
  });

  // Permissions
  const resources = [
    'user',
    'product',
    'category',
    'brand',
    'order',
    'inventory',
    'payment',
    'installation',
    'ticket',
    'faq',
    'review',
    'coupon',
    'report',
    'settings',
  ];
  const actions = ['create', 'read', 'update', 'delete'];

  for (const resource of resources) {
    for (const action of actions) {
      await prisma.permission.upsert({
        where: { resource_action: { resource, action } },
        update: {},
        create: { resource, action },
      });
    }
  }

  // Assign all permissions to ADMIN role
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // Admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: passwordHashAdmin,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+254700000001',
      isEmailVerified: true,
      isActive: true,
      userRoles: {
        create: { roleId: adminRole.id },
      },
    },
  });

  // Customer user
  const customerUser = await prisma.user.upsert({
    where: { email: 'customer@example.com' },
    update: {},
    create: {
      email: 'customer@example.com',
      passwordHash: passwordHashCustomer,
      firstName: 'John',
      lastName: 'Doe',
      phone: '+254700000002',
      isEmailVerified: true,
      isActive: true,
      userRoles: {
        create: { roleId: customerRole.id },
      },
    },
  });

  // Customer address
  await prisma.address.upsert({
    where: { id: 'customer-default-address' },
    update: {},
    create: {
      id: 'customer-default-address',
      userId: customerUser.id,
      type: AddressType.SHIPPING,
      line1: '123 Moi Avenue',
      city: 'Nairobi',
      postalCode: '00100',
      country: 'Kenya',
      isDefault: true,
    },
  });

  // Categories
  const catStarlinkKits = await prisma.category.upsert({
    where: { slug: 'starlink-kits' },
    update: {},
    create: { name: 'Starlink Kits', slug: 'starlink-kits', description: 'Complete Starlink satellite internet kits' },
  });
  await prisma.category.upsert({
    where: { slug: 'starlink-accessories' },
    update: {},
    create: { name: 'Starlink Accessories', slug: 'starlink-accessories', description: 'Mounts, cables, and accessories' },
  });
  await prisma.category.upsert({
    where: { slug: 'cctv-cameras' },
    update: {},
    create: { name: 'CCTV Cameras', slug: 'cctv-cameras', description: 'IP and analog security cameras' },
  });
  await prisma.category.upsert({
    where: { slug: 'dvr-nvr' },
    update: {},
    create: { name: 'DVR/NVR', slug: 'dvr-nvr', description: 'Digital and Network Video Recorders' },
  });
  await prisma.category.upsert({
    where: { slug: 'hard-drives' },
    update: {},
    create: { name: 'Hard Drives', slug: 'hard-drives', description: 'Surveillance-grade hard drives' },
  });
  await prisma.category.upsert({
    where: { slug: 'network-equipment' },
    update: {},
    create: { name: 'Network Equipment', slug: 'network-equipment', description: 'Routers, switches, PoE injectors' },
  });
  await prisma.category.upsert({
    where: { slug: 'installation-accessories' },
    update: {},
    create: { name: 'Installation Accessories', slug: 'installation-accessories', description: 'Cables, connectors, brackets' },
  });

  // Brands
  const brandStarlink = await prisma.brand.upsert({
    where: { slug: 'starlink' },
    update: {},
    create: { name: 'Starlink', slug: 'starlink' },
  });
  await prisma.brand.upsert({
    where: { slug: 'hikvision' },
    update: {},
    create: { name: 'Hikvision', slug: 'hikvision' },
  });
  await prisma.brand.upsert({
    where: { slug: 'dahua' },
    update: {},
    create: { name: 'Dahua', slug: 'dahua' },
  });
  await prisma.brand.upsert({
    where: { slug: 'tp-link' },
    update: {},
    create: { name: 'TP-Link', slug: 'tp-link' },
  });
  await prisma.brand.upsert({
    where: { slug: 'ubiquiti' },
    update: {},
    create: { name: 'Ubiquiti', slug: 'ubiquiti' },
  });
  await prisma.brand.upsert({
    where: { slug: 'seagate' },
    update: {},
    create: { name: 'Seagate', slug: 'seagate' },
  });

  // Products
  const product1 = await prisma.product.upsert({
    where: { slug: 'starlink-standard-kit' },
    update: {},
    create: {
      name: 'Starlink Standard Kit',
      slug: 'starlink-standard-kit',
      description: 'Complete Starlink kit with Wi-Fi router, dish, and cables.',
      shortDescription: 'High-speed satellite internet for home.',
      sku: 'STAR-STD-001',
      price: 65000.00,
      compareAtPrice: 70000.00,
      costPrice: 55000.00,
      isActive: true,
      isFeatured: true,
      brandId: brandStarlink.id,
      categories: { create: [{ categoryId: catStarlinkKits.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: product1.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: product1.id, warehouseId: mainWarehouse.id, quantity: 25, lowStockThreshold: 5 },
  });

  const product2 = await prisma.product.upsert({
    where: { slug: 'starlink-ethernet-adapter' },
    update: {},
    create: {
      name: 'Starlink Ethernet Adapter',
      slug: 'starlink-ethernet-adapter',
      description: 'Add a wired Ethernet port to your Starlink router.',
      shortDescription: 'Ethernet adapter for Starlink.',
      sku: 'STAR-ETH-002',
      price: 3500.00,
      costPrice: 2500.00,
      isActive: true,
      brandId: brandStarlink.id,
      categories: { create: [{ categoryId: (await prisma.category.findUnique({ where: { slug: 'starlink-accessories' } }))!.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: product2.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: product2.id, warehouseId: mainWarehouse.id, quantity: 100, lowStockThreshold: 10 },
  });

  console.log('Seed data inserted successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });