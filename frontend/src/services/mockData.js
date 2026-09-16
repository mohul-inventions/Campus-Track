// Mock fallback data for Vercel standalone preview when backend is not connected
export const mockCategories = [
  { category_id: 1, category_name: 'Electronics & Laptops', description: 'Laptops, tablets, chargers, and accessories', icon: 'Laptop' },
  { category_id: 2, category_name: 'Smartphones & Watches', description: 'Mobile phones, smartwatches, and fitness bands', icon: 'Smartphone' },
  { category_id: 3, category_name: 'Student ID & Access Cards', description: 'Campus RFID identity cards and library access tags', icon: 'CreditCard' },
  { category_id: 4, category_name: 'Wallets & Purses', description: 'Leather wallets, pouches, coin purses, and card holders', icon: 'Wallet' },
  { category_id: 5, category_name: 'Keys & Keychains', description: 'Hostel room keys, vehicle keys, and locker keys', icon: 'Key' },
  { category_id: 6, category_name: 'Bags & Backpacks', description: 'College backpacks, gym bags, and laptop sleeves', icon: 'Briefcase' },
  { category_id: 7, category_name: 'Books & Notebooks', description: 'Academic textbooks, lab manuals, and spiral notebooks', icon: 'Book' },
  { category_id: 8, category_name: 'Water Bottles & Tumblers', description: 'Stainless steel flasks, sippers, and bottles', icon: 'Coffee' },
  { category_id: 9, category_name: 'Eyewear & Sunglasses', description: 'Prescription spectacles and optical frames', icon: 'Glasses' },
  { category_id: 10, category_name: 'Sports & Fitness Equipment', description: 'Badminton racquets, basketballs, and athletic gear', icon: 'Dumbbell' }
];

export const mockLocations = [
  { location_id: 1, location_name: 'Central University Library', building: 'Library Complex', floor_zone: '2nd Floor Reading Hall' },
  { location_id: 2, location_name: 'Engineering Block 3', building: 'Academic Block B', floor_zone: 'Ground Floor Labs' },
  { location_id: 3, location_name: 'Main Student Cafeteria', building: 'Student Amenities Center', floor_zone: 'Food Court' },
  { location_id: 4, location_name: 'Indoor Sports Arena', building: 'Recreation Complex', floor_zone: 'Badminton Courts' },
  { location_id: 5, location_name: 'Computer Science Lab 4', building: 'IT Tower', floor_zone: '3rd Floor Lab Suite' },
  { location_id: 6, location_name: 'Campus Auditorium', building: 'Convocation Center', floor_zone: 'Main Hall' },
  { location_id: 7, location_name: 'Hostel Block A Common Room', building: 'Men\'s Residence A', floor_zone: '1st Floor' },
  { location_id: 8, location_name: 'Hostel Block C Lobby', building: 'Women\'s Residence C', floor_zone: 'Ground Lobby' },
  { location_id: 9, location_name: 'Chemistry Science Block', building: 'Natural Sciences', floor_zone: '2nd Floor Lab' },
  { location_id: 10, location_name: 'Administration Building', building: 'Registrar Building', floor_zone: 'Help Desk' }
];

export const mockStudentUser = {
  student_id: 1,
  reg_no: '2024CS101',
  full_name: 'Mohul Ramjee',
  email: 'student@campustrack.edu',
  phone: '+91 98765 43210',
  department: 'Computer Science & Engineering',
  role: 'student'
};

export const mockAdminUser = {
  student_id: 2,
  reg_no: 'ADMIN01',
  full_name: 'Chief Campus Administrator',
  email: 'admin@campustrack.edu',
  phone: '+91 91234 56789',
  department: 'Campus Security & Administration',
  role: 'admin'
};

export const mockLostItems = [
  {
    lost_id: 1,
    item_name: 'Dell XPS 15 Silver Laptop',
    category_id: 1,
    category_name: 'Electronics & Laptops',
    location_id: 1,
    location_name: 'Central University Library',
    building: 'Library Complex',
    brand: 'Dell',
    primary_color: 'Silver',
    date_lost: '2026-09-10',
    description: 'Silver Dell XPS laptop with CS sticker on palm rest and carbon fiber finish.',
    status: 'Matched',
    match_count: 1,
    reported_by: 'Mohul Ramjee',
    department: 'Computer Science & Engineering',
    created_at: '2026-09-10T14:30:00Z'
  },
  {
    lost_id: 2,
    item_name: 'Noise ColorFit Pro 4 Smartwatch',
    category_id: 2,
    category_name: 'Smartphones & Watches',
    location_id: 4,
    location_name: 'Indoor Sports Arena',
    building: 'Recreation Complex',
    brand: 'Noise',
    primary_color: 'Black',
    date_lost: '2026-09-11',
    description: 'Black smartwatch with silicone strap and small scratch near top right bezel.',
    status: 'Lost',
    match_count: 0,
    reported_by: 'Mohul Ramjee',
    department: 'Computer Science & Engineering',
    created_at: '2026-09-11T16:00:00Z'
  },
  {
    lost_id: 3,
    item_name: 'Campus RFID Student ID Card',
    category_id: 3,
    category_name: 'Student ID & Access Cards',
    location_id: 3,
    location_name: 'Main Student Cafeteria',
    building: 'Student Amenities Center',
    brand: 'University ID',
    primary_color: 'Blue',
    date_lost: '2026-09-12',
    description: 'Blue student ID lanyard with registration number ending in 101.',
    status: 'Lost',
    match_count: 0,
    reported_by: 'Mohul Ramjee',
    department: 'Computer Science & Engineering',
    created_at: '2026-09-12T09:15:00Z'
  }
];

export const mockFoundItems = [
  {
    found_id: 1,
    item_name: 'Dell XPS 15 Silver Laptop',
    category_id: 1,
    category_name: 'Electronics & Laptops',
    location_id: 1,
    location_name: 'Central University Library',
    building: 'Library Complex',
    brand: 'Dell',
    primary_color: 'Silver',
    date_found: '2026-09-10',
    description: 'Silver Dell XPS laptop found on reading table. Has CS department sticker on top.',
    storage_location: 'Central Library Front Desk Locker 3',
    status: 'Matched',
    reported_by: 'Ananya Sharma',
    created_at: '2026-09-10T17:45:00Z'
  },
  {
    found_id: 2,
    item_name: 'Stainless Steel Milton Water Bottle',
    category_id: 8,
    category_name: 'Water Bottles & Tumblers',
    location_id: 2,
    location_name: 'Engineering Block 3',
    building: 'Academic Block B',
    brand: 'Milton',
    primary_color: 'Silver',
    date_found: '2026-09-11',
    description: 'Silver 1-liter thermo steel bottle found in CAD Lab.',
    storage_location: 'Security Desk Block B',
    status: 'Found',
    reported_by: 'Rohan Verma',
    created_at: '2026-09-11T11:20:00Z'
  }
];

export const mockMatches = [
  {
    match_id: 1,
    score: 100,
    match_status: 'Suggested',
    created_at: '2026-09-10T18:00:00Z',
    lost_id: 1,
    lost_name: 'Dell XPS 15 Silver Laptop',
    lost_brand: 'Dell',
    lost_color: 'Silver',
    lost_status: 'Matched',
    lost_by_name: 'Mohul Ramjee',
    found_id: 1,
    found_name: 'Dell XPS 15 Silver Laptop',
    found_brand: 'Dell',
    found_color: 'Silver',
    found_status: 'Matched',
    found_by_name: 'Ananya Sharma',
    storage_location: 'Central Library Front Desk Locker 3',
    category_name: 'Electronics & Laptops',
    lost_location_name: 'Central University Library',
    found_location_name: 'Central University Library',
    score_breakdown: {
      category_score: 25,
      location_score: 25,
      color_score: 15,
      brand_score: 15,
      description_score: 10,
      date_score: 10,
      total_score: 100
    }
  }
];

export const mockClaims = [
  {
    claim_id: 1,
    match_id: 1,
    lost_id: 1,
    found_id: 1,
    claimant_id: 1,
    claimant_name: 'Mohul Ramjee',
    claimant_email: 'student@campustrack.edu',
    claimant_reg_no: '2024CS101',
    claimant_department: 'Computer Science & Engineering',
    lost_name: 'Dell XPS 15 Silver Laptop',
    found_name: 'Dell XPS 15 Silver Laptop',
    storage_location: 'Central Library Front Desk Locker 3',
    category_name: 'Electronics & Laptops',
    location_name: 'Central University Library',
    claim_description: 'I forgot my laptop at the Central Library 2nd floor reading hall yesterday evening.',
    identifying_marks: 'Dell XPS 15, Silver, CS department sticker on palm rest, space nebula wallpaper.',
    proof_details: 'Can unlock laptop with student PIN 8841 and produce original invoice.',
    claim_status: 'Pending',
    admin_remarks: null,
    created_at: '2026-09-11T09:00:00Z'
  }
];

export const mockDashboard = {
  kpis: {
    totalStudents: 16,
    totalLost: 22,
    totalFound: 22,
    pendingMatches: 6,
    pendingClaims: 4,
    returnedItems: 5,
    resolutionRate: 23
  },
  charts: {
    categoryDistribution: [
      { category_name: 'Electronics & Laptops', lost_count: 6, found_count: 5 },
      { category_name: 'Student ID & Access Cards', lost_count: 5, found_count: 4 },
      { category_name: 'Smartphones & Watches', lost_count: 4, found_count: 4 },
      { category_name: 'Wallets & Purses', lost_count: 3, found_count: 3 },
      { category_name: 'Keys & Keychains', lost_count: 2, found_count: 3 },
      { category_name: 'Water Bottles & Tumblers', lost_count: 2, found_count: 3 }
    ],
    locationDistribution: [
      { location_name: 'Central University Library', building: 'Library Complex', lost_count: 7, found_count: 6 },
      { location_name: 'Main Student Cafeteria', building: 'Student Amenities Center', lost_count: 5, found_count: 4 },
      { location_name: 'Engineering Block 3', building: 'Academic Block B', lost_count: 4, found_count: 4 },
      { location_name: 'Indoor Sports Arena', building: 'Recreation Complex', lost_count: 3, found_count: 3 },
      { location_name: 'Computer Science Lab 4', building: 'IT Tower', lost_count: 3, found_count: 5 }
    ],
    statusDistribution: [
      { status: 'Lost', count: 16 },
      { status: 'Found', count: 17 },
      { status: 'Matched', count: 6 },
      { status: 'Claimed', count: 5 }
    ]
  },
  recentActivity: [
    { type: 'CLAIM', id: 1, title: 'Claim on: Dell XPS 15 Silver Laptop', status: 'Pending', person: 'Mohul Ramjee', created_at: '2026-09-11T09:00:00Z' },
    { type: 'FOUND', id: 2, title: 'Stainless Steel Milton Water Bottle', status: 'Found', person: 'Rohan Verma', created_at: '2026-09-11T11:20:00Z' },
    { type: 'LOST', id: 2, title: 'Noise ColorFit Pro 4 Smartwatch', status: 'Lost', person: 'Mohul Ramjee', created_at: '2026-09-11T16:00:00Z' },
    { type: 'LOST', id: 1, title: 'Dell XPS 15 Silver Laptop', status: 'Matched', person: 'Mohul Ramjee', created_at: '2026-09-10T14:30:00Z' },
    { type: 'FOUND', id: 1, title: 'Dell XPS 15 Silver Laptop', status: 'Matched', person: 'Ananya Sharma', created_at: '2026-09-10T17:45:00Z' }
  ]
};

export const mockAuditLogs = [
  { log_id: 1, entity_type: 'CLAIM', entity_id: 1, old_status: 'Pending', new_status: 'Approved', changer_name: 'Chief Campus Administrator', changer_role: 'admin', change_notes: 'Claim approved via ACID transaction. Records synchronized.', timestamp: '2026-09-11T10:00:00Z' },
  { log_id: 2, entity_type: 'FOUND', entity_id: 1, old_status: 'Matched', new_status: 'Claimed', changer_name: 'Chief Campus Administrator', changer_role: 'admin', change_notes: 'Status updated from Matched to Claimed', timestamp: '2026-09-11T10:00:00Z' },
  { log_id: 3, entity_type: 'LOST', entity_id: 1, old_status: 'Matched', new_status: 'Claimed', changer_name: 'Chief Campus Administrator', changer_role: 'admin', change_notes: 'Status updated from Matched to Claimed', timestamp: '2026-09-11T10:00:00Z' },
  { log_id: 4, entity_type: 'LOST', entity_id: 1, old_status: 'Lost', new_status: 'Matched', changer_name: 'Mohul Ramjee', changer_role: 'student', change_notes: 'Automated match calculated by 100-point engine', timestamp: '2026-09-10T18:00:00Z' }
];
