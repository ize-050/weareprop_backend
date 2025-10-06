// Seed script for home section translations
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed home section translations...');
  
  // Home section translations
  const homeTranslations = [
    // Title
    {
      key: 'title',
      section: 'home',
      th: 'ยินดีต้อนรับสู่',
      en: 'WELCOME TO',
      cn: '欢迎来到',
      ru: 'ДОБРО ПОЖАЛОВАТЬ В'
    },
    // D-Luck Property
    {
      key: 'd_luck',
      section: 'home',
      th: 'ดี-ลัค พร็อพเพอร์ตี้',
      en: 'D-LUCK PROPERTY',
      cn: 'D-LUCK 房地产',
      ru: 'D-LUCK НЕДВИЖИМОСТЬ'
    },
    // Buy
    {
      key: 'buy',
      section: 'home',
      th: 'ซื้อ',
      en: 'Buy',
      cn: '购买',
      ru: 'Купить'
    },
    // Rent
    {
      key: 'rent',
      section: 'home',
      th: 'เช่า',
      en: 'Rent',
      cn: '租赁',
      ru: 'Аренда'
    },
    // Price
    {
      key: 'price',
      section: 'home',
      th: 'ราคา',
      en: 'Price',
      cn: '价格',
      ru: 'Цена'
    },
    // Select Area
    {
      key: 'select_area',
      section: 'home',
      th: 'เลือกพื้นที่',
      en: 'Select Area',
      cn: '选择区域',
      ru: 'Выбрать район'
    },
    // Advance Search
    {
      key: 'advance_search',
      section: 'home',
      th: 'ค้นหาขั้นสูง',
      en: 'Advance Search',
      cn: '高级搜索',
      ru: 'Расширенный поиск'
    },
    // Subtitle
    {
      key: 'subtitle',
      section: 'home',
      th: 'เว็บไซต์อสังหาริมทรัพย์ที่ดีที่สุดในประเทศไทย',
      en: 'The best property website in Thailand',
      cn: '泰国最好的房地产网站',
      ru: 'Лучший сайт недвижимости в Таиланде'
    },
    // Developer
    {
      key: 'developer',
      section: 'home',
      th: 'นักพัฒนาอสังหาริมทรัพย์',
      en: 'Property Developer',
      cn: '房地产开发商',
      ru: 'Застройщик'
    },
    
    // Featured section
    {
      key: 'featured.title',
      section: 'home',
      th: 'ค้นพบรายการที่โดดเด่นของเรา',
      en: 'Discover Our Featured Listings',
      cn: '探索我们的精选房源',
      ru: 'Откройте для себя наши избранные объявления'
    },
    {
      key: 'featured.subtitle',
      section: 'home',
      th: 'อสังหาริมทรัพย์คุณภาพที่คัดสรรมาเป็นพิเศษ',
      en: 'Aliquam lacinia diam quis lacus euismod',
      cn: '精心挑选的优质房产',
      ru: 'Тщательно отобранная качественная недвижимость'
    },
    {
      key: 'featured.seeAll',
      section: 'home',
      th: 'ดูอสังหาริมทรัพย์ทั้งหมด',
      en: 'See All Properties',
      cn: '查看所有房产',
      ru: 'Посмотреть все объекты'
    },
    
    // Property Types section
    {
      key: 'propertyTypes.title',
      section: 'home',
      th: 'ประเภทอสังหาริมทรัพย์',
      en: 'Property Types',
      cn: '房产类型',
      ru: 'Типы недвижимости'
    },
    {
      key: 'propertyTypes.subtitle',
      section: 'home',
      th: 'ค้นพบอสังหาริมทรัพย์ในพัทยาสำหรับขายและเช่า - คอนโด, พูลวิลล่า, บ้าน และอสังหาริมทรัพย์เชิงพาณิชย์',
      en: 'Discover Pattaya Properties for Sale and Rent - Condos, Pool Villa, House & Commercial Real Estate',
      cn: '探索芭堂雅待售和出租房产 - 公寓、泳池别墅、房屋和商业地产',
      ru: 'Откройте для себя недвижимость в Паттайе для продажи и аренды - кондоминиумы, виллы с бассейном, дома и коммерческая недвижимость'
    },
    {
      key: 'propertyTypes.noPropertyTypesFound',
      section: 'home',
      th: 'ไม่พบประเภทอสังหาริมทรัพย์',
      en: 'No property types found',
      cn: '未找到房产类型',
      ru: 'Типы недвижимости не найдены'
    },
    
    // Explore Locations section
    {
      key: 'ExploreLocations.title',
      section: 'home',
      th: 'สำรวจทำเลที่ตั้ง',
      en: 'Explore Locations',
      cn: '探索位置',
      ru: 'Исследуйте местоположения'
    },
    {
      key: 'ExploreLocations.subtitle',
      section: 'home',
      th: 'การซื้อและเช่าคอนโด บ้าน และพูลวิลล่าในพัทยาและพื้นที่โดยรอบ: จอมเทียน, เขาพระตำหนัก, บางเสร่, พัทยาตะวันออก, บ้านอำเภอ, นาเกลือ และสัตหีบ',
      en: 'Buying and renting condos, houses, and pool villas in Pattaya and surrounding areas: Jomtien, Pratumnak Hill, Bang Saray, East Pattaya, Baan Amphur, Naklua, and Sattahip.',
      cn: '在芭堤雅及周边地区购买和租赁公寓、房屋和泳池别墅：宗滴恩、普拉图姆纳克山、邦萨莱、东芭堤雅、班安普、纳克鲁阿和沙堤普。',
      ru: 'Покупка и аренда кондоминиумов, домов и вилл с бассейном в Паттайе и прилегающих районах: Джомтьен, холм Пратумнак, Банг Сарай, Восточная Паттайя, Бан Ампур, Наклуа и Саттахип.'
    },
    {
      key: 'ExploreLocations.more',
      section: 'home',
      th: 'เพิ่มเติม',
      en: 'More',
      cn: '更多',
      ru: 'Подробнее'
    },
    {
      key: 'ExploreLocations.properties',
      section: 'home',
      th: 'อสังหาริมทรัพย์',
      en: 'Properties',
      cn: '房产',
      ru: 'Объекты'
    },
    {
      key: 'ExploreLocations.errorFetching',
      section: 'home',
      th: 'เกิดข้อผิดพลาดในการโหลดตำแหน่งที่ตั้ง โปรดลองอีกครั้งในภายหลัง',
      en: 'Error loading locations. Please try again later.',
      cn: '加载位置时出错。请稍后再试。',
      ru: 'Ошибка при загрузке местоположений. Пожалуйста, повторите попытку позже.'
    },
    
    // Service section
    {
      key: 'service.title',
      section: 'home',
      th: 'ร่วมกัน เราจะค้นหาเส้นทางการขายที่สมบูรณ์แบบสำหรับคุณ',
      en: 'Together, We\'ll Find Your Perfect Selling Path',
      cn: '携手共进，我们将为您找到完美的销售路径',
      ru: 'Вместе мы найдем ваш идеальный путь продажи'
    },
    {
      key: 'service.subtitle',
      section: 'home',
      th: 'พร้อมที่จะซื้อหรือขายอสังหาริมทรัพย์ในพัทยา? เราพร้อมช่วยเหลือคุณ',
      en: 'Ready to Buy or Sell Property in Pattaya? We\'re Here to Help',
      cn: '准备在芭堤雅买卖房产？我们随时为您提供帮助',
      ru: 'Готовы купить или продать недвижимость в Паттайе? Мы здесь, чтобы помочь'
    },
    {
      key: 'service.property_management',
      section: 'home',
      th: 'การจัดการอสังหาริมทรัพย์',
      en: 'Property Management',
      cn: '物业管理',
      ru: 'Управление недвижимостью'
    },
    {
      key: 'service.property_onine',
      section: 'home',
      th: 'การจัดการการตลาดอสังหาริมทรัพย์ออนไลน์แบบมืออาชีพ',
      en: 'Professional Online Property Marketing Management',
      cn: '专业在线房地产营销管理',
      ru: 'Профессиональное управление онлайн-маркетингом недвижимости'
    },
    {
      key: 'service.mortgate_service',
      section: 'home',
      th: 'บริการสินเชื่อ',
      en: 'Mortgage Services',
      cn: '抵押贷款服务',
      ru: 'Ипотечные услуги'
    },
    {
      key: 'service.mortgate_service_description',
      section: 'home',
      th: 'ความช่วยเหลือด้านการเงินจากธนาคารในประเทศไทยสำหรับผู้ซื้ออสังหาริมทรัพย์',
      en: 'Thailand Bank Financing Assistance for Property Buyers',
      cn: '为房产买家提供泰国银行融资协助',
      ru: 'Помощь в финансировании от тайских банков для покупателей недвижимости'
    },
    {
      key: 'service.legal_service',
      section: 'home',
      th: 'บริการทางกฎหมาย - วีซ่า',
      en: 'Legal Services - Visa',
      cn: '法律服务 - 签证',
      ru: 'Юридические услуги - Виза'
    },
    {
      key: 'service.legal_service_description',
      section: 'home',
      th: 'การสนับสนุนด้านเอกสารทางกฎหมายสำหรับบริการโอนอสังหาริมทรัพย์',
      en: 'Legal Documentation Support for Property Transfer Services',
      cn: '房产过户服务的法律文件支持',
      ru: 'Поддержка юридической документации для услуг по передаче недвижимости'
    },
    
    // Meet Our Team section
    {
      key: 'meetOurTeam.title',
      section: 'home',
      th: 'พบกับทีมงานของเรา',
      en: 'Meet Our Team',
      cn: '认识我们的团队',
      ru: 'Познакомьтесь с нашей командой'
    },
    {
      key: 'meetOurTeam.subtitle',
      section: 'home',
      th: 'ที่ปรึกษาที่มีประสบการณ์ของเราพร้อมที่จะทำให้ความฝันด้านอสังหาริมทรัพย์ของคุณเป็นจริง',
      en: 'Our experienced consultants are ready to make your property dreams come true.',
      cn: '我们经验丰富的顾问已准备好实现您的房产梦想。',
      ru: 'Наши опытные консультанты готовы воплотить в жизнь ваши мечты о недвижимости.'
    },
    {
      key: 'meetOurTeam.out_team',
      section: 'home',
      th: 'ทีมงานของเรา',
      en: 'Our Team',
      cn: '我们的团队',
      ru: 'Наша команда'
    }
  ];

  // Insert all translations
  console.log(`Inserting ${homeTranslations.length} home section translations...`);
  
  for (const translation of homeTranslations) {
    await prisma.uiString.create({
      data: {
        slug: translation.key,
        section: translation.section,
        th: translation.th,
        en: translation.en,
        zhCN: translation.cn,
        ru: translation.ru
      }
    });
  }

  console.log('Home section translations seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
