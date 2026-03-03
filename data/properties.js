const properties = [
  {
    title: "Ground Floor Retail Shop in Sector 22, Chandigarh",
    description:
      "Prime ground-floor retail shop located in busy Sector 22 market. High footfall area suitable for boutique, pharmacy, or café setup.",
    deal: "Rent",
    type: "Commercial",
    propertyCategory: "Shop",

    area: { value: 450, unit: "sqft" },

    ageOfProperty: 12,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "South",

    price: 60000,
    securityDeposit: 120000,
    pricePerSqft: 133,

    image: [
      "https://res.cloudinary.com/demo/image/upload/v1700000601/properties/shop-front.jpg",
    ],

    negotiable: false,
    postedBy: "Agent",
    contactNumber: ["9814112233"],
    preferredContact: "Call",

    location: {
      address: "Main Market Road",
      city: "Chandigarh",
      sector: "Sector 22",
      state: "Chandigarh",
      country: "India",
      slug: "retail-shop-sector-22-chandigarh",
      pincode: "160022",
      coordinates: { type: "Point", coordinates: [76.7821, 30.7295] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-22-2018-145",

    facilities: {
      bathrooms: 1,
      parkings: 1,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 1,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Speciality Hospital"],
      metroStations: [],
      malls: ["Shastri Market"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 56,
    leads: 8,
  },
  {
    title: "Modern 3BHK Independent Villa in Zirakpur",
    description:
      "Beautifully designed 3BHK independent villa with front lawn and covered parking. Located in a peaceful gated colony near Patiala Highway. Ideal for families seeking independent living.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Independent House/Villa",

    area: { value: 180, unit: "sqyard" },

    ageOfProperty: 1,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 14500000,
    pricePerSqft: 8055,

    image: [
      "https://res.cloudinary.com/demo/image/upload/v1700000501/properties/villa-front.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1700000502/properties/villa-hall.jpg",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780055511"],
    preferredContact: "Call",

    location: {
      address: "Near Patiala Highway",
      city: "Zirakpur",
      sector: "Highway Colony",
      state: "Punjab",
      country: "India",
      slug: "3bhk-independent-villa-zirakpur",
      pincode: "140603",
      coordinates: { type: "Point", coordinates: [76.8195, 30.6399] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-ZRK-2024-066",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: ["Dikshant International School"],
      hospitals: ["Amcare Hospital"],
      metroStations: [],
      malls: ["Cosmo Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 38,
    leads: 5,
  },
  {
    title: "Luxury 4BHK Penthouse with Private Terrace in Sector 66, Mohali",
    description:
      "Exclusive 4BHK penthouse featuring private terrace garden, premium wooden flooring, false ceiling lighting, and panoramic city views. Located in a high-end gated society with clubhouse and 3-tier security system.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Penthouse",

    area: { value: 2850, unit: "sqft" },

    ageOfProperty: 2,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North",

    price: 26500000,
    pricePerSqft: 9298,

    projectName: "Royal Heights",
    builderName: "Royal Buildcon",
    totalUnits: 150,

    societyAmenities: [
      "Infinity Pool",
      "Club House",
      "Gym",
      "Spa",
      "24x7 Security",
      "Power Backup",
    ],

    image: [
      "https://res.cloudinary.com/demo/image/upload/v1700000401/properties/penthouse-living.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1700000402/properties/penthouse-terrace.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1700000403/properties/penthouse-bedroom.jpg",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814778899"],
    preferredContact: "Call",

    location: {
      address: "Tower Top Floor, Sector 66",
      city: "Mohali",
      sector: "Sector 66",
      state: "Punjab",
      country: "India",
      slug: "luxury-4bhk-penthouse-sector-66-mohali",
      pincode: "160062",
      coordinates: { type: "Point", coordinates: [76.7138, 30.6897] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-S66-2023-410",

    facilities: {
      bedrooms: 4,
      bathrooms: 4,
      parkings: 3,
      servantRooms: 1,
      securityFeatures: ["CCTV", "Guard", "Gated"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 18,
    },

    nearbyPlaces: {
      schools: ["Shivalik Public School"],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["Bestech Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 91,
    leads: 14,
  },
  {
    title: "Boys PG Accommodation in Sector 34, Chandigarh",
    description:
      "Well-maintained boys PG with food and WiFi facility in Sector 34. Walking distance to coaching institutes and market. Safe locality with CCTV monitoring.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 300, unit: "sqft" },

    ageOfProperty: 5,
    availability: "Ready to Move",
    furnishing: "Furnished",
    facing: "West",

    price: 7500,
    securityDeposit: 7500,
    pricePerSqft: 25,

    images: [
      "https://res.cloudinary.com/demo/image/upload/v1700000701/properties/pg-room.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1700000702/properties/pg-dining.jpg",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9876007788"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near Coaching Hub",
      city: "Chandigarh",
      sector: "Sector 34",
      state: "Chandigarh",
      country: "India",
      slug: "boys-pg-sector-34-chandigarh",
      pincode: "160034",
      coordinates: { type: "Point", coordinates: [76.7683, 30.7338] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-PG-2022-055",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Mukta Hospital"],
      metroStations: [],
      malls: ["Sector 34 Market"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 29,
    leads: 4,
  },

  {
    title: "3BHK Luxury Apartment in Sector 79, Mohali",
    description:
      "Spacious 3BHK semi-furnished apartment located in a premium gated society in Sector 79, Mohali. The property offers modern interiors, modular kitchen, wide balconies, and landscaped green surroundings. Ideal for families looking for peaceful yet well-connected living near Chandigarh.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: {
      value: 1650,
      unit: "sqft",
    },

    ageOfProperty: 3,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "North-East",

    price: 12500000,
    pricePerSqft: 7575,

    projectName: "Homeland Heights",
    builderName: "Homeland Group",
    totalUnits: 240,

    societyAmenities: [
      "Club House",
      "Gym",
      "Swimming Pool",
      "24x7 Security",
      "Children Play Area",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9876543210"],
    preferredContact: "Call",

    location: {
      address: "Tower B, Homeland Heights, Sector 79",
      city: "Mohali",
      sector: "Sector 79",
      state: "Punjab",
      country: "India",
      slug: "3bhk-luxury-apartment-sector-79-mohali",
      pincode: "140308",
      coordinates: {
        type: "Point",
        coordinates: [76.69, 30.7046],
      },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-SAS79-2022-045",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      servantRooms: 1,
      securityFeatures: ["CCTV", "Guard", "Gated"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 18,
    },

    nearbyPlaces: {
      schools: ["Delhi Public School Mohali"],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 35,
    leads: 4,
  },
  {
    title: "Fully Furnished Office Space in Chandigarh IT Park",
    description:
      "Premium ready-to-move office space available for rent in IT Park, Chandigarh. The unit includes workstations, conference room, reception area, pantry, and central AC. Suitable for startups and IT companies.",
    deal: "Rent",
    type: "Commercial",
    propertyCategory: "Office",

    area: {
      value: 1200,
      unit: "sqft",
    },

    ageOfProperty: 5,
    availability: "Ready to Move",
    furnishing: "Furnished",
    facing: "East",

    price: 85000,
    maintenanceCharge: 10000,
    securityDeposit: 170000,
    pricePerSqft: 70,

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9812345678"],
    preferredContact: "WhatsApp",

    location: {
      address: "IT Tower 3, Chandigarh IT Park",
      city: "Chandigarh",
      sector: "IT Park",
      state: "Chandigarh",
      country: "India",
      slug: "office-space-it-park-chandigarh",
      pincode: "160101",
      coordinates: {
        type: "Point",
        coordinates: [76.813, 30.728],
      },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-ITP-2021-112",

    commercialPropertyTypes: ["IT/ITES Office"],
    investmentOptions: ["Rental Yield"],

    facilities: {
      bathrooms: 2,
      parkings: 3,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 7,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Alchemist Hospital"],
      metroStations: [],
      malls: ["Elante Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 22,
    leads: 3,
  },
  {
    title: "200 Sq Yard Residential Plot in Sector 20, Panchkula",
    description:
      "Prime 200 sq yard residential plot located in a well-developed pocket of Sector 20, Panchkula. Ideal for independent house construction. Wide road frontage, proper drainage, and close proximity to schools and markets.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Land/Plot",

    area: {
      value: 200,
      unit: "sqyard",
    },

    availability: "Ready to Move",
    price: 16500000,
    pricePerSqft: 8250,

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9898989898"],
    preferredContact: "Call",

    location: {
      address: "Near Main Market, Sector 20",
      city: "Panchkula",
      sector: "Sector 20",
      state: "Haryana",
      country: "India",
      slug: "200-sqyard-plot-sector-20-panchkula",
      pincode: "134116",
      coordinates: {
        type: "Point",
        coordinates: [76.851, 30.6942],
      },
    },

    ownershipType: "Freehold",
    approvedBy: "HUDA",
    reraNumber: "HRERA-PKL-2023-078",

    facilities: {
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
    },

    nearbyPlaces: {
      schools: ["Blue Bird High School"],
      hospitals: ["Ojas Hospital"],
      metroStations: [],
      malls: ["Paras Downtown Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 18,
    leads: 1,
  },

  {
    title: "4BHK Independent House in Sector 15, Panchkula",
    description:
      "Beautifully maintained 4BHK independent house in Sector 15, Panchkula. Built on a spacious plot with modern elevation, modular kitchen, wooden flooring in bedrooms, and a private terrace. Located in a peaceful residential area with wide roads and green surroundings.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Independent House/Villa",

    area: {
      value: 250,
      unit: "sqyard",
    },

    ageOfProperty: 6,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "South-East",

    price: 28500000,
    pricePerSqft: 11400,

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814012345"],
    preferredContact: "Call",

    location: {
      address: "House No 1452, Sector 15",
      city: "Panchkula",
      sector: "Sector 15",
      state: "Haryana",
      country: "India",
      slug: "4bhk-independent-house-sector-15-panchkula",
      pincode: "134113",
      coordinates: {
        type: "Point",
        coordinates: [76.8612, 30.7075],
      },
    },

    ownershipType: "Freehold",
    approvedBy: "HUDA",
    reraNumber: "HRERA-PKL-2021-233",

    facilities: {
      bedrooms: 4,
      bathrooms: 4,
      parkings: 2,
      servantRooms: 1,
      securityFeatures: ["CCTV", "Gated"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: ["St. Xavier's High School"],
      hospitals: ["Paras Hospital Panchkula"],
      metroStations: [],
      malls: ["DT Mall IT Park"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 41,
    leads: 6,
  },
  {
    title: "2BHK Builder Floor in Zirakpur VIP Road",
    description:
      "Affordable 2BHK builder floor located on VIP Road, Zirakpur. Well-ventilated unit with lift facility, covered parking, and modular kitchen. Ideal for small families and working professionals.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Builder Floor",

    area: {
      value: 1100,
      unit: "sqft",
    },

    ageOfProperty: 2,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "West",

    price: 5200000,
    pricePerSqft: 4727,

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780011122"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near Cosmo Mall, VIP Road",
      city: "Zirakpur",
      sector: "VIP Road",
      state: "Punjab",
      country: "India",
      slug: "2bhk-builder-floor-vip-road-zirakpur",
      pincode: "140603",
      coordinates: {
        type: "Point",
        coordinates: [76.8173, 30.6425],
      },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-ZRK-2023-118",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["CCTV"],
      waterSupply: "Both",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: ["Holy Family School"],
      hospitals: ["Amcare Hospital"],
      metroStations: [],
      malls: ["Cosmo Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 27,
    leads: 2,
  },
  {
    title: "Commercial Showroom Space on Patiala Highway, Zirakpur",
    description:
      "High visibility commercial showroom space available on Patiala Highway, Zirakpur. Ideal for retail brands, automobile display, or franchise outlets. Ample parking space and excellent road frontage.",
    deal: "Rent",
    type: "Commercial",
    propertyCategory: "Showroom",

    area: {
      value: 2000,
      unit: "sqft",
    },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "North",

    price: 140000,
    maintenanceCharge: 15000,
    securityDeposit: 300000,
    pricePerSqft: 70,

    negotiable: false,
    postedBy: "Agent",
    contactNumber: ["9876003344"],
    preferredContact: "Call",

    location: {
      address: "Main Patiala Highway",
      city: "Zirakpur",
      sector: "Patiala Road",
      state: "Punjab",
      country: "India",
      slug: "commercial-showroom-patiala-highway-zirakpur",
      pincode: "140603",
      coordinates: {
        type: "Point",
        coordinates: [76.8201, 30.6391],
      },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-COMM-2022-299",

    commercialPropertyTypes: ["Retail Showroom"],
    investmentOptions: ["Business Setup"],

    facilities: {
      bathrooms: 1,
      parkings: 5,
      securityFeatures: ["Guard"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 1,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Healing Touch Hospital"],
      metroStations: [],
      malls: ["Dhillon Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 19,
    leads: 5,
  },

  {
    title: "Luxury 3BHK Apartment in Aerocity, Mohali",
    description:
      "Premium 3BHK apartment in a high-rise tower at Aerocity, Mohali. Features include Italian marble flooring, smart home automation, modular kitchen with chimney & hob, and panoramic city views from the 14th floor. Located close to Chandigarh International Airport.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: {
      value: 1850,
      unit: "sqft",
    },

    ageOfProperty: 1,
    availability: "Ready to Move",
    furnishing: "Furnished",
    facing: "North",

    price: 14800000,
    pricePerSqft: 8000,

    projectName: "Aerocity Skyline Towers",
    builderName: "Gill Developers",
    totalUnits: 320,

    societyAmenities: [
      "Infinity Pool",
      "Club House",
      "Gym",
      "Jogging Track",
      "24x7 Security",
      "Power Backup",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9815007788"],
    preferredContact: "Call",

    location: {
      address: "Tower C, Aerocity",
      city: "Mohali",
      sector: "Aerocity",
      state: "Punjab",
      country: "India",
      slug: "luxury-3bhk-apartment-aerocity-mohali",
      pincode: "140306",
      coordinates: {
        type: "Point",
        coordinates: [76.7275, 30.6682],
      },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-AERO-2024-011",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      securityFeatures: ["CCTV", "Guard", "Gated"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 22,
    },

    nearbyPlaces: {
      schools: ["Manav Mangal School"],
      hospitals: ["Max Super Speciality Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 52,
    leads: 7,
  },
  {
    title: "Affordable 1BHK Flat in Kharar Near Chandigarh University",
    description:
      "Budget-friendly 1BHK apartment ideal for students and working professionals. Located near Chandigarh University with easy access to public transport, grocery stores, and daily utilities.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: {
      value: 550,
      unit: "sqft",
    },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 9500,
    securityDeposit: 19000,
    pricePerSqft: 17,

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9872211445"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near Chandigarh University Road",
      city: "Kharar",
      sector: "CU Road",
      state: "Punjab",
      country: "India",
      slug: "1bhk-flat-kharar-near-cu",
      pincode: "140301",
      coordinates: {
        type: "Point",
        coordinates: [76.5743, 30.7461],
      },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-KHR-2022-201",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 1,
      securityFeatures: ["Guard"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 4,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Civil Hospital Kharar"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 14,
    leads: 2,
  },
  {
    title: "Industrial Warehouse in Phase 8B, Mohali",
    description:
      "Spacious industrial warehouse available for lease in Phase 8B Industrial Area, Mohali. Suitable for storage, logistics, and light manufacturing units. Equipped with heavy-duty flooring and easy truck access.",
    deal: "Rent",
    type: "Commercial",
    propertyCategory: "Warehouse",

    area: {
      value: 5000,
      unit: "sqft",
    },

    ageOfProperty: 8,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "South",

    price: 175000,
    securityDeposit: 350000,
    pricePerSqft: 35,

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9780099900"],
    preferredContact: "Call",

    location: {
      address: "Industrial Area Phase 8B",
      city: "Mohali",
      sector: "Phase 8B",
      state: "Punjab",
      country: "India",
      slug: "industrial-warehouse-phase-8b-mohali",
      pincode: "160071",
      coordinates: {
        type: "Point",
        coordinates: [76.7098, 30.7023],
      },
    },

    ownershipType: "Leasehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-IND-2020-055",

    commercialPropertyTypes: ["Warehouse"],
    investmentOptions: ["Long Term Lease"],

    facilities: {
      bathrooms: 2,
      parkings: 8,
      securityFeatures: ["Guard"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 1,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 31,
    leads: 4,
  },
  {
    title: "Under Construction 3BHK in Sector 88, Mohali",
    description:
      "Modern 3BHK apartment under construction in Sector 88, Mohali. Located in a premium township with upcoming clubhouse, landscaped gardens, and sports facilities. Attractive pre-launch pricing with flexible payment plan.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: {
      value: 1550,
      unit: "sqft",
    },

    ageOfProperty: 0,
    availability: "Under Construction",
    furnishing: "Unfurnished",
    facing: "East",

    price: 9200000,
    pricePerSqft: 5935,

    projectName: "Greenfield Residency",
    builderName: "Greenfield Developers",
    totalUnits: 180,

    societyAmenities: ["Club House", "Gym", "Jogging Track", "24x7 Security"],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814301122"],
    preferredContact: "Call",

    location: {
      address: "Sector 88 Main Road",
      city: "Mohali",
      sector: "Sector 88",
      state: "Punjab",
      country: "India",
      slug: "under-construction-3bhk-sector-88-mohali",
      pincode: "140307",
      coordinates: {
        type: "Point",
        coordinates: [76.7389, 30.6731],
      },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-S88-2025-032",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 1,
      securityFeatures: ["CCTV", "Gated"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 16,
    },

    nearbyPlaces: {
      schools: ["Delhi Public School Mohali"],
      hospitals: ["Max Hospital Mohali"],
      metroStations: [],
      malls: ["Bestech Square Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 12,
    leads: 1,
  },

  {
    title: "Corner 3BHK Park Facing Apartment in Sector 82, Mohali",
    description:
      "Well-maintained corner 3BHK apartment overlooking central park in Sector 82, Mohali. Excellent ventilation, modular kitchen, wooden wardrobes, and spacious balconies. Located in a gated society with full security and clubhouse access.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1725, unit: "sqft" },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "North-East",

    price: 11800000,
    pricePerSqft: 6840,

    projectName: "Parkview Residency",
    builderName: "Sunrise Buildtech",
    totalUnits: 210,

    societyAmenities: [
      "Club House",
      "Gym",
      "Swimming Pool",
      "24x7 Security",
      "Jogging Track",
    ],

    images: [
      "https://res.cloudinary.com/demo/image/upload/v1700000001/properties/sector82-livingroom.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1700000002/properties/sector82-bedroom.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1700000003/properties/sector82-balcony.jpg",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814556677"],
    preferredContact: "Call",

    location: {
      address: "Tower A, Sector 82",
      city: "Mohali",
      sector: "Sector 82",
      state: "Punjab",
      country: "India",
      slug: "corner-3bhk-park-facing-sector-82-mohali",
      pincode: "140308",
      coordinates: { type: "Point", coordinates: [76.7154, 30.6851] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-S82-2022-214",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      securityFeatures: ["CCTV", "Guard", "Gated"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 14,
    },

    nearbyPlaces: {
      schools: ["Delhi Public School Mohali"],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 63,
    leads: 9,
  },
  {
    title: "Spacious 2BHK Rental in Sector 5, Panchkula",
    description:
      "Bright and airy 2BHK apartment available for rent in Sector 5, Panchkula. Close to market, schools, and main road connectivity. Ideal for working couples and small families.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 980, unit: "sqft" },

    ageOfProperty: 7,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 18500,
    securityDeposit: 37000,
    pricePerSqft: 19,

    images: [
      "https://res.cloudinary.com/demo/image/upload/v1700000101/properties/sec5-hall.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1700000102/properties/sec5-bedroom.jpg",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9876547788"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near Main Market, Sector 5",
      city: "Panchkula",
      sector: "Sector 5",
      state: "Haryana",
      country: "India",
      slug: "2bhk-rental-sector-5-panchkula",
      pincode: "134109",
      coordinates: { type: "Point", coordinates: [76.8524, 30.7012] },
    },

    ownershipType: "Freehold",
    approvedBy: "HUDA",
    reraNumber: "HRERA-PKL-2021-089",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Guard"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: ["Bhavan Vidyalaya"],
      hospitals: ["Paras Hospital Panchkula"],
      metroStations: [],
      malls: ["DT Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 21,
    leads: 3,
  },
  {
    title: "SCO Investment Property in Sector 70, Mohali",
    description:
      "Commercial SCO available for sale in prime Sector 70 market. Excellent rental yield opportunity with high footfall and established business surroundings.",
    deal: "Sale",
    type: "Commercial",
    propertyCategory: "Shop/SCO",

    area: { value: 1350, unit: "sqft" },

    ageOfProperty: 9,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "South",

    price: 32500000,
    pricePerSqft: 24074,

    images: [
      "https://res.cloudinary.com/demo/image/upload/v1700000201/properties/sco-front.jpg",
      "https://res.cloudinary.com/demo/image/upload/v1700000202/properties/sco-inside.jpg",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814992211"],
    preferredContact: "Call",

    location: {
      address: "Main Market SCO Line",
      city: "Mohali",
      sector: "Sector 70",
      state: "Punjab",
      country: "India",
      slug: "sco-investment-sector-70-mohali",
      pincode: "160071",
      coordinates: { type: "Point", coordinates: [76.7241, 30.7015] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-COM-2019-302",

    commercialPropertyTypes: ["Retail", "Office"],
    investmentOptions: ["Rental Yield", "Capital Appreciation"],

    facilities: {
      bathrooms: 2,
      parkings: 4,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Ivy Hospital Mohali"],
      metroStations: [],
      malls: ["Bestech Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 74,
    leads: 11,
  },
  {
    title: "150 Sq Yard Residential Plot in New Chandigarh",
    description:
      "East-facing residential plot in New Chandigarh township. Ideal for building an independent house in a planned area with wide roads, parks, and future commercial development nearby.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Land/Plot",

    area: { value: 150, unit: "sqyard" },

    availability: "Ready to Move",
    price: 7800000,
    pricePerSqft: 5200,

    images: [
      "https://res.cloudinary.com/demo/image/upload/v1700000301/properties/newchd-plot.jpg",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780023344"],
    preferredContact: "Call",

    location: {
      address: "Eco City 1 Extension",
      city: "New Chandigarh",
      sector: "Eco City 1",
      state: "Punjab",
      country: "India",
      slug: "150-sqyard-plot-new-chandigarh",
      pincode: "140901",
      coordinates: { type: "Point", coordinates: [76.7552, 30.7789] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-NCHD-2023-176",

    facilities: {
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
    },

    nearbyPlaces: {
      schools: ["Akal Academy"],
      hospitals: ["Civil Hospital Kurali"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 17,
    leads: 2,
  },
  {
    title: "Modern 2BHK Apartment in Sector 21, Panchkula",
    description:
      "Newly renovated 2BHK apartment with modular kitchen and wooden flooring in bedrooms. Located in a quiet residential pocket of Sector 21, Panchkula with easy access to Chandigarh.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1250, unit: "sqft" },

    ageOfProperty: 3,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 7800000,
    pricePerSqft: 6240,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1560185007-cde436f6a4d0",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9876541122"],
    preferredContact: "Call",

    location: {
      address: "Near Community Center",
      city: "Panchkula",
      sector: "Sector 21",
      state: "Haryana",
      country: "India",
      slug: "modern-2bhk-sector-21-panchkula",
      pincode: "134112",
      coordinates: { type: "Point", coordinates: [76.8605, 30.7131] },
    },

    ownershipType: "Freehold",
    approvedBy: "HUDA",
    reraNumber: "HRERA-PKL-2022-142",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Guard"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 4,
    },

    nearbyPlaces: {
      schools: ["Hansraj Public School"],
      hospitals: ["Paras Hospital"],
      metroStations: [],
      malls: ["DT Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 26,
    leads: 3,
  },
  {
    title: "3BHK Apartment in Gated Society, Kharar",
    description:
      "Spacious 3BHK apartment located in a well-maintained gated society near Kharar-Landran Road. Ideal for families seeking affordable yet modern living near Mohali.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1420, unit: "sqft" },

    ageOfProperty: 2,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "North",

    price: 6200000,
    pricePerSqft: 4366,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1493809842364-78817add7ffb",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814304455"],
    preferredContact: "Call",

    location: {
      address: "Near Landran Road",
      city: "Kharar",
      sector: "Landran Road",
      state: "Punjab",
      country: "India",
      slug: "3bhk-gated-society-kharar",
      pincode: "140301",
      coordinates: { type: "Point", coordinates: [76.5803, 30.7449] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-KHR-2023-178",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 1,
      securityFeatures: ["CCTV", "Gated"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 10,
    },

    nearbyPlaces: {
      schools: ["Doaba Public School"],
      hospitals: ["Civil Hospital Kharar"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 33,
    leads: 5,
  },
  {
    title: "Plug & Play Office Space in Industrial Area Phase 1, Chandigarh",
    description:
      "Fully furnished office space with 20 workstations, conference room and reception area. Ideal for IT startups and service companies.",
    deal: "Rent",
    type: "Commercial",
    propertyCategory: "Office",

    area: { value: 1500, unit: "sqft" },

    ageOfProperty: 6,
    availability: "Ready to Move",
    furnishing: "Furnished",
    facing: "South",

    price: 95000,
    securityDeposit: 190000,
    pricePerSqft: 63,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1497366754035-f200968a6e72",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1556761175-b413da4baf72",
    ],

    negotiable: false,
    postedBy: "Agent",
    contactNumber: ["9876507788"],
    preferredContact: "Call",

    location: {
      address: "Industrial Area Phase 1",
      city: "Chandigarh",
      sector: "Industrial Area",
      state: "Chandigarh",
      country: "India",
      slug: "office-space-industrial-area-chandigarh",
      pincode: "160002",
      coordinates: { type: "Point", coordinates: [76.7936, 30.7042] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-IND-2020-089",

    facilities: {
      bathrooms: 2,
      parkings: 4,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 5,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["GMCH 32"],
      metroStations: [],
      malls: ["Elante Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 47,
    leads: 6,
  },
  {
    title: "250 Sq Yard Corner Plot in Aerocity, Mohali",
    description:
      "Premium corner residential plot in Aerocity with 2-side open access. Located near main boulevard road and upcoming commercial hub. Ideal for luxury house construction.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Land/Plot",

    area: { value: 250, unit: "sqyard" },

    availability: "Ready to Move",
    price: 19500000,
    pricePerSqft: 7800,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780012344"],
    preferredContact: "Call",

    location: {
      address: "Block D, Aerocity",
      city: "Mohali",
      sector: "Aerocity",
      state: "Punjab",
      country: "India",
      slug: "250-sqyard-corner-plot-aerocity-mohali",
      pincode: "140306",
      coordinates: { type: "Point", coordinates: [76.7268, 30.6674] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-AERO-2023-219",

    facilities: {
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
    },

    nearbyPlaces: {
      schools: ["Manav Mangal Smart School"],
      hospitals: ["Max Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 54,
    leads: 8,
  },

  {
    title: "Industrial Plot for Sale in Dera Bassi Industrial Area",
    description:
      "Industrial plot suitable for factory setup or warehouse development. Located in approved industrial zone with wide road access and power supply infrastructure.",
    deal: "Sale",
    type: "Commercial",
    propertyCategory: "Industrial Land",

    area: { value: 1000, unit: "sqyard" },

    availability: "Ready to Move",
    price: 42000000,
    pricePerSqft: 4200,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1509395176047-4a66953fd231",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814889900"],
    preferredContact: "Call",

    location: {
      address: "Industrial Area Phase 2",
      city: "Dera Bassi",
      sector: "Industrial Zone",
      state: "Punjab",
      country: "India",
      slug: "industrial-plot-dera-bassi",
      pincode: "140507",
      coordinates: { type: "Point", coordinates: [76.8441, 30.5873] },
    },

    ownershipType: "Freehold",
    approvedBy: "PUDA",
    reraNumber: "PBRERA-DB-2023-140",

    facilities: {
      securityFeatures: ["Guard"],
      waterSupply: "Municipal",
      powerBackup: true,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Indus Hospital Dera Bassi"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 36,
    leads: 4,
  },
  {
    title: "4 Marla Newly Built Builder Floor in Sunny Enclave, Kharar",
    description:
      "Newly constructed 3BHK builder floor in Sunny Enclave. Modern elevation, modular kitchen, POP ceilings and dedicated parking space. Affordable option near Mohali border.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Builder Floor",

    area: { value: 1000, unit: "sqft" },

    ageOfProperty: 0,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "East",

    price: 4800000,
    pricePerSqft: 4800,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1568605114967-8130f3a36994",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780098765"],
    preferredContact: "Call",

    location: {
      address: "Sunny Enclave Main Road",
      city: "Kharar",
      sector: "Sunny Enclave",
      state: "Punjab",
      country: "India",
      slug: "4-marla-builder-floor-sunny-enclave-kharar",
      pincode: "140301",
      coordinates: { type: "Point", coordinates: [76.5751, 30.7395] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-SE-2024-052",

    facilities: {
      bedrooms: 3,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: ["Akal Academy"],
      hospitals: ["Civil Hospital Kharar"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 23,
    leads: 2,
  },
  {
    title: "Studio Apartment for Rent in IT Park, Chandigarh",
    description:
      "Compact and modern studio apartment ideal for IT professionals working in Chandigarh IT Park. Fully furnished with bed, wardrobe, kitchenette and attached washroom.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Studio Apartment",

    area: { value: 420, unit: "sqft" },

    ageOfProperty: 3,
    availability: "Ready to Move",
    furnishing: "Furnished",
    facing: "West",

    price: 16000,
    securityDeposit: 32000,
    pricePerSqft: 38,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9876012345"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near IT Tower 2",
      city: "Chandigarh",
      sector: "IT Park",
      state: "Chandigarh",
      country: "India",
      slug: "studio-apartment-it-park-chandigarh",
      pincode: "160101",
      coordinates: { type: "Point", coordinates: [76.8135, 30.7293] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-ST-2022-076",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 1,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 6,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Alchemist Hospital"],
      metroStations: [],
      malls: ["Elante Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 44,
    leads: 6,
  },
  {
    title: "5BHK Luxury Kothi in Sector 10, Chandigarh",
    description:
      "Ultra-premium 5BHK independent kothi in one of Chandigarh’s most prestigious sectors. Spacious lawn area, Italian marble flooring, private office room, and servant quarters. Ideal for high-net-worth families.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Independent House/Villa",

    area: { value: 500, unit: "sqyard" },

    ageOfProperty: 8,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "North",

    price: 145000000,
    pricePerSqft: 29000,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814001122"],
    preferredContact: "Call",

    location: {
      address: "House No 112, Sector 10",
      city: "Chandigarh",
      sector: "Sector 10",
      state: "Chandigarh",
      country: "India",
      slug: "5bhk-luxury-kothi-sector-10-chandigarh",
      pincode: "160011",
      coordinates: { type: "Point", coordinates: [76.7875, 30.7521] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-2016-010",

    facilities: {
      bedrooms: 5,
      bathrooms: 5,
      parkings: 4,
      servantRooms: 2,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: ["St. John's High School"],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 112,
    leads: 17,
  },

  {
    title: "3BHK Park Facing Apartment in Sector 70, Mohali",
    description:
      "Well-maintained 3BHK apartment overlooking landscaped park in Sector 70. Located in a premium residential society with lift, security and reserved parking. Suitable for working professionals and families.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1650, unit: "sqft" },

    ageOfProperty: 5,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "Park Facing",

    price: 9800000,
    pricePerSqft: 5939,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1560185007-c5ca9d2c014d",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600585152220-90363fe7e115",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814112233"],
    preferredContact: "Call",

    location: {
      address: "Sector 70",
      city: "Mohali",
      sector: "Sector 70",
      state: "Punjab",
      country: "India",
      slug: "3bhk-park-facing-sector-70-mohali",
      pincode: "160070",
      coordinates: { type: "Point", coordinates: [76.7186, 30.7046] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-2022-145",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      securityFeatures: ["CCTV", "Gated"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 12,
    },

    nearbyPlaces: {
      schools: ["Yadavindra Public School"],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 61,
    leads: 9,
  },
  {
    title: "Warehouse for Rent on Zirakpur-Patiala Highway",
    description:
      "Newly constructed warehouse with high ceiling clearance and easy container access. Ideal for logistics, FMCG storage or distribution hub near Zirakpur.",
    deal: "Rent",
    type: "Commercial",
    propertyCategory: "Warehouse",

    area: { value: 4200, unit: "sqft" },

    ageOfProperty: 1,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "East",

    price: 125000,
    securityDeposit: 250000,
    pricePerSqft: 29,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9876548899"],
    preferredContact: "Call",

    location: {
      address: "Near Singhpura Chowk",
      city: "Zirakpur",
      sector: "Patiala Highway",
      state: "Punjab",
      country: "India",
      slug: "warehouse-rent-zirakpur-highway",
      pincode: "140603",
      coordinates: { type: "Point", coordinates: [76.8173, 30.642] },
    },

    ownershipType: "Leasehold",
    approvedBy: "PUDA",
    reraNumber: "PBRERA-ZKP-2024-018",

    facilities: {
      bathrooms: 1,
      parkings: 5,
      securityFeatures: ["Guard"],
      waterSupply: "Municipal",
      powerBackup: true,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Paras Hospitals Panchkula"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 19,
    leads: 3,
  },
  {
    title: "2BHK Builder Floor in Sector 123, Sunny Enclave Extension",
    description:
      "Budget-friendly 2BHK builder floor with separate entry and modular kitchen. Located in a fast-developing pocket close to NH-5 and Mohali. Suitable for first-time buyers.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "Builder Floor",

    area: { value: 950, unit: "sqft" },

    ageOfProperty: 1,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "South",

    price: 3950000,
    pricePerSqft: 4157,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1605276374104-dee2a0ed3cd6",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780022445"],
    preferredContact: "WhatsApp",

    location: {
      address: "Sector 123",
      city: "Kharar",
      sector: "Sunny Enclave Extension",
      state: "Punjab",
      country: "India",
      slug: "2bhk-builder-floor-sector-123-kharar",
      pincode: "140301",
      coordinates: { type: "Point", coordinates: [76.5678, 30.7312] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-SEXT-2024-071",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: ["Gillco International School"],
      hospitals: ["Sohana Hospital"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 28,
    leads: 4,
  },
  {
    title: "SCO Booth in Sector 82 JLPL Industrial Area, Mohali",
    description:
      "Prime commercial SCO booth in JLPL Industrial Area Sector 82. Suitable for clinic, showroom, or office setup. Located on main road with heavy daily footfall.",
    deal: "Sale",
    type: "Commercial",
    propertyCategory: "Retail Shop",

    area: { value: 1250, unit: "sqft" },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Unfurnished",
    facing: "Main Road",

    price: 22000000,
    pricePerSqft: 17600,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814556677"],
    preferredContact: "Call",

    location: {
      address: "Sector 82 JLPL",
      city: "Mohali",
      sector: "Sector 82",
      state: "Punjab",
      country: "India",
      slug: "sco-sector-82-jlpl-mohali",
      pincode: "160082",
      coordinates: { type: "Point", coordinates: [76.7055, 30.6649] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-SCO-2021-099",

    facilities: {
      bathrooms: 1,
      parkings: 3,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Max Hospital Mohali"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 72,
    leads: 11,
  },
  {
    title: "6BHK Ultra Luxury Villa in Sector 8, Chandigarh",
    description:
      "Architect-designed 6BHK ultra luxury villa in prime Sector 8. Built on a spacious plot with Italian marble flooring, private elevator, home theatre, landscaped lawn and servant quarters. Located in one of Chandigarh’s most prestigious residential pockets.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "House/Villa",

    area: { value: 550, unit: "sqyard" },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North-East",

    price: 185000000,
    pricePerSqft: 33636,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1613977257363-707ba9348227",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600607687644-c7171b42498b",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814007788"],
    preferredContact: "Call",

    location: {
      address: "House No 214, Sector 8",
      city: "Chandigarh",
      sector: "Sector 8",
      state: "Chandigarh",
      country: "India",
      slug: "6bhk-ultra-luxury-villa-sector-8-chandigarh",
      pincode: "160009",
      coordinates: { type: "Point", coordinates: [76.799, 30.7445] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-2019-021",

    facilities: {
      bedrooms: 6,
      bathrooms: 6,
      parkings: 5,
      servantRooms: 2,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: ["St. Kabir Public School"],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 134,
    leads: 21,
  },
  {
    title: "5BHK Premium Kothi with Basement in Sector 16, Chandigarh",
    description:
      "Elegant 5BHK kothi with fully developed basement in Sector 16. Features include wooden flooring in bedrooms, modular kitchen with island counter, bar lounge in basement and beautifully maintained front lawn. Ideal for elite families.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "House/Villa",

    area: { value: 450, unit: "sqyard" },

    ageOfProperty: 7,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 162000000,
    pricePerSqft: 36000,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600573472550-8090b5e0745e",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814558899"],
    preferredContact: "Call",

    location: {
      address: "House No 87, Sector 16",
      city: "Chandigarh",
      sector: "Sector 16",
      state: "Chandigarh",
      country: "India",
      slug: "5bhk-premium-kothi-sector-16-chandigarh",
      pincode: "160015",
      coordinates: { type: "Point", coordinates: [76.7848, 30.7353] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-2018-044",

    facilities: {
      bedrooms: 5,
      bathrooms: 5,
      parkings: 4,
      servantRooms: 1,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: ["Bhavan Vidyalaya"],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 118,
    leads: 16,
  },
  {
    title: "Modern 4BHK Designer House in Sector 11, Chandigarh",
    description:
      "Contemporary 4BHK designer house in Sector 11 with double-height entrance lobby, glass façade elevation and landscaped terrace garden. Premium fittings, smart home automation and covered parking. Walking distance to market and park.",
    deal: "Sale",
    type: "Residential",
    propertyCategory: "House/Villa",

    area: { value: 400, unit: "sqyard" },

    ageOfProperty: 2,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North",

    price: 148000000,
    pricePerSqft: 37000,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600585154526-990dced4db0d",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780011122"],
    preferredContact: "Call",

    location: {
      address: "House No 56, Sector 11",
      city: "Chandigarh",
      sector: "Sector 11",
      state: "Chandigarh",
      country: "India",
      slug: "4bhk-designer-house-sector-11-chandigarh",
      pincode: "160011",
      coordinates: { type: "Point", coordinates: [76.7894, 30.7529] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "CHD-RERA-2021-062",

    facilities: {
      bedrooms: 4,
      bathrooms: 4,
      parkings: 3,
      servantRooms: 1,
      securityFeatures: ["CCTV"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: ["St. John's High School"],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 97,
    leads: 13,
  },
  {
    title: "Furnished 2BHK for Students in Sector 15, Chandigarh",
    description:
      "Fully furnished 2BHK apartment walking distance from Panjab University. Includes beds, study tables, wardrobes, refrigerator and washing machine. Ideal for 3–4 students looking for safe and peaceful locality.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 900, unit: "sqft" },

    ageOfProperty: 12,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "East",

    price: 22000,
    securityDeposit: 44000,
    pricePerSqft: 24,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1507089947368-19c1da9775ae",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1522708323590-d24dbb6b0267",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9876018899"],
    preferredContact: "WhatsApp",

    location: {
      address: "House No 214, Sector 15",
      city: "Chandigarh",
      sector: "Sector 15",
      state: "Chandigarh",
      country: "India",
      slug: "2bhk-student-rent-sector-15-chandigarh",
      pincode: "160015",
      coordinates: { type: "Point", coordinates: [76.7754, 30.7421] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2022-118",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 52,
    leads: 9,
  },
  {
    title: "Girls PG Accommodation Near Panjab University Gate No. 2",
    description:
      "Well-maintained girls PG with double and triple sharing options. Includes WiFi, meals, housekeeping and 24x7 security. Walking distance from PU Gate No. 2 and DAV College.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 350, unit: "sqft" },

    ageOfProperty: 6,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North",

    price: 9000,
    securityDeposit: 9000,
    pricePerSqft: 26,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1555854877-bab0e564b8d5",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9814556670"],
    preferredContact: "Call",

    location: {
      address: "Near PU Gate No 2",
      city: "Chandigarh",
      sector: "Sector 14",
      state: "Chandigarh",
      country: "India",
      slug: "girls-pg-near-pu-chandigarh",
      pincode: "160014",
      coordinates: { type: "Point", coordinates: [76.7682, 30.759] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2023-051",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 4,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 76,
    leads: 14,
  },
  {
    title: "1RK Studio for Rent Near PEC & PGI, Sector 12",
    description:
      "Compact 1RK studio apartment suitable for single student or intern at PGI/PEC. Includes bed, cupboard, kitchenette and attached bathroom. Peaceful residential lane with easy access to university campus.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Studio Apartment",

    area: { value: 380, unit: "sqft" },

    ageOfProperty: 8,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 13000,
    securityDeposit: 26000,
    pricePerSqft: 34,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780099901"],
    preferredContact: "WhatsApp",

    location: {
      address: "Sector 12 Residential Area",
      city: "Chandigarh",
      sector: "Sector 12",
      state: "Chandigarh",
      country: "India",
      slug: "1rk-studio-near-pec-pgi-sector-12",
      pincode: "160012",
      coordinates: { type: "Point", coordinates: [76.7695, 30.7572] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2021-093",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 63,
    leads: 11,
  },
  {
    title: "3BHK Student Friendly Flat in Sector 22, Chandigarh",
    description:
      "Spacious 3BHK flat suitable for group of 4–5 students. Located near coaching institutes and local market in Sector 22. Separate beds, wardrobes and basic kitchen setup available.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1150, unit: "sqft" },

    ageOfProperty: 15,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "South",

    price: 28000,
    securityDeposit: 56000,
    pricePerSqft: 24,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9876501122"],
    preferredContact: "Call",

    location: {
      address: "Near Shastri Market",
      city: "Chandigarh",
      sector: "Sector 22",
      state: "Chandigarh",
      country: "India",
      slug: "3bhk-student-flat-sector-22-chandigarh",
      pincode: "160022",
      coordinates: { type: "Point", coordinates: [76.7794, 30.7265] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2020-144",

    facilities: {
      bedrooms: 3,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 41,
    leads: 6,
  },
  {
    title: "Boys PG with Meals Near PEC University, Sector 12",
    description:
      "Comfortable boys PG accommodation near PEC University. Double sharing rooms with attached washroom, WiFi, home-style meals and daily housekeeping included in rent.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 300, unit: "sqft" },

    ageOfProperty: 5,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "East",

    price: 8500,
    securityDeposit: 8500,
    pricePerSqft: 28,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1598928506311-c55ded91a20c",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9814772233"],
    preferredContact: "Call",

    location: {
      address: "Near PEC Main Gate",
      city: "Chandigarh",
      sector: "Sector 12",
      state: "Chandigarh",
      country: "India",
      slug: "boys-pg-near-pec-sector-12",
      pincode: "160012",
      coordinates: { type: "Point", coordinates: [76.768, 30.7575] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2022-067",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 58,
    leads: 10,
  },
  {
    title: "Affordable 2BHK for Students in Phase 7, Mohali",
    description:
      "Budget 2BHK apartment in Phase 7, Mohali suitable for 3–4 students. Close to ISBT Mohali and daily market. Basic furnishings available including beds and fridge.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 820, unit: "sqft" },

    ageOfProperty: 10,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "North",

    price: 18000,
    securityDeposit: 36000,
    pricePerSqft: 22,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1494526585095-c41746248156",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780044556"],
    preferredContact: "WhatsApp",

    location: {
      address: "Phase 7",
      city: "Mohali",
      sector: "Phase 7",
      state: "Punjab",
      country: "India",
      slug: "2bhk-student-rent-phase-7-mohali",
      pincode: "160061",
      coordinates: { type: "Point", coordinates: [76.7325, 30.7078] },
    },

    ownershipType: "Leasehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2021-055",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 4,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 37,
    leads: 5,
  },
  {
    title: "Single Room with Attached Washroom in Sector 15, Chandigarh",
    description:
      "Independent single room with attached washroom available for student. Separate entry, peaceful environment and walking distance from PU and DAV College.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Independent Room",

    area: { value: 250, unit: "sqft" },

    ageOfProperty: 14,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 7500,
    securityDeposit: 15000,
    pricePerSqft: 30,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1560448204-603b3fc33ddc",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9814883344"],
    preferredContact: "Call",

    location: {
      address: "House No 178, Sector 15",
      city: "Chandigarh",
      sector: "Sector 15",
      state: "Chandigarh",
      country: "India",
      slug: "single-room-sector-15-student-rent",
      pincode: "160015",
      coordinates: { type: "Point", coordinates: [76.776, 30.7425] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2019-188",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 49,
    leads: 7,
  },
  {
    title: "Shared 2BHK for Girls in Sector 16, Chandigarh",
    description:
      "Well-maintained 2BHK available for girls near Government College Sector 16. Fully furnished with beds, wardrobes and study desks. Peaceful area with park and market nearby.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 850, unit: "sqft" },

    ageOfProperty: 18,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North",

    price: 20000,
    securityDeposit: 40000,
    pricePerSqft: 23,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9814667788"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near Rose Garden Side",
      city: "Chandigarh",
      sector: "Sector 16",
      state: "Chandigarh",
      country: "India",
      slug: "girls-2bhk-sector-16-chandigarh",
      pincode: "160015",
      coordinates: { type: "Point", coordinates: [76.7818, 30.7356] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2018-201",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 34,
    leads: 4,
  },
  {
    title: "Triple Sharing Boys PG in Sector 21, Chandigarh",
    description:
      "Affordable triple sharing boys PG in Sector 21 near coaching centers. Includes WiFi, RO water, cupboard and evening meals. Suitable for students preparing for competitive exams.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 320, unit: "sqft" },

    ageOfProperty: 7,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "South",

    price: 7000,
    securityDeposit: 7000,
    pricePerSqft: 22,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780023411"],
    preferredContact: "Call",

    location: {
      address: "Near Main Market Sector 21",
      city: "Chandigarh",
      sector: "Sector 21",
      state: "Chandigarh",
      country: "India",
      slug: "boys-pg-sector-21-chandigarh",
      pincode: "160021",
      coordinates: { type: "Point", coordinates: [76.7773, 30.7214] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2021-072",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 61,
    leads: 8,
  },
  {
    title: "1BHK for Rent Near PU South Campus, Sector 25",
    description:
      "Neat and clean 1BHK apartment ideal for couple of students. Located near PU South Campus and bus stop. Includes bed, almirah and gas connection.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 520, unit: "sqft" },

    ageOfProperty: 11,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 14000,
    securityDeposit: 28000,
    pricePerSqft: 27,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1493666438817-866a91353ca9",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814990022"],
    preferredContact: "Call",

    location: {
      address: "Near PU South Campus",
      city: "Chandigarh",
      sector: "Sector 25",
      state: "Chandigarh",
      country: "India",
      slug: "1bhk-rent-sector-25-chandigarh",
      pincode: "160014",
      coordinates: { type: "Point", coordinates: [76.7589, 30.7481] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2020-131",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 28,
    leads: 3,
  },
  {
    title: "Budget Student Room in Phase 5, Mohali",
    description:
      "Single furnished room available in Phase 5 Mohali for student. Walking distance from bus stop and daily market. Includes bed, fan, cupboard and attached washroom.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Independent Room",

    area: { value: 240, unit: "sqft" },

    ageOfProperty: 9,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 6500,
    securityDeposit: 13000,
    pricePerSqft: 27,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1560185127-6ed189bf02f4",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9876112233"],
    preferredContact: "WhatsApp",

    location: {
      address: "Phase 5",
      city: "Mohali",
      sector: "Phase 5",
      state: "Punjab",
      country: "India",
      slug: "student-room-phase-5-mohali",
      pincode: "160059",
      coordinates: { type: "Point", coordinates: [76.7184, 30.7089] },
    },

    ownershipType: "Leasehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2019-089",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 22,
    leads: 2,
  },
  {
    title: "Fully Furnished 3BHK for Students in Sector 11, Chandigarh",
    description:
      "Spacious 3BHK available for group of 4–5 students near PEC and PGI. Equipped with beds, wardrobes, sofa set, fridge and washing machine. Quiet residential lane with park nearby.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1250, unit: "sqft" },

    ageOfProperty: 20,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North-East",

    price: 32000,
    securityDeposit: 64000,
    pricePerSqft: 26,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1560448075-bb485b067938",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814003344"],
    preferredContact: "Call",

    location: {
      address: "House No 78, Sector 11",
      city: "Chandigarh",
      sector: "Sector 11",
      state: "Chandigarh",
      country: "India",
      slug: "3bhk-student-sector-11-chandigarh",
      pincode: "160011",
      coordinates: { type: "Point", coordinates: [76.7898, 30.7534] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2017-166",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      securityFeatures: ["Gated"],
      waterSupply: "Both",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 67,
    leads: 9,
  },
  {
    title: "Budget Girls PG in Sector 24 Near Coaching Hub",
    description:
      "Clean and affordable girls PG in Sector 24. Double sharing rooms with WiFi, RO water and security. Walking distance to coaching institutes and bus stop.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 280, unit: "sqft" },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "South",

    price: 6800,
    securityDeposit: 6800,
    pricePerSqft: 24,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1616594039964-ae9021a400a0",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780067890"],
    preferredContact: "Call",

    location: {
      address: "Near Sector 24 Main Market",
      city: "Chandigarh",
      sector: "Sector 24",
      state: "Chandigarh",
      country: "India",
      slug: "girls-pg-sector-24-chandigarh",
      pincode: "160023",
      coordinates: { type: "Point", coordinates: [76.7712, 30.7361] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2023-094",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 38,
    leads: 6,
  },
  {
    title: "2BHK Builder Floor for Students in Sunny Enclave, Kharar",
    description:
      "Affordable 2BHK builder floor suitable for students studying in CGC Landran or CU. Includes beds, almirahs and basic kitchen fittings. Peaceful lane with grocery shops nearby.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Builder Floor",

    area: { value: 780, unit: "sqft" },

    ageOfProperty: 3,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 15000,
    securityDeposit: 30000,
    pricePerSqft: 19,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1502672023488-70e25813eb80",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9876005544"],
    preferredContact: "WhatsApp",

    location: {
      address: "Sunny Enclave Block C",
      city: "Kharar",
      sector: "Sunny Enclave",
      state: "Punjab",
      country: "India",
      slug: "2bhk-student-sunny-enclave-kharar",
      pincode: "140301",
      coordinates: { type: "Point", coordinates: [76.5738, 30.7387] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-SE-RENT-2022-041",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Civil Hospital Kharar"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 29,
    leads: 4,
  },
  {
    title: "Compact 1RK for Rent in Sector 20, Chandigarh",
    description:
      "Neat 1RK unit ideal for single student or intern. Located near market and bus connectivity in Sector 20. Includes bed, cupboard and attached washroom.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Studio Apartment",

    area: { value: 340, unit: "sqft" },

    ageOfProperty: 13,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 9000,
    securityDeposit: 18000,
    pricePerSqft: 26,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1524758631624-e2822e304c36",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814778899"],
    preferredContact: "Call",

    location: {
      address: "Sector 20 Housing Board",
      city: "Chandigarh",
      sector: "Sector 20",
      state: "Chandigarh",
      country: "India",
      slug: "1rk-rent-sector-20-chandigarh",
      pincode: "160020",
      coordinates: { type: "Point", coordinates: [76.7742, 30.7198] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2016-205",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 31,
    leads: 3,
  },
  {
    title: "Modern 2BHK Near IT Park, Chandigarh",
    description:
      "Well-maintained 2BHK apartment located 5 minutes from IT Park Chandigarh. Ideal for working professionals. Comes with modular kitchen, wardrobes, AC in both bedrooms and reserved parking.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 980, unit: "sqft" },

    ageOfProperty: 6,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 26000,
    securityDeposit: 52000,
    pricePerSqft: 27,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1505691938895-1758d7feb511",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1494526585095-c41746248156",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814007788"],
    preferredContact: "Call",

    location: {
      address: "Near DLF IT Park",
      city: "Chandigarh",
      sector: "IT Park",
      state: "Chandigarh",
      country: "India",
      slug: "2bhk-near-it-park-chandigarh",
      pincode: "160101",
      coordinates: { type: "Point", coordinates: [76.8055, 30.7269] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2021-212",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated", "CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 8,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["Elante Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 112,
    leads: 18,
  },
  {
    title: "Fully Furnished 3BHK in Zirakpur High-Rise Society",
    description:
      "Premium 3BHK in gated society at Zirakpur, suitable for IT professionals working in Chandigarh or Mohali. Includes ACs, sofa set, dining table, beds and modular kitchen. Clubhouse and gym access available.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1450, unit: "sqft" },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North-East",

    price: 38000,
    securityDeposit: 76000,
    pricePerSqft: 26,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1560185008-b033106af5c3",
    ],

    negotiable: false,
    postedBy: "Agent",
    contactNumber: ["9876502233"],
    preferredContact: "Call",

    location: {
      address: "High-Rise Society, VIP Road",
      city: "Zirakpur",
      sector: "VIP Road",
      state: "Punjab",
      country: "India",
      slug: "3bhk-highrise-zirakpur-vip-road",
      pincode: "140603",
      coordinates: { type: "Point", coordinates: [76.8258, 30.6425] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-ZRK-RENT-2023-061",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      securityFeatures: ["Gated", "CCTV", "Guard"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 14,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Alchemist Hospital Panchkula"],
      metroStations: [],
      malls: ["Elante Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 146,
    leads: 21,
  },
  {
    title: "Luxury 2BHK in IT City, Mohali",
    description:
      "Contemporary 2BHK apartment in Mohali IT City with balcony view. Suitable for corporate employees working in Quark City or nearby tech offices. Covered parking and 24x7 security available.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1100, unit: "sqft" },

    ageOfProperty: 2,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 30000,
    securityDeposit: 60000,
    pricePerSqft: 27,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814779900"],
    preferredContact: "WhatsApp",

    location: {
      address: "IT City, Sector 82A",
      city: "Mohali",
      sector: "Sector 82A",
      state: "Punjab",
      country: "India",
      slug: "2bhk-it-city-mohali-sector-82a",
      pincode: "160082",
      coordinates: { type: "Point", coordinates: [76.7085, 30.6652] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2024-011",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated", "CCTV"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 10,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 98,
    leads: 13,
  },
  {
    title: "Spacious 2BHK for Students in Sector 14, Chandigarh",
    description:
      "Comfortable 2BHK flat ideal for 3–4 students. Located near Punjab University main campus and local market. Includes beds, study tables, fridge and washing machine.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 920, unit: "sqft" },

    ageOfProperty: 16,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "East",

    price: 24000,
    securityDeposit: 48000,
    pricePerSqft: 26,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1507089947367-19c1da9775ae",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814556677"],
    preferredContact: "Call",

    location: {
      address: "Near DAV College Road",
      city: "Chandigarh",
      sector: "Sector 14",
      state: "Chandigarh",
      country: "India",
      slug: "2bhk-student-sector-14-chandigarh",
      pincode: "160014",
      coordinates: { type: "Point", coordinates: [76.7685, 30.7448] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2019-173",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Both",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 44,
    leads: 6,
  },
  {
    title: "Affordable Boys PG in Sector 15, Chandigarh",
    description:
      "Double sharing boys PG within walking distance of PU and coaching institutes. Includes WiFi, RO water, cupboard and daily housekeeping. Suitable for first-year students.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 260, unit: "sqft" },

    ageOfProperty: 8,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North",

    price: 7200,
    securityDeposit: 7200,
    pricePerSqft: 28,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1598928636135-d146006ff4be",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780034567"],
    preferredContact: "WhatsApp",

    location: {
      address: "House No 211, Sector 15",
      city: "Chandigarh",
      sector: "Sector 15",
      state: "Chandigarh",
      country: "India",
      slug: "boys-pg-sector-15-chandigarh-budget",
      pincode: "160015",
      coordinates: { type: "Point", coordinates: [76.776, 30.7422] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2020-083",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 39,
    leads: 5,
  },
  {
    title: "Student Friendly 1BHK in Phase 3B2, Mohali",
    description:
      "Neat 1BHK apartment suitable for two students. Located in Phase 3B2 Mohali with good bus connectivity to Chandigarh colleges. Includes bed, almirah and kitchen cabinets.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 540, unit: "sqft" },

    ageOfProperty: 12,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "South",

    price: 13000,
    securityDeposit: 26000,
    pricePerSqft: 24,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814885522"],
    preferredContact: "Call",

    location: {
      address: "Phase 3B2",
      city: "Mohali",
      sector: "Phase 3B2",
      state: "Punjab",
      country: "India",
      slug: "1bhk-student-phase-3b2-mohali",
      pincode: "160059",
      coordinates: { type: "Point", coordinates: [76.7264, 30.7094] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2018-054",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 27,
    leads: 3,
  },
  {
    title: "Triple Sharing Girls PG Near PU South Campus",
    description:
      "Comfortable triple sharing accommodation for girls near PU South Campus. Includes WiFi, study tables, cupboards and home-style meals. Safe residential locality.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 300, unit: "sqft" },

    ageOfProperty: 6,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "West",

    price: 6500,
    securityDeposit: 6500,
    pricePerSqft: 22,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1616046229478-9901c5536a45",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9876123456"],
    preferredContact: "Call",

    location: {
      address: "Near PU South Campus Gate",
      city: "Chandigarh",
      sector: "Sector 25",
      state: "Chandigarh",
      country: "India",
      slug: "girls-pg-pu-south-campus",
      pincode: "160014",
      coordinates: { type: "Point", coordinates: [76.7592, 30.7478] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2022-101",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 53,
    leads: 7,
  },
  {
    title: "Independent 2BHK for Students in Sector 19, Chandigarh",
    description:
      "Well-ventilated 2BHK on first floor available for 3–4 students. Located in peaceful residential lane of Sector 19 with nearby grocery market and bus connectivity.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Builder Floor",

    area: { value: 880, unit: "sqft" },

    ageOfProperty: 22,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "North",

    price: 21000,
    securityDeposit: 42000,
    pricePerSqft: 24,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814012233"],
    preferredContact: "Call",

    location: {
      address: "House No 145, Sector 19",
      city: "Chandigarh",
      sector: "Sector 19",
      state: "Chandigarh",
      country: "India",
      slug: "2bhk-student-sector-19-chandigarh",
      pincode: "160019",
      coordinates: { type: "Point", coordinates: [76.7768, 30.7224] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2015-148",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 36,
    leads: 4,
  },
  {
    title: "Triple Sharing Boys PG in Sector 34 Coaching Hub",
    description:
      "Budget-friendly triple sharing PG in Sector 34, ideal for students preparing for banking and SSC exams. Includes WiFi, study tables and evening meals.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 310, unit: "sqft" },

    ageOfProperty: 6,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "South-East",

    price: 6200,
    securityDeposit: 6200,
    pricePerSqft: 20,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780011199"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near Coaching Street, Sector 34",
      city: "Chandigarh",
      sector: "Sector 34",
      state: "Chandigarh",
      country: "India",
      slug: "boys-pg-sector-34-coaching",
      pincode: "160034",
      coordinates: { type: "Point", coordinates: [76.7644, 30.7135] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2021-092",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Elante Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 58,
    leads: 9,
  },
  {
    title: "Compact 1BHK for Students in Sector 23, Chandigarh",
    description:
      "Affordable 1BHK suitable for two students. Located close to market and public transport in Sector 23. Includes bed, cupboard and basic kitchen setup.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 480, unit: "sqft" },

    ageOfProperty: 14,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 12000,
    securityDeposit: 24000,
    pricePerSqft: 25,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814559900"],
    preferredContact: "Call",

    location: {
      address: "Sector 23 Housing Area",
      city: "Chandigarh",
      sector: "Sector 23",
      state: "Chandigarh",
      country: "India",
      slug: "1bhk-student-sector-23-chandigarh",
      pincode: "160023",
      coordinates: { type: "Point", coordinates: [76.7689, 30.7291] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2018-177",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 25,
    leads: 3,
  },
  {
    title: "Student 2BHK Near CGC Landran, Mohali",
    description:
      "Budget 2BHK apartment near CGC Landran, suitable for 3–4 students. Includes beds and wardrobes. Grocery shops and bus stop available at walking distance.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 760, unit: "sqft" },

    ageOfProperty: 5,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 15500,
    securityDeposit: 31000,
    pricePerSqft: 20,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1493809842364-78817add7ffb",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9876011122"],
    preferredContact: "Call",

    location: {
      address: "Near CGC College Road",
      city: "Mohali",
      sector: "Landran",
      state: "Punjab",
      country: "India",
      slug: "2bhk-student-cgc-landran-mohali",
      pincode: "140307",
      coordinates: { type: "Point", coordinates: [76.6345, 30.6932] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2022-048",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Civil Hospital Kharar"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 33,
    leads: 5,
  },
  {
    title: "Affordable 1RK for Students in Sector 22, Chandigarh",
    description:
      "Compact 1RK unit ideal for single student. Located near Sector 22 main market with easy bus connectivity. Includes bed, cupboard and attached washroom.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Studio Apartment",

    area: { value: 300, unit: "sqft" },

    ageOfProperty: 19,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "North",

    price: 8500,
    securityDeposit: 17000,
    pricePerSqft: 28,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1494526585095-c41746248156",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814027788"],
    preferredContact: "Call",

    location: {
      address: "Near Shastri Market",
      city: "Chandigarh",
      sector: "Sector 22",
      state: "Chandigarh",
      country: "India",
      slug: "1rk-student-sector-22-chandigarh",
      pincode: "160022",
      coordinates: { type: "Point", coordinates: [76.7736, 30.7272] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2016-139",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 41,
    leads: 5,
  },
  {
    title: "Double Sharing Girls PG in Sector 35, Chandigarh",
    description:
      "Comfortable double sharing girls PG near coaching institutes in Sector 35. Includes WiFi, RO water, study table and daily cleaning service.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 280, unit: "sqft" },

    ageOfProperty: 7,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "East",

    price: 7500,
    securityDeposit: 7500,
    pricePerSqft: 27,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1616594039964-ae9021a400a0",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780045566"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near Coaching Street",
      city: "Chandigarh",
      sector: "Sector 35",
      state: "Chandigarh",
      country: "India",
      slug: "girls-pg-sector-35-chandigarh",
      pincode: "160035",
      coordinates: { type: "Point", coordinates: [76.7618, 30.7119] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2022-110",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Elante Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 64,
    leads: 10,
  },
  {
    title: "Student Friendly 2BHK in Phase 7, Mohali",
    description:
      "Spacious 2BHK apartment in Phase 7 Mohali suitable for 3–4 students. Close to bus stand and daily market. Includes wardrobes and kitchen cabinets.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 820, unit: "sqft" },

    ageOfProperty: 10,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "South",

    price: 17000,
    securityDeposit: 34000,
    pricePerSqft: 21,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1502672023488-70e25813eb80",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9876023344"],
    preferredContact: "Call",

    location: {
      address: "Phase 7 Main Road",
      city: "Mohali",
      sector: "Phase 7",
      state: "Punjab",
      country: "India",
      slug: "2bhk-student-phase-7-mohali",
      pincode: "160062",
      coordinates: { type: "Point", coordinates: [76.7301, 30.7012] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2019-067",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 37,
    leads: 4,
  },
  {
    title: "Budget 3 Sharing Room Near Chandigarh University, Kharar",
    description:
      "Triple sharing accommodation near Chandigarh University. Includes bed, cupboard, WiFi and RO water. Ideal for first-year students looking for affordable stay.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 320, unit: "sqft" },

    ageOfProperty: 5,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "West",

    price: 6000,
    securityDeposit: 6000,
    pricePerSqft: 18,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780060011"],
    preferredContact: "Call",

    location: {
      address: "Near CU Main Gate",
      city: "Kharar",
      sector: "CU Area",
      state: "Punjab",
      country: "India",
      slug: "pg-near-chandigarh-university-kharar",
      pincode: "140301",
      coordinates: { type: "Point", coordinates: [76.5752, 30.7691] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-KHR-RENT-2023-032",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV"],
      waterSupply: "Municipal",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Civil Hospital Kharar"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 71,
    leads: 12,
  },
  {
    title: "Budget 1BHK for Students in Sector 21, Chandigarh",
    description:
      "Well-maintained 1BHK ideal for two students. Located close to local market and public transport in Sector 21. Includes bed, wardrobe and basic kitchen fittings.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 520, unit: "sqft" },

    ageOfProperty: 18,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 11500,
    securityDeposit: 23000,
    pricePerSqft: 22,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814067788"],
    preferredContact: "Call",

    location: {
      address: "House No 88, Sector 21",
      city: "Chandigarh",
      sector: "Sector 21",
      state: "Chandigarh",
      country: "India",
      slug: "1bhk-student-sector-21-chandigarh",
      pincode: "160021",
      coordinates: { type: "Point", coordinates: [76.7699, 30.7238] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2014-118",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 32,
    leads: 4,
  },
  {
    title: "Spacious 3BHK for Student Group in Sector 16, Chandigarh",
    description:
      "Large 3BHK suitable for group of 4–5 students near colleges and hospital area. Comes with beds, wardrobes and washing machine. Quiet residential street.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Builder Floor",

    area: { value: 1350, unit: "sqft" },

    ageOfProperty: 21,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North-East",

    price: 31000,
    securityDeposit: 62000,
    pricePerSqft: 23,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600607687939-ce8a6c25118c",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9876004455"],
    preferredContact: "Call",

    location: {
      address: "Near Government College Road",
      city: "Chandigarh",
      sector: "Sector 16",
      state: "Chandigarh",
      country: "India",
      slug: "3bhk-student-sector-16-chandigarh",
      pincode: "160016",
      coordinates: { type: "Point", coordinates: [76.7802, 30.7371] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2013-105",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Both",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 76,
    leads: 11,
  },
  {
    title: "Student Friendly 2BHK in Phase 5, Mohali",
    description:
      "Comfortable 2BHK apartment located in Phase 5 Mohali. Suitable for students traveling daily to Chandigarh colleges. Includes wardrobes and kitchen cabinets.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 790, unit: "sqft" },

    ageOfProperty: 9,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "South",

    price: 16500,
    securityDeposit: 33000,
    pricePerSqft: 21,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814552233"],
    preferredContact: "WhatsApp",

    location: {
      address: "Phase 5 Main Market Area",
      city: "Mohali",
      sector: "Phase 5",
      state: "Punjab",
      country: "India",
      slug: "2bhk-student-phase-5-mohali",
      pincode: "160059",
      coordinates: { type: "Point", coordinates: [76.7228, 30.7099] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2017-039",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 34,
    leads: 4,
  },
  {
    title: "Affordable Girls PG in Greater Mohali (Near Airport Road)",
    description:
      "Clean and secure girls PG in Greater Mohali area. Double sharing rooms with WiFi, cupboards and attached washroom. Good road connectivity to Chandigarh.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 290, unit: "sqft" },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "West",

    price: 7000,
    securityDeposit: 7000,
    pricePerSqft: 24,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780088899"],
    preferredContact: "Call",

    location: {
      address: "Near Airport Road Extension",
      city: "Mohali",
      sector: "Greater Mohali",
      state: "Punjab",
      country: "India",
      slug: "girls-pg-greater-mohali-airport-road",
      pincode: "160055",
      coordinates: { type: "Point", coordinates: [76.7398, 30.6684] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2023-072",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 59,
    leads: 8,
  },
  {
    title: "Comfortable 2BHK for Students in Sector 18, Chandigarh",
    description:
      "Well-ventilated 2BHK suitable for 3–4 students. Located close to local market and bus stop in Sector 18. Includes beds, wardrobes and basic kitchen setup.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 860, unit: "sqft" },

    ageOfProperty: 17,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 19500,
    securityDeposit: 39000,
    pricePerSqft: 23,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1502672260266-1c1ef2d93688",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814099911"],
    preferredContact: "Call",

    location: {
      address: "House No 212, Sector 18",
      city: "Chandigarh",
      sector: "Sector 18",
      state: "Chandigarh",
      country: "India",
      slug: "2bhk-student-sector-18-chandigarh",
      pincode: "160018",
      coordinates: { type: "Point", coordinates: [76.7744, 30.7328] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2017-151",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["PGIMER Chandigarh"],
      metroStations: [],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 29,
    leads: 3,
  },
  {
    title: "Affordable Boys PG in Sector 37, Chandigarh",
    description:
      "Triple sharing boys PG near coaching institutes in Sector 37. Includes WiFi, study tables and RO water. Suitable for students preparing for competitive exams.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "PG/Hostel",

    area: { value: 305, unit: "sqft" },

    ageOfProperty: 6,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "South",

    price: 6300,
    securityDeposit: 6300,
    pricePerSqft: 20,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1595526114035-0d45ed16cfbf",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780099912"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near Coaching Street, Sector 37",
      city: "Chandigarh",
      sector: "Sector 37",
      state: "Chandigarh",
      country: "India",
      slug: "boys-pg-sector-37-chandigarh",
      pincode: "160036",
      coordinates: { type: "Point", coordinates: [76.7582, 30.7084] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-PG-2021-097",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["CCTV"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 3,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Government Multi Specialty Hospital 16"],
      metroStations: [],
      malls: ["Elante Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 61,
    leads: 9,
  },
  {
    title: "Student 1BHK in Phase 11, Mohali",
    description:
      "Neat 1BHK apartment suitable for two students in Phase 11 Mohali. Close to bus stand and daily market. Includes wardrobes and kitchen cabinets.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 560, unit: "sqft" },

    ageOfProperty: 11,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 12500,
    securityDeposit: 25000,
    pricePerSqft: 22,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9814771122"],
    preferredContact: "Call",

    location: {
      address: "Phase 11 Main Market",
      city: "Mohali",
      sector: "Phase 11",
      state: "Punjab",
      country: "India",
      slug: "1bhk-student-phase-11-mohali",
      pincode: "160062",
      coordinates: { type: "Point", coordinates: [76.7279, 30.6938] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2018-052",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 1,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Fortis Hospital Mohali"],
      metroStations: [],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 26,
    leads: 2,
  },
  {
    title: "Ultra Budget Student Room Near Kharar Bus Stand",
    description:
      "Single room accommodation for students near Kharar Bus Stand. Ideal for budget-conscious students traveling to Chandigarh colleges daily.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Studio Apartment",

    area: { value: 240, unit: "sqft" },

    ageOfProperty: 9,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "North",

    price: 5200,
    securityDeposit: 5200,
    pricePerSqft: 21,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
    ],

    negotiable: false,
    postedBy: "Owner",
    contactNumber: ["9780018877"],
    preferredContact: "Call",

    location: {
      address: "Near Kharar Bus Stand",
      city: "Kharar",
      sector: "Bus Stand Area",
      state: "Punjab",
      country: "India",
      slug: "student-room-kharar-bus-stand",
      pincode: "140301",
      coordinates: { type: "Point", coordinates: [76.575, 30.7476] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-KHR-RENT-2022-029",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: [],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      schools: [],
      hospitals: ["Civil Hospital Kharar"],
      metroStations: [],
      malls: [],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 22,
    leads: 2,
  },

  {
    title: "Modern 2BHK for IT Professionals in Sector 67, Mohali",
    description:
      "Fully furnished 2BHK apartment ideal for IT professionals working in IT City Mohali. Includes modular kitchen, sofa set, workstation corner and balcony view.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 980, unit: "sqft" },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North-East",

    price: 32000,
    securityDeposit: 64000,
    pricePerSqft: 33,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600607687644-c7171b42498f",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1560448204-e02f11c3d0e2",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1484154218962-a197022b5858",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9876012345"],
    preferredContact: "Call",

    location: {
      address: "IT City Road",
      city: "Mohali",
      sector: "Sector 67",
      state: "Punjab",
      country: "India",
      slug: "2bhk-it-professional-sector-67-mohali",
      pincode: "160062",
      coordinates: { type: "Point", coordinates: [76.7262, 30.6884] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2021-084",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["CCTV", "Gated", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 12,
    },

    nearbyPlaces: {
      hospitals: ["Fortis Hospital Mohali"],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 118,
    leads: 17,
  },
  {
    title: "Premium 3BHK Family Apartment in Zirakpur High-Rise",
    description:
      "Spacious 3BHK apartment in gated society with clubhouse, gym and landscaped gardens. Ideal for families looking for comfort and security.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1650, unit: "sqft" },

    ageOfProperty: 3,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 38000,
    securityDeposit: 76000,
    pricePerSqft: 23,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600585154526-990dced4db0d",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1600607687920-4e2a09cf159d",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814888800"],
    preferredContact: "Call",

    location: {
      address: "High-Rise Society, VIP Road",
      city: "Zirakpur",
      sector: "VIP Road",
      state: "Punjab",
      country: "India",
      slug: "3bhk-premium-vip-road-zirakpur",
      pincode: "140603",
      coordinates: { type: "Point", coordinates: [76.8156, 30.6425] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "PBRERA-ZRK-RENT-2022-051",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      securityFeatures: ["CCTV", "Gated", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 14,
    },

    nearbyPlaces: {
      hospitals: ["Alchemist Hospital Zirakpur"],
      malls: ["Paras Downtown Square Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 92,
    leads: 12,
  },
  {
    title: "Budget 1BHK for Students in Sector 24, Chandigarh",
    description:
      "Affordable 1BHK apartment suitable for two students. Located in peaceful residential pocket of Sector 24 with easy connectivity to Punjab University.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 510, unit: "sqft" },

    ageOfProperty: 15,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 11000,
    securityDeposit: 22000,
    pricePerSqft: 21,

    image: [
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1494526585095-c41746248156",
      "https://res.cloudinary.com/demo/image/fetch/https://images.unsplash.com/photo-1505691938895-1758d7feb511",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780011122"],
    preferredContact: "WhatsApp",

    location: {
      address: "House No 77, Sector 24",
      city: "Chandigarh",
      sector: "Sector 24",
      state: "Chandigarh",
      country: "India",
      slug: "1bhk-student-sector-24-chandigarh",
      pincode: "160024",
      coordinates: { type: "Point", coordinates: [76.7652, 30.7346] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2016-142",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 2,
    },

    nearbyPlaces: {
      hospitals: ["PGIMER Chandigarh"],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 34,
    leads: 4,
  },
  {
    title: "Fully Furnished 2BHK for IT Professionals in Sector 66, Mohali",
    description:
      "Modern 2BHK apartment near IT City Mohali, ideal for working professionals. Includes modular kitchen, workstation space and balcony view.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1020, unit: "sqft" },

    ageOfProperty: 3,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "North-East",

    price: 34000,
    securityDeposit: 68000,
    pricePerSqft: 33,

    image: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9876001122"],
    preferredContact: "Call",

    location: {
      address: "IT City Road",
      city: "Mohali",
      sector: "Sector 66",
      state: "Punjab",
      country: "India",
      slug: "2bhk-it-sector-66-mohali",
      pincode: "160066",
      coordinates: { type: "Point", coordinates: [76.7265, 30.6892] },
    },

    status: "Active",
    views: 134,
    leads: 21,
  },
  {
    title: "Affordable 1BHK for Students in Sector 25, Chandigarh",
    description:
      "Budget-friendly 1BHK suitable for two students near Punjab University. Quiet residential pocket with market at walking distance.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 520, unit: "sqft" },

    ageOfProperty: 14,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "West",

    price: 11500,
    securityDeposit: 23000,
    pricePerSqft: 22,

    image: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780017788"],
    preferredContact: "WhatsApp",

    location: {
      address: "Near PU Gate 2",
      city: "Chandigarh",
      sector: "Sector 25",
      state: "Chandigarh",
      country: "India",
      slug: "1bhk-student-sector-25-chandigarh",
      pincode: "160025",
      coordinates: { type: "Point", coordinates: [76.7608, 30.7482] },
    },

    status: "Active",
    views: 48,
    leads: 6,
  },
  {
    title: "Premium 3BHK High-Rise Apartment in Zirakpur",
    description:
      "Spacious 3BHK in gated society on VIP Road, Zirakpur. Includes clubhouse access, gym and covered parking. Ideal for families.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1720, unit: "sqft" },

    ageOfProperty: 2,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "East",

    price: 39000,
    securityDeposit: 78000,
    pricePerSqft: 22,

    image: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1200&auto=format&fit=crop",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9814881122"],
    preferredContact: "Call",

    location: {
      address: "VIP Road High-Rise Society",
      city: "Zirakpur",
      sector: "VIP Road",
      state: "Punjab",
      country: "India",
      slug: "3bhk-vip-road-zirakpur",
      pincode: "140603",
      coordinates: { type: "Point", coordinates: [76.8156, 30.6425] },
    },

    status: "Active",
    views: 102,
    leads: 14,
  },
  {
    title: "Modern 2BHK Near IT Park, Panchkula Sector 20",
    description:
      "Well-maintained 2BHK apartment ideal for IT professionals working in Chandigarh IT Park. Peaceful locality with quick highway access.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1150, unit: "sqft" },

    ageOfProperty: 4,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "North",

    price: 26000,
    securityDeposit: 52000,
    pricePerSqft: 23,

    image: [
      "https://images.unsplash.com/photo-1600585154526-990dced4db0d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?q=80&w=1200&auto=format&fit=crop",
    ],

    negotiable: true,
    postedBy: "Agent",
    contactNumber: ["9876543321"],
    preferredContact: "Call",

    location: {
      address: "Sector 20",
      city: "Panchkula",
      sector: "Sector 20",
      state: "Haryana",
      country: "India",
      slug: "2bhk-sector-20-panchkula",
      pincode: "134116",
      coordinates: { type: "Point", coordinates: [76.8602, 30.6942] },
    },

    ownershipType: "Freehold",
    approvedBy: "MC",
    reraNumber: "HRERA-PKL-RENT-2023-091",

    facilities: {
      bedrooms: 2,
      bathrooms: 2,
      parkings: 1,
      securityFeatures: ["Gated", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 8,
    },

    nearbyPlaces: {
      hospitals: ["Ojas Hospital Panchkula"],
      malls: ["Elante Mall Chandigarh"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 76,
    leads: 9,
  },
  {
    title: "Luxury 3BHK in Sector 82, Mohali (JLPL Area)",
    description:
      "Premium high-rise apartment in emerging JLPL area of Sector 82 Mohali. Ideal for senior IT professionals and corporate families.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 1850, unit: "sqft" },

    ageOfProperty: 2,
    availability: "Ready to Move",
    furnishing: "Fully Furnished",
    facing: "East",

    price: 42000,
    securityDeposit: 84000,
    pricePerSqft: 23,

    image: [
      "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?q=80&w=1200&auto=format&fit=crop",
    ],

    negotiable: false,
    postedBy: "Agent",
    contactNumber: ["9814012233"],
    preferredContact: "Call",

    location: {
      address: "JLPL Road",
      city: "Mohali",
      sector: "Sector 82",
      state: "Punjab",
      country: "India",
      slug: "3bhk-sector-82-mohali",
      pincode: "160082",
      coordinates: { type: "Point", coordinates: [76.7205, 30.6521] },
    },

    ownershipType: "Freehold",
    approvedBy: "GMADA",
    reraNumber: "PBRERA-MHL-RENT-2024-118",

    facilities: {
      bedrooms: 3,
      bathrooms: 3,
      parkings: 2,
      securityFeatures: ["CCTV", "Gated", "Guard"],
      waterSupply: "Both",
      powerBackup: true,
      totalFloors: 18,
    },

    nearbyPlaces: {
      hospitals: ["Fortis Hospital Mohali"],
      malls: ["VR Punjab Mall"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: true,
    views: 143,
    leads: 18,
  },
  {
    title: "Affordable 1RK for Students – Sector 22, Chandigarh",
    description:
      "Compact 1RK ideal for single students or working professionals. Walking distance from markets and public transport.",
    deal: "Rent",
    type: "Residential",
    propertyCategory: "Apartment/Flat",

    area: { value: 380, unit: "sqft" },

    ageOfProperty: 18,
    availability: "Ready to Move",
    furnishing: "Semi Furnished",
    facing: "South",

    price: 9000,
    securityDeposit: 18000,
    pricePerSqft: 24,

    image: [
      "https://images.unsplash.com/photo-1494526585095-c41746248156?q=80&w=1200&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1505691938895-1758d7feb511?q=80&w=1200&auto=format&fit=crop",
    ],

    negotiable: true,
    postedBy: "Owner",
    contactNumber: ["9780004455"],
    preferredContact: "WhatsApp",

    location: {
      address: "Sector 22",
      city: "Chandigarh",
      sector: "Sector 22",
      state: "Chandigarh",
      country: "India",
      slug: "1rk-sector-22-chandigarh",
      pincode: "160022",
      coordinates: { type: "Point", coordinates: [76.7724, 30.7333] },
    },

    ownershipType: "Leasehold",
    approvedBy: "MC",
    reraNumber: "CHD-RENT-2015-077",

    facilities: {
      bedrooms: 1,
      bathrooms: 1,
      parkings: 0,
      securityFeatures: ["Gated"],
      waterSupply: "Municipal",
      powerBackup: false,
      totalFloors: 3,
    },

    nearbyPlaces: {
      hospitals: ["Government Medical College & Hospital Sector 32"],
      malls: ["Sector 17 Plaza"],
    },

    user: "699c10496d91a183d85aefba",
    status: "Active",
    isVerified: false,
    views: 41,
    leads: 5,
  },
];

export default properties;
