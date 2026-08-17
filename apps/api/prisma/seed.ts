import { PrismaClient } from '@prisma/client';
import { faker } from '@faker-js/faker/locale/ar';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ──────────────────────────────────────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────────────────────────────────────
const unsplashImages = [
  'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=900&auto=format',
  'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=900&auto=format',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=900&auto=format',
  'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=900&auto=format',
  'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?w=900&auto=format',
  'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=900&auto=format',
  'https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6?w=900&auto=format',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=900&auto=format',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=900&auto=format',
  'https://images.unsplash.com/photo-1598228723793-52759bba239c?w=900&auto=format',
];

const CITIES = [
  { ar: 'القاهرة', en: 'Cairo', areas: ['التجمع الخامس', 'مدينة نصر', 'المعادي', 'الزمالك', 'مصر الجديدة', 'العاصمة الإدارية', 'القاهرة الجديدة'] },
  { ar: 'الجيزة', en: 'Giza', areas: ['الشيخ زايد', '6 أكتوبر', 'الهرم', 'الدقي', 'المهندسين'] },
  { ar: 'الإسكندرية', en: 'Alexandria', areas: ['سيدي بشر', 'المنتزه', 'الجانوكليس', 'كليوباترا'] },
  { ar: 'الغردقة', en: 'Hurghada', areas: ['سهل حشيش', 'الممشى السياحي', 'الجونة'] },
];

const PURPOSES = ['SALE', 'RENT'] as const;
const FURNISHING = ['UNFURNISHED', 'SEMI_FURNISHED', 'FULLY_FURNISHED'];
const FINISHING = ['CORE_AND_SHELL', 'SEMI_FINISHED', 'FULLY_FINISHED'];
const STATUSES = ['PUBLISHED', 'PUBLISHED', 'PUBLISHED', 'PENDING_REVIEW', 'DRAFT'] as const;
const LEAD_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'VIEWING', 'NEGOTIATION', 'CONVERTED', 'LOST'];
const SOURCES = ['PROPERTY_PAGE', 'SEARCH', 'AI_SEARCH', 'WHATSAPP', 'PHONE'];

function randImage() { return unsplashImages[Math.floor(Math.random() * unsplashImages.length)]; }
function randItem<T>(arr: T[]): T { return arr[Math.floor(Math.random() * arr.length)]; }

