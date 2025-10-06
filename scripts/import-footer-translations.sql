INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'popular-search', 'Popular Search', 'การค้นหายอดนิยม', '热门搜索', 'Популярные поиски', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'condo-for-sale', 'Condominium for Sale', 'คอนโดมิเนียมขาย', '公寓出售', 'Кондоминиум на продажу', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'condo-for-rent', 'Condominium for Rent', 'คอนโดมิเนียมให้เช่า', '公寓出租', 'Кондоминиум в аренду', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'pool-villa-for-sale', 'Pool Villa for Sale', 'พูลวิลล่าขาย', '泳池别墅出售', 'Вилла с бассейном на продажу', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'pool-villa-for-rent', 'Pool Villa for Rent', 'พูลวิลล่าให้เช่า', '泳池别墅出租', 'Вилла с бассейном в аренду', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'house-for-sale', 'House for Sale', 'บ้านขาย', '房屋出售', 'Дом на продажу', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'quick-links', 'Quick Links', 'ลิงก์ด่วน', '快速链接', 'Быстрые ссылки', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'property-for-sale', 'Property for Sale', 'อสังหาริมทรัพย์ขาย', '房产出售', 'Недвижимость на продажу', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'about-us', 'About Us', 'เกี่ยวกับเรา', '关于我们', 'О нас', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'contact-us', 'Contact Us', 'ติดต่อเรา', '联系我们', 'Связаться с нами', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'discover-by-area', 'Discover by Area', 'ค้นพบตามพื้นที่', '按区域发现', 'Поиск по районам', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'jomtien', 'Jomtien', 'จอมเทียน', '芭提雅海滩', 'Джомтьен', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'wongamat', 'Wongamat', 'วงศ์อมาตย์', '黄金海岸', 'Вонгамат', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'naklua', 'Naklua', 'นาเกลือ', '纳克卢阿', 'Наклуа', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'pratumnak', 'Pratumnak', 'ประตูน้ำ', '芭提雅山', 'Пратумнак', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'banglamung', 'Bang Lamung', 'บางละมุง', '邦拉蒙', 'Банг Ламунг', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'call-us-now', 'Call Us Now', 'โทรหาเราเดี๋ยวนี้', '立即致电', 'Звоните сейчас', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'drop-email', 'Drop a mail', 'ส่งอีเมล', '发送邮件', 'Отправить письмо', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'get-promo-with-newsletter', 'Get Promo with Newsletter', 'รับโปรโมชั่นจากจดหมายข่าว', '通过时事通讯获取促销', 'Получить промо через рассылку', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'subscribe', 'Subscribe', 'สมัครสมาชิก', '订阅', 'Подписаться', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'privacy', 'Privacy Policy', 'นโยบายความเป็นส่วนตัว', '隐私政策', 'Политика конфиденциальности', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'terms', 'Terms and Conditions', 'ข้อกำหนดและเงื่อนไข', '条款和条件', 'Условия использования', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();

INSERT INTO ui_string (section, slug, en, th, zhCN, ru, created_at, updated_at) 
VALUES ('footer', 'sitemap', 'Sitemap', 'แผนผังเว็บไซต์', '网站地图', 'Карта сайта', NOW(), NOW())
ON DUPLICATE KEY UPDATE 
  en = VALUES(en),
  th = VALUES(th), 
  zhCN = VALUES(zhCN),
  ru = VALUES(ru),
  updated_at = NOW();
