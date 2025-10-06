// Seed script for contact section translations
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Starting to seed contact section translations...');
  
  // Contact section translations
  const contactTranslations = [
    // Form fields and headings
    {
      key: 'need_more_info',
      section: 'contact',
      en: 'Need more information ?',
      th: 'ต้องการข้อมูลเพิ่มเติมหรือไม่?',
      cn: '需要更多资料吗？',
      ru: 'Нужна дополнительная информация?'
    },
    {
      key: 'contact_assistance',
      section: 'contact',
      en: 'Please don\'t hesitate to contact us for assistance.',
      th: 'กรุณาติดต่อเราเพื่อข้อข้อมูลเพิ่มเติม',
      cn: '请与我们联系以获取更多信息',
      ru: 'Свяжитесь с нами для получения дополнительной информации'
    },
    {
      key: 'your_name',
      section: 'contact',
      en: 'Your Name *',
      th: 'ชื่อ *',
      cn: '姓名 *',
      ru: 'Имя *'
    },
    {
      key: 'email_address',
      section: 'contact',
      en: 'Email Address *',
      th: 'อีเมล *',
      cn: '邮箱 *',
      ru: 'Электронная почта *'
    },
    {
      key: 'subject',
      section: 'contact',
      en: 'Subject *',
      th: 'หัวข้อ *',
      cn: '主题 *',
      ru: 'Тема *'
    },
    {
      key: 'your_message',
      section: 'contact',
      en: 'Your Message *',
      th: 'ข้อความของคุณ *',
      cn: '您的留言 *',
      ru: 'Ваше сообщение *'
    },
    {
      key: 'send_message',
      section: 'contact',
      en: 'Send Message',
      th: 'ส่งข้อความ',
      cn: '发送留言',
      ru: 'отправлять'
    },
    
    // Contact information
    {
      key: 'contact_consultant',
      section: 'contact',
      en: 'Contact our Property Consultant',
      th: 'ติดต่อที่ปรึกษาด้านอสังหาริมทรัพย์ของเรา',
      cn: '联系我们的房地产顾问',
      ru: 'Свяжитесь с нашим консультантом по недвижимости'
    },
    {
      key: 'contact_description',
      section: 'contact',
      en: 'Please do not hesitate to contact us if you have any questions about the condo & properties buying, selling or leasing process and for would like to schedule an appointment to view properties in Pattaya.',
      th: 'โปรดอย่าลังเลที่จะติดต่อเราหากคุณมีคำถามเกี่ยวกับการซื้อ ขาย หรือเช่าคอนโดและอสังหาริมทรัพย์ และต้องการนัดหมายเพื่อชมอสังหาริมทรัพย์ในพัทยา',
      cn: '如果您对公寓和房产的购买、销售或租赁过程有任何疑问，或者想预约在芭堤雅看房，请随时与我们联系。',
      ru: 'Пожалуйста, не стесняйтесь обращаться к нам, если у вас есть вопросы о покупке, продаже или аренде кондоминиумов и недвижимости, а также если вы хотите назначить встречу для просмотра недвижимости в Паттайе.'
    },
    {
      key: 'call_us_now',
      section: 'contact',
      en: 'Call Us Now\n+66(0)95 1432 2345',
      th: 'โทรหาเราเลย\n+66(0)95 1432 2345',
      cn: '立即致电\n+66(0)95 1432 2345',
      ru: 'Позвоните нам сейчас\n+66(0)95 1432 2345'
    },
    {
      key: 'drop_mail',
      section: 'contact',
      en: 'Drop a Mail\ninfo@d-luckproperty.com',
      th: 'ส่งอีเมล\ninfo@d-luckproperty.com',
      cn: '发送邮件\ninfo@d-luckproperty.com',
      ru: 'Отправить письмо\ninfo@d-luckproperty.com'
    },
    {
      key: 'add_friend',
      section: 'contact',
      en: 'Add Friend\nLine ID : @dluck or Click',
      th: 'เพิ่มเพื่อน\nLine ID : @dluck หรือ คลิก',
      cn: '添加好友\nLine ID : @dluck 或点击',
      ru: 'Добавить в друзья\nLine ID : @dluck или нажмите'
    }
  ];

  console.log(`Preparing to seed ${contactTranslations.length} contact section translations...`);

  // Create UI strings for contact section
  for (const translation of contactTranslations) {
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

  console.log('Contact section translations seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