async function main() {
  console.log('🌱 Starting rich seed...');

  // ── 1. Users ────────────────────────────────────────────────────────────────
  const hashedAgent = await bcrypt.hash('password123', 10);
  const hashedAdmin = await bcrypt.hash('admin123', 10);

  const agent = await prisma.user.upsert({
    where: { email: 'agent@amlak.com' },
    update: {},
    create: { firstName: 'Ahmed', lastName: 'Hassan', email: 'agent@amlak.com', password: hashedAgent, role: 'AGENT', isVerifiedAgent: true, company: 'Amlak Real Estate', licenseNumber: 'RE-2026-001' },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@amlak.com' },
    update: {},
    create: { firstName: 'Super', lastName: 'Admin', email: 'admin@amlak.com', password: hashedAdmin, role: 'ADMIN' },
  });

  // Extra agents
  const agentEmails = ['sara@amlak.com', 'khaled@amlak.com', 'nour@amlak.com'];
  const agents: any[] = [agent];
  for (const email of agentEmails) {
    const a = await prisma.user.upsert({
      where: { email },
      update: {},
      create: {
        firstName: email.split('@')[0],
        lastName: 'Agent',
        email,
        password: hashedAgent,
        role: 'AGENT',
        isVerifiedAgent: true,
        company: 'Property Hub',
      },
    });
    agents.push(a);
  }

  console.log(`✅ Created ${agents.length} agents + 1 admin`);

  // ── 2. Property Types ───────────────────────────────────────────────────────
  const types = await Promise.all([
    prisma.propertyType.upsert({ where: { nameEn: 'Apartment' }, update: {}, create: { nameEn: 'Apartment', nameAr: 'شقة' } }),
    prisma.propertyType.upsert({ where: { nameEn: 'Villa' }, update: {}, create: { nameEn: 'Villa', nameAr: 'فيلا' } }),
    prisma.propertyType.upsert({ where: { nameEn: 'Office' }, update: {}, create: { nameEn: 'Office', nameAr: 'مكتب' } }),
    prisma.propertyType.upsert({ where: { nameEn: 'Chalet' }, update: {}, create: { nameEn: 'Chalet', nameAr: 'شاليه' } }),
    prisma.propertyType.upsert({ where: { nameEn: 'Twin House' }, update: {}, create: { nameEn: 'Twin House', nameAr: 'توين هاوس' } }),
    prisma.propertyType.upsert({ where: { nameEn: 'Duplex' }, update: {}, create: { nameEn: 'Duplex', nameAr: 'دوبلكس' } }),
  ]);

  // ── 3. Properties (100 records) ─────────────────────────────────────────────
  await prisma.property.deleteMany({});
  console.log('Seeding 100 properties...');

  const arabicTitles = [
    'شقة فاخرة بإطلالة رائعة', 'فيلا مودرن للبيع', 'شقة تشطيب سوبر لوكس', 'دوبلكس متميز بحديقة خاصة',
    'مكتب إداري في برج تجاري', 'توين هاوس كامل المرافق', 'شاليه بإطلالة بحرية', 'شقة ستوديو مفروشة',
    'بنتهاوس مع تراس خاص', 'فيلا مستقلة بحمام سباحة', 'شقة قريبة من الخدمات', 'أرض للبيع بموقع متميز',
    'محل تجاري في شارع رئيسي', 'مخزن صناعي للإيجار', 'شقة للمعيشة أو الاستثمار', 'وحدة فندقية مجهزة',
    'فيلا في كمبوند راقي', 'شقة بالقرب من المدارس', 'مكتب بالقرب من المطار', 'شقة أرضية بحديقة',
  ];

  for (let i = 0; i < 100; i++) {
    const city = randItem(CITIES);
    const area = randItem(city.areas);
    const purpose = randItem([...PURPOSES]);
    const type = randItem(types);
    const status = randItem([...STATUSES]);
    const owner = randItem(agents);
    const beds = faker.number.int({ min: 1, max: 6 });
    const baths = faker.number.int({ min: 1, max: 4 });
    const areaSize = faker.number.int({ min: 60, max: 500 });
    const basePrice = purpose === 'RENT' ? faker.number.int({ min: 5000, max: 80000 }) : faker.number.int({ min: 500000, max: 15000000 });
    const title = `${arabicTitles[i % arabicTitles.length]} - ${city.ar} (${i + 1})`;
    const slug = `property-${i + 1}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`;

    await prisma.property.create({
      data: {
        title,
        slug,
        description: `${title} في منطقة ${area} بمساحة ${areaSize} متر مربع. ${beds} غرف نوم و${baths} حمامات. موقع متميز قريب من الخدمات والمدارس والمراكز التجارية.`,
        purpose,
        propertyTypeId: type.id,
        ownerId: owner.id,
        price: basePrice,
        currency: 'EGP',
        area: areaSize,
        bedrooms: beds,
        bathrooms: baths,
        floor: faker.number.int({ min: 0, max: 25 }),
        buildingFloors: faker.number.int({ min: 3, max: 30 }),
        furnishingStatus: randItem(FURNISHING),
        finishingStatus: randItem(FINISHING),
        country: 'مصر',
        city: city.ar,
        areaLocation: area,
        address: `شارع ${faker.number.int({ min: 1, max: 200 })}, ${area}`,
        latitude: 30.0444 + (Math.random() - 0.5) * 2,
        longitude: 31.2357 + (Math.random() - 0.5) * 2,
        status: status as any,
        listingQuality: faker.number.int({ min: 40, max: 100 }),
        media: {
          create: [
            { url: randImage(), isCover: true, type: 'IMAGE', status: 'ACTIVE' },
            { url: randImage(), isCover: false, type: 'IMAGE', status: 'ACTIVE' },
          ]
        },
        paymentPlans: purpose === 'SALE' && Math.random() > 0.4 ? {
          create: [{
            name: 'خطة A - تقسيط 5 سنوات',
            paymentType: 'INSTALLMENTS',
            totalPrice: basePrice,
            downPayment: basePrice * 0.2,
            installment: Math.round((basePrice * 0.8) / 60),
            frequency: 'MONTHLY',
            durationMonths: 60,
          }]
        } : undefined,
      }
    });
  }
  console.log('✅ 100 properties seeded');

  // ── 4. Leads (50 records) ───────────────────────────────────────────────────
  const firstProperty = await prisma.property.findFirst({ where: { ownerId: agent.id, status: 'PUBLISHED' } });
  await prisma.lead.deleteMany({});

  const arabicNames = [
    'أحمد محمد', 'سارة علي', 'محمد خالد', 'نور حسن', 'كريم طارق',
    'ياسمين سامي', 'عمر فاروق', 'رنا مصطفى', 'بسمة حسام', 'وليد ناصر',
    'مي إبراهيم', 'أسامة رضا', 'دينا يوسف', 'تامر سعيد', 'هبة أحمد',
    'خالد عبد الله', 'ريم سليمان', 'مصطفى حمادة', 'آية محمود', 'إسلام عاطف',
    'شيرين علاء', 'علاء الدين', 'نادية حافظ', 'رامي الشبراوي', 'لميس صادق',
    'كارم عبد العزيز', 'نهال مجدي', 'أحمد الفيومي', 'منى السيد', 'يوسف الحسيني',
  ];

  for (let i = 0; i < 50; i++) {
    const leadStatus = randItem(LEAD_STATUSES);
    const targetAgent = randItem(agents);
    const phone = `+2010${faker.number.int({ min: 10000000, max: 99999999 })}`;

    const score = faker.number.int({ min: 15, max: 98 });
    let scoreCategory = 'COLD';
    if (score >= 81) scoreCategory = 'VERY_HOT';
    else if (score >= 61) scoreCategory = 'HOT';
    else if (score >= 31) scoreCategory = 'WARM';

    const intent = randItem(['BUY', 'RENT', 'INVEST', 'COMPARE']);
    const conversionProbability = Math.round((score / 100) * 100) / 100;

    await prisma.lead.create({
      data: {
        agentId: targetAgent.id,
        name: arabicNames[i % arabicNames.length],
        phone,
        email: Math.random() > 0.4 ? `lead${i}@example.com` : null,
        message: Math.random() > 0.5 ? 'أنا مهتم بالعقار وأريد معرفة المزيد من التفاصيل وأنظمة السداد' : null,
        source: randItem(SOURCES),
        status: leadStatus,
        score,
        scoreCategory,
        intent,
        intentConfidence: 0.88,
        conversionProbability,
        budgetMin: faker.number.int({ min: 500000, max: 2000000 }),
        budgetMax: faker.number.int({ min: 2000000, max: 10000000 }),
        propertyInterests: firstProperty ? { create: [{ propertyId: firstProperty.id }] } : undefined,
        inquiries: {
          create: [
            { inquiryType: randItem(['BOOK_VIEWING', 'PRICING', 'PAYMENT_PLAN', 'CALLBACK', 'WHATSAPP']), source: randItem(SOURCES), message: 'طلب تفاصيل العقار ونظام التقسيط' },
          ]
        },
        activities: {
          create: [
            { type: 'LEAD_CREATED', notes: `Lead created via ${randItem(SOURCES)}` },
            ...(leadStatus !== 'NEW' ? [{ type: 'CALL', notes: 'تم التواصل مع العميل وإرسال تفاصيل العقار', actorId: targetAgent.id }] : []),
            ...(leadStatus === 'VIEWING' || leadStatus === 'NEGOTIATION' || leadStatus === 'CONVERTED'
              ? [{ type: 'WHATSAPP', notes: 'تم إرسال صور وفيديو العقار على الواتساب', actorId: targetAgent.id }]
              : []),
          ]
        },
        notes: (leadStatus === 'QUALIFIED' || leadStatus === 'VIEWING' || leadStatus === 'NEGOTIATION') ? {
          create: [{ authorId: targetAgent.id, content: 'العميل جاد ومهتم بالشراء. يفضل التجمع الخامس أو القاهرة الجديدة. ميزانيته مرنة.' }]
        } : undefined,
      }
    });
  }
  console.log('✅ 50 leads seeded');

  console.log('\n🎉 Seeding complete!');
  console.log('Agent credentials: agent@amlak.com / password123');
  console.log('Admin credentials: admin@amlak.com / admin123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
