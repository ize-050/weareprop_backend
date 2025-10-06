const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Starting to seed icons...');

    // Initial facility icons (for property amenities)
    // const facilityIcons = [
    //   {
    //     prefix: 'facility',
    //     key: 'green-area',
    //     name:'Green Area',
    //     iconPath: '/icons/Facilities/GreenArea.svg',
    //     sub_name :'common-area'
    //   },
    //   {
    //     prefix: 'facility',
    //     key:'library',
    //     name: 'Library',
    //     iconPath: '/icons/Facilities/Library.svg',
    //     sub_name: 'common-area'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'lobby',
    //     name: 'Lobby',
    //     iconPath: '/icons/Facilities/Lobby.svg',
    //     sub_name: 'common-area'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'meeting-room',
    //     name: 'Meeting Room',
    //     iconPath: '/icons/Facilities/MeetingRoom.svg',
    //     sub_name: 'common-area'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'sky-garden',
    //     name: 'Sky Garden',
    //     iconPath: '/icons/Facilities/SkyGarden.svg',
    //     sub_name: 'common-area'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'working-space',
    //     name: 'Working Space',
    //     iconPath: '/icons/Facilities/WorkingSpace.svg',
    //     sub_name: 'common-area'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'bar',
    //     name: 'Bar',
    //     iconPath: '/icons/Facilities/Bar.svg',
    //     sub_name:'dining'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'game-room',
    //     name: 'Game Room',
    //     iconPath: '/icons/Facilities/GameRoom.svg',
    //     sub_name: 'dining'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'karaoke-room',
    //     name: 'Karaoke Room',
    //     iconPath: '/icons/Facilities/KaraokeRoom.svg',
    //     sub_name: 'dining'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'mini-theater',
    //     name: 'Mini Theater',
    //     iconPath: '/icons/Facilities/MiniTheater.svg',
    //     sub_name: 'dining'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'pool-table',
    //     name: 'Pool Table',
    //     iconPath: '/icons/Facilities/PoolTable.svg',
    //     sub_name: 'dining'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'restaurant',
    //     name: 'Restaurant',
    //     iconPath: '/icons/Facilities/Restaurant.svg',
    //     sub_name: 'restaurant'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'sky-bar',
    //     name: 'Sky Bar',
    //     iconPath: '/icons/Facilities/Skybar.svg',
    //     sub_name: 'restaurant'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'fitness-basketball',
    //     name: 'Fitness Basketball',
    //     iconPath: '/icons/Facilities/Fitness_basketball.svg',
    //     sub_name: 'fitness'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'fitness-gym',
    //     name: 'Fitness',
    //     iconPath: '/icons/Facilities/Fitness.svg',
    //     sub_name: 'fitness'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'golf-simulator',
    //     name: 'Golf Simulator',
    //     iconPath: '/icons/Facilities/Golfsimulator.svg',
    //     sub_name: 'fitness'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'jogging-track',
    //     name: 'Jogging Track',
    //     iconPath: '/icons/Facilities/JoggingTrack.svg',
    //     sub_name: 'fitness'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'squash-court',
    //     name: 'Squash Court',
    //     iconPath: '/icons/Facilities/Squashcourt.svg',
    //     sub_name: 'fitness'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'tennis-court',
    //     name: 'Tennis Court',
    //     iconPath: '/icons/Facilities/Tennis_court.svg',
    //     sub_name: 'fitness'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'yoga-room',
    //     name: 'Yoga Room',
    //     iconPath: '/icons/Facilities/Yogaroom.svg',
    //     sub_name: 'fitness'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'cctv',
    //     name: 'CCTV',
    //     iconPath: '/icons/Facilities/CCTV.svg',
    //     sub_name: 'other'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'concierge-services',
    //     name: 'Concierge Services',
    //     iconPath: '/icons/Facilities/ConciergeServices.svg',
    //     sub_name: 'other'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'Ev-charger',
    //     name: 'EV Charger',
    //     iconPath: '/icons/Facilities/Ev-charger.svg',
    //     sub_name : 'other'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'high-speed',
    //     name: 'High Speed Internet',
    //     iconPath: '/icons/Facilities/HighSpeed.svg',
    //     sub_name: 'other'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'kids-club',
    //     name: 'Kids Club',
    //     iconPath: '/icons/Facilities/KidsClub.svg',
    //     sub_name: 'other'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'security',
    //     name: '24 hr Security',
    //     iconPath: '/icons/Facilities/Security.svg',
    //     sub_name: 'other'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'kids-pool',
    //     name: 'Kids Pool',
    //     iconPath: '/icons/Facilities/KidsPool.svg',
    //     sub_name:'pool',
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'onsen',
    //     name: 'Onsen',
    //     iconPath: '/icons/Facilities/Onsen.svg',
    //     sub_name: 'pool'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'salon',
    //     name: 'Salon',
    //     iconPath: '/icons/Facilities/Salon.svg',
    //     sub_name: 'pool'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'sauna',
    //     name: 'Sauna',
    //     iconPath: '/icons/Facilities/sauna.svg',
    //     sub_name: 'pool'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'sky-pool',
    //     name: 'Sky Pool',
    //     iconPath: '/icons/Facilities/Skypool.svg',
    //     sub_name: 'pool'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'spa',
    //     name: 'Spa',
    //     iconPath: '/icons/Facilities/Spa.svg',
    //     sub_name: 'pool'
    //   },
    //   {
    //     prefix: 'facility',
    //     key: 'swimming-pool',
    //     name: 'Swimming Pool',
    //     iconPath: '/icons/Facilities/SwimmingPool.svg',
    //     sub_name: 'pool'
    //   }
    // ];

    const  highlights = [
        {
      prefix: 'highlight',
      key: 'brand-new',
      name: 'Brand-New Property',
      iconPath: '',
      sub_name: 'highlight'
       },
      {
        prefix: 'highlight',
        key: 'pets-allowed',
        name: 'Pets Allowed',
        iconPath: '',
        sub_name: 'highlight'
      },
      {
        prefix: 'highlight',
        key: 'company-registration',
        name: 'Company Registration',
        iconPath: '',
        sub_name: 'highlight'
      },
      {
        prefix: 'highlight',
        key: 'rent-to-own',
        name: 'Rent to own',
        iconPath: '',
        sub_name: 'highlight'
      },
      {
        prefix: 'highlight',
        key: 'npa-assets',
        name: 'NPA Assets',
        iconPath: '',
        sub_name: 'highlight'
      },
      {
        prefix: 'highlight',
        key: 'foreigner-quota',
        name: 'Foreigner Quota',
        iconPath: '',
        sub_name: 'highlight'
      },
      {
        prefix: 'highlight',
        key: 'sale-down',
        name: 'Sale Down',
        iconPath: '',
        sub_name: 'highlight'
      }
    ]

    const PropertyLabel =[
        {
      prefix: 'property-label',
      key: 'new-development',
      name: 'New Development',
      iconPath: '',
      sub_name: 'label',
    },
      {
        prefix: 'property-label',
        key: 'new-listing',
        name: 'New Listing',
        iconPath: '',
        sub_name: 'label'
      },
      {
        prefix: 'property-label',
        key: 'reduce-price',
        name: 'Reduce Price',
        iconPath: '',
        sub_name: 'label'
      },
      {
        prefix: 'property-label',
        key: 'resale',
        name: 'Resale',
        iconPath: '',
        sub_name: 'label'
      },
      {
        prefix: 'property-label',
        key: 'under-construction',
        name: 'Under Construction',
        iconPath: '',
        sub_name: 'label'
      },
      {
        prefix: 'property-label',
        key: 'hot-offer',
        name: 'Hot Offer',
        iconPath: '',
        sub_name: 'label'
      },
      {
        prefix: 'property-label',
        key: 'rented',
        name: 'Rented',
        iconPath: '',
        sub_name:'label'
      },
      {
          prefix:'property-label',
          key:'sold',
          name:'Sold',
          iconPath:'',
          sub_name:'label'
      }
    ]

    const NearBy =[
      {
        prefix: 'nearby',
        key: 'near-park',
        name: 'Near Park',
        iconPath: '/icons/Nearby/Near_park.svg',
        sub_name: 'nearby'
      },
      {
        prefix: 'nearby',
        key: 'near-mall',
        name: 'Near Mall',
        iconPath: '/icons/Nearby/Near_mall.svg',
        sub_name: 'nearby'
      },
      {
        prefix: 'nearby',
        key: 'near-train-station',
        name: 'Near Train Station',
        iconPath: '/icons/Nearby/Near_train.svg',
        sub_name: 'nearby'
      },
      {
        prefix: 'nearby',
        key: 'near-transportation',
        name: 'Near Transportation',
        iconPath: '/icons/Nearby/Near_Transportation.svg',
        sub_name: 'nearby'
      },
      {
        prefix: 'nearby',
        key: 'near-hospital',
        name: 'Near Hospital',
        iconPath: '/icons/Nearby/Near_Hospital.svg',
        sub_name: 'nearby'
      },
      {
        prefix: 'nearby',
        key: 'near-airport',
        name: 'Near Airport',
        iconPath: '/icons/Nearby/Near_airport.svg',
        sub_name: 'nearby'
      },
      {
        prefix: 'nearby',
        key: 'near-beach',
        name: 'Near Beach',
        iconPath: '/icons/Nearby/Near_beach.svg',
        sub_name: 'nearby'
      },
      {
        prefix: 'nearby',
        key: 'near-market',
        name: 'Near Market',
        iconPath: '/icons/Nearby/Near_market.svg',
        sub_name: 'nearby'
      },
      {
        prefix: 'nearby',
        key: 'near-school',
        name: 'Near School',
        iconPath: '/icons/Nearby/Near_school.svg',
        sub_name: 'nearby'
      }
    ]

    const views = [{

      prefix: 'views',
      key: 'sea-view',
      name: 'Sea View',
      iconPath: '/icons/View/View_sea.svg',
      sub_name: 'views'
      },
      {
        prefix: 'views',
        key: 'mountain-view',
        name: 'Mountain View',
        iconPath: '/icons/View/View_montain.svg',
        sub_name: 'views'
       },
      {
        prefix: 'views',
        key: 'city-view',
        name: 'City View',
        iconPath: '/icons/View/View_city.svg',
        sub_name: 'views'
      },
      {
        prefix: 'views',
        key: 'garden-view',
        name: 'Garden View',
        iconPath: '/icons/View/View_garden.svg',
        sub_name: 'views'
      },{
        prefix: 'views',
        key: 'pool-view',
        name: 'Pool View',
        iconPath: '/icons/View/View_pool.svg',
        sub_name: 'views'
      },
      {
        prefix: 'views',
        key: 'view-lake',
        name: 'Lake View',
        iconPath: '/icons/View/View_lake.svg',
        sub_name: 'views'
      }
    ]

    const Amenity = [
        {
          prefix: 'amenity',
          key: 'air-conditioner',
          name: 'Air Conditioner',
          iconPath: '/icons/Amenity/Amenity_air_conditioner.svg',
          sub_name: 'amenity'
        },
      {
        prefix: 'amenity',
        key: 'bbq',
        name: 'BBQ',
        iconPath: '/icons/Amenity/Amenity_bbq.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'dryer-machine',
        name: 'Dryer Machine',
        iconPath: '/icons/Amenity/Amenity_dry.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'hair-dryer',
        name: 'Hair Dryer',
        iconPath: '/icons/Amenity/Amenity_hair.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'karaoke-box',
        name: 'Karaoke Box',
        iconPath: '/icons/Amenity/Amenity_Karaoke.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'kitchen-ware',
        name: 'Kitchen Ware',
        iconPath: '/icons/Amenity/Amenity_kitchen.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'micro-wave',
        name: 'Micro Wave',
        iconPath: '/icons/Amenity/Amenity_micro.svg',
        sub_name: 'amenity',
      },
      {
        prefix: 'amenity',
        key: 'oven',
        name: 'Oven',
        iconPath: '/icons/Amenity/Amenity_oven.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'private-lift',
        name: 'Private  lift',
        iconPath: '/icons/Amenity/Amenity_private.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'refrigerator',
        name: 'Refrigerator',
        iconPath: '/icons/Amenity/Amenity_refrigerator.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'tv',
        name: 'TV',
        iconPath: '/icons/Amenity/Amenity_tv.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'wardrobe',
        name: 'Wardrobe',
        iconPath: '/icons/Amenity/Amenity_wardrobe.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'washing-machine',
        name: 'Washing Machine',
        iconPath: '/icons/Amenity/Amenity_machine.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'water-heater',
        name: 'Water Heater',
        iconPath: '/icons/Amenity/Amenity_heater.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'wifi',
        name: 'Wifi',
        iconPath: '/icons/Amenity/Amenity_wifi.svg',
        sub_name: 'amenity'
      },
      {
        prefix: 'amenity',
        key: 'home-security',
        name: 'Home Security',
        iconPath: '/icons/Amenity/Amenity_security.svg',
        sub_name: 'amenity'
      }
    ]


    // Combined icons for seeding
    const allIcons = [...highlights , ...PropertyLabel , ...NearBy , ...views, ...Amenity];

    // Insert all icons
    for (const icon of allIcons) {
      await prisma.icon.upsert({
        where: {
          prefix_name: {
            prefix: icon.prefix,
            name: icon.name

          }
        },
        update: {
          iconPath: icon.iconPath,
          active: true
        },
        create: {
          prefix: icon.prefix,
          name: icon.name,
          key: icon.key,
          iconPath: icon.iconPath,
          sub_name: icon.sub_name || null,
          active: true
        }
      });
      console.log(`Seeded icon: ${icon.prefix}/${icon.name}`);
    }


    console.log('Icons seeding completed successfully.');

  } catch (error) {
    console.error('Error seeding icons:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
