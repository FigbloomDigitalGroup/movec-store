import { PrismaClient, RoleName, AddressType } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHashAdmin = await bcrypt.hash('Admin123!', 12);
  const passwordHashCustomer = await bcrypt.hash('Customer123!', 12);

  // ─── Warehouses ────────────────────────────────────────────────
  const mainWarehouse = await prisma.warehouse.upsert({
    where: { id: 'main-warehouse' },
    update: {},
    create: { id: 'main-warehouse', name: 'Main Warehouse', location: 'Nairobi, Kenya' },
  });

  // ─── Roles ─────────────────────────────────────────────────────
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
  await prisma.role.upsert({
    where: { name: RoleName.TECHNICIAN },
    update: {},
    create: { name: RoleName.TECHNICIAN },
  });
  await prisma.role.upsert({
    where: { name: RoleName.STAFF },
    update: {},
    create: { name: RoleName.STAFF },
  });

  // ─── Permissions ───────────────────────────────────────────────
  const resources = [
    'user', 'product', 'category', 'brand', 'order',
    'inventory', 'payment', 'installation', 'ticket',
    'faq', 'review', 'coupon', 'report', 'settings', 'module',
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

  // Assign all permissions to ADMIN
  const allPermissions = await prisma.permission.findMany();
  for (const perm of allPermissions) {
    await prisma.rolePermission.upsert({
      where: { roleId_permissionId: { roleId: adminRole.id, permissionId: perm.id } },
      update: {},
      create: { roleId: adminRole.id, permissionId: perm.id },
    });
  }

  // ─── Users ─────────────────────────────────────────────────────
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      passwordHash: passwordHashAdmin,
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+254727572310',
      isEmailVerified: true,
      isActive: true,
      userRoles: { create: { roleId: adminRole.id } },
    },
  });

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
      userRoles: { create: { roleId: customerRole.id } },
    },
  });

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

  await prisma.address.upsert({
    where: { id: 'admin-default-address' },
    update: {},
    create: {
      id: 'admin-default-address',
      userId: adminUser.id,
      type: AddressType.SHIPPING,
      line1: '456 Harambee Avenue',
      city: 'Nairobi',
      postalCode: '00100',
      country: 'Kenya',
      isDefault: true,
    },
  });

  // ─── Store Modules ─────────────────────────────────────────────
  const moduleStarlink = await prisma.storeModule.upsert({
    where: { slug: 'starlink' },
    update: {},
    create: {
      id: 'module-starlink',
      name: 'Starlink',
      slug: 'starlink',
      description: 'High-speed satellite internet solutions powered by SpaceX Starlink.',
      sortOrder: 1,
    },
  });

  const moduleCCTV = await prisma.storeModule.upsert({
    where: { slug: 'cctv' },
    update: {},
    create: {
      id: 'module-cctv',
      name: 'CCTV & Security',
      slug: 'cctv',
      description: 'Professional CCTV cameras, DVRs, NVRs and surveillance accessories.',
      sortOrder: 2,
    },
  });

  // ─── Categories ────────────────────────────────────────────────
  // Starlink categories
  const catStarlinkKits = await prisma.category.upsert({
    where: { slug: 'starlink-kits' },
    update: { moduleId: moduleStarlink.id },
    create: {
      name: 'Starlink Kits',
      slug: 'starlink-kits',
      description: 'Complete Starlink satellite internet kits',
      moduleId: moduleStarlink.id,
    },
  });
  const catStarlinkAccessories = await prisma.category.upsert({
    where: { slug: 'starlink-accessories' },
    update: { moduleId: moduleStarlink.id },
    create: {
      name: 'Starlink Accessories',
      slug: 'starlink-accessories',
      description: 'Mounts, cables, and accessories for Starlink',
      moduleId: moduleStarlink.id,
    },
  });
  const catStarlinkMounts = await prisma.category.upsert({
    where: { slug: 'starlink-mounts' },
    update: { moduleId: moduleStarlink.id },
    create: {
      name: 'Starlink Mounts',
      slug: 'starlink-mounts',
      description: 'Pole, wall and roof mounts for Starlink dishes',
      moduleId: moduleStarlink.id,
    },
  });

  // CCTV categories
  const catIPCameras = await prisma.category.upsert({
    where: { slug: 'ip-cameras' },
    update: { moduleId: moduleCCTV.id },
    create: {
      name: 'IP Cameras',
      slug: 'ip-cameras',
      description: 'Wired and wireless network IP cameras',
      moduleId: moduleCCTV.id,
    },
  });
  const catDvrNvr = await prisma.category.upsert({
    where: { slug: 'dvr-nvr' },
    update: { moduleId: moduleCCTV.id },
    create: {
      name: 'DVR / NVR',
      slug: 'dvr-nvr',
      description: 'Digital and Network Video Recorders',
      moduleId: moduleCCTV.id,
    },
  });
  const catHardDrives = await prisma.category.upsert({
    where: { slug: 'surveillance-hard-drives' },
    update: { moduleId: moduleCCTV.id },
    create: {
      name: 'Hard Drives',
      slug: 'surveillance-hard-drives',
      description: 'Surveillance-grade hard drives for 24/7 recording',
      moduleId: moduleCCTV.id,
    },
  });

  // ─── Brands ────────────────────────────────────────────────────
  const brandStarlink = await prisma.brand.upsert({
    where: { slug: 'starlink' },
    update: {},
    create: { name: 'Starlink', slug: 'starlink' },
  });
  const brandHikvision = await prisma.brand.upsert({
    where: { slug: 'hikvision' },
    update: {},
    create: { name: 'Hikvision', slug: 'hikvision' },
  });
  const brandDahua = await prisma.brand.upsert({
    where: { slug: 'dahua' },
    update: {},
    create: { name: 'Dahua', slug: 'dahua' },
  });
  const brandSeagate = await prisma.brand.upsert({
    where: { slug: 'seagate' },
    update: {},
    create: { name: 'Seagate', slug: 'seagate' },
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

  // ─── Products — Starlink ────────────────────────────────────────
  const prod1 = await prisma.product.upsert({
    where: { slug: 'starlink-standard-kit' },
    update: {},
    create: {
      name: 'Starlink Standard Kit',
      slug: 'starlink-standard-kit',
      description: 'Complete Starlink kit with Gen 3 Wi-Fi router, dish, and cables. Get speeds of 25–220 Mbps wherever you are.',
      shortDescription: 'High-speed satellite internet for home.',
      sku: 'STAR-STD-001',
      price: 65000.00,
      compareAtPrice: 70000.00,
      costPrice: 55000.00,
      isActive: true,
      isFeatured: true,
      brandId: brandStarlink.id,
      moduleId: moduleStarlink.id,
      categories: { create: [{ categoryId: catStarlinkKits.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: prod1.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: prod1.id, warehouseId: mainWarehouse.id, quantity: 25, lowStockThreshold: 5 },
  });

  const prod2 = await prisma.product.upsert({
    where: { slug: 'starlink-roam-kit' },
    update: {},
    create: {
      name: 'Starlink Roam Kit',
      slug: 'starlink-roam-kit',
      description: 'The portable Starlink kit for mobile use — perfect for RVs, camping, and remote job sites.',
      shortDescription: 'Portable satellite internet on the go.',
      sku: 'STAR-ROAM-002',
      price: 75000.00,
      compareAtPrice: 82000.00,
      costPrice: 62000.00,
      isActive: true,
      isFeatured: true,
      brandId: brandStarlink.id,
      moduleId: moduleStarlink.id,
      categories: { create: [{ categoryId: catStarlinkKits.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: prod2.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: prod2.id, warehouseId: mainWarehouse.id, quantity: 15, lowStockThreshold: 3 },
  });

  const prod3 = await prisma.product.upsert({
    where: { slug: 'starlink-ethernet-adapter' },
    update: {},
    create: {
      name: 'Starlink Ethernet Adapter',
      slug: 'starlink-ethernet-adapter',
      description: 'Add a wired Ethernet port to your Starlink router for faster, more stable connections.',
      shortDescription: 'Ethernet adapter for Starlink.',
      sku: 'STAR-ETH-003',
      price: 3500.00,
      costPrice: 2500.00,
      isActive: true,
      brandId: brandStarlink.id,
      moduleId: moduleStarlink.id,
      categories: { create: [{ categoryId: catStarlinkAccessories.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: prod3.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: prod3.id, warehouseId: mainWarehouse.id, quantity: 100, lowStockThreshold: 10 },
  });

  const prod4 = await prisma.product.upsert({
    where: { slug: 'starlink-pipe-adapter' },
    update: {},
    create: {
      name: 'Starlink Pole Mount Adapter',
      slug: 'starlink-pipe-adapter',
      description: 'Heavy-duty pipe adapter for mounting the Starlink dish on poles from 1.5" to 2.5" diameter.',
      shortDescription: 'Pole mount adapter for Starlink dish.',
      sku: 'STAR-MNT-004',
      price: 4500.00,
      costPrice: 3000.00,
      isActive: true,
      brandId: brandStarlink.id,
      moduleId: moduleStarlink.id,
      categories: { create: [{ categoryId: catStarlinkMounts.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: prod4.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: prod4.id, warehouseId: mainWarehouse.id, quantity: 60, lowStockThreshold: 10 },
  });

  // ─── Products — CCTV ───────────────────────────────────────────
  const prod5 = await prisma.product.upsert({
    where: { slug: 'hikvision-4mp-dome' },
    update: {},
    create: {
      name: 'Hikvision 4MP ColorVu Dome Camera',
      slug: 'hikvision-4mp-dome',
      description: '4MP ColorVu fixed dome network camera with full-color night vision up to 30m, H.265+ encoding, and IP67 weatherproofing.',
      shortDescription: 'Full-color night vision dome camera.',
      sku: 'HIK-DOM-001',
      price: 8500.00,
      compareAtPrice: 9500.00,
      costPrice: 6000.00,
      isActive: true,
      isFeatured: true,
      brandId: brandHikvision.id,
      moduleId: moduleCCTV.id,
      categories: { create: [{ categoryId: catIPCameras.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: prod5.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: prod5.id, warehouseId: mainWarehouse.id, quantity: 50, lowStockThreshold: 10 },
  });

  const prod6 = await prisma.product.upsert({
    where: { slug: 'hikvision-8ch-nvr' },
    update: {},
    create: {
      name: 'Hikvision 8-Channel NVR',
      slug: 'hikvision-8ch-nvr',
      description: '8-channel NVR supporting up to 8MP resolution cameras, with 2 SATA HDD bays, H.265+ compression, and remote mobile access via Hik-Connect.',
      shortDescription: '8-channel NVR for IP cameras.',
      sku: 'HIK-NVR-002',
      price: 18000.00,
      compareAtPrice: 20000.00,
      costPrice: 13000.00,
      isActive: true,
      isFeatured: true,
      brandId: brandHikvision.id,
      moduleId: moduleCCTV.id,
      categories: { create: [{ categoryId: catDvrNvr.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: prod6.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: prod6.id, warehouseId: mainWarehouse.id, quantity: 20, lowStockThreshold: 5 },
  });

  const prod7 = await prisma.product.upsert({
    where: { slug: 'dahua-4k-bullet-camera' },
    update: {},
    create: {
      name: 'Dahua 4K WDR Bullet Camera',
      slug: 'dahua-4k-bullet-camera',
      description: 'Ultra HD 4K (8MP) IR bullet camera with 120dB WDR, Smart IR up to 80m range, IP67 and IK10 rated.',
      shortDescription: '4K outdoor bullet camera.',
      sku: 'DAH-BUL-003',
      price: 12000.00,
      costPrice: 8500.00,
      isActive: true,
      brandId: brandDahua.id,
      moduleId: moduleCCTV.id,
      categories: { create: [{ categoryId: catIPCameras.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: prod7.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: prod7.id, warehouseId: mainWarehouse.id, quantity: 35, lowStockThreshold: 8 },
  });

  const prod8 = await prisma.product.upsert({
    where: { slug: 'seagate-skyhawk-2tb' },
    update: {},
    create: {
      name: 'Seagate SkyHawk 2TB Surveillance HDD',
      slug: 'seagate-skyhawk-2tb',
      description: 'Purpose-built surveillance-grade hard drive optimized for 24/7 CCTV recording with up to 16 HD camera streams simultaneously.',
      shortDescription: '2TB surveillance hard drive.',
      sku: 'SEA-HDD-001',
      price: 7500.00,
      compareAtPrice: 8200.00,
      costPrice: 5500.00,
      isActive: true,
      brandId: brandSeagate.id,
      moduleId: moduleCCTV.id,
      categories: { create: [{ categoryId: catHardDrives.id }] },
    },
  });
  await prisma.inventory.upsert({
    where: { productId_warehouseId: { productId: prod8.id, warehouseId: mainWarehouse.id } },
    update: {},
    create: { productId: prod8.id, warehouseId: mainWarehouse.id, quantity: 45, lowStockThreshold: 10 },
  });

  console.log('✅ Seed data inserted successfully.');
  console.log(`   Modules: Starlink, CCTV`);
  console.log(`   Categories: ${[catStarlinkKits, catStarlinkAccessories, catStarlinkMounts, catIPCameras, catDvrNvr, catHardDrives].map(c => c.name).join(', ')}`);
  console.log(`   Products: ${[prod1, prod2, prod3, prod4, prod5, prod6, prod7, prod8].map(p => p.name).join(', ')}`);
  // ─── Installation Services ───────────────────────────────────────
  await prisma.installationService.upsert({
    where: { id: 'service-starlink-standard' },
    update: {},
    create: {
      id: 'service-starlink-standard',
      name: 'Standard Starlink Installation',
      description: 'Standard roof or wall mount installation for Starlink kit.',
      basePrice: 5000,
      durationMinutes: 120,
      isActive: true,
    },
  });

  await prisma.installationService.upsert({
    where: { id: 'service-starlink-premium' },
    update: {},
    create: {
      id: 'service-starlink-premium',
      name: 'Premium Starlink Installation',
      description: 'Advanced installation including cable routing and pole mounting.',
      basePrice: 8500,
      durationMinutes: 180,
      isActive: true,
    },
  });

  await prisma.installationService.upsert({
    where: { id: 'service-cctv-standard' },
    update: {},
    create: {
      id: 'service-cctv-standard',
      name: 'Standard CCTV Installation (4 Cameras)',
      description: 'Installation of up to 4 CCTV cameras including wiring and DVR setup.',
      basePrice: 15000,
      durationMinutes: 360,
      isActive: true,
    },
  });

  // ─── Promo Banners ─────────────────────────────────────────────
  console.log('🎨 Seeding promo banners...');
  
  await prisma.promoBanner.upsert({
    where: { id: 'banner-starlink-gen3' },
    update: {},
    create: {
      id: 'banner-starlink-gen3',
      title: 'STARLINK GEN 3 KIT',
      subtitle: 'Ultra-fast satellite internet anywhere\nfor homes, businesses & remote locations.',
      badge: 'OFFICIAL STARLINK PARTNER',
      badgeColor: '#10b982',
      ctaText: 'SHOP STARLINK',
      ctaLink: '/solutions/starlink',
      bgColor: '#1a2332',
      textColor: '#ffffff',
      imageUrl: 'https://images.unsplash.com/photo-1614730321146-b6fa6a46bcb4?w=800&q=80',
      productId: prod1.id,
      isActive: true,
      sortOrder: 0,
    },
  });

  await prisma.promoBanner.upsert({
    where: { id: 'banner-cctv-ai' },
    update: {},
    create: {
      id: 'banner-cctv-ai',
      title: 'AI CCTV SURVEILLANCE',
      subtitle: 'Professional HD and 4K security camera systems\nwith remote monitoring, night vision & smart detection.',
      badge: 'AI POWERED SECURITY',
      badgeColor: '#fc6501',
      ctaText: 'SHOP CCTV',
      ctaLink: '/solutions/cctv',
      bgColor: '#1a1f28',
      textColor: '#ffffff',
      imageUrl: 'https://images.unsplash.com/photo-1557597774-9d273605dfa9?w=800&q=80',
      isActive: true,
      sortOrder: 1,
    },
  });

  await prisma.promoBanner.upsert({
    where: { id: 'banner-installation' },
    update: {},
    create: {
      id: 'banner-installation',
      title: 'PROFESSIONAL INSTALLATION',
      subtitle: 'Expert Starlink and CCTV installation with\nnationwide coverage, clean cabling & after-sales support.',
      badge: 'CERTIFIED INSTALLERS',
      badgeColor: '#10b982',
      ctaText: 'BOOK INSTALLATION',
      ctaLink: '/installation',
      bgColor: '#1a2230',
      textColor: '#ffffff',
      imageUrl: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=800&q=80',
      isActive: true,
      sortOrder: 2,
    },
  });

  console.log('✅ Promo banners seeded successfully!');

  // ─── FAQs ──────────────────────────────────────────────────────
  console.log('❓ Seeding FAQs...');

  const catFaqGeneral = await prisma.fAQCategory.upsert({
    where: { slug: 'general' },
    update: { name: 'General & Products' },
    create: { id: 'faq-cat-general', name: 'General & Products', slug: 'general' },
  });

  const catFaqStarlink = await prisma.fAQCategory.upsert({
    where: { slug: 'starlink' },
    update: { name: 'Starlink Internet' },
    create: { id: 'faq-cat-starlink', name: 'Starlink Internet', slug: 'starlink' },
  });

  const catFaqCCTV = await prisma.fAQCategory.upsert({
    where: { slug: 'cctv' },
    update: { name: 'CCTV & Security' },
    create: { id: 'faq-cat-cctv', name: 'CCTV & Security', slug: 'cctv' },
  });

  const catFaqSupport = await prisma.fAQCategory.upsert({
    where: { slug: 'support' },
    update: { name: 'Installation & Support' },
    create: { id: 'faq-cat-support', name: 'Installation & Support', slug: 'support' },
  });

  const faqsToSeed = [
    {
      id: 'faq-1',
      question: 'What products do you sell?',
      answer: 'We supply Starlink internet kits, accessories, mounting solutions, and intelligent CCTV systems including cameras, NVRs, storage devices, and installation accessories.',
      categoryId: catFaqGeneral.id,
      sortOrder: 1,
    },
    {
      id: 'faq-2',
      question: 'Do you sell genuine Starlink equipment?',
      answer: 'Yes. We provide genuine Starlink hardware and compatible accessories. Product availability may vary by location.',
      categoryId: catFaqStarlink.id,
      sortOrder: 2,
    },
    {
      id: 'faq-3',
      question: 'Does Starlink work in my area?',
      answer: 'Starlink coverage depends on your service address. Contact us with your location and we will help you confirm availability before purchase.',
      categoryId: catFaqStarlink.id,
      sortOrder: 3,
    },
    {
      id: 'faq-4',
      question: 'Is installation included with Starlink purchases?',
      answer: 'Installation can be arranged as an additional service. We can assist with setup, mounting, cable routing, and network configuration.',
      categoryId: catFaqStarlink.id,
      sortOrder: 4,
    },
    {
      id: 'faq-5',
      question: 'What is an intelligent CCTV system?',
      answer: 'An intelligent CCTV system uses features such as motion detection, person and vehicle recognition, intrusion alerts, remote viewing, and recording to improve security monitoring.',
      categoryId: catFaqCCTV.id,
      sortOrder: 5,
    },
    {
      id: 'faq-6',
      question: 'Can I view my CCTV cameras remotely?',
      answer: 'Yes. Most of our CCTV systems support secure remote viewing through a mobile app or computer, provided the system has an internet connection.',
      categoryId: catFaqCCTV.id,
      sortOrder: 6,
    },
    {
      id: 'faq-7',
      question: 'Do CCTV cameras record at night?',
      answer: 'Yes. Many models include infrared night vision, while selected models offer full-colour night vision for clearer low-light footage.',
      categoryId: catFaqCCTV.id,
      sortOrder: 7,
    },
    {
      id: 'faq-8',
      question: 'How long is CCTV footage stored?',
      answer: 'Storage time depends on the number of cameras, video quality, recording schedule, and hard-drive capacity. We can recommend the right storage size for your needs.',
      categoryId: catFaqCCTV.id,
      sortOrder: 8,
    },
    {
      id: 'faq-9',
      question: 'Do you provide CCTV installation?',
      answer: 'Yes. We offer professional installation, configuration, testing, and user guidance for homes, shops, offices, schools, and other premises.',
      categoryId: catFaqCCTV.id,
      sortOrder: 9,
    },
    {
      id: 'faq-10',
      question: 'What payment methods do you accept?',
      answer: 'We accept the payment options displayed at checkout. For large installations or business orders, please contact us for a quotation.',
      categoryId: catFaqGeneral.id,
      sortOrder: 10,
    },
    {
      id: 'faq-11',
      question: 'How long does delivery take?',
      answer: 'Delivery times depend on product availability and your location. Estimated delivery details are provided during checkout or upon confirmation of your order.',
      categoryId: catFaqGeneral.id,
      sortOrder: 11,
    },
    {
      id: 'faq-12',
      question: 'What is your return and warranty policy?',
      answer: 'Eligible products may be returned according to our return policy. Products are covered by applicable manufacturer warranties; please retain your receipt and original packaging.',
      categoryId: catFaqGeneral.id,
      sortOrder: 12,
    },
    {
      id: 'faq-13',
      question: 'Can I get a quotation for multiple items or a full installation?',
      answer: 'Yes. Send us your requirements, location, and preferred products, and we will prepare a tailored quotation.',
      categoryId: catFaqSupport.id,
      sortOrder: 13,
    },
    {
      id: 'faq-14',
      question: 'How can I get technical support?',
      answer: 'Contact our support team with your order number, product model, and a brief description of the issue. We will guide you through troubleshooting or arrange further assistance.',
      categoryId: catFaqSupport.id,
      sortOrder: 14,
    },
  ];

  for (const faq of faqsToSeed) {
    await prisma.fAQ.upsert({
      where: { id: faq.id },
      update: {
        question: faq.question,
        answer: faq.answer,
        categoryId: faq.categoryId,
        sortOrder: faq.sortOrder,
      },
      create: faq,
    });
  }

  console.log('✅ 14 FAQs seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });