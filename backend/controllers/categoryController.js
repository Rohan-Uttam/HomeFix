// backend/controllers/categoryController.js

// Static categories list (future me DB se aa sakta hai)
export const CATEGORIES = [
  {
    key: "home-maintenance",
    label: "Home Maintenance",
    subcategories: [
      "Plumber",
      "Electrician",
      "Carpenter",
      "Painter",
      "AC Technician",
      "Refrigerator Repair",
      "Washing Machine Repair",
      "RO/Water Purifier Technician",
      "Geyser Repair",
      "Gas Stove / Chimney Repair",
      "Pest Control",
      "Mason / Civil Work",
    ],
  },
  {
    key: "cleaning-household",
    label: "Cleaning & Household",
    subcategories: [
      "House Cleaning",
      "Bathroom Cleaning",
      "Kitchen Cleaning",
      "Sofa / Carpet Cleaning",
      "Water Tank Cleaning",
      "Garbage Disposal",
      "Laundry / Ironing Services",
      "Domestic Maid",
    ],
  },
  {
    key: "beauty-wellness",
    label: "Beauty & Wellness",
    subcategories: [
      "Beautician",
      "Hairdresser / Barber",
      "Makeup Artist",
      "Spa / Massage Therapist",
      "Mehendi Artist",
      "Nail Technician",
    ],
  },
  {
    key: "transport-driver",
    label: "Transport & Driver",
    subcategories: [
      "Driver on Demand",
      "Mini Truck / Shifting",
      "Movers & Packers",
      "Delivery Boy",
    ],
  },
  {
    key: "personal-care",
    label: "Personal Care & Support",
    subcategories: [
      "Babysitter / Nanny",
      "Elderly Caregiver",
      "Patient Attendant",
      "Cook / Chef",
      "Pet Care",
    ],
  },
  {
    key: "education-coaching",
    label: "Education & Coaching",
    subcategories: [
      "Home Tutor",
      "Music Teacher",
      "Dance Teacher",
      "Yoga Instructor",
      "Fitness Trainer",
    ],
  },
  {
    key: "tech-appliances",
    label: "Tech & Appliances",
    subcategories: [
      "Mobile Repair",
      "Laptop / Computer Repair",
      "CCTV Installation",
      "Wi-Fi Technician",
      "Printer Repair",
    ],
  },
  {
    key: "outdoor-others",
    label: "Outdoor & Others",
    subcategories: [
      "Gardener",
      "Car Washer",
      "Bike Mechanic",
      "Car Mechanic",
      "Event Helper / Labor",
      "Security Guard",
      "Photographer",
      "Tailor / Stitching",
    ],
  },
];

/**
 * @route GET /api/categories
 * @desc Return categories with subcategories
 */
export const getCategories = (req, res) => {
  res.json({ success: true, data: CATEGORIES });
};
