// Seed script for about section translations
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed about section translations...');
  
  // About section translations
  const aboutTranslations = [
    // Headline banner
    {
      key: 'about_us',
      section: 'about',
      en: 'About Us',
      th: 'เกี่ยวกับเรา',
      cn: '关于我们',
      ru: 'О нас'
    },
    {
      key: 'home_about_us',
      section: 'about',
      en: 'Home / About Us',
      th: 'หน้าแรก / เกี่ยวกับเรา',
      cn: '首页 / 关于我们',
      ru: 'домашняя страница / О нас'
    },
    
    // Content
    {
      key: 'about_d_luck_property',
      section: 'about',
      en: 'About D-LUCK PROPERTY',
      th: 'เกี่ยวกับ D-LUCK PROPERTY',
      cn: '关于 D-LUCK PROPERTY',
      ru: 'О компании D-LUCK PROPERTY'
    },
    {
      key: 'best_real_estate_agent',
      section: 'about',
      en: 'Best Real Estate Agent in Pattaya Thailand',
      th: 'นายหน้าอสังหาริมทรัพย์ที่ดีที่สุดในพัทยา ประเทศไทย',
      cn: '泰国芭堤雅最佳房地产经纪人',
      ru: 'Лучший агент по недвижимости в Паттайе, Таиланд'
    },
    {
      key: 'company_description',
      section: 'about',
      en: 'Pattaya Condo for Sales | Pattaya Real Estate Agent | D-LUCK PROPERTY\n\nPattaya Real Estate Specialists - Comprehensive Services for All Locations\nD-LUCK PROPERTY specializes in Pattaya condo sales, Pattaya condo rentals, and Pattaya real estate investment. We cover all popular locations with professional services.',
      th: 'ขายคอนโดพัทยา | ตัวแทนอสังหาริมทรัพย์พัทยา | D-LUCK PROPERTY\nผู้เชี่ยวชาญด้านอสังหาริมทรัพย์พัทยา - บริการครบวงจรทุกทำเล\nD-LUCK PROPERTY เชี่ยวชาญขายคอนโดพัทยา เช่าคอนโดพัทยา และลงทุนอสังหาริมทรัพย์พัทยา ครอบคลุมทุกทำเลยอดนิยม พร้อมบริการแบบมืออาชีพ',
      cn: '芭堤雅公寓出售 | 芭堤雅房地产经纪人 | D-LUCK PROPERTY\n\n芭堤雅房地产专家 - 全方位服务，覆盖所有地区\nD-LUCK PROPERTY 专注于芭堤雅公寓销售、租赁和房地产投资。我们提供覆盖所有热门地区的专业服务。',
      ru: 'Продажа кондоминиумов в Паттайе | Агент по недвижимости в Паттайе | D-LUCK PROPERTY\n\nСпециалисты по недвижимости в Паттайе — комплексные услуги для всех локаций\nD-LUCK PROPERTY специализируется на продаже кондоминиумов в Паттайе, аренде кондоминиумов в Паттайе и инвестициях в недвижимость в Паттайе. Мы предоставляем профессиональные услуги во всех популярных локациях.'
    },
    {
      key: 'service_areas',
      section: 'about',
      en: 'Service Areas\n\nCentral Pattaya Condos | Jomtien Condos | North Pattaya Condos | Khao Phra Tamnak Condos | Bang Saray Condos | Na Kluea Condos | Sattahip Condos | Ban Amphoe Condos',
      th: 'พื้นที่ให้บริการ\nคอนโดพัทยากลาง | คอนโดจอมเทียน | คอนโดพัทยาเหนือ | คอนโดเขาพระตำหนัก | คอนโดบางเสร่ | คอนโดนาเกลือ | คอนโดสัตหีบ | คอนโดบ้านอำเภอ',
      cn: '服务区域\n\n芭堤雅中心区公寓 | 中天区公寓 | 芭堤雅北部区公寓 | 考帕塔纳克区公寓 | 邦萨拉区公寓 | 纳克鲁亚区公寓 | 梭桃邑区公寓 | Ban Amphoe 公寓',
      ru: 'Области обслуживания\n\nКондоминиумы в центральной Паттайе | Кондоминиумы в Джомтьене | Кондоминиумы в Северной Паттайе | Кондоминиумы в Кхао Пра Тамнак | Кондоминиумы в Банг Сарай | Кондоминиумы в На Клуеа | Кондоминиумы в Саттахип | Ban Amphoe Condos'
    },
    {
      key: 'our_services_title',
      section: 'about',
      en: 'Our Services',
      th: 'บริการของเรา',
      cn: '我们的服务',
      ru: 'Наши услуги'
    },
    {
      key: 'buy_sell_rent',
      section: 'about',
      en: 'Buy-Sell-Rent Real Estate',
      th: 'ซื้อ-ขาย-เช่า อสังหาริมทรัพย์',
      cn: '买卖租赁房地产',
      ru: 'Купля-продажа-аренда недвижимости'
    },
    {
      key: 'condo_sales',
      section: 'about',
      en: 'Pattaya condo sales in all price ranges',
      th: 'ขายคอนโดพัทยา ทุกช่วงราคา',
      cn: '芭堤雅各价位公寓出售',
      ru: 'Продажа квартир в Паттайе во всех ценовых диапазонах'
    },
    {
      key: 'condo_rentals',
      section: 'about',
      en: 'Pattaya condo rentals - short and long term',
      th: 'เช่าคอนโดพัทยา ระยะสั้น-ยาว',
      cn: '芭堤雅公寓租赁 - 短期和长期',
      ru: 'Аренда квартир в Паттайе — краткосрочная и долгосрочная'
    },
    {
      key: 'rental_management',
      section: 'about',
      en: 'Condo rental management with guaranteed returns',
      th: 'บริหารคอนโดให้เช่า รับประกันผลตอบแทน',
      cn: '保障回报的公寓租赁管理',
      ru: 'Управление арендой квартир с гарантированной прибылью'
    },
    {
      key: 'investment_consultation',
      section: 'about',
      en: 'Investment consultation and market analysis',
      th: 'คำปรึกษาการลงทุนและวิเคราะห์ตลาด',
      cn: '投资咨询和市场分析',
      ru: 'Инвестиционные консультации и анализ рынка'
    },
    {
      key: 'our_strengths_title',
      section: 'about',
      en: 'Our Strengths',
      th: 'จุดเด่นของเรา',
      cn: '我们的优势',
      ru: 'Наши сильные стороны'
    },
    {
      key: 'experience',
      section: 'about',
      en: '10+ years of experience in the Pattaya market',
      th: 'ประสบการณ์ 10+ ปี ในตลาดพัทยา',
      cn: '芭堤雅市场10年以上经验',
      ru: '10+ лет опыта на рынке Паттайи'
    },
    {
      key: 'professional_team',
      section: 'about',
      en: 'Professional team with complete licensing',
      th: 'ทีมงานมืออาชีพ ใบอนุญาตครบถ้วน',
      cn: '拥有完整执照的专业团队',
      ru: 'Профессиональная команда с полным лицензированием'
    },
    {
      key: 'complete_database',
      section: 'about',
      en: 'Complete database of all projects in Pattaya',
      th: 'ฐานข้อมูลครบ ทุกโครงการในพัทยา',
      cn: '芭堤雅所有项目的完整数据库',
      ru: 'Полная база данных всех проектов в Паттайе'
    },
    {
      key: 'transparent_service',
      section: 'about',
      en: 'Transparent service with no hidden fees',
      th: 'บริการโปร่งใส ไม่มีค่าใช้จ้ายแอบแฝง',
      cn: '透明服务，无隐藏费用',
      ru: 'Прозрачное обслуживание без скрытых платежей'
    },
    {
      key: 'contact_us_today',
      section: 'about',
      en: 'Contact Us Today',
      th: 'ติดต่อเราวันนี้',
      cn: '立即联系我们',
      ru: 'Свяжитесь с нами сегодня'
    },
    {
      key: 'start_investing',
      section: 'about',
      en: 'Start investing in Pattaya condos with specialists you can trust',
      th: 'เริ่มลงทุนคอนโดพัทยากับผู้เชี่ยวชาญที่คุณไว้วางใจ',
      cn: '开始投资芭堤雅公寓，与我们值得信赖的专家合作',
      ru: 'Начните инвестировать в квартиры в Паттайе со специалистами, которым вы можете доверять'
    },
    {
      key: 'free_consultation',
      section: 'about',
      en: 'Free consultation for Pattaya condo sales, Pattaya condo rentals, Pattaya real estate investment in all locations in Pattaya, Jomtien, Khao Phra Tamnak, and nearby areas',
      th: 'คำปรึกษาฟรีขายคอนโดพัทยา เช่าคอนโดพัทยา ลงทุนอสังหาริมทรัพย์พัทยา ทุกทำเลในพัทยา จอมเทียน เขาพระตำหนัก และพื้นที่ใกล้เคียง',
      cn: '芭堤雅公寓出售、公寓租赁、房地产投资，芭堤雅、宗滴恩、考帕塔纳克及周边地区均提供免费咨询',
      ru: 'Бесплатная консультация по продаже квартир в Паттайе, аренде квартир в Паттайе, инвестициям в недвижимость в Паттайе во всех местах в Паттайе, Джомтьене, Као Пра Тамнаке и близлежащих районах'
    },
    
    // Meet our team section
    {
      key: 'meet_our_team',
      section: 'about',
      en: 'Meet Our Team',
      th: 'พบกับทีมงานของเรา',
      cn: '认识我们的团队',
      ru: 'Познакомьтесь с нашей командой'
    },
    {
      key: 'team_description',
      section: 'about',
      en: 'Our experienced consultants are ready to make your property dreams come true.',
      th: 'ที่ปรึกษาผู้เชี่ยวชาญของเรายินดีที่จะทำให้ความฝันด้านอสังหาริมทรัพย์ของคุณเป็นจริง',
      cn: '我们经验丰富的顾问随时准备助您实现置业梦想。',
      ru: 'Наши опытные консультанты готовы воплотить ваши мечты о недвижимости в реальность.'
    },
    {
      key: 'oat_supakorn',
      section: 'about',
      en: 'Oat - Supakorn',
      th: 'โอ๊ต - ศุภกร',
      cn: 'Oat - Supakorn',
      ru: 'Oat - Supakorn'
    },
    {
      key: 'ceo_founder',
      section: 'about',
      en: 'CEO & Founder',
      th: 'CEO & Founder',
      cn: '首席执行官兼创始人',
      ru: 'Генеральный директор и основатель'
    },
    {
      key: 'amy_thannaree',
      section: 'about',
      en: 'Amy - Thannaree',
      th: 'เอมี่ - ธัญญ์นรี',
      cn: 'Amy - Thannaree',
      ru: 'Amy - Thannaree'
    },
    {
      key: 'sale_director',
      section: 'about',
      en: 'Sale Director',
      th: 'Sale Director',
      cn: '销售总监',
      ru: 'Директор по продажам'
    },
    {
      key: 'ize_chanyapak',
      section: 'about',
      en: 'Ize - Chanyapak',
      th: 'ไอซ์ - ชัญญาภัค',
      cn: 'Ize - Chanyapak',
      ru: 'Ize - Chanyapak'
    },
    {
      key: 'sale_manager',
      section: 'about',
      en: 'Sale Manager',
      th: 'Sale Manager',
      cn: '销售经理',
      ru: 'Менеджер по продажам'
    }
  ];

  console.log(`Preparing to seed ${aboutTranslations.length} about section translations...`);

  // Create UI strings for about section
  for (const translation of aboutTranslations) {
    await prisma.uiString.create({
      data: {
        section: translation.section,
        slug: translation.key,
        en: translation.en,
        th: translation.th,
        zhCN: translation.cn,
        ru: translation.ru
      }
    });
  }

  console.log('About section translations seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
