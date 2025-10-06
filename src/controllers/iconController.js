const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Get all icons
exports.getAllIcons = async (req, res) => {
  try {
    const icons = await prisma.icon.findMany({
      where: {
        active: true
      },
      orderBy: {
        prefix: 'asc'
      }
    });
    const Dataicon = [];
    for(let icon of icons) {
      const url = `${process.env.NEXT_PUBLIC_IMAGE_URL}/icons/${icon.iconPath}`;
      // Create new object with snake_case properties
      const iconData = {
        id: icon.id,
        prefix: icon.prefix,
        name: icon.name,
        name_th: icon.nameTh,
        name_ch: icon.nameCh,
        name_ru: icon.nameRu,
        key: icon.key,
        iconPath: url,
        sub_name: icon.sub_name
      };
      Dataicon.push(iconData);
    }
    // Group icons by prefix

    res.status(200).json({
      success: true,
      data: Dataicon
    });
  } catch (error) {
    console.error('Error fetching icons:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get icons by prefix
exports.getIconsByPrefix = async (req, res) => {
  try {
    const { prefix } = req.params;
    
    const icons = await prisma.icon.findMany({
      where: {
        prefix: prefix,
        active: true
      },
      orderBy: {
        name: 'asc'
      }
    });

    // เริ่มต้นเป็น object ว่างเพื่อจัดกลุ่มตาม sub_name
    let groupedIcons = {};
    
    // วนลูปผ่านแต่ละไอคอนที่ได้
    for (let i = 0; i < icons.length; i++) {
      // ใช้ sub_name เป็น key หรือ 'other' ถ้าไม่มี sub_name
      const subName = icons[i].sub_name || 'other';
      
      // สร้าง array ถ้ายังไม่มี key นี้
      if (!groupedIcons[subName]) {
        groupedIcons[subName] = [];
      }
      
      // เพิ่มไอคอนเข้าไปในกลุ่ม
      groupedIcons[subName].push({
        id: icons[i].id,
        prefix: icons[i].prefix,
        name: icons[i].name,
        name_th: icons[i].nameTh,
        name_ch: icons[i].nameCh,
        name_ru: icons[i].nameRu,
        key: icons[i].key,
        iconPath: `${process.env.NEXT_PUBLIC_IMAGE_URL}${icons[i].iconPath}`,
        sub_name: icons[i].sub_name
      });
    }

    res.status(200).json({
      success: true,
      data: groupedIcons
    });
  } catch (error) {
    console.error(`Error fetching ${req.params.prefix} icons:`, error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};

// Get icon by id
exports.getIconById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const icon = await prisma.icon.findUnique({
      where: {
        id: parseInt(id)
      }
    });

    if (!icon) {
      return res.status(404).json({
        success: false,
        message: 'Icon not found'
      });
    }

    // Create new object with snake_case properties
    const iconData = {
      id: icon.id,
      prefix: icon.prefix,
      name: icon.name,
      name_th: icon.nameTh,
      name_ch: icon.nameCh,
      name_ru: icon.nameRu,
      key: icon.key,
      iconPath: icon.iconPath,
      sub_name: icon.sub_name
    };

    res.status(200).json({
      success: true,
      data: iconData
    });
  } catch (error) {
    console.error('Error fetching icon:', error);
    res.status(500).json({
      success: false,
      message: 'Server Error',
      error: error.message
    });
  }
};
