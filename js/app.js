/**
 * TUNTUN COFFEE & CAFE POS - Engine Logic
 * Pure Cafe Focus: Full-page Management with Left Sidebar,
 * 7-Day Sales & Peak Hours Charts, Cart Item Modifier Editing,
 * Daily Sequence Orders (#001, #002...),
 * 1-by-1 Cup Sticker Label Carousel & Thermal Printing,
 * Flexible Date Range Finance & Drink Photo Upload.
 */

// --- UTILITIES ---
function formatRupiah(amount) {
  if (isNaN(amount)) amount = 0;
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount).replace(/\s+/g, ' ');
}

function formatDate(date) {
  return new Intl.DateTimeFormat('id-ID', {
    dateStyle: 'medium',
    timeStyle: 'short'
  }).format(new Date(date));
}

function formatTime(date) {
  const d = new Date(date);
  return d.getHours().toString().padStart(2, '0') + ':' + d.getMinutes().toString().padStart(2, '0') + ' WIB';
}

// --- PRESET COFFEE IMAGES (Curated Aesthetic Cafe Photos) ---
const PresetPhotos = [
  { name: 'Iced Aren Latte', url: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80' },
  { name: 'Matcha Latte', url: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80' },
  { name: 'Hot Cappuccino', url: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80' },
  { name: 'Iced Americano', url: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=500&q=80' },
  { name: 'Caramel Macchiato', url: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80' },
  { name: 'Butter Croissant', url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=80' },
  { name: 'Chocolate Pastry', url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=80' },
  { name: 'Beef Burger Toast', url: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=500&q=80' }
];

// --- APPLICATION STATE ---
const State = {
  currentMainView: 'pos', // 'pos', 'orders', 'management'
  currentMgmtSubPane: 'dashboard', // 'dashboard', 'keuangan', 'produk', 'promosi', 'shift', 'crm', 'kds', 'retur', 'cabang', 'ai', 'pengaturan'
  selectedCategory: 'Semua Menu',
  searchQuery: '',
  orderType: 'Langsung',
  tableNumber: '-',
  selectedCustomer: null,
  appliedPromo: null,

  // Active Store Session (Multi-Tenant by ID: Toko Utama SAADAH)
  activeStore: {
    id: 'SAADAH',
    name: "Caffee Sa'adah (Pusat)",
    password: '',
    address: "Coffee, Cake & Bread • Halal Indonesia",
    footer: "Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah"
  },

  // Active Cart
  cart: [],

  // Cart item currently being edited in modifier modal (-1 if adding new)
  editingCartIndex: -1,

  // Invoice of existing order being edited/recalled into cart (null if new order)
  editingOrderInvoice: null,

  // Target Order for Printing & Sticker Carousel
  activePrintOrder: null,
  activeCupStickers: [],
  currentStickerIndex: 0,

  // Product currently being edited for photo
  editingProduct: null,

  // Cafe Categories (Sesuai Menu Caffee Sa'adah)
  categories: [
    { name: 'Semua Menu', icon: 'fa-table-cells' },
    { name: 'CS Signature', icon: 'fa-crown' },
    { name: 'Coffee', icon: 'fa-mug-hot' },
    { name: 'Coffee Flavour Series', icon: 'fa-wand-magic-sparkles' },
    { name: 'Chocolate Base', icon: 'fa-cookie-bite' },
    { name: 'Redvelvet Base', icon: 'fa-heart' },
    { name: 'Matcha Base', icon: 'fa-leaf' },
    { name: 'Squash Base', icon: 'fa-martini-glass-citrus' },
    { name: 'Milk Base', icon: 'fa-glass-water' },
    { name: 'Americano Series', icon: 'fa-cubes-stacked' }
  ],

  // Products Database (Lengkap dari Buku Menu Asli Caffee Sa'adah)
  products: [
    // --- 1. CS SIGNATURE ---
    {
      id: 'SIG-01',
      name: 'Aren Butter Sea Salt',
      category: 'CS Signature',
      sku: 'CS-SIG-01',
      costPrice: 7500,
      price: 18000,
      stock: 120,
      unit: 'cup',
      desc: 'Espresso blend, fresh milk, aren organik, dengan topping butter sea salt cream foam gurih',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'SIG-02',
      name: 'Brown Butter Pandan',
      category: 'CS Signature',
      sku: 'CS-SIG-02',
      costPrice: 6500,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Espresso wangi pandan alami bercampur gurihnya brown butter dan susu segar',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'SIG-03',
      name: 'Aren Latte',
      category: 'CS Signature',
      sku: 'CS-SIG-03',
      costPrice: 6000,
      price: 15000,
      stock: 150,
      unit: 'cup',
      desc: 'Kopi susu gula aren signature Saadah dengan rasa manis legit seimbang',
      image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'SIG-04',
      name: 'Nutty Tiramisu Latte',
      category: 'CS Signature',
      sku: 'CS-SIG-04',
      costPrice: 6500,
      price: 15000,
      stock: 90,
      unit: 'cup',
      desc: 'Espresso lembut beraroma biskuit nutty tiramisu khas Italia',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'SIG-05',
      name: 'Butterscotch Sea Salt',
      category: 'CS Signature',
      sku: 'CS-SIG-05',
      costPrice: 7500,
      price: 18000,
      stock: 95,
      unit: 'cup',
      desc: 'Saus butterscotch karamel mentega berpadu taburan sea salt dan susu dingin',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'SIG-06',
      name: 'Biscoff Lotus Latte',
      category: 'CS Signature',
      sku: 'CS-SIG-06',
      costPrice: 8500,
      price: 20000,
      stock: 80,
      unit: 'cup',
      desc: 'Kopi susu dengan olesan selai Lotus Biscoff karamel dan taburan remah biskuit renyah',
      image: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'SIG-07',
      name: 'Cheesecake Strawberry',
      category: 'CS Signature',
      sku: 'CS-SIG-07',
      costPrice: 6500,
      price: 15000,
      stock: 85,
      unit: 'cup',
      desc: 'Creamy cheesecake foam berpadu selai strawberry segar dan susu manis gurih',
      image: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'SIG-08',
      name: 'Honey Latte',
      category: 'CS Signature',
      sku: 'CS-SIG-08',
      costPrice: 6000,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Kopi susu lembut dimaniskan dengan madu murni alami tanpa gula tambahan',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },

    // --- 2. COFFEE ---
    {
      id: 'COF-01',
      name: 'Americano',
      category: 'Coffee',
      sku: 'CS-COF-01',
      costPrice: 4000,
      price: 13000,
      stock: 200,
      unit: 'cup',
      desc: 'Double shot espresso hitam murni dengan profil rasa bold & aromatik',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'COF-02',
      name: 'Caffè Latte',
      category: 'Coffee',
      sku: 'CS-COF-02',
      costPrice: 6000,
      price: 15000,
      stock: 140,
      unit: 'cup',
      desc: 'Espresso seimbang dengan perpaduan fresh milk steamed yang gurih lembut',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'COF-03',
      name: 'Cappuccino',
      category: 'Coffee',
      sku: 'CS-COF-03',
      costPrice: 6000,
      price: 15000,
      stock: 130,
      unit: 'cup',
      desc: 'Espresso dengan foam susu tebal dan taburan bubuk cokelat di atasnya',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'COF-04',
      name: 'Caffè Mocha',
      category: 'Coffee',
      sku: 'CS-COF-04',
      costPrice: 6500,
      price: 15000,
      stock: 110,
      unit: 'cup',
      desc: 'Perpaduan espresso kopi, dark chocolate premium, dan fresh milk gurih',
      image: 'https://images.unsplash.com/photo-1578314675249-a6910f80cc4e?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'COF-05',
      name: 'Coffee Matcha',
      category: 'Coffee',
      sku: 'CS-COF-05',
      costPrice: 6500,
      price: 15000,
      stock: 90,
      unit: 'cup',
      desc: 'Kombinasi unik lapisan matcha hijau Jepang, espresso kopi, dan susu dingin',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'COF-06',
      name: 'Spanish Latte',
      category: 'Coffee',
      sku: 'CS-COF-06',
      costPrice: 6500,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Espresso dengan susu kental manis dan fresh milk cita rasa Spanyol',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'COF-07',
      name: 'Aren Caramel Latte',
      category: 'Coffee',
      sku: 'CS-COF-07',
      costPrice: 6500,
      price: 15000,
      stock: 120,
      unit: 'cup',
      desc: 'Paduan gula aren alami dengan drizzle sirup karamel manis harum',
      image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'COF-08',
      name: 'Pistasio Latte',
      category: 'Coffee',
      sku: 'CS-COF-08',
      costPrice: 6500,
      price: 15000,
      stock: 85,
      unit: 'cup',
      desc: 'Espresso kopi susu dengan cita rasa kacang pistachio lembut khas timur tengah',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'COF-09',
      name: 'Caramel Macchiato',
      category: 'Coffee',
      sku: 'CS-COF-09',
      costPrice: 7000,
      price: 17000,
      stock: 105,
      unit: 'cup',
      desc: 'Susu vanilla dingin ditandai shot espresso pekat dan sirup karamel di atasnya',
      image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },

    // --- 3. COFFEE FLAVOUR SERIES ---
    {
      id: 'FLV-01',
      name: 'Coffee Cheesecake',
      category: 'Coffee Flavour Series',
      sku: 'CS-FLV-01',
      costPrice: 6500,
      price: 15000,
      stock: 90,
      unit: 'cup',
      desc: 'Kopi susu dengan sentuhan rasa krim cheesecake manis gurih',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'FLV-02',
      name: 'Coffee Strawberry',
      category: 'Coffee Flavour Series',
      sku: 'CS-FLV-02',
      costPrice: 6500,
      price: 15000,
      stock: 85,
      unit: 'cup',
      desc: 'Espresso berpadu sari buah strawberry segar dan susu dingin',
      image: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'FLV-03',
      name: 'Coffee Hazelnut',
      category: 'Coffee Flavour Series',
      sku: 'CS-FLV-03',
      costPrice: 6500,
      price: 15000,
      stock: 115,
      unit: 'cup',
      desc: 'Kopi susu beraroma kacang hazelnut panggang yang wangi dan lembut',
      image: 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'FLV-04',
      name: 'Coffee Vanilla',
      category: 'Coffee Flavour Series',
      sku: 'CS-FLV-04',
      costPrice: 6000,
      price: 15000,
      stock: 120,
      unit: 'cup',
      desc: 'Kopi susu manis lembut berpadu ekstrak vanilla harum klasik',
      image: 'https://images.unsplash.com/photo-1534778101976-62847782c213?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'FLV-05',
      name: 'Coffee Tiramisu',
      category: 'Coffee Flavour Series',
      sku: 'CS-FLV-05',
      costPrice: 6500,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Kopi susu bercita rasa cake tiramisu khas kafe',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'FLV-06',
      name: 'Coffee Pandan',
      category: 'Coffee Flavour Series',
      sku: 'CS-FLV-06',
      costPrice: 6000,
      price: 15000,
      stock: 110,
      unit: 'cup',
      desc: 'Kopi susu bercita rasa wangi daun pandan nusantara segar',
      image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'FLV-07',
      name: 'Coffee Caramel',
      category: 'Coffee Flavour Series',
      sku: 'CS-FLV-07',
      costPrice: 6500,
      price: 15000,
      stock: 115,
      unit: 'cup',
      desc: 'Kopi susu manis legit dengan saus sirup karamel gurih',
      image: 'https://images.unsplash.com/photo-1485808191679-5f86510681a2?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'FLV-08',
      name: 'Mix 2 Flavour',
      category: 'Coffee Flavour Series',
      sku: 'CS-FLV-08',
      costPrice: 6500,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Bebas pilih kombinasi 2 rasa sirup favorit Anda dalam satu cup',
      image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },

    // --- 4. CHOCOLATE BASE ---
    {
      id: 'CHO-01',
      name: 'Classic Chocolate',
      category: 'Chocolate Base',
      sku: 'CS-CHO-01',
      costPrice: 6000,
      price: 15000,
      stock: 140,
      unit: 'cup',
      desc: 'Cokelat klasik premium kental kaya rasa tanpa kopi',
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'CHO-02',
      name: 'Choco Cheesecake',
      category: 'Chocolate Base',
      sku: 'CS-CHO-02',
      costPrice: 6500,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Cokelat pekat berpadu rasa cheesecake gurih manis',
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'CHO-03',
      name: 'Choco Tiramisu',
      category: 'Chocolate Base',
      sku: 'CS-CHO-03',
      costPrice: 6500,
      price: 15000,
      stock: 95,
      unit: 'cup',
      desc: 'Cokelat susu dengan aroma tiramisu khas dessert kafe',
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'CHO-04',
      name: 'Choco Hazelnut',
      category: 'Chocolate Base',
      sku: 'CS-CHO-04',
      costPrice: 6500,
      price: 15000,
      stock: 110,
      unit: 'cup',
      desc: 'Cokelat lezat dipadu sirup kacang hazelnut harum gurih',
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'CHO-05',
      name: 'Choco Pistasio',
      category: 'Chocolate Base',
      sku: 'CS-CHO-05',
      costPrice: 6500,
      price: 15000,
      stock: 90,
      unit: 'cup',
      desc: 'Cokelat susu dengan sensasi aroma kacang pistachio istimewa',
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },

    // --- 5. REDVELVET BASE ---
    {
      id: 'RED-01',
      name: 'Classic Red Velvet',
      category: 'Redvelvet Base',
      sku: 'CS-RED-01',
      costPrice: 6000,
      price: 15000,
      stock: 120,
      unit: 'cup',
      desc: 'Red velvet klasik lembut dengan cita rasa kue manis memikat',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'RED-02',
      name: 'Redvelt Cheesecake',
      category: 'Redvelvet Base',
      sku: 'CS-RED-02',
      costPrice: 6500,
      price: 15000,
      stock: 95,
      unit: 'cup',
      desc: 'Red velvet creamy berpadu keju cheesecake gurih',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'RED-03',
      name: 'Redvelt Vanilla',
      category: 'Redvelvet Base',
      sku: 'CS-RED-03',
      costPrice: 6000,
      price: 15000,
      stock: 90,
      unit: 'cup',
      desc: 'Red velvet wangi vanilla manis dengan warna merah ruby cantik',
      image: 'https://images.unsplash.com/photo-1589301760014-d929f3979dbc?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },

    // --- 6. MATCHA BASE ---
    {
      id: 'MTC-01',
      name: 'Classic Matcha',
      category: 'Matcha Base',
      sku: 'CS-MTC-01',
      costPrice: 6000,
      price: 15000,
      stock: 130,
      unit: 'cup',
      desc: 'Matcha hijau Jepang murni dikocok dengan fresh milk dingin',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'MTC-02',
      name: 'Matcha Cheesecake',
      category: 'Matcha Base',
      sku: 'CS-MTC-02',
      costPrice: 6500,
      price: 15000,
      stock: 90,
      unit: 'cup',
      desc: 'Matcha latte gurih dipadu busa keju cheesecake lembut',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'MTC-03',
      name: 'Matcha Palm Sugar',
      category: 'Matcha Base',
      sku: 'CS-MTC-03',
      costPrice: 6000,
      price: 15000,
      stock: 110,
      unit: 'cup',
      desc: 'Matcha latte berpadu manis legitnya gula aren alami',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'MTC-04',
      name: 'Matcha Strawberry',
      category: 'Matcha Base',
      sku: 'CS-MTC-04',
      costPrice: 6500,
      price: 15000,
      stock: 95,
      unit: 'cup',
      desc: 'Gradasi matcha hijau dan sari strawberry merah yang segar',
      image: 'https://images.unsplash.com/photo-1536256263959-770b48d82b0a?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },

    // --- 7. SQUASH BASE ---
    {
      id: 'SQS-01',
      name: 'Squash Lecy',
      category: 'Squash Base',
      sku: 'CS-SQS-01',
      costPrice: 5000,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Minuman soda leci berkarbonasi dingin pelepas dahaga seketika',
      image: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'SQS-02',
      name: 'Squash Strawberry',
      category: 'Squash Base',
      sku: 'CS-SQS-02',
      costPrice: 5000,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Soda segar berpadu sari strawberry asam manis segar',
      image: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },

    // --- 8. MILK BASE ---
    {
      id: 'MLK-01',
      name: 'Milk Butterscotch',
      category: 'Milk Base',
      sku: 'CS-MLK-01',
      costPrice: 7000,
      price: 18000,
      stock: 90,
      unit: 'cup',
      desc: 'Susu segar gurih dipadu saus butterscotch karamel mentega',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'MLK-02',
      name: 'Milk Strawberry',
      category: 'Milk Base',
      sku: 'CS-MLK-02',
      costPrice: 6000,
      price: 15000,
      stock: 110,
      unit: 'cup',
      desc: 'Susu segar manis berpadu selai strawberry asam manis creamy',
      image: 'https://images.unsplash.com/photo-1553787499-6f9133860278?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'MLK-03',
      name: 'Milk Pandan',
      category: 'Milk Base',
      sku: 'CS-MLK-03',
      costPrice: 5500,
      price: 15000,
      stock: 105,
      unit: 'cup',
      desc: 'Susu segar wangi pandan alami nikmat dingin',
      image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'MLK-04',
      name: 'Milo Dino',
      category: 'Milk Base',
      sku: 'CS-MLK-04',
      costPrice: 6000,
      price: 15000,
      stock: 125,
      unit: 'cup',
      desc: 'Es susu Milo pekat dengan taburan bubuk cokelat Milo melimpah di atasnya',
      image: 'https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },

    // --- 9. AMERICANO SERIES ---
    {
      id: 'AMS-01',
      name: 'Americano Lecy',
      category: 'Americano Series',
      sku: 'CS-AMS-01',
      costPrice: 5000,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Espresso Americano dingin berpadu sirup leci aromatik yang menyegarkan',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    },
    {
      id: 'AMS-02',
      name: 'Americano Strawberry',
      category: 'Americano Series',
      sku: 'CS-AMS-02',
      costPrice: 5000,
      price: 15000,
      stock: 100,
      unit: 'cup',
      desc: 'Espresso Americano dingin dipadu sari strawberry manis asam nikmat',
      image: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=500&q=80',
      hasModifiers: true
    }
  ],

  // Modifier Groups for Cafe (Sesuai Ukuran, Suhu, Rasa & Extra di Buku Menu)
  modifierGroups: [
    {
      id: 'size',
      title: 'Pilihan Ukuran Gelas',
      required: true,
      options: [
        { id: 'sz1', name: 'Regular (Iced / Hot)', shortCode: 'Reg', extra: 0, default: true },
        { id: 'sz2', name: 'Large (+7K)', shortCode: 'Large', extra: 7000 },
        { id: 'sz3', name: '1 Liter Bottle (+40K)', shortCode: '1L', extra: 40000 }
      ]
    },
    {
      id: 'temp',
      title: 'Penyajian Suhu',
      required: true,
      options: [
        { id: 't1', name: 'Iced (Dingin)', shortCode: 'Iced', extra: 0, default: true },
        { id: 't2', name: 'Hot (Panas)', shortCode: 'Hot', extra: 0 }
      ]
    },
    {
      id: 'sugar',
      title: 'Tingkat Kemanisan (Sugar Level)',
      required: false,
      options: [
        { id: 's1', name: 'Normal Sugar (100%)', shortCode: 'Normal Sugar', extra: 0, default: true },
        { id: 's2', name: 'Less Sugar (50%)', shortCode: 'Less Sugar 50%', extra: 0 },
        { id: 's3', name: 'Low Sugar (25%)', shortCode: 'Low Sugar 25%', extra: 0 },
        { id: 's4', name: 'No Sugar (0%)', shortCode: 'No Sugar', extra: 0 }
      ]
    },
    {
      id: 'ice',
      title: 'Tingkat Es (Ice Level)',
      required: false,
      options: [
        { id: 'i1', name: 'Normal Ice', shortCode: 'Normal Ice', extra: 0, default: true },
        { id: 'i2', name: 'Less Ice', shortCode: 'Less Ice', extra: 0 },
        { id: 'i3', name: 'No Ice', shortCode: 'No Ice', extra: 0 },
        { id: 'i4', name: 'Extra Ice', shortCode: 'Extra Ice', extra: 0 }
      ]
    },
    {
      id: 'extra',
      title: 'Tambahan / Extra (Sesuai Menu)',
      required: false,
      multi: true,
      options: [
        { id: 'e1', name: 'Espresso Shot (+5K)', shortCode: '+Espresso', extra: 5000 },
        { id: 'e2', name: 'Syrup Flavour (+5K)', shortCode: '+Syrup', extra: 5000 },
        { id: 'e3', name: 'Simple Syrup (+1K)', shortCode: '+SimpleSyrup', extra: 1000 },
        { id: 'e4', name: 'Sauce Caramel (+2K)', shortCode: '+Caramel', extra: 2000 }
      ]
    }
  ],

  // Customers
  customers: [
    {
      id: 'C01',
      name: 'Ahmad Fauzi',
      phone: '08129881234',
      tier: 'Gold',
      tierDiscount: 8,
      points: 840,
      deposit: 150000,
      pref: 'Aren Butter Sea Salt, Less Sugar 50%'
    },
    {
      id: 'C02',
      name: 'Dewi Lestari',
      phone: '08571234567',
      tier: 'Silver',
      tierDiscount: 5,
      points: 320,
      deposit: 50000,
      pref: 'Matcha Strawberry, Less Ice'
    },
    {
      id: 'C03',
      name: 'Budi Santoso (Member VIP)',
      phone: '08139988776',
      tier: 'Platinum',
      tierDiscount: 12,
      points: 1850,
      deposit: 450000,
      pref: 'Americano Double Shot, Tanpa Gula'
    }
  ],

  // Employees / Tim Karyawan & Pemilik Kafe
  employees: [
    { id: 'E01', name: 'Syukri', role: 'Pemilik (Owner)', phone: '0812-1111-2222', pin: '1111' },
    { id: 'E02', name: 'Ardan', role: 'Pemilik (Owner)', phone: '0813-3333-4444', pin: '2222' },
    { id: 'E03', name: 'Karyawan 1', role: 'Kasir & Barista', phone: '0857-5555-6666', pin: '1234' }
  ],

  // Promotions
  promotions: [
    { code: 'SAADAHHEMAT', name: 'Voucher Opening Kafe Saadah (Rp 10.000)', type: 'fixed', value: 10000, minSpend: 40000 },
    { code: 'HAPPYHOUR', name: 'Happy Hour Coffee Time (15%)', type: 'percent', value: 15, minSpend: 30000 }
  ],

  // Orders History (Fresh Start: Bersih 0 Pesanan untuk Toko Baru Launching)
  dailyOrders: [],

  // Shift & Drawer (Fresh Start: Modal awal Rp 250.000, Penjualan Rp 0)
  currentShift: {
    id: 'SH-001',
    name: 'Shift Pagi (07:00 - 15:00 WIB)',
    cashierName: 'Karyawan 1',
    initialCash: 250000,
    totalCashSales: 0,
    totalQrisSales: 0,
    totalBankSales: 0,
    movements: []
  },

  // Operational Expenses for Finance (Fresh Start: Rp 0)
  expenses: []
};

// --- MASTER TEMPLATES UNTUK CLONING TOKO MULTI-TENANT ---
// Semua toko baru yang diregistrasi otomatis mendapatkan resep, menu kopi, dan kategori lengkap yang sama!
let MasterDefaultProducts = [];
let MasterDefaultCategories = [];
let MasterDefaultPromotions = [];

try {
  MasterDefaultProducts = JSON.parse(JSON.stringify(State.products));
  MasterDefaultCategories = JSON.parse(JSON.stringify(State.categories));
  MasterDefaultPromotions = JSON.parse(JSON.stringify(State.promotions));
} catch (e) {
  console.warn('Gagal menyiapkan master template:', e);
}

// --- 0. MULTI-STORE REGISTRY & ISOLATION SYSTEM ---
function getStoreRegistry() {
  try {
    const raw = localStorage.getItem('tuntun_stores_registry');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.length > 0) return list;
    }
  } catch (e) {}

  const defaultRegistry = [
    {
      id: 'SAADAH',
      name: "Caffee Sa'adah (Pusat)",
      password: '',
      address: "Coffee, Cake & Bread • Halal Indonesia",
      footer: "Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah",
      createdAt: '2026-10-28T00:00:00.000Z'
    }
  ];
  saveStoreRegistry(defaultRegistry);
  return defaultRegistry;
}

function saveStoreRegistry(list) {
  try {
    localStorage.setItem('tuntun_stores_registry', JSON.stringify(list));
  } catch (e) {
    console.warn('Gagal menyimpan registry toko:', e);
  }
}

function findStoreById(id) {
  if (!id) return null;
  const target = id.trim().toUpperCase();
  const list = getStoreRegistry();
  return list.find(s => (s.id || '').toUpperCase() === target) || null;
}

function updateStoreHeaderUI() {
  const store = State.activeStore || { id: 'SAADAH', name: "Caffee Sa'adah (Pusat)" };
  const storeIdEl = document.getElementById('headerStoreId');
  const storeNameEl = document.getElementById('headerStoreName');
  const settingsIdEl = document.getElementById('settingsActiveStoreId');
  const settingsNameEl = document.getElementById('settingsActiveStoreName');

  if (storeIdEl) storeIdEl.innerText = `ID: ${store.id}`;
  if (storeNameEl) storeNameEl.innerText = store.name;
  if (settingsIdEl) settingsIdEl.innerText = store.id;
  if (settingsNameEl) settingsNameEl.innerText = store.name;
}

// Simpan data toko yang sedang aktif ke namespace localStorage
function saveAppState() {
  setTimeout(pushStoreStateToServer, 50);
  const store = State.activeStore || { id: 'SAADAH', name: "Caffee Sa'adah (Pusat)" };
  const id = (store.id || 'SAADAH').toUpperCase();

  try {
    localStorage.setItem(`tuntun_${id}_daily_orders`, JSON.stringify(State.dailyOrders));
    localStorage.setItem(`tuntun_${id}_products`, JSON.stringify(State.products));
    localStorage.setItem(`tuntun_${id}_categories`, JSON.stringify(State.categories));
    localStorage.setItem(`tuntun_${id}_expenses`, JSON.stringify(State.expenses));
    localStorage.setItem(`tuntun_${id}_current_shift`, JSON.stringify(State.currentShift));
    localStorage.setItem(`tuntun_${id}_customers`, JSON.stringify(State.customers));
    localStorage.setItem(`tuntun_${id}_promotions`, JSON.stringify(State.promotions));

    // Sinkronisasi khusus toko utama SAADAH agar data lama tetap backward-compatible
    if (id === 'SAADAH' || id === 'TUNTUN') {
      localStorage.setItem('caffee_daily_orders', JSON.stringify(State.dailyOrders));
      localStorage.setItem('tuntun_SAADAH_daily_orders', JSON.stringify(State.dailyOrders));
      localStorage.setItem('caffee_products', JSON.stringify(State.products));
      localStorage.setItem('caffee_categories', JSON.stringify(State.categories));
      localStorage.setItem('caffee_expenses', JSON.stringify(State.expenses));
      localStorage.setItem('caffee_current_shift', JSON.stringify(State.currentShift));
      localStorage.setItem('caffee_customers', JSON.stringify(State.customers));
      localStorage.setItem('caffee_promotions', JSON.stringify(State.promotions));
      localStorage.setItem('tuntun_SAADAH_products', JSON.stringify(State.products));
      localStorage.setItem('tuntun_SAADAH_categories', JSON.stringify(State.categories));
    }
  } catch (err) {
    console.warn('Gagal menyimpan state toko:', err);
  }
}
window.saveAppState = saveAppState;
window.addEventListener('beforeunload', saveAppState);

// Muat data spesifik toko berdasarkan Store ID
function loadStoreData(storeId) {
  const id = (storeId || 'SAADAH').trim().toUpperCase();
  const store = findStoreById(id) || {
    id: id,
    name: (id === 'SAADAH' || id === 'TUNTUN') ? "Caffee Sa'adah (Pusat)" : `Toko ${id}`,
    address: "Coffee, Cake & Bread • Halal Indonesia",
    footer: "Terima Kasih Telah Berkunjung!"
  };
  State.activeStore = store;

  try {
    // 1. Pesanan Harian (Orders): Data transaksi tersimpan aman & permanen untuk setiap ID Toko
    let savedOrders = localStorage.getItem(`tuntun_${id}_daily_orders`);
    if (!savedOrders && (id === 'SAADAH' || id === 'TUNTUN')) {
      savedOrders = localStorage.getItem('tuntun_SAADAH_daily_orders') || localStorage.getItem('tuntun_TUNTUN_daily_orders') || localStorage.getItem('caffee_daily_orders');
    }
    if (savedOrders) {
      try {
        const parsed = JSON.parse(savedOrders);
        State.dailyOrders = Array.isArray(parsed) ? parsed : [];
      } catch (e) {
        State.dailyOrders = [];
      }
    } else {
      State.dailyOrders = [];
    }

    // 2. Katalog Produk (Menu Lengkap Otomatis untuk Setiap Toko!)
    let savedProducts = localStorage.getItem(`tuntun_${id}_products`);
    if (!savedProducts && (id === 'SAADAH' || id === 'TUNTUN')) {
      savedProducts = localStorage.getItem('tuntun_SAADAH_products') || localStorage.getItem('tuntun_TUNTUN_products') || localStorage.getItem('caffee_products');
    }
    if (savedProducts) {
      const parsed = JSON.parse(savedProducts);
      if (Array.isArray(parsed) && parsed.length > 0) {
        State.products = parsed;
      } else {
        State.products = JSON.parse(JSON.stringify(MasterDefaultProducts));
      }
    } else {
      State.products = JSON.parse(JSON.stringify(MasterDefaultProducts));
    }

    // 3. Kategori Menu
    let savedCategories = localStorage.getItem(`tuntun_${id}_categories`);
    if (!savedCategories && (id === 'SAADAH' || id === 'TUNTUN')) {
      savedCategories = localStorage.getItem('tuntun_SAADAH_categories') || localStorage.getItem('tuntun_TUNTUN_categories') || localStorage.getItem('caffee_categories');
    }
    if (savedCategories) {
      const parsed = JSON.parse(savedCategories);
      if (Array.isArray(parsed) && parsed.length > 0) {
        State.categories = parsed;
      } else {
        State.categories = JSON.parse(JSON.stringify(MasterDefaultCategories));
      }
    } else {
      State.categories = JSON.parse(JSON.stringify(MasterDefaultCategories));
    }

    // 4. Pengeluaran
    let savedExpenses = localStorage.getItem(`tuntun_${id}_expenses`);
    if (!savedExpenses && (id === 'SAADAH' || id === 'TUNTUN')) savedExpenses = localStorage.getItem('caffee_expenses');
    State.expenses = savedExpenses ? JSON.parse(savedExpenses) : [];

    // 5. Shift & Kas Laci
    let savedShift = localStorage.getItem(`tuntun_${id}_current_shift`);
    if (!savedShift && (id === 'SAADAH' || id === 'TUNTUN')) savedShift = localStorage.getItem('caffee_current_shift');
    if (savedShift) {
      State.currentShift = { ...State.currentShift, ...JSON.parse(savedShift) };
    } else {
      const cashRev = State.dailyOrders.filter(o => (o.paymentMethod || '').toLowerCase().includes('tunai')).reduce((s, o) => s + o.grandTotal, 0);
      State.currentShift = {
        id: 'SH-001',
        name: 'Shift Pagi (07:00 - 15:00 WIB)',
        cashierName: 'Karyawan 1',
        initialCash: 250000,
        totalCashSales: cashRev,
        totalQrisSales: 0,
        totalBankSales: 0,
        movements: []
      };
    }

    // 6. Pelanggan & Promosi
    let savedCust = localStorage.getItem(`tuntun_${id}_customers`);
    if (!savedCust && (id === 'SAADAH' || id === 'TUNTUN')) savedCust = localStorage.getItem('caffee_customers');
    if (savedCust) State.customers = JSON.parse(savedCust);

    let savedPromo = localStorage.getItem(`tuntun_${id}_promotions`);
    if (!savedPromo && (id === 'SAADAH' || id === 'TUNTUN')) savedPromo = localStorage.getItem('caffee_promotions');
    State.promotions = savedPromo ? JSON.parse(savedPromo) : JSON.parse(JSON.stringify(MasterDefaultPromotions));

    // 7. Pengaturan Nama & Footer Struk Toko
    const cafeName = localStorage.getItem(`tuntun_${id}_setting_name`) || store.name;
    const cafeAddr = localStorage.getItem(`tuntun_${id}_setting_addr`) || store.address;
    const cafeFooter = localStorage.getItem(`tuntun_${id}_setting_footer`) || store.footer;

    localStorage.setItem('caffee_setting_name', cafeName);
    localStorage.setItem('caffee_setting_addr', cafeAddr);
    localStorage.setItem('caffee_setting_footer', cafeFooter);

    const cafeNameInput = document.getElementById('settingCafeName');
    const cafeAddrInput = document.getElementById('settingCafeAddress');
    const cafeFooterInput = document.getElementById('settingCafeFooter');
    if (cafeNameInput) cafeNameInput.value = cafeName;
    if (cafeAddrInput) cafeAddrInput.value = cafeAddr;
    if (cafeFooterInput) cafeFooterInput.value = cafeFooter;

    // Reset keranjang
    State.cart = [];
    State.selectedCategory = 'Semua Menu';
    State.searchQuery = '';
    State.selectedCustomer = null;
    State.appliedPromo = null;
    State.editingCartIndex = -1;
    State.editingOrderInvoice = null;

    updateStoreHeaderUI();
  } catch (err) {
    console.warn('Gagal memuat state toko dari localStorage:', err);
  }
}

function loadAppState() {
  setTimeout(() => pullStoreStateFromServer(true), 100);
  let activeId = localStorage.getItem('tuntun_active_store_id') || 'SAADAH';
  if (activeId === 'TUNTUN') activeId = 'SAADAH';
  loadStoreData(activeId);
}

// --- AUTH GATE MODAL CONTROLLER & EVENTS ---
function openAuthModal() {
  const modal = document.getElementById('authGateModal');
  if (!modal) return;
  modal.classList.remove('auth-hidden');
  modal.style.setProperty('display', 'flex', 'important');
  modal.style.setProperty('opacity', '1', 'important');
  modal.style.setProperty('visibility', 'visible', 'important');
  modal.style.setProperty('pointer-events', 'auto', 'important');

  renderSavedStoresList();

  const tabLogin = document.getElementById('tabAuthLogin');
  if (tabLogin) tabLogin.click();

  const loginIdInput = document.getElementById('loginStoreId');
  if (loginIdInput) {
    let defaultId = State.activeStore?.id || localStorage.getItem('tuntun_active_store_id') || 'SAADAH';
    if (defaultId === 'TUNTUN') defaultId = 'SAADAH';
    loginIdInput.value = defaultId;
    setTimeout(() => {
      try {
        loginIdInput.focus();
        loginIdInput.select();
      } catch (e) {}
    }, 100);
  }
}

function closeAuthModal() {
  const modal = document.getElementById('authGateModal');
  if (!modal) return;
  modal.classList.add('auth-hidden');
  modal.style.setProperty('display', 'none', 'important');
  modal.style.setProperty('opacity', '0', 'important');
  modal.style.setProperty('visibility', 'hidden', 'important');
  modal.style.setProperty('pointer-events', 'none', 'important');
}

function renderSavedStoresList() {
  const container = document.getElementById('authSavedStoresList');
  if (!container) return;

  const stores = getStoreRegistry();
  let activeId = (State.activeStore?.id || localStorage.getItem('tuntun_active_store_id') || 'SAADAH').toUpperCase();
  if (activeId === 'TUNTUN') activeId = 'SAADAH';

  container.innerHTML = stores.map(st => {
    const isAct = st.id.toUpperCase() === activeId;
    return `
      <button type="button" class="btn-store-pill ${isAct ? 'active' : ''}" onclick="window.quickFillStore('${st.id}', false)" title="Pilih toko: ${st.name}">
        <i class="fa-solid fa-store"></i> <strong>${st.id}</strong> - ${st.name}
      </button>
    `;
  }).join('');
}

window.quickFillStore = function(id, autoLogin = false) {
  const loginIdInput = document.getElementById('loginStoreId');
  if (loginIdInput) {
    loginIdInput.value = id;
    loginIdInput.focus();
  }
  if (autoLogin) {
    loginStore(id);
  }
};

function performLogin(store, isNewRegister = false) {
  // Hanya simpan state toko sebelumnya jika memang sudah ada toko aktif berbeda yang sedang berjalan
  if (State.activeStore && State.activeStore.id && State.activeStore.id !== store.id) {
    saveAppState();
  }
  State.activeStore = store;
  localStorage.setItem('tuntun_active_store_id', store.id);
  sessionStorage.setItem('tuntun_session_authenticated', 'true');

  loadStoreData(store.id);

  // Tutup modal terlebih dahulu agar kasir langsung terbuka responsif
  closeAuthModal();

  // Re-render seluruh UI dengan data toko aktif secara aman
  try {
    if (typeof initCategoriesSidebar === 'function') initCategoriesSidebar();
    if (typeof renderProducts === 'function') renderProducts();
    if (typeof renderCart === 'function') renderCart();
    if (typeof renderDailyOrders === 'function') renderDailyOrders();
    if (typeof initShiftTatakan === 'function') initShiftTatakan();
    if (typeof renderDashboardChartsAndMetrics === 'function') renderDashboardChartsAndMetrics();
    updateStoreHeaderUI();
    updateArchiveCountBadge();
  } catch (err) {
    console.warn('UI re-render error during login:', err);
  }

  showToast(
    isNewRegister
      ? `Toko ${store.name} (ID: ${store.id}) berhasil didaftarkan!`
      : `Berhasil masuk ke ${store.name} (ID: ${store.id})!`,
    'success'
  );
}

function loginStore(id) {
  const cleanId = (id || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!cleanId) {
    showToast('Silakan masukkan ID Toko Anda (contoh: SAADAH)', 'warning');
    const input = document.getElementById('loginStoreId');
    if (input) input.focus();
    return;
  }

  let store = findStoreById(cleanId);

  // Toko Utama SAADAH (Caffee Sa'adah Pusat)
  if (cleanId === 'SAADAH' || cleanId === 'TUNTUN') {
    if (!store) {
      store = {
        id: 'SAADAH',
        name: "Caffee Sa'adah (Pusat)",
        password: '',
        address: "Coffee, Cake & Bread • Halal Indonesia",
        footer: "Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah"
      };
      const reg = getStoreRegistry();
      const idx = reg.findIndex(s => s.id === 'SAADAH' || s.id === 'TUNTUN');
      if (idx >= 0) reg[idx] = store;
      else reg.unshift(store);
      saveStoreRegistry(reg);
    }
    performLogin(store, false);
    return;
  }

  // Jika ID belum terdaftar di registry
  if (!store) {
    if (confirm(`ID Toko "${cleanId}" belum terdaftar.\nApakah Anda ingin langsung mendaftarkannya sebagai toko baru dengan menu lengkap?`)) {
      registerNewStore(cleanId, `Caffee Sa'adah (${cleanId})`);
      return;
    } else {
      const tabRegister = document.getElementById('tabAuthRegister');
      const regIdInput = document.getElementById('regStoreId');
      if (tabRegister) tabRegister.click();
      if (regIdInput) {
        regIdInput.value = cleanId;
        regIdInput.focus();
      }
      return;
    }
  }

  performLogin(store, false);
}

function registerNewStore(id, name) {
  const cleanId = (id || '').trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
  if (!cleanId || cleanId.length < 2) {
    showToast('Masukkan ID Toko Baru (minimal 2 huruf/angka)!', 'warning');
    const input = document.getElementById('regStoreId');
    if (input) input.focus();
    return false;
  }

  const cleanName = (name && name.trim()) ? name.trim() : `Caffee Sa'adah (${cleanId})`;

  let existing = findStoreById(cleanId);
  if (existing) {
    showToast(`ID Toko "${cleanId}" sudah ada, langsung masuk...`, 'info');
    performLogin(existing, false);
    return false;
  }

  const newStore = {
    id: cleanId,
    name: cleanName,
    password: '',
    address: "Coffee, Cake & Bread • Halal Indonesia",
    footer: `Terima Kasih Telah Berkunjung ke ${cleanName}!`,
    createdAt: new Date().toISOString()
  };

  const registry = getStoreRegistry();
  registry.push(newStore);
  saveStoreRegistry(registry);

  // Inisialisasi katalog menu lengkap 50+ menu untuk toko baru ini, dan laporan selalu mulai dari Rp 0!
  const defaultProds = (MasterDefaultProducts && MasterDefaultProducts.length > 0)
    ? MasterDefaultProducts
    : JSON.parse(JSON.stringify(State.products));
  const defaultCats = (MasterDefaultCategories && MasterDefaultCategories.length > 0)
    ? MasterDefaultCategories
    : JSON.parse(JSON.stringify(State.categories));

  localStorage.setItem(`tuntun_${cleanId}_products`, JSON.stringify(defaultProds));
  localStorage.setItem(`tuntun_${cleanId}_categories`, JSON.stringify(defaultCats));
  localStorage.setItem(`tuntun_${cleanId}_daily_orders`, JSON.stringify([]));
  localStorage.setItem(`tuntun_${cleanId}_expenses`, JSON.stringify([]));
  localStorage.setItem(`tuntun_${cleanId}_current_shift`, JSON.stringify({
    id: 'SH-001',
    name: 'Shift Pagi (07:00 - 15:00 WIB)',
    cashierName: 'Karyawan 1',
    initialCash: 250000,
    totalCashSales: 0,
    totalQrisSales: 0,
    totalBankSales: 0,
    movements: []
  }));
  localStorage.setItem(`tuntun_${cleanId}_customers`, JSON.stringify([]));
  localStorage.setItem(`tuntun_${cleanId}_promotions`, JSON.stringify(MasterDefaultPromotions || []));
  localStorage.setItem(`tuntun_${cleanId}_setting_name`, newStore.name);
  localStorage.setItem(`tuntun_${cleanId}_setting_addr`, newStore.address);
  localStorage.setItem(`tuntun_${cleanId}_setting_footer`, newStore.footer);

  // Login langsung ke toko baru
  performLogin(newStore, true);
  return true;
}

// =========================================================================
// FITUR RESET LAPORAN AMAN (3 TAHAP KONFIRMASI) & ARSIP CADANGAN OTOMATIS
// =========================================================================

// Update badge jumlah arsip tersimpan
function updateArchiveCountBadge() {
  const curId = (State.activeStore?.id || localStorage.getItem('tuntun_active_store_id') || 'SAADAH').toUpperCase();
  let count = 0;
  try {
    const raw = localStorage.getItem(`tuntun_${curId}_report_archives`);
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) count = list.length;
    }
  } catch(e) {}
  const badge = document.getElementById('archiveCountBadge');
  if (badge) badge.innerText = count.toString();
}
window.updateArchiveCountBadge = updateArchiveCountBadge;

// Reset laporan transaksi toko dengan 3 TAHAP KONFIRMASI PENGAMAN dan OTOMATIS MEMBUAT ARSIP CADANGAN
function resetStoreReports(storeId) {
  const id = (storeId || State.activeStore?.id || 'SAADAH').trim().toUpperCase();
  const storeName = State.activeStore?.name || `Toko ${id}`;

  const currentOrders = Array.isArray(State.dailyOrders) ? State.dailyOrders : [];
  const currentExpenses = Array.isArray(State.expenses) ? State.expenses : [];
  const totalRev = currentOrders.reduce((sum, o) => sum + (o.grandTotal || 0), 0);
  const totalExp = currentExpenses.reduce((sum, e) => sum + (e.amount || 0), 0);

  // 1. KONFIRMASI TAHAP 1 DARI 3: PERINGATAN UMUM
  const step1 = confirm(
    `⚠️ [KONFIRMASI 1 DARI 3: PERINGATAN RESET LAPORAN]\n\n` +
    `Anda akan me-reset seluruh laporan keuangan dan transaksi toko:\n` +
    `"${storeName}" (ID: ${id}) kembali ke Rp 0.\n\n` +
    `• Total pesanan saat ini: ${currentOrders.length} transaksi\n` +
    `• Total omzet saat ini: ${formatRupiah(totalRev)}\n` +
    `• Menu kopi & pengaturan toko: TETAP AMAN (tidak terhapus)\n\n` +
    `Apakah Anda yakin ingin melanjutkan ke Konfirmasi Tahap 2?`
  );
  if (!step1) {
    showToast('Reset laporan dibatalkan pada Konfirmasi Tahap 1.', 'info');
    return false;
  }

  // 2. KONFIRMASI TAHAP 2 DARI 3: JAMINAN PERLINDUNGAN ARSIP
  const step2 = confirm(
    `🛡️ [KONFIRMASI 2 DARI 3: SISTEM PERLINDUNGAN ARSIP CADANGAN]\n\n` +
    `Sistem Tuntun POS akan OTOMATIS MEMBUAT ARSIP SIMPANAN CADANGAN dari seluruh ${currentOrders.length} transaksi ini sebelum dikosongkan!\n\n` +
    `Data lama Anda TIDAK AKAN HILANG, melainkan tersimpan di "Arsip Cadangan Laporan" sehingga dapat Anda buka, diekspor ke Excel (.xlsx), atau dipulihkan kembali kapan saja.\n\n` +
    `Lanjutkan ke Konfirmasi Terakhir (Tahap 3)?`
  );
  if (!step2) {
    showToast('Reset laporan dibatalkan pada Konfirmasi Tahap 2.', 'info');
    return false;
  }

  // 3. KONFIRMASI TAHAP 3 DARI 3: VERIFIKASI KATA KUNCI "RESET"
  const step3 = prompt(
    `🔒 [KONFIRMASI 3 DARI 3: VERIFIKASI FINAL]\n\n` +
    `Untuk mencegah salah klik secara tidak sengaja, silakan ketik kata "RESET" (huruf besar semua) pada kotak di bawah ini lalu tekan OK:`,
    ''
  );
  if (!step3 || step3.trim().toUpperCase() !== 'RESET') {
    showToast('Reset dibatalkan (kata verifikasi tidak sesuai). Seluruh data laporan Anda 100% aman!', 'info');
    return false;
  }

  // --- PEMBUATAN ARSIP CADANGAN (MASIH ADA SIMPANANNYA) ---
  const archiveRecord = {
    id: 'ARC-' + Date.now(),
    storeId: id,
    storeName: storeName,
    archivedAt: new Date().toISOString(),
    archivedAtFormatted: formatDate(new Date()) + ' • ' + formatTime(new Date()),
    orderCount: currentOrders.length,
    totalRevenue: totalRev,
    totalExpenses: totalExp,
    netProfit: totalRev - totalExp,
    orders: JSON.parse(JSON.stringify(currentOrders)),
    expenses: JSON.parse(JSON.stringify(currentExpenses)),
    shift: JSON.parse(JSON.stringify(State.currentShift || {}))
  };

  let archives = [];
  try {
    const raw = localStorage.getItem(`tuntun_${id}_report_archives`);
    if (raw) archives = JSON.parse(raw);
    if (!Array.isArray(archives)) archives = [];
  } catch(e) {
    archives = [];
  }
  archives.unshift(archiveRecord);
  if (archives.length > 50) archives.length = 50; // simpan hingga 50 riwayat reset
  localStorage.setItem(`tuntun_${id}_report_archives`, JSON.stringify(archives));

  // --- BERSIHKAN DATA AKTIF MENJADI RP 0 ---
  State.dailyOrders = [];
  State.expenses = [];
  if (State.currentShift) {
    State.currentShift.totalCashSales = 0;
    State.currentShift.totalQrisSales = 0;
    State.currentShift.totalBankSales = 0;
    State.currentShift.movements = [];
  }

  localStorage.setItem(`tuntun_${id}_daily_orders`, JSON.stringify([]));
  localStorage.setItem(`tuntun_${id}_expenses`, JSON.stringify([]));
  localStorage.setItem(`tuntun_${id}_current_shift`, JSON.stringify(State.currentShift));

  if (id === 'SAADAH' || id === 'TUNTUN') {
    localStorage.setItem('caffee_daily_orders', JSON.stringify([]));
    localStorage.setItem('caffee_expenses', JSON.stringify([]));
    localStorage.setItem('caffee_current_shift', JSON.stringify(State.currentShift));
  }

  // Refresh UI
  try {
    if (typeof renderDailyOrders === 'function') renderDailyOrders();
    if (typeof renderDashboardChartsAndMetrics === 'function') renderDashboardChartsAndMetrics();
    if (typeof initShiftTatakan === 'function') initShiftTatakan();
  } catch (err) {
    console.warn('UI update error:', err);
  }

  const revEl = document.getElementById('finTotalRevenue');
  const countEl = document.getElementById('finOrderCountText');
  const netEl = document.getElementById('finNetProfit');
  if (revEl) revEl.innerText = formatRupiah(0);
  if (countEl) countEl.innerText = '0 transaksi';
  if (netEl) netEl.innerText = formatRupiah(0);

  updateArchiveCountBadge();

  showToast(`Laporan toko ID: ${id} telah bersih ke Rp 0. Arsip cadangan (${currentOrders.length} transaksi, ${formatRupiah(totalRev)}) telah diamankan!`, 'success');
  return true;
}
window.resetStoreReports = resetStoreReports;

// =========================================================================
// SISTEM MODAL & PENGELOLAAN ARSIP SIMPANAN LAPORAN
// =========================================================================

function openReportArchiveModal() {
  const modal = document.getElementById('reportArchiveModal');
  if (!modal) return;
  modal.classList.add('active');
  renderReportArchives();
}
window.openReportArchiveModal = openReportArchiveModal;

function closeReportArchiveModal() {
  const modal = document.getElementById('reportArchiveModal');
  if (!modal) return;
  modal.classList.remove('active');
}
window.closeReportArchiveModal = closeReportArchiveModal;

function renderReportArchives() {
  const container = document.getElementById('reportArchiveListContainer');
  if (!container) return;

  const curId = (State.activeStore?.id || 'SAADAH').toUpperCase();
  let archives = [];
  try {
    const raw = localStorage.getItem(`tuntun_${curId}_report_archives`);
    if (raw) archives = JSON.parse(raw);
    if (!Array.isArray(archives)) archives = [];
  } catch(e) {
    archives = [];
  }

  updateArchiveCountBadge();

  if (archives.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 40px 20px; color: #8a6a4e; background: #faf5ed; border: 1.5px dashed #d1bba4; border-radius: 16px;">
        <i class="fa-solid fa-box-open" style="font-size: 2.5rem; margin-bottom: 12px; opacity: 0.6;"></i>
        <h4 style="margin: 0 0 6px; color: #271a13; font-size: 1.05rem;">Belum Ada Arsip Simpanan</h4>
        <p style="margin: 0; font-size: 0.85rem; max-width: 420px; margin-inline: auto;">
          Setiap kali laporan transaksi toko di-reset (dengan 3 kali konfirmasi pengaman), sistem otomatis menyimpan salinan cadangannya di sini sehingga tidak akan pernah hilang.
        </p>
      </div>
    `;
    return;
  }

  container.innerHTML = archives.map((arc, idx) => {
    return `
      <div class="archive-card" style="background: #ffffff; border: 1.5px solid #ebd5c1; border-radius: 16px; padding: 16px; display: flex; flex-direction: column; gap: 12px; box-shadow: 0 4px 12px rgba(39, 26, 19, 0.05);">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 1px solid #f2e5d9; padding-bottom: 10px;">
          <div>
            <div style="display: flex; align-items: center; gap: 8px;">
              <span style="font-weight: 700; color: #271a13; font-size: 0.95rem;">
                <i class="fa-solid fa-calendar-check text-caramel"></i> ${arc.archivedAtFormatted || arc.dateFormatted || formatDate(arc.archivedAt)}
              </span>
              <span style="background: #ebd5c1; color: #634027; font-size: 0.72rem; padding: 2px 8px; border-radius: 20px; font-weight: 700;">
                #${archives.length - idx} • ${arc.storeId}
              </span>
            </div>
            <span style="font-size: 0.78rem; color: #8a6a4e;">Disimpan otomatis sebelum laporan di-reset</span>
          </div>
          <button type="button" class="btn-icon" style="color: #c94a4a; width: 28px; height: 28px; font-size: 0.8rem;" onclick="window.deleteReportArchive('${arc.id}')" title="Hapus Arsip Ini">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>

        <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; background: #faf5ed; padding: 10px 12px; border-radius: 12px;">
          <div>
            <span style="font-size: 0.72rem; color: #8a6a4e; display: block;">Total Pesanan:</span>
            <strong style="font-size: 0.95rem; color: #271a13;">${arc.orderCount || (arc.orders ? arc.orders.length : 0)} pesanan</strong>
          </div>
          <div>
            <span style="font-size: 0.72rem; color: #8a6a4e; display: block;">Pemasukan (Omzet):</span>
            <strong style="font-size: 0.95rem; color: #2e7d32;">${formatRupiah(arc.totalRevenue || 0)}</strong>
          </div>
          <div>
            <span style="font-size: 0.72rem; color: #8a6a4e; display: block;">Pengeluaran:</span>
            <strong style="font-size: 0.95rem; color: #c94a4a;">${formatRupiah(arc.totalExpenses || 0)}</strong>
          </div>
        </div>

        <div style="display: flex; gap: 8px; justify-content: flex-end; margin-top: 4px;">
          <button type="button" class="btn-secondary" style="padding: 6px 12px; font-size: 0.8rem;" onclick="window.exportArchiveToExcel('${arc.id}')" title="Download Excel Laporan Arsip Ini">
            <i class="fa-solid fa-file-excel" style="color: #2e7d32;"></i> Download Excel (.xlsx)
          </button>
          <button type="button" class="btn-primary-warm" style="padding: 6px 14px; font-size: 0.8rem;" onclick="window.restoreReportArchive('${arc.id}')" title="Kembalikan transaksi dari arsip ini ke laporan utama">
            <i class="fa-solid fa-clock-rotate-left"></i> Pulihkan Data Ini
          </button>
        </div>
      </div>
    `;
  }).join('');
}
window.renderReportArchives = renderReportArchives;

// Ekspor Arsip ke File Excel (.XLSX)
function exportArchiveToExcel(archiveId) {
  const curId = (State.activeStore?.id || 'SAADAH').toUpperCase();
  let archives = [];
  try {
    const raw = localStorage.getItem(`tuntun_${curId}_report_archives`);
    if (raw) archives = JSON.parse(raw);
  } catch(e) {}

  const arc = archives.find(a => a.id === archiveId);
  if (!arc) {
    showToast('Arsip tidak ditemukan.', 'error');
    return;
  }

  if (typeof XLSX === 'undefined') {
    showToast('Library Excel sedang dimuat, silakan coba sesaat lagi.', 'warning');
    return;
  }

  const wb = XLSX.utils.book_new();

  // Sheet 1: Rangkuman Arsip
  const summaryData = [
    ["ARSIP LAPORAN KEUANGAN - CAFFEE SA'ADAH POS"],
    ["Toko / Kafe:", arc.storeName || `Toko ${curId}`],
    ["ID Toko:", curId],
    ["Waktu Reset & Simpan:", arc.archivedAtFormatted || arc.dateFormatted || formatDate(arc.archivedAt)],
    ["Jumlah Pesanan:", `${arc.orderCount || (arc.orders ? arc.orders.length : 0)} transaksi`],
    ["Total Pemasukan:", formatRupiah(arc.totalRevenue || 0)],
    ["Total Pengeluaran:", formatRupiah(arc.totalExpenses || 0)],
    ["Laba Bersih:", formatRupiah((arc.totalRevenue || 0) - (arc.totalExpenses || 0))],
    []
  ];
  const ws1 = XLSX.utils.aoa_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, "Rangkuman Arsip");

  // Sheet 2: Riwayat Pesanan
  const orderHeaders = ["No", "Invoice", "Tanggal & Waktu", "Pelanggan", "Meja", "Metode Bayar", "Item Menu Terjual", "Grand Total (Rp)"];
  const orderRows = (arc.orders || []).map((o, i) => {
    const itemsStr = (o.items || []).map(it => `${it.name} (x${it.quantity})`).join(', ');
    return [
      i + 1,
      o.invoice || `INV-${i+1}`,
      formatDate(o.timestamp),
      o.customerName || 'Pelanggan Umum',
      o.tableNumber ? `Meja ${o.tableNumber}` : 'Take Away',
      o.paymentMethod || 'Tunai',
      itemsStr,
      o.grandTotal || 0
    ];
  });
  const ws2 = XLSX.utils.aoa_to_sheet([orderHeaders, ...orderRows]);
  XLSX.utils.book_append_sheet(wb, ws2, "Riwayat Pesanan");

  // Sheet 3: Pengeluaran
  const expHeaders = ["No", "Tanggal & Waktu", "Deskripsi Beban", "Kategori Beban", "Nominal (Rp)"];
  const expRows = (arc.expenses || []).map((e, i) => [
    i + 1,
    formatDate(e.timestamp),
    e.description || '-',
    e.category || 'Operasional',
    e.amount || 0
  ]);
  const ws3 = XLSX.utils.aoa_to_sheet([expHeaders, ...expRows]);
  XLSX.utils.book_append_sheet(wb, ws3, "Pengeluaran Beban");

  const cleanDateStr = (arc.archivedAt || new Date().toISOString()).slice(0, 10);
  XLSX.writeFile(wb, `Arsip_Laporan_${curId}_${cleanDateStr}.xlsx`);
  showToast(`File Excel arsip toko ${curId} berhasil diunduh!`, 'success');
}
window.exportArchiveToExcel = exportArchiveToExcel;

// Pulihkan Data dari Arsip kembali ke Laporan Aktif
function restoreReportArchive(archiveId) {
  const curId = (State.activeStore?.id || 'SAADAH').toUpperCase();
  let archives = [];
  try {
    const raw = localStorage.getItem(`tuntun_${curId}_report_archives`);
    if (raw) archives = JSON.parse(raw);
  } catch(e) {}

  const arc = archives.find(a => a.id === archiveId);
  if (!arc) {
    showToast('Arsip tidak ditemukan.', 'error');
    return;
  }

  const confirmRestore = confirm(
    `Apakah Anda ingin memulihkan data ${arc.orderCount || (arc.orders ? arc.orders.length : 0)} pesanan dari arsip:\n` +
    `"${arc.archivedAtFormatted || arc.dateFormatted}"\n\n` +
    `Data ini akan kembali aktif di Pesanan Hari Ini & Laporan Keuangan.`
  );
  if (!confirmRestore) return;

  State.dailyOrders = JSON.parse(JSON.stringify(arc.orders || []));
  State.expenses = JSON.parse(JSON.stringify(arc.expenses || []));
  if (arc.shift && State.currentShift) {
    State.currentShift = JSON.parse(JSON.stringify(arc.shift));
  }

  localStorage.setItem(`tuntun_${curId}_daily_orders`, JSON.stringify(State.dailyOrders));
  localStorage.setItem(`tuntun_${curId}_expenses`, JSON.stringify(State.expenses));
  localStorage.setItem(`tuntun_${curId}_current_shift`, JSON.stringify(State.currentShift));

  if (curId === 'SAADAH' || curId === 'TUNTUN') {
    localStorage.setItem('caffee_daily_orders', JSON.stringify(State.dailyOrders));
    localStorage.setItem('caffee_expenses', JSON.stringify(State.expenses));
    localStorage.setItem('caffee_current_shift', JSON.stringify(State.currentShift));
  }

  try {
    if (typeof renderDailyOrders === 'function') renderDailyOrders();
    if (typeof renderDashboardChartsAndMetrics === 'function') renderDashboardChartsAndMetrics();
    if (typeof initShiftTatakan === 'function') initShiftTatakan();
  } catch(e) {}

  closeReportArchiveModal();
  showToast(`Data dari arsip (${arc.orderCount} transaksi) berhasil dipulihkan ke laporan aktif!`, 'success');
}
window.restoreReportArchive = restoreReportArchive;

// Hapus Arsip Tertentu
function deleteReportArchive(archiveId) {
  const curId = (State.activeStore?.id || 'SAADAH').toUpperCase();
  let archives = [];
  try {
    const raw = localStorage.getItem(`tuntun_${curId}_report_archives`);
    if (raw) archives = JSON.parse(raw);
  } catch(e) {}

  if (!confirm('Apakah Anda yakin ingin menghapus arsip simpanan ini secara permanen?')) return;

  archives = archives.filter(a => a.id !== archiveId);
  localStorage.setItem(`tuntun_${curId}_report_archives`, JSON.stringify(archives));
  renderReportArchives();
  updateArchiveCountBadge();
  showToast('Arsip simpanan berhasil dihapus.', 'info');
}
window.deleteReportArchive = deleteReportArchive;

function logoutStore() {
  saveAppState();
  sessionStorage.removeItem('tuntun_session_authenticated');
  localStorage.removeItem('tuntun_logged_in_store_id');
  openAuthModal();
  const currentName = State.activeStore?.name || 'Toko';
  showToast(`Anda telah keluar dari ${currentName}. Silakan masukkan ID Toko (contoh: SAADAH) untuk masuk kembali.`, 'info');
}

function initAuthAndStoreManager() {
  const tabLogin = document.getElementById('tabAuthLogin');
  const tabRegister = document.getElementById('tabAuthRegister');
  const formLogin = document.getElementById('formAuthLogin');
  const formRegister = document.getElementById('formAuthRegister');
  const linkToRegister = document.getElementById('linkToRegister');
  const linkToLogin = document.getElementById('linkToLogin');

  const btnSubmitLogin = document.getElementById('btnSubmitLogin');
  const btnQuickLoginWithIdOnly = document.getElementById('btnQuickLoginWithIdOnly');
  const btnSubmitRegister = document.getElementById('btnSubmitRegister');

  const btnHeaderSwitch = document.getElementById('btnHeaderSwitchStore');
  const btnSidebarSwitch = document.getElementById('mgmtSwitchStoreBtn');
  const btnSettingsSwitch = document.getElementById('btnSettingsSwitchStore');
  const btnSettingsReg = document.getElementById('btnSettingsRegisterNewStore');
  const btnResetFinance = document.getElementById('btnResetCurrentStoreReports');
  const btnResetSettings = document.getElementById('btnSettingsResetReports');

  // Definisi Handler Global untuk HTML inline onclick & onsubmit (HANYA PAKAI ID)
  window.handleAuthLoginSubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById('loginStoreId')?.value || '';
    loginStore(id);
  };

  window.handleAuthQuickIdLogin = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById('loginStoreId')?.value || '';
    loginStore(id);
  };

  window.handleAuthRegisterSubmit = function(e) {
    if (e && e.preventDefault) e.preventDefault();
    const id = document.getElementById('regStoreId')?.value || '';
    const name = document.getElementById('regStoreName')?.value || '';
    registerNewStore(id, name);
  };

  window.loginStore = loginStore;
  window.registerNewStore = registerNewStore;
  window.logoutStore = logoutStore;
  window.openAuthModal = openAuthModal;
  window.closeAuthModal = closeAuthModal;

  if (tabLogin && tabRegister && formLogin && formRegister) {
    tabLogin.addEventListener('click', () => {
      tabLogin.classList.add('active');
      tabRegister.classList.remove('active');
      formLogin.classList.add('active');
      formRegister.classList.remove('active');
      const loginIdInput = document.getElementById('loginStoreId');
      if (loginIdInput) loginIdInput.focus();
    });

    tabRegister.addEventListener('click', () => {
      tabRegister.classList.add('active');
      tabLogin.classList.remove('active');
      formRegister.classList.add('active');
      formLogin.classList.remove('active');
      const regIdInput = document.getElementById('regStoreId');
      if (regIdInput) regIdInput.focus();
    });

    if (linkToRegister) linkToRegister.addEventListener('click', () => tabRegister.click());
    if (linkToLogin) linkToLogin.addEventListener('click', () => tabLogin.click());

    formLogin.addEventListener('submit', window.handleAuthLoginSubmit);
    formRegister.addEventListener('submit', window.handleAuthRegisterSubmit);

    if (btnSubmitLogin) btnSubmitLogin.addEventListener('click', window.handleAuthLoginSubmit);
    if (btnQuickLoginWithIdOnly) btnQuickLoginWithIdOnly.addEventListener('click', window.handleAuthQuickIdLogin);
    if (btnSubmitRegister) btnSubmitRegister.addEventListener('click', window.handleAuthRegisterSubmit);
  }

  // Tombol reset laporan ke Rp 0 (dilindungi 3 tahap konfirmasi)
  const handleResetConfirm = () => {
    const curId = State.activeStore?.id || 'SAADAH';
    resetStoreReports(curId);
  };
  if (btnResetFinance) btnResetFinance.addEventListener('click', handleResetConfirm);
  if (btnResetSettings) btnResetSettings.addEventListener('click', handleResetConfirm);

  // Event listener tombol Riwayat Arsip Simpanan Laporan
  const btnViewArchive = document.getElementById('btnViewReportArchives');
  const btnCloseArchive = document.getElementById('btnCloseReportArchiveModal');
  const btnDismissArchive = document.getElementById('btnDismissReportArchiveModal');
  if (btnViewArchive) btnViewArchive.addEventListener('click', openReportArchiveModal);
  if (btnCloseArchive) btnCloseArchive.addEventListener('click', closeReportArchiveModal);
  if (btnDismissArchive) btnDismissArchive.addEventListener('click', closeReportArchiveModal);

  if (btnHeaderSwitch) btnHeaderSwitch.addEventListener('click', logoutStore);
  if (btnSidebarSwitch) btnSidebarSwitch.addEventListener('click', logoutStore);
  if (btnSettingsSwitch) btnSettingsSwitch.addEventListener('click', logoutStore);
  if (btnSettingsReg) {
    btnSettingsReg.addEventListener('click', () => {
      logoutStore();
      const tabReg = document.getElementById('tabAuthRegister');
      if (tabReg) tabReg.click();
    });
  }

  updateStoreHeaderUI();
  updateArchiveCountBadge();

  // WAJIB LOGIN SETIAP KALI APLIKASI DIBUKA ATAU DI-REFRESH:
  openAuthModal();
}

// --- INITIALIZE ON DOM READY ---
document.addEventListener('DOMContentLoaded', () => {
  // 1. Inisialisasi Auth & Login Gate TERLEBIH DAHULU agar langsung aktif dan siap dipencet
  try { initAuthAndStoreManager(); } catch (e) { console.warn('Auth init warning:', e); }

  // 2. Muat data toko & komponen POS dengan aman
  try { loadAppState(); } catch (e) { console.warn('loadAppState warning:', e); }
  try { initMainScreenNavigation(); } catch (e) { console.warn(e); }
  try { initManagementSidebar(); } catch (e) { console.warn(e); }
  try { initCategoriesSidebar(); } catch (e) { console.warn(e); }
  try { renderProducts(); } catch (e) { console.warn(e); }
  try { renderCart(); } catch (e) { console.warn(e); }
  try { renderDailyOrders(); } catch (e) { console.warn(e); }
  try { initPosControls(); } catch (e) { console.warn(e); }
  try { initModifierModal(); } catch (e) { console.warn(e); }
  try { initCheckout(); } catch (e) { console.warn(e); }
  try { initPrintHub(); } catch (e) { console.warn(e); }
  try { initCetakLabelAndOrdersScreen(); } catch (e) { console.warn(e); }
  try { initPhotoUploadModal(); } catch (e) { console.warn(e); }
  try { initFinanceFilter(); } catch (e) { console.warn(e); }
  try { initThemeAndDevice(); } catch (e) { console.warn(e); }
  try { initAiAssistant(); } catch (e) { console.warn(e); }
  try { initCatalogManagement(); } catch (e) { console.warn(e); }
  try { initShiftTatakan(); } catch (e) { console.warn(e); }
  try { initGoogleSheetsIntegration(); } catch (e) { console.warn(e); }
  try { initEditOrderModal(); } catch (e) { console.warn(e); }
  try { initSalesTrendChart(); } catch (e) { console.warn(e); }
  try { initShiftSelectorAndStaff(); } catch (e) { console.warn(e); }
  try { initCustomerSelectorAndCrm(); } catch (e) { console.warn(e); }
  try { initPromoCrud(); } catch (e) { console.warn(e); }
  try { initBluetoothPrinter(); } catch (e) { console.warn(e); }
  try { initLiveClockAndMidnightReset(); } catch (e) { console.warn(e); }
  try { renderDashboardChartsAndMetrics(); } catch (e) { console.warn(e); }
  try { initReceiptSettingsAndLogo(); } catch (e) { console.warn(e); }
});

// --- 0.1 FORMAT STRUK & LOGO CETAK THERMAL ---
function initReceiptSettingsAndLogo() {
  const cafeNameInput = document.getElementById('settingCafeName');
  const cafeAddrInput = document.getElementById('settingCafeAddress');
  const cafePhoneInput = document.getElementById('settingCafePhone');
  const cafeFooterInput = document.getElementById('settingCafeFooter');
  const btnSaveSettings = document.getElementById('btnSaveCafeSettings');

  const toggleLogoActive = document.getElementById('toggleReceiptLogoActive');
  const selectLogoSize = document.getElementById('selectReceiptLogoSize');
  const selectLogoMono = document.getElementById('selectReceiptLogoMono');
  const previewImg = document.getElementById('receiptLogoPreviewImg');
  const dimHint = document.getElementById('receiptLogoDimensionHint');

  const btnUploadLogo = document.getElementById('btnUploadReceiptLogo');
  const inputFileLogo = document.getElementById('inputReceiptLogoFile');
  const btnResetLogo = document.getElementById('btnResetReceiptLogo');

  const quickToggleLogo = document.getElementById('quickToggleReceiptLogo');
  const quickLogoLabel = document.getElementById('quickLogoStatusLabel');
  const quickBtnUpload = document.getElementById('quickBtnUploadLogo');
  const quickInputFile = document.getElementById('quickLogoFileInput');
  const quickPaperSelect = document.getElementById('quickReceiptPaperSize');

  // 1. Load persisted values
  if (cafeNameInput && localStorage.getItem('caffee_setting_name')) {
    cafeNameInput.value = localStorage.getItem('caffee_setting_name');
  }
  if (cafeAddrInput && localStorage.getItem('caffee_setting_addr')) {
    cafeAddrInput.value = localStorage.getItem('caffee_setting_addr');
  }
  if (cafePhoneInput && localStorage.getItem('caffee_setting_phone')) {
    cafePhoneInput.value = localStorage.getItem('caffee_setting_phone');
  }
  if (cafeFooterInput) {
    let savedFooter = localStorage.getItem('caffee_setting_footer');
    if (savedFooter && savedFooter.includes('Pemilik: Syukri & Ardan')) {
      savedFooter = savedFooter.replace('Pemilik: Syukri & Ardan • ', '').replace('Pemilik: Syukri & Ardan', '').trim();
      localStorage.setItem('caffee_setting_footer', savedFooter);
    }
    cafeFooterInput.value = savedFooter || "Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah";
  }

  const isLogoActive = localStorage.getItem('caffee_receipt_show_logo') !== 'false';
  if (toggleLogoActive) toggleLogoActive.checked = isLogoActive;
  if (quickToggleLogo) quickToggleLogo.checked = isLogoActive;
  if (quickLogoLabel) quickLogoLabel.innerText = isLogoActive ? 'Aktif' : 'Nonaktif';

  const logoSize = localStorage.getItem('caffee_receipt_logo_size') || 'medium';
  if (selectLogoSize) selectLogoSize.value = logoSize;

  const logoMono = localStorage.getItem('caffee_receipt_logo_mono') || 'normal';
  if (selectLogoMono) selectLogoMono.value = logoMono;

  const currentLogo = localStorage.getItem('caffee_receipt_logo') || 'assets/saadah_logo.png';
  if (previewImg) {
    previewImg.src = currentLogo;
    if (logoMono === 'mono') previewImg.classList.add('receipt-logo-mono');
    else previewImg.classList.remove('receipt-logo-mono');
  }
  if (dimHint) {
    dimHint.innerText = currentLogo.startsWith('data:') ? 'Logo Kustom Aktif' : "Logo Standar: Caffee Sa'adah";
  }

  // 2. Save text settings
  if (btnSaveSettings) {
    btnSaveSettings.addEventListener('click', () => {
      if (cafeNameInput) localStorage.setItem('caffee_setting_name', cafeNameInput.value.trim());
      if (cafeAddrInput) localStorage.setItem('caffee_setting_addr', cafeAddrInput.value.trim());
      if (cafePhoneInput) localStorage.setItem('caffee_setting_phone', cafePhoneInput.value.trim());
      if (cafeFooterInput) localStorage.setItem('caffee_setting_footer', cafeFooterInput.value.trim());

      if (State.currentPrintingOrder) {
        renderCashierReceipt(State.currentPrintingOrder);
      }
      showToast('Format teks struk berhasil disimpan!', 'success');
    });
  }

  // 3. Toggle logo display
  function handleLogoToggle(isChecked) {
    localStorage.setItem('caffee_receipt_show_logo', isChecked ? 'true' : 'false');
    if (toggleLogoActive) toggleLogoActive.checked = isChecked;
    if (quickToggleLogo) quickToggleLogo.checked = isChecked;
    if (quickLogoLabel) quickLogoLabel.innerText = isChecked ? 'Aktif' : 'Nonaktif';

    const order = State.currentPrintingOrder || State.activePrintOrder;
    if (order) {
      renderCashierReceipt(order);
      renderCashierSummaryCard(order);
      renderCleanCupList(order);
    }
    showToast(`Cetak logo pada struk ${isChecked ? 'diaktifkan' : 'dinonaktifkan'}.`);
  }

  if (toggleLogoActive) {
    toggleLogoActive.addEventListener('change', (e) => handleLogoToggle(e.target.checked));
  }
  if (quickToggleLogo) {
    quickToggleLogo.addEventListener('change', (e) => handleLogoToggle(e.target.checked));
  }

  // 4. Logo size & monochrome effects
  if (selectLogoSize) {
    selectLogoSize.addEventListener('change', (e) => {
      localStorage.setItem('caffee_receipt_logo_size', e.target.value);
      const order = State.currentPrintingOrder || State.activePrintOrder;
      if (order) {
        renderCashierReceipt(order);
        renderCashierSummaryCard(order);
      }
    });
  }

  if (selectLogoMono) {
    selectLogoMono.addEventListener('change', (e) => {
      localStorage.setItem('caffee_receipt_logo_mono', e.target.value);
      if (previewImg) {
        if (e.target.value === 'mono') previewImg.classList.add('receipt-logo-mono');
        else previewImg.classList.remove('receipt-logo-mono');
      }
      const order = State.currentPrintingOrder || State.activePrintOrder;
      if (order) {
        renderCashierReceipt(order);
        renderCashierSummaryCard(order);
      }
    });
  }

  // 5. File upload handler (compresses to crisp max-width 450px)
  function handleLogoFileUpload(file) {
    if (!file || !file.type.startsWith('image/')) {
      showToast('Harap pilih file gambar logo (PNG atau JPG)!', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxW = 420;
        let w = img.width;
        let h = img.height;
        if (w > maxW) {
          h = Math.round((h * maxW) / w);
          w = maxW;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const compressedDataUrl = canvas.toDataURL('image/png', 0.92);

        try {
          localStorage.setItem('caffee_receipt_logo', compressedDataUrl);
          localStorage.setItem('caffee_receipt_show_logo', 'true');
          if (toggleLogoActive) toggleLogoActive.checked = true;
          if (quickToggleLogo) quickToggleLogo.checked = true;
          if (quickLogoLabel) quickLogoLabel.innerText = 'Aktif';

          if (previewImg) previewImg.src = compressedDataUrl;
          if (dimHint) dimHint.innerText = `Logo Kustom (${w}x${h} px)`;

          const order = State.currentPrintingOrder || State.activePrintOrder;
          if (order) {
            renderCashierReceipt(order);
            renderCashierSummaryCard(order);
            renderCleanCupList(order);
          }
          showToast('Logo kafe berhasil diupload! Format struk otomatis menggunakan logo ini.', 'success');
        } catch (err) {
          showToast('Gambar terlalu besar untuk memori peramban. Silakan pilih gambar yang lebih ringan.', 'error');
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  if (btnUploadLogo && inputFileLogo) {
    btnUploadLogo.addEventListener('click', () => inputFileLogo.click());
    inputFileLogo.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleLogoFileUpload(e.target.files[0]);
      }
    });
  }

  if (quickBtnUpload && quickInputFile) {
    quickBtnUpload.addEventListener('click', () => quickInputFile.click());
    quickInputFile.addEventListener('change', (e) => {
      if (e.target.files && e.target.files[0]) {
        handleLogoFileUpload(e.target.files[0]);
      }
    });
  }

  // 6. Reset logo to default Caffee Saadah
  if (btnResetLogo) {
    btnResetLogo.addEventListener('click', () => {
      localStorage.setItem('caffee_receipt_logo', 'assets/saadah_logo.png');
      if (previewImg) previewImg.src = 'assets/saadah_logo.png';
      if (dimHint) dimHint.innerText = "Logo Standar: Caffee Sa'adah";
      if (State.currentPrintingOrder) {
        renderCashierReceipt(State.currentPrintingOrder);
      }
      showToast("Logo struk berhasil direset ke logo resmi Caffee Sa'adah!", 'info');
    });
  }

  // 7. Quick paper size select
  if (quickPaperSelect) {
    quickPaperSelect.addEventListener('change', (e) => {
      const papers = document.querySelectorAll('.thermal-paper');
      if (e.target.value === '58mm') {
        papers.forEach(p => p.classList.add('paper-58mm'));
      } else {
        papers.forEach(p => p.classList.remove('paper-58mm'));
      }
    });
  }
}

// (Splash screen removed: Layar Login & Registrasi Toko langsung menjadi layar pertama)
function initSplashScreen() {
  // no-op
}

// --- 1. MAIN SCREEN NAVIGATION (KASIR, PESANAN HARI INI, MANAJEMEN PENUH) ---
function initMainScreenNavigation() {
  const tabPos = document.getElementById('tabNavPos');
  const tabOrders = document.getElementById('tabNavOrders');
  const tabMgmt = document.getElementById('tabNavManagement');
  const logoBtn = document.getElementById('headerLogoBtn');
  const mgmtBackBtn = document.getElementById('mgmtBackToPosBtn');
  const backToPosBtn = document.getElementById('backToPosBtn');

  function switchMainView(viewName) {
    State.currentMainView = viewName;

    // Toggle view elements
    document.querySelectorAll('.main-view').forEach(v => v.classList.remove('active'));
    document.querySelectorAll('.screen-tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll('.bnav-item').forEach(b => b.classList.remove('active'));

    if (viewName === 'pos') {
      document.getElementById('viewPos')?.classList.add('active');
      tabPos?.classList.add('active');
      document.querySelector('.bnav-item[data-view="pos"]')?.classList.add('active');
    } else if (viewName === 'orders') {
      document.getElementById('viewOrders')?.classList.add('active');
      tabOrders?.classList.add('active');
      document.querySelector('.bnav-item[data-view="orders"]')?.classList.add('active');
      renderDailyOrders();
    } else if (viewName === 'management') {
      document.getElementById('viewManagement')?.classList.add('active');
      tabMgmt?.classList.add('active');
      document.querySelector('.bnav-item[data-view="management"]')?.classList.add('active');
      refreshManagementActiveSubPane();
    }
  }

  tabPos?.addEventListener('click', () => switchMainView('pos'));
  tabOrders?.addEventListener('click', () => switchMainView('orders'));
  tabMgmt?.addEventListener('click', () => switchMainView('management'));
  logoBtn?.addEventListener('click', () => switchMainView('management'));
  mgmtBackBtn?.addEventListener('click', () => switchMainView('pos'));
  backToPosBtn?.addEventListener('click', () => switchMainView('pos'));

  // Mobile Bottom Nav
  document.querySelectorAll('.bnav-item').forEach(b => {
    b.addEventListener('click', () => {
      const v = b.dataset.view;
      if (v) switchMainView(v);
    });
  });

  // Header Quick AI Assistant button
  document.getElementById('headerAiBtn')?.addEventListener('click', () => {
    switchMainView('management');
    switchMgmtSubPane('ai');
  });
}

// --- 2. MANAGEMENT LEFT SIDEBAR & SUB-PANES ---
function initManagementSidebar() {
  document.querySelectorAll('.mgmt-nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const sub = btn.dataset.sub;
      switchMgmtSubPane(sub);
    });
  });
}

function switchMgmtSubPane(subKey) {
  State.currentMgmtSubPane = subKey;

  document.querySelectorAll('.mgmt-nav-item').forEach(item => {
    item.classList.toggle('active', item.dataset.sub === subKey);
  });

  document.querySelectorAll('.mgmt-pane').forEach(pane => {
    pane.classList.remove('active');
  });

  const paneId = 'pane' + subKey.charAt(0).toUpperCase() + subKey.slice(1);
  const targetPane = document.getElementById(paneId);
  if (targetPane) targetPane.classList.add('active');

  refreshManagementActiveSubPane();
}

function refreshManagementActiveSubPane() {
  const sub = State.currentMgmtSubPane;
  if (sub === 'dashboard') renderDashboardChartsAndMetrics();
  else if (sub === 'keuangan') renderFinanceStatement();
  else if (sub === 'produk') renderCatalogManageGrid();
  else if (sub === 'promosi') renderPromoCards();
  else if (sub === 'shift') renderShiftDetails();
  else if (sub === 'crm') renderCustomersTable();
  else if (sub === 'kds') renderKDSGrid();
  else if (sub === 'retur') renderAuditLogsTable();
  else if (sub === 'ai') updateAiExecutiveBriefing();
}

// --- 3. DASHBOARD METRICS & CHARTS (REAL-TIME & FRESH LAUNCH EMPTY STATES) ---
function renderDashboardChartsAndMetrics() {
  const totalRev = State.dailyOrders.reduce((s, o) => s + o.grandTotal, 0);
  const totalCogs = State.dailyOrders.reduce((s, o) => s + o.costTotal, 0);
  const grossProfit = totalRev - totalCogs;
  const expectedCash = State.currentShift.initialCash + State.currentShift.totalCashSales;

  const revEl = document.getElementById('dashTotalRevenue');
  if (revEl) revEl.innerText = formatRupiah(totalRev);
  const ordersEl = document.getElementById('dashTotalOrders');
  if (ordersEl) ordersEl.innerText = `${State.dailyOrders.length} Pesanan`;
  const profitEl = document.getElementById('dashGrossProfit');
  if (profitEl) profitEl.innerText = formatRupiah(grossProfit);
  const drawerEl = document.getElementById('dashDrawerCash');
  if (drawerEl) drawerEl.innerText = formatRupiah(expectedCash);

  // 1. TOP 5 MENU TERLARIS & MENGUNTUNGKAN (REALTIME)
  const topBody = document.getElementById('dashTopProductsBody');
  if (topBody) {
    if (State.dailyOrders.length === 0) {
      topBody.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 32px 14px; color: var(--text-dim);">
            <i class="fa-solid fa-mug-saucer" style="font-size: 2rem; opacity: 0.35; margin-bottom: 8px; display: block;"></i>
            Belum ada pesanan hari ini. Data Top 5 Menu & Laba akan terisi otomatis secara real-time begitu kasir memproses pesanan.
          </td>
        </tr>
      `;
    } else {
      const map = {};
      State.dailyOrders.forEach(order => {
        (order.items || []).forEach(item => {
          const key = item.name;
          if (!map[key]) {
            const prod = State.products.find(p => p.name === item.name);
            map[key] = {
              name: item.name,
              category: prod ? prod.category : 'Minuman',
              qty: 0,
              revenue: 0,
              cost: 0
            };
          }
          map[key].qty += item.qty;
          map[key].revenue += (item.price || 0) * item.qty;
          const prod = State.products.find(p => p.name === item.name);
          const cogs = prod ? prod.costPrice : Math.round((item.price || 0) * 0.4);
          map[key].cost += cogs * item.qty;
        });
      });

      const sorted = Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);

      if (sorted.length === 0) {
        topBody.innerHTML = `
          <tr>
            <td colspan="5" style="text-align: center; padding: 24px; color: var(--text-dim);">
              Belum ada pesanan hari ini.
            </td>
          </tr>
        `;
      } else {
        topBody.innerHTML = sorted.map(item => {
          const margin = item.revenue > 0 ? ((item.revenue - item.cost) / item.revenue) * 100 : 0;
          return `
            <tr>
              <td><strong>${item.name}</strong></td>
              <td>${item.category}</td>
              <td>${item.qty} cup</td>
              <td>${formatRupiah(item.revenue)}</td>
              <td><strong class="text-green">${margin.toFixed(1)}%</strong></td>
            </tr>
          `;
        }).join('');
      }
    }
  }

  // 2. JAM PALING RAMAI (PEAK HOURS) (REALTIME)
  const peakList = document.getElementById('dashPeakHoursList');
  if (peakList) {
    if (State.dailyOrders.length === 0) {
      peakList.innerHTML = `
        <div style="text-align: center; padding: 36px 16px; color: var(--text-dim);">
          <i class="fa-solid fa-clock" style="font-size: 2rem; opacity: 0.35; margin-bottom: 8px; display: block;"></i>
          <p style="font-size: 0.82rem; margin: 0;">Belum ada pesanan hari ini. Analisis jam ramai akan dikalkulasi otomatis secara real-time.</p>
        </div>
      `;
    } else {
        const slots = [
          { label: '07:00 - 11:59 (Morning Coffee)', min: 7, max: 12, count: 0 },
          { label: '12:00 - 14:59 (Lunch Rush)', min: 12, max: 15, count: 0 },
          { label: '15:00 - 17:59 (Afternoon Break)', min: 15, max: 18, count: 0 },
          { label: '18:00 - 23:59 (Evening Hangout)', min: 18, max: 24, count: 0 }
        ];

        State.dailyOrders.forEach(o => {
          const d = new Date(o.date);
          const h = d.getHours();
          let matched = false;
          slots.forEach(slot => {
            if (h >= slot.min && h < slot.max) {
              slot.count++;
              matched = true;
            }
          });
          if (!matched && slots.length > 0) {
            slots[0].count++;
          }
        });

        const maxCount = Math.max(1, ...slots.map(s => s.count));

        peakList.innerHTML = slots.map(slot => {
          const pct = slot.count > 0 ? Math.round((slot.count / maxCount) * 100) : 0;
          const isPeak = slot.count === maxCount && slot.count > 0;
          return `
            <div class="peak-hour-line">
              <span>${slot.label}</span>
              <div class="progress-track"><div class="progress-bar ${isPeak ? 'highlight' : ''}" style="width: ${Math.max(pct, 5)}%;"></div></div>
              <strong>${pct}% ${isPeak ? '<span style="color:var(--caramel);">(Teramai)</span>' : ''}</strong>
            </div>
          `;
        }).join('');
      }
    }

    // 3. SALES TREND CHART (REALTIME)
    const activeTrendPill = document.querySelector('.trend-pill.active');
  const period = activeTrendPill ? activeTrendPill.dataset.period : '7days';
  renderSalesTrendChart(period);
}

// --- 4. SIDEBAR KATEGORI MENU (DI SAMPING KASIR) ---
function initCategoriesSidebar() {
  const container = document.getElementById('categoriesVList');
  if (!container) return;

  container.innerHTML = State.categories.map(cat => `
    <button class="cat-v-btn ${cat.name === State.selectedCategory ? 'active' : ''}" data-cat="${cat.name}">
      <i class="fa-solid ${cat.icon}"></i>
      <span>${cat.name}</span>
    </button>
  `).join('');

  container.querySelectorAll('.cat-v-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      container.querySelectorAll('.cat-v-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      State.selectedCategory = btn.dataset.cat;
      renderProducts();
    });
  });
}

// --- 5. RENDER PRODUCTS GALLERY: 100% TEKS-ONLY & SUPER RINGAN (TABLET CEPAT & HEMAT RAM) ---
function renderProducts() {
  const grid = document.getElementById('coffeeGrid');
  if (!grid) return;

  const filtered = State.products.filter(p => {
    const matchCat = State.selectedCategory === 'Semua Menu' || p.category === State.selectedCategory;
    const matchSearch = State.searchQuery === '' ||
      p.name.toLowerCase().includes(State.searchQuery) ||
      p.sku.toLowerCase().includes(State.searchQuery);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 50px 20px; color: var(--text-dim);">
        <i class="fa-solid fa-mug-saucer" style="font-size: 3rem; opacity: 0.3; margin-bottom: 12px;"></i>
        <p>Tidak ada menu minuman ditemukan untuk kategori ini.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(prod => `
    <div class="coffee-card text-only-card" data-id="${prod.id}">
      <div class="coffee-card-body">
        <h3 class="coffee-name">${prod.name}</h3>
      </div>
      <div class="coffee-footer">
        <span class="coffee-price">${formatRupiah(prod.price)}</span>
        <button class="btn-add-circle" title="Tambah Pesanan">
          <i class="fa-solid fa-plus"></i>
        </button>
      </div>
    </div>
  `).join('');

  grid.querySelectorAll('.coffee-card').forEach(card => {
    card.addEventListener('click', () => {
      const prodId = card.dataset.id;
      const product = State.products.find(p => p.id === prodId);
      if (product) handleProductSelect(product);
    });
  });
}

// --- 6. MODIFIER POPUP & CART ITEM EDITING ---
let pendingProduct = null;
let selectedModifiers = [];

function handleProductSelect(product) {
  State.editingCartIndex = -1; // New item mode
  if (product.hasModifiers) {
    openModifierModal(product);
  } else {
    addToCart(product, [], 1);
  }
}

function initModifierModal() {
  const modal = document.getElementById('modifierModal');
  const closeBtn = document.getElementById('closeModifierModalBtn');
  const confirmBtn = document.getElementById('confirmAddToCartBtn');
  const minusBtn = document.getElementById('modalQtyMinusBtn');
  const plusBtn = document.getElementById('modalQtyPlusBtn');
  const qtyInput = document.getElementById('modalItemQtyInput');

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (minusBtn && qtyInput) {
    minusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      if (val > 1) qtyInput.value = val - 1;
      updateModalTotal();
    });
  }

  if (plusBtn && qtyInput) {
    plusBtn.addEventListener('click', () => {
      let val = parseInt(qtyInput.value) || 1;
      qtyInput.value = val + 1;
      updateModalTotal();
    });
  }

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      if (!pendingProduct) return;

      const customNotes = document.getElementById('modalItemNotesInput')?.value.trim() || '';
      const itemQty = parseInt(document.getElementById('modalItemQtyInput')?.value) || 1;

      const modsString = selectedModifiers.map(m => m.name).sort().join(', ');
      const modsShort = selectedModifiers.map(m => m.shortCode || m.name).join(' • ');

      if (State.editingCartIndex >= 0 && State.editingCartIndex < State.cart.length) {
        // Edit existing cart item in-place
        State.cart[State.editingCartIndex].modifiers = [...selectedModifiers];
        State.cart[State.editingCartIndex].modsString = modsString;
        State.cart[State.editingCartIndex].modsShort = modsShort;
        State.cart[State.editingCartIndex].notes = customNotes;
        State.cart[State.editingCartIndex].qty = itemQty;
        showToast('Pilihan pesanan berhasil diperbarui!');
        State.editingCartIndex = -1;
      } else {
        // Add as new item to cart
        addToCart(pendingProduct, [...selectedModifiers], itemQty, customNotes);
      }

      modal.classList.remove('active');
      renderCart();
    });
  }
}

function openModifierModal(product, existingItem = null) {
  pendingProduct = product;
  selectedModifiers = [];

  const modal = document.getElementById('modifierModal');
  const nameEl = document.getElementById('modalProductName');
  const priceEl = document.getElementById('modalProductBasePrice');
  const btnText = document.getElementById('confirmModBtnText');
  const container = document.getElementById('modifierGroupsContainer');
  const notesInput = document.getElementById('modalItemNotesInput');
  const qtyInput = document.getElementById('modalItemQtyInput');

  if (nameEl) nameEl.innerText = product.name;
  if (priceEl) priceEl.innerText = 'Harga Dasar: ' + formatRupiah(product.price);
  if (btnText) btnText.innerText = existingItem ? 'Simpan Perubahan Pesanan' : 'Tambah ke Pesanan';

  if (existingItem) {
    selectedModifiers = [...(existingItem.modifiers || [])];
    if (notesInput) notesInput.value = existingItem.notes || '';
    if (qtyInput) qtyInput.value = existingItem.qty || 1;
  } else {
    if (notesInput) notesInput.value = '';
    if (qtyInput) qtyInput.value = 1;
    if (product.hasModifiers) {
      State.modifierGroups.forEach(group => {
        if (!group.multi) {
          const def = group.options.find(o => o.default) || group.options[0];
          if (def) selectedModifiers.push(def);
        }
      });
    }
  }

  renderModifierOptions(container);
  updateModalTotal();
  if (modal) modal.classList.add('active');
}

function renderModifierOptions(container) {
  if (!container) return;

  // Gabungkan grup bawaan kafe + pilihan modifier kustom yang dibuat sendiri oleh pemilik
  let activeGroups = [...State.modifierGroups];
  if (pendingProduct && Array.isArray(pendingProduct.customModifiers) && pendingProduct.customModifiers.length > 0) {
    activeGroups.push({
      id: 'custom_product_mods',
      title: 'Pilihan Modifier Khusus Menu Ini',
      required: false,
      multi: true,
      options: pendingProduct.customModifiers.map((cm, idx) => ({
        id: `cmod_${idx}`,
        name: cm.name,
        extra: Number(cm.price) || 0,
        shortCode: cm.name
      }))
    });
  }

  container.innerHTML = activeGroups.map(group => `
    <div class="modifier-group-block">
      <div class="modifier-group-title">
        <span>${group.title}</span>
        ${group.required ? '<span class="mod-required-tag">*Wajib</span>' : ''}
      </div>
      <div class="modifier-options-grid">
        ${group.options.map(opt => {
          const isSelected = selectedModifiers.some(m => m.id === opt.id);
          return `
            <div class="mod-option-pill ${isSelected ? 'selected' : ''}" 
                 data-group="${group.id}" 
                 data-opt-id="${opt.id}">
              <span>${opt.name}</span>
              ${opt.extra > 0 ? '<strong>+' + formatRupiah(opt.extra) + '</strong>' : ''}
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `).join('');

  container.querySelectorAll('.mod-option-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      const groupId = pill.dataset.group;
      const optId = pill.dataset.optId;
      const group = activeGroups.find(g => g.id === groupId);
      if (!group) return;
      const option = group.options.find(o => o.id === optId);
      if (!option) return;

      if (group.multi) {
        const idx = selectedModifiers.findIndex(m => m.id === optId);
        if (idx >= 0) selectedModifiers.splice(idx, 1);
        else selectedModifiers.push(option);
      } else {
        selectedModifiers = selectedModifiers.filter(m => !group.options.some(o => o.id === m.id));
        selectedModifiers.push(option);
      }

      renderModifierOptions(container);
      updateModalTotal();
    });
  });
}

function updateModalTotal() {
  const totalEl = document.getElementById('modalItemTotalText');
  if (!totalEl || !pendingProduct) return;
  const extraTotal = selectedModifiers.reduce((sum, m) => sum + (m.extra || 0), 0);
  totalEl.innerText = formatRupiah(pendingProduct.price + extraTotal);
}

// Edit existing item from cart
window.editCartItem = function(index) {
  if (index >= 0 && index < State.cart.length) {
    State.editingCartIndex = index;
    const item = State.cart[index];
    openModifierModal(item.product, item);
  }
};

// --- 7. CART & BILLING ---
function addToCart(product, modifiers = [], qty = 1, notes = '') {
  const modsString = modifiers.map(m => m.name).sort().join(', ');
  const modsShort = modifiers.map(m => m.shortCode || m.name).join(' • ');

  const existingIdx = State.cart.findIndex(i =>
    i.product.id === product.id && i.modsString === modsString && (i.notes || '') === notes
  );

  if (existingIdx >= 0) {
    State.cart[existingIdx].qty += qty;
  } else {
    State.cart.push({
      product: product,
      qty: qty,
      modifiers: modifiers,
      modsString: modsString,
      modsShort: modsShort,
      notes: notes
    });
  }

  showToast(`Ditambahkan: ${product.name}`);
  renderCart();
}

function updateCartQty(index, delta) {
  if (index >= 0 && index < State.cart.length) {
    State.cart[index].qty += delta;
    if (State.cart[index].qty <= 0) {
      State.cart.splice(index, 1);
    }
    renderCart();
  }
}

function removeCartItem(index) {
  if (index >= 0 && index < State.cart.length) {
    State.cart.splice(index, 1);
    renderCart();
  }
}

function renderCart() {
  const container = document.getElementById('cartItemsList');
  const custName = document.getElementById('cartCustomerName');
  const custTier = document.getElementById('cartCustomerTier');
  const editAlert = document.getElementById('cartOrderEditAlert');
  const cartTitle = document.getElementById('cartTitleText');
  const seqTag = document.getElementById('editingOrderSeqTag');

  // Mode Edit Pesanan Recalled
  if (State.editingOrderInvoice) {
    const targetOrder = State.dailyOrders.find(o => o.invoice === State.editingOrderInvoice);
    if (editAlert) editAlert.style.display = 'flex';
    if (seqTag && targetOrder) seqTag.innerText = targetOrder.dailySeq;
    if (cartTitle && targetOrder) cartTitle.innerText = `Koreksi ${targetOrder.dailySeq}`;
  } else {
    if (editAlert) editAlert.style.display = 'none';
    if (cartTitle) cartTitle.innerText = 'Pesanan Baru';
  }

  if (State.selectedCustomer) {
    if (custName) custName.innerText = `${State.selectedCustomer.name} (${State.selectedCustomer.tier})`;
    if (custTier) custTier.innerText = `Poin: ${State.selectedCustomer.points} • Diskon Member: ${State.selectedCustomer.tierDiscount}%`;
  } else {
    if (custName) custName.innerText = 'Pilih Pelanggan / Member';
    if (custTier) custTier.innerText = 'Dapatkan poin loyalitas & promo member';
  }

  if (!container) return;

  if (State.cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-coffee">
        <i class="fa-solid fa-mug-saucer"></i>
        <p>Pesanan masih kosong.<br>Pilih kopi atau makanan di menu.</p>
      </div>
    `;
    updateCartTotals(0, 0, 0, 0);
    const checkoutBtn = document.getElementById('checkoutBtn');
    if (checkoutBtn) checkoutBtn.disabled = true;
    return;
  }

  let subtotal = 0;

  container.innerHTML = State.cart.map((item, idx) => {
    const modExtra = (item.modifiers || []).reduce((s, m) => s + (m.extra || 0), 0);
    const unitPrice = item.product.price + modExtra;
    const itemSubtotal = unitPrice * item.qty;
    subtotal += itemSubtotal;

    return `
      <div class="cart-item-card">
        <div class="cart-item-header">
          <div>
            <div class="cart-item-name">${item.product.name}</div>
            ${item.modsString ? `<div class="cart-item-mods"><i class="fa-solid fa-sliders"></i> ${item.modsString}</div>` : ''}
            ${item.notes ? `<div class="cart-item-note"><i class="fa-solid fa-comment-dots"></i> ${item.notes}</div>` : ''}
          </div>
          <div class="cart-item-actions">
            <!-- Tombol Edit Modifier & Catatan Pesanan Input -->
            <button class="btn-edit-cart-item" onclick="editCartItem(${idx})" title="Edit Opsi & Catatan Minuman">
              <i class="fa-solid fa-pen"></i>
            </button>
            <button class="btn-text-danger" onclick="removeCartItem(${idx})" title="Hapus"><i class="fa-solid fa-xmark"></i></button>
          </div>
        </div>
        <div class="cart-item-bottom">
          <div class="cart-qty-pill">
            <button class="btn-qty-mini" onclick="updateCartQty(${idx}, -1)">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="btn-qty-mini" onclick="updateCartQty(${idx}, 1)">+</button>
          </div>
          <span class="cart-item-price">${formatRupiah(itemSubtotal)}</span>
        </div>
      </div>
    `;
  }).join('');

  // Discount Calculation
  let discount = 0;
  if (State.selectedCustomer && State.selectedCustomer.tierDiscount > 0) {
    discount += (subtotal * State.selectedCustomer.tierDiscount / 100);
  }
  if (State.appliedPromo) {
    if (State.appliedPromo.type === 'percent') discount += (subtotal * State.appliedPromo.value / 100);
    else discount += State.appliedPromo.value;
  }

  const taxable = Math.max(0, subtotal - discount);
  const tax = 0; // Bebas Pajak (Tanpa Pajak)
  const grandTotal = taxable;

  updateCartTotals(subtotal, discount, tax, grandTotal);

  const checkoutBtn = document.getElementById('checkoutBtn');
  if (checkoutBtn) {
    checkoutBtn.disabled = false;
    const btnTextSpan = checkoutBtn.querySelector('.btn-left span');
    if (btnTextSpan) {
      btnTextSpan.innerText = State.editingOrderInvoice ? 'Perbarui Pesanan' : 'Bayar Sekarang';
    }
  }
}

function updateCartTotals(subtotal, discount, tax, grandTotal) {
  const subtotalEl = document.getElementById('cartSubtotalText');
  const discountRow = document.getElementById('cartDiscountRow');
  const discountEl = document.getElementById('cartDiscountText');
  const taxEl = document.getElementById('cartTaxText');
  const totalEl = document.getElementById('cartGrandTotalText');
  const btnTotalEl = document.getElementById('checkoutBtnTotal');

  if (subtotalEl) subtotalEl.innerText = formatRupiah(subtotal);
  if (discountRow) {
    discountRow.style.display = discount > 0 ? 'flex' : 'none';
    if (discountEl) discountEl.innerText = '-' + formatRupiah(discount);
  }
  if (taxEl) taxEl.innerText = formatRupiah(tax);
  if (totalEl) totalEl.innerText = formatRupiah(grandTotal);
  if (btnTotalEl) btnTotalEl.innerText = formatRupiah(grandTotal);
}

// --- 8. POS CONTROLS ---
function initPosControls() {
  const searchInput = document.getElementById('coffeeSearchInput');
  const clearSearchBtn = document.getElementById('clearSearchBtn');
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      State.searchQuery = e.target.value.trim().toLowerCase();
      if (clearSearchBtn) clearSearchBtn.style.display = State.searchQuery ? 'block' : 'none';
      renderProducts();
    });
  }
  if (clearSearchBtn) {
    clearSearchBtn.addEventListener('click', () => {
      searchInput.value = '';
      State.searchQuery = '';
      clearSearchBtn.style.display = 'none';
      renderProducts();
    });
  }

  document.querySelectorAll('.chip-type').forEach(chip => {
    chip.addEventListener('click', () => {
      document.querySelectorAll('.chip-type').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      State.orderType = chip.dataset.type;

      const tableWrap = document.getElementById('tableSelectorWrap');
      if (tableWrap) tableWrap.style.display = State.orderType === 'dineIn' ? 'flex' : 'none';
    });
  });

  const tableSelect = document.getElementById('tableNumberSelect');
  if (tableSelect) {
    tableSelect.addEventListener('change', e => {
      State.tableNumber = e.target.value;
    });
  }

  document.getElementById('clearCartBtn')?.addEventListener('click', () => {
    if (confirm('Kosongkan keranjang pesanan?')) {
      State.cart = [];
      renderCart();
    }
  });

  document.getElementById('applyVoucherBtn')?.addEventListener('click', () => {
    const code = document.getElementById('voucherCodeInput').value.trim().toUpperCase();
    const p = State.promotions.find(x => x.code === code);
    if (p) {
      State.appliedPromo = p;
      const b = document.getElementById('appliedPromoBadge');
      const t = document.getElementById('appliedPromoText');
      if (b) b.style.display = 'flex';
      if (t) t.innerText = `Promo Aktif: ${p.name}`;
      renderCart();
      showToast(`Voucher ${code} berhasil diterapkan!`);
    } else {
      showToast('Voucher tidak ditemukan atau sudah habis!', 'error');
    }
  });

  document.getElementById('removePromoBtn')?.addEventListener('click', () => {
    State.appliedPromo = null;
    document.getElementById('appliedPromoBadge').style.display = 'none';
    renderCart();
  });

  document.getElementById('cancelEditRecalledOrderBtn')?.addEventListener('click', () => {
    State.editingOrderInvoice = null;
    State.cart = [];
    renderCart();
    showToast('Mode koreksi pesanan dibatalkan');
  });
}

// --- 9. RENDER DAFTAR PESANAN MASTER-DETAIL & CETAK LABEL (PERSIS SCREENSHOT 1 & 2) ---
State.currentOrdersTab = 'selesai';
State.ordersSearchQuery = '';
State.selectedOrderInvoice = null;

function renderDailyOrders() {
  const cardsGrid = document.getElementById('dailyOrdersCardsGrid');
  const detailPane = document.getElementById('ordersDetailPane');
  if (!cardsGrid) return;

  const orders = Array.isArray(State.dailyOrders) ? State.dailyOrders : [];
  const currentTab = State.currentOrdersTab || 'selesai';
  const query = (State.ordersSearchQuery || '').trim().toLowerCase();

  // Filter berdasarkan Tab Status
  let filtered = orders.filter(o => {
    const status = (o.status || 'Selesai').toLowerCase();
    if (currentTab === 'pending') {
      return status.includes('pending') || status.includes('proses') || status.includes('barista');
    } else if (currentTab === 'menunggu') {
      return status.includes('tunggu') || status.includes('bayar');
    } else if (currentTab === 'selesai') {
      return status.includes('selesai') || status.includes('lunas') || status.includes('done');
    }
    return true; // tab 'all'
  });

  // Filter pencarian
  if (query) {
    filtered = filtered.filter(o => {
      const qNum = (o.dailySeq || '').toLowerCase();
      const inv = (o.invoice || '').toLowerCase();
      const cust = (o.customerName || '').toLowerCase();
      const table = (o.table || '').toLowerCase();
      const itemNames = (o.items || []).map(i => i.name.toLowerCase()).join(' ');
      return qNum.includes(query) || inv.includes(query) || cust.includes(query) || table.includes(query) || itemNames.includes(query);
    });
  }

  // Pilih order pertama jika order terpilih tidak ditemukan di daftar filter
  if (!State.selectedOrderInvoice || !filtered.some(o => o.invoice === State.selectedOrderInvoice)) {
    State.selectedOrderInvoice = filtered[0]?.invoice || null;
  }

  // 1. RENDER KARTU PESANAN (KIRI)
  if (filtered.length === 0) {
    cardsGrid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 48px 16px; background: #ffffff; border: 1.5px dashed #cbd5e1; border-radius: 14px;">
        <i class="fa-solid fa-receipt" style="font-size: 2.8rem; color: #f97316; opacity: 0.5; margin-bottom: 10px; display: block;"></i>
        <h4 style="font-size: 1rem; color: #0f172a; margin-bottom: 4px;">Tidak Ada Pesanan (${currentTab.toUpperCase()})</h4>
        <p style="font-size: 0.8rem; color: #64748b; margin: 0;">Ganti tab atau cari dengan kata kunci lain.</p>
      </div>
    `;
  } else {
    cardsGrid.innerHTML = filtered.map(order => {
      const isSel = order.invoice === State.selectedOrderInvoice;
      const isTakeAway = (order.orderType || '').toLowerCase().includes('take');
      const queueDisplay = order.dailySeq ? (order.dailySeq.startsWith('#') ? 'P' + order.dailySeq.slice(1).padStart(4, '0') : order.dailySeq) : 'P0001';

      return `
        <div class="pos-order-card ${isSel ? 'selected' : ''}" onclick="selectDailyOrder('${order.invoice}')">
          <div class="card-top-row">
            <span class="card-queue-num">${queueDisplay}</span>
            <span class="card-time">${formatTime(order.date)}</span>
          </div>
          <div class="card-mid-row">
            <span class="card-customer">${order.customerName || 'GUEST'}</span>
            <strong class="card-total">${formatRupiah(order.grandTotal)}</strong>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. RENDER DETAIL PESANAN TERPILIH (KANAN - PERSIS SCREENSHOT 1)
  const selOrder = orders.find(o => o.invoice === State.selectedOrderInvoice) || filtered[0];

  if (!selOrder || !detailPane) {
    if (detailPane) {
      detailPane.innerHTML = `
        <div style="padding: 40px 20px; text-align: center; color: #64748b; font-size: 0.85rem;">
          <i class="fa-solid fa-arrow-left" style="font-size: 2rem; color: #cbd5e1; margin-bottom: 12px; display: block;"></i>
          Pilih salah satu pesanan di sebelah kiri untuk melihat rincian dan mencetak struk.
        </div>
      `;
    }
    return;
  }

  const selQueueDisplay = selOrder.dailySeq ? (selOrder.dailySeq.startsWith('#') ? 'P' + selOrder.dailySeq.slice(1).padStart(4, '0') : selOrder.dailySeq) : 'P0001';

  detailPane.innerHTML = `
    <div class="order-detail-header-meta">
      <div class="meta-row">
        <span class="meta-label">No. Invoice</span>
        <strong class="meta-val">${selOrder.invoice}</strong>
      </div>
      <div class="meta-row">
        <span class="meta-label">Nomor Antrian</span>
        <strong class="meta-val meta-val-highlight">${selQueueDisplay}</strong>
      </div>
      <div class="meta-row">
        <span class="meta-label">Transaksi Dibuat</span>
        <span class="meta-val">${formatDate(selOrder.date)} ${formatTime(selOrder.date)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Transaksi Selesai</span>
        <span class="meta-val">${formatDate(selOrder.date)} ${formatTime(selOrder.date)}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Pelanggan</span>
        <strong class="meta-val">${selOrder.customerName || 'GUEST'}</strong>
      </div>
      <div class="meta-row">
        <span class="meta-label">Jenis Pesanan</span>
        <span class="meta-val">Langsung (Kasir)</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Order</span>
        <span class="meta-val">${selOrder.cashier || 'user007994'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Kasir</span>
        <span class="meta-val">${selOrder.cashier || 'user007994'}</span>
      </div>
      <div class="meta-row">
        <span class="meta-label">Pembayaran</span>
        <span class="meta-val" style="color:#16a34a; font-weight:700;">${selOrder.paymentMethod || 'Tunai'} (LUNAS)</span>
      </div>
    </div>

    <div class="order-detail-section-title">DAFTAR PESANAN</div>

    <div class="order-detail-items-scroll">
      ${(selOrder.items || []).map(it => `
        <div class="detail-item-row">
          <div class="detail-item-left">
            <span class="detail-item-qty">${it.qty}</span>
            <div class="detail-item-info">
              <div class="detail-item-name">${it.name}</div>
              <div class="detail-item-mods">${it.mods || 'Standar (Normal Ice, Normal Sugar)'}</div>
            </div>
          </div>
          <div class="detail-item-price">${formatRupiah(it.price * it.qty)}</div>
        </div>
      `).join('')}
    </div>

    <div class="order-detail-totals-box">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatRupiah(selOrder.subtotal || selOrder.grandTotal)}</span>
      </div>
      ${selOrder.discount > 0 ? `
        <div class="totals-row" style="color:#dc2626;">
          <span>Diskon</span>
          <span>-${formatRupiah(selOrder.discount)}</span>
        </div>
      ` : ''}
      <div class="totals-row totals-grand">
        <span>TOTAL TAGIHAN</span>
        <strong>${formatRupiah(selOrder.grandTotal)}</strong>
      </div>
    </div>

    <div class="order-detail-actions-bar">
      <button type="button" class="btn-action-outline btn-print-receipt-action" onclick="printOrderDirectReceipt('${selOrder.invoice}')" title="Cetak Struk Kasir Thermal (1 Halaman)">
        <i class="fa-solid fa-receipt"></i> Cetak Struk
      </button>
      <button type="button" class="btn-action-outline btn-print-label-action" onclick="openCetakLabelModal('${selOrder.invoice}')" title="Cetak Stiker Label Cup Minuman">
        <i class="fa-solid fa-stamp"></i> Cetak Label
      </button>
      <button type="button" class="btn-action-outline btn-share-wa-action" onclick="shareOrderDirectWa('${selOrder.invoice}')" title="Bagikan ke WhatsApp Pelanggan">
        <i class="fa-brands fa-whatsapp"></i> Bagikan Struk
      </button>
    </div>
  `;
}

// Handler Pilih Kartu Pesanan
window.selectDailyOrder = function(invoice) {
  State.selectedOrderInvoice = invoice;
  renderDailyOrders();
};

// Handler Cetak Struk Langsung (Cepat, 1 Lembar Bersih Langsung ke Bluetooth)
window.printOrderDirectReceipt = function(invoice) {
  const order = (State.dailyOrders || []).find(o => o.invoice === invoice);
  if (!order) {
    showToast('Pesanan tidak ditemukan', 'error');
    return;
  }
  State.activePrintOrder = order;

  if (window.BluetoothPrintManager && window.BluetoothPrintManager.isConnected) {
    executeThermalPrint('print-mode-cashier');
  } else {
    // Tampilkan modal Bluetooth agar kasir bisa langsung cari & sambungkan printer dengan 1 klik
    window.openBluetoothModal(order);
  }
};

// Handler Bagikan Struk ke WhatsApp
window.shareOrderDirectWa = function(invoice) {
  const order = (State.dailyOrders || []).find(o => o.invoice === invoice);
  if (!order) return;
  const itemsText = (order.items || []).map(i => `• ${i.name} x${i.qty} = ${formatRupiah(i.price * i.qty)}`).join('\n');
  const text = encodeURIComponent(
    `*CAFFEE SA'ADAH - BUKTI PEMBAYARAN*\n` +
    `No. Invoice: ${order.invoice}\n` +
    `No. Antrian: ${order.dailySeq}\n` +
    `Pelanggan: ${order.customerName || 'GUEST'}\n` +
    `Waktu: ${formatDate(order.date)} ${formatTime(order.date)}\n` +
    `--------------------------------\n` +
    `${itemsText}\n` +
    `--------------------------------\n` +
    `*TOTAL: ${formatRupiah(order.grandTotal)} (LUNAS)*\n` +
    `Metode: ${order.paymentMethod}\n\n` +
    `Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah`
  );
  window.open(`https://wa.me/?text=${text}`, '_blank');
};

// =========================================================================
// HANDLER MODAL CETAK LABEL (PERSIS SCREENSHOT 2)
// =========================================================================
window.openCetakLabelModal = function(invoice) {
  const order = (State.dailyOrders || []).find(o => o.invoice === invoice);
  if (!order) {
    showToast('Pesanan tidak ditemukan', 'error');
    return;
  }
  State.labelPrintingOrder = order;

  const modal = document.getElementById('modalCetakLabel');
  const listContainer = document.getElementById('labelItemsListContainer');
  const selectAllCheck = document.getElementById('checkSelectAllLabels');

  if (!modal || !listContainer) return;

  if (selectAllCheck) selectAllCheck.checked = true;

  // Render daftar item pesanan dengan checkbox
  const items = order.items || [];
  if (items.length === 0) {
    listContainer.innerHTML = `<div style="text-align:center; color:#64748b; padding:16px;">Tidak ada produk untuk dicetak.</div>`;
  } else {
    listContainer.innerHTML = items.map((it, idx) => `
      <label class="label-item-checkbox-row">
        <input type="checkbox" class="check-label-item" data-index="${idx}" checked>
        <div class="label-item-info">
          <span class="label-item-title">${it.qty} x ${it.name}</span>
          <span class="label-item-mods">${it.mods || 'Standar (Normal Ice, Normal Sugar)'}</span>
        </div>
      </label>
    `).join('');
  }

  // Update tombol cetak label
  updatePrintLabelButtonState();

  modal.classList.add('active');
};

function updatePrintLabelButtonState() {
  const checkedBoxes = document.querySelectorAll('.check-label-item:checked');
  const btn = document.getElementById('btnExecuteCetakLabel');
  if (btn) {
    btn.innerHTML = `<i class="fa-solid fa-print"></i> Cetak (${checkedBoxes.length} Label)`;
    btn.disabled = checkedBoxes.length === 0;
  }
}

// Inisialisasi Event Listener Modal Cetak Label & Subnav Daftar Pesanan
function initCetakLabelAndOrdersScreen() {
  const modal = document.getElementById('modalCetakLabel');
  const btnClose = document.getElementById('btnCloseCetakLabel');
  const selectAll = document.getElementById('checkSelectAllLabels');
  const btnExecute = document.getElementById('btnExecuteCetakLabel');
  const listContainer = document.getElementById('labelItemsListContainer');

  if (btnClose && modal) {
    btnClose.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (selectAll) {
    selectAll.addEventListener('change', (e) => {
      const isChecked = e.target.checked;
      document.querySelectorAll('.check-label-item').forEach(cb => {
        cb.checked = isChecked;
      });
      updatePrintLabelButtonState();
    });
  }

  if (listContainer) {
    listContainer.addEventListener('change', (e) => {
      if (e.target.classList.contains('check-label-item')) {
        const allBoxes = document.querySelectorAll('.check-label-item');
        const checkedBoxes = document.querySelectorAll('.check-label-item:checked');
        if (selectAll) {
          selectAll.checked = allBoxes.length > 0 && allBoxes.length === checkedBoxes.length;
        }
        updatePrintLabelButtonState();
      }
    });
  }

  if (btnExecute) {
    btnExecute.addEventListener('click', () => {
      const order = State.labelPrintingOrder;
      if (!order) return;

      const checkedIndexes = Array.from(document.querySelectorAll('.check-label-item:checked')).map(cb => parseInt(cb.dataset.index, 10));
      if (checkedIndexes.length === 0) {
        showToast('Pilih minimal 1 produk untuk dicetak labelnya!', 'warning');
        return;
      }

      // Kumpulkan item yang dicentang
      const selectedItems = checkedIndexes.map(idx => order.items[idx]).filter(Boolean);

      // Siapkan sticker cups
      const stickers = [];
      const totalSelectedCups = selectedItems.reduce((sum, it) => sum + (it.qty || 1), 0);
      let cupCounter = 1;

      selectedItems.forEach(it => {
        const qty = it.qty || 1;
        for (let c = 0; c < qty; c++) {
          stickers.push({
            drinkName: it.name,
            modsShort: it.mods || 'Standar',
            cupNum: cupCounter++,
            totalCups: totalSelectedCups,
            orderSeq: order.dailySeq || 'P0001',
            customerName: order.customerName || 'GUEST',
            table: order.table || order.orderType || 'Default Table',
            time: formatTime(order.date)
          });
        }
      });

      const showLogo = localStorage.getItem('caffee_receipt_show_logo') !== 'false';
      const logoUrl = localStorage.getItem('caffee_receipt_logo') || 'assets/saadah_logo.png';
      const isMono = localStorage.getItem('caffee_receipt_logo_mono') === 'mono';

      const stickersHtml = stickers.map(st => {
        const nameLen = (st.drinkName || '').length;
        const titleFontSize = nameLen > 24 ? '0.70rem' : nameLen > 16 ? '0.78rem' : '0.84rem';
        return `
          <div class="cup-sticker-label">
            <div class="sticker-header">
              <div style="display:flex; align-items:center; gap:4px;">
                ${showLogo ? `<img src="${logoUrl}" class="sticker-logo-img ${isMono ? 'receipt-logo-mono' : ''}" alt="Logo">` : ''}
                <span class="sticker-title">CAFFEE SA'ADAH</span>
              </div>
              <span class="sticker-cup-index">${st.orderSeq} • Cup ${st.cupNum}/${st.totalCups}</span>
            </div>
            <div class="sticker-drink-name" style="font-size:${titleFontSize}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${st.drinkName}</div>
            <div class="sticker-drink-mods" style="font-size:0.65rem;">${st.modsShort}</div>
            <div class="sticker-footer">
              <span>${st.customerName} (${st.table})</span>
              <span>${st.time}</span>
            </div>
          </div>
        `;
      }).join('');

      // Prioritas Bluetooth: Cetak langsung ke Printer Bluetooth ESC/POS
      if (window.BluetoothPrintManager && window.BluetoothPrintManager.isConnected) {
        const bytes = window.EscPosEncoder.buildLabels(order, selectedItems, window.BluetoothPrintManager.paperWidth);
        window.BluetoothPrintManager.sendBytes(bytes).then(() => {
          showToast(`✓ ${selectedItems.length} label cup berhasil dicetak ke Printer Bluetooth!`, 'success');
        }).catch(err => {
          console.warn('Bluetooth label error:', err);
          printThermalIframe(stickersHtml, '50mm', `Label #${order.dailySeq}`);
        });
        if (modal) modal.classList.remove('active');
        return;
      }

      // Cetak via isolated iframe jika belum konek Bluetooth
      printThermalIframe(stickersHtml, '50mm', `Label #${order.dailySeq}`);

      if (modal) modal.classList.remove('active');
      showToast(`Mencetak ${stickers.length} label stiker cup!`, 'success');
    });
  }

  // Filter Tabs Event Listeners
  document.querySelectorAll('.tab-order-status').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.tab-order-status').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      State.currentOrdersTab = tab.dataset.filter || 'all';
      renderDailyOrders();
    });
  });

  // Search Input Event Listener
  const searchInput = document.getElementById('inputSearchDailyOrders');
  const btnClearSearch = document.getElementById('btnClearOrdersSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      State.ordersSearchQuery = e.target.value;
      if (btnClearSearch) btnClearSearch.style.display = e.target.value ? 'inline-block' : 'none';
      renderDailyOrders();
    });
  }
  if (btnClearSearch && searchInput) {
    btnClearSearch.addEventListener('click', () => {
      searchInput.value = '';
      State.ordersSearchQuery = '';
      btnClearSearch.style.display = 'none';
      renderDailyOrders();
    });
  }

  // Refresh Button Event Listener
  const btnRefresh = document.getElementById('refreshDailyOrdersBtn');
  if (btnRefresh) {
    btnRefresh.addEventListener('click', () => {
      const activeId = State.activeStore?.id || 'SAADAH';
      loadStoreData(activeId);
      renderDailyOrders();
      showToast('Daftar pesanan diperbarui!', 'info');
    });
  }
}

window.openPrintSpecificOrder = function(invoice, tabType) {
  const order = State.dailyOrders.find(o => o.invoice === invoice);
  if (order) {
    State.activePrintOrder = order;
    if (tabType === 'sticker') {
      openCetakLabelModal(invoice);
    } else {
      printOrderDirectReceipt(invoice);
    }
  }
};

// --- 10. CHECKOUT & SUBMIT ORDER ---
function initCheckout() {
  const checkoutBtn = document.getElementById('checkoutBtn');
  const modal = document.getElementById('checkoutModal');
  const closeBtn = document.getElementById('closeCheckoutModalBtn');
  const cancelBtn = document.getElementById('cancelCheckoutBtn');
  const confirmBtn = document.getElementById('confirmProcessPaymentBtn');

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', () => {
      const grandTotal = getGrandTotal();
      document.getElementById('checkoutTagihanAmount').innerText = formatRupiah(grandTotal);
      document.getElementById('qrisBadgeAmount').innerText = formatRupiah(grandTotal);
      document.getElementById('cashReceivedInput').value = grandTotal;
      calculateChange();
      modal.classList.add('active');
    });
  }

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  const cashInput = document.getElementById('cashReceivedInput');
  if (cashInput) cashInput.addEventListener('input', calculateChange);

  document.getElementById('exactCashChip')?.addEventListener('click', () => {
    cashInput.value = getGrandTotal();
    calculateChange();
  });

  document.querySelectorAll('.btn-cash-chip[data-amt]').forEach(c => {
    c.addEventListener('click', () => {
      cashInput.value = c.dataset.amt;
      calculateChange();
    });
  });

  document.querySelectorAll('.pay-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.pay-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const method = btn.dataset.method;
      document.getElementById('cashInputSection').style.display = method === 'cash' ? 'block' : 'none';
      document.getElementById('qrisInputSection').style.display = method === 'qris' ? 'block' : 'none';
    });
  });

  if (confirmBtn) {
    confirmBtn.addEventListener('click', () => {
      completeOrderTransaction();
    });
  }
}

function calculateChange() {
  const grandTotal = getGrandTotal();
  const received = parseFloat(document.getElementById('cashReceivedInput')?.value) || 0;
  const change = Math.max(0, received - grandTotal);
  const changeEl = document.getElementById('cashChangeAmount');
  if (changeEl) changeEl.innerText = formatRupiah(change);
}

function getGrandTotal() {
  const totalStr = document.getElementById('cartGrandTotalText').innerText;
  return parseFloat(totalStr.replace(/[^0-9]/g, '')) || 0;
}

function completeOrderTransaction() {
  const grandTotal = getGrandTotal();
  const received = parseFloat(document.getElementById('cashReceivedInput')?.value) || grandTotal;
  const change = Math.max(0, received - grandTotal);
  const activePay = document.querySelector('.pay-btn.active');
  const payMethod = activePay ? activePay.querySelector('strong').innerText : 'Tunai (Cash)';

  // MODE A: KOREKSI / EDIT PESANAN YANG SUDAH ADA (DITARIK KE KASIR)
  if (State.editingOrderInvoice) {
    const existingOrder = State.dailyOrders.find(o => o.invoice === State.editingOrderInvoice);
    if (existingOrder) {
      existingOrder.items = State.cart.map(i => ({
        name: i.product.name,
        qty: i.qty,
        price: i.product.price + (i.modifiers || []).reduce((s, m) => s + (m.extra || 0), 0),
        mods: i.modsString || '',
        modsShort: i.modsShort || ''
      }));
      existingOrder.subtotal = State.cart.reduce((s, i) => s + (i.product.price * i.qty), 0);
      existingOrder.discount = (State.selectedCustomer?.tierDiscount || 0) + (State.appliedPromo?.value || 0);
      existingOrder.tax = 0;
      existingOrder.grandTotal = grandTotal;
      existingOrder.costTotal = State.cart.reduce((s, i) => s + (i.product.costPrice * i.qty), 0);
      existingOrder.paymentMethod = payMethod;
      existingOrder.cashReceived = received;
      existingOrder.change = change;
      existingOrder.orderType = 'Langsung';
      existingOrder.table = '-';

      // Sinkronisasi pembaruan ke Google Spreadsheet
      syncOrderToGoogleSheets(existingOrder, 'UPDATE');

      const savedSeq = existingOrder.dailySeq;
      State.editingOrderInvoice = null;
      document.getElementById('checkoutModal').classList.remove('active');
      State.activePrintOrder = existingOrder;
      openPrintHubModal(existingOrder, 'cashier');
      State.cart = [];
      State.appliedPromo = null;
      renderCart();
      renderProducts();
      renderDailyOrders();
      renderDashboardChartsAndMetrics();
      showToast(`Pesanan ${savedSeq} Berhasil Diperbarui & Disinkronkan!`);
      return;
    }
  }

  // MODE B: PESANAN BARU
  const nextSeq = '#' + (State.dailyOrders.length + 1).toString().padStart(3, '0');
  const now = new Date();
  const invStr = `INV-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now.getDate().toString().padStart(2, '0')}-${(State.dailyOrders.length + 1).toString().padStart(3, '0')}`;

  const newOrder = {
    dailySeq: nextSeq,
    invoice: invStr,
    date: now,
    customerName: State.selectedCustomer ? State.selectedCustomer.name : 'Pelanggan Umum',
    cashier: State.currentShift.cashierName || 'Karyawan 1',
    orderType: 'Langsung',
    table: '-',
    status: 'Diproses Barista',
    items: State.cart.map(i => ({
      name: i.product.name,
      qty: i.qty,
      price: i.product.price + (i.modifiers || []).reduce((s, m) => s + (m.extra || 0), 0),
      mods: i.modsString || '',
      modsShort: i.modsShort || ''
    })),
    subtotal: State.cart.reduce((s, i) => s + (i.product.price * i.qty), 0),
    discount: (State.selectedCustomer?.tierDiscount || 0) + (State.appliedPromo?.value || 0),
    tax: 0,
    grandTotal: grandTotal,
    costTotal: State.cart.reduce((s, i) => s + (i.product.costPrice * i.qty), 0),
    paymentMethod: payMethod,
    cashReceived: received,
    change: change
  };

  // Deduct Stock
  State.cart.forEach(c => {
    const prod = State.products.find(p => p.id === c.product.id);
    if (prod) prod.stock = Math.max(0, prod.stock - c.qty);
  });

  // Shift drawer calculation
  if (payMethod.includes('Tunai')) {
    State.currentShift.totalCashSales += grandTotal;
  } else {
    State.currentShift.totalQrisSales += grandTotal;
  }

  const shiftExpected = State.currentShift.initialCash + State.currentShift.totalCashSales;
  const headerCashEl = document.getElementById('headerDrawerCash');
  if (headerCashEl) headerCashEl.innerText = formatRupiah(shiftExpected);

  State.dailyOrders.unshift(newOrder);
  saveAppState();

  // Kirim data pesanan real-time ke Google Spreadsheet
  syncOrderToGoogleSheets(newOrder, 'CREATE');

  document.getElementById('checkoutModal').classList.remove('active');

  State.activePrintOrder = newOrder;
  openPrintHubModal(newOrder, 'cashier');

  State.cart = [];
  State.appliedPromo = null;
  renderCart();
  renderProducts();
  renderDailyOrders();
  renderDashboardChartsAndMetrics();
  saveAppState();
  showToast(`Pesanan ${newOrder.dailySeq} Berhasil Disimpan & Dikirim ke Cloud!`);
}

// --- 11. PRINT HUB & PILIHAN CETAK STRUK (BERSIH, SIMPEL & CEPAT) ---
function initPrintHub() {
  const modal = document.getElementById('printHubModal');
  const closeBtn = document.getElementById('closePrintHubBtn');
  const closeFooterBtn = document.getElementById('closePrintHubFooterBtn');
  const btnCashier = document.getElementById('btnPrintCashierDirect');
  const btnKitchen = document.getElementById('btnPrintKitchenDirect');
  const btnSticker = document.getElementById('btnPrintStickerDirect');
  const btnBtSettings = document.getElementById('btnConnectBluetoothPrinter');
  const shareWaBtn = document.getElementById('shareWaBtn');
  const paperSelect = document.getElementById('quickReceiptPaperSize');
  const logoToggle = document.getElementById('quickToggleReceiptLogo');

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (closeFooterBtn) closeFooterBtn.addEventListener('click', () => modal.classList.remove('active'));

  // 1. Eksekusi Cetak Struk Kasir Langsung
  if (btnCashier) {
    btnCashier.addEventListener('click', () => {
      executeThermalPrint('print-mode-cashier');
    });
  }

  // 2. Eksekusi Cetak Struk Dapur / Bar Langsung
  if (btnKitchen) {
    btnKitchen.addEventListener('click', () => {
      executeThermalPrint('print-mode-kitchen');
    });
  }

  // 3. Eksekusi Cetak Stiker Cup Minuman Langsung
  if (btnSticker) {
    btnSticker.addEventListener('click', () => {
      executeThermalPrint('print-mode-all-stickers');
    });
  }

  // 4. Tombol Atur / Sambungkan Printer Bluetooth
  if (btnBtSettings) {
    btnBtSettings.addEventListener('click', () => {
      window.openBluetoothModal(State.activePrintOrder);
    });
  }

  // 5. Ganti Ukuran Kertas Cepat (58mm / 80mm)
  if (paperSelect) {
    paperSelect.addEventListener('change', (e) => {
      localStorage.setItem('caffee_receipt_paper_size', e.target.value);
      if (window.BluetoothPrintManager) {
        window.BluetoothPrintManager.paperWidth = e.target.value;
      }
      const order = State.activePrintOrder || State.currentPrintingOrder;
      if (order) {
        renderCashierReceipt(order);
        renderKitchenTicket(order);
      }
      showToast(`Ukuran kertas diatur ke ${e.target.value}`);
    });
  }

  // 6. Toggle Cetak Logo Kafe
  if (logoToggle) {
    logoToggle.addEventListener('change', (e) => {
      localStorage.setItem('caffee_receipt_show_logo', e.target.checked ? 'true' : 'false');
      const order = State.activePrintOrder || State.currentPrintingOrder;
      if (order) {
        renderCashierReceipt(order);
      }
      showToast(`Cetak logo pada struk ${e.target.checked ? 'diaktifkan' : 'dinonaktifkan'}.`);
    });
  }

  // 7. Bagikan Bukti Bayar via WhatsApp
  if (shareWaBtn) {
    shareWaBtn.addEventListener('click', () => {
      const o = State.activePrintOrder || State.currentPrintingOrder;
      if (!o) return;
      const itemsList = (o.items || []).map(i => `• ${i.name} x${i.qty} = ${formatRupiah(i.price * i.qty)}`).join('\n');
      const text = encodeURIComponent(
        `*STRUK PEMBAYARAN CAFFEE SA'ADAH*\n` +
        `No. Pesanan: ${o.dailySeq} (${o.invoice})\n` +
        `Pelanggan: ${o.customerName || 'Pelanggan Umum'}\n` +
        `--------------------------------\n` +
        `${itemsList}\n` +
        `--------------------------------\n` +
        `*TOTAL: ${formatRupiah(o.grandTotal)} (LUNAS)*\n` +
        `Metode: ${o.paymentMethod || 'Tunai'}\n\n` +
        `Terima kasih telah berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah`
      );
      window.open(`https://wa.me/?text=${text}`, '_blank');
    });
  }

  // Pastikan area buffer cetak tersembunyi kosong pada saat startup
  const printArea = document.getElementById('printReceiptThermalArea');
  if (printArea) {
    printArea.innerHTML = '';
  }
}

// =========================================================================
// SISTEM CETAK THERMAL TERISOLASI (IFRAME ISOLATION - 100% ANTI HALAMAN KOSONG)
// =========================================================================
function printThermalIframe(htmlContent, paperWidth = '80mm', title = 'Cetak Struk') {
  let iframe = document.getElementById('thermalPrintIframe');
  if (!iframe) {
    iframe = document.createElement('iframe');
    iframe.id = 'thermalPrintIframe';
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.style.zIndex = '-9999';
    document.body.appendChild(iframe);
  }

  const is58 = paperWidth === '58mm';
  const widthMm = is58 ? '54mm' : '72mm';
  const baseHref = window.location.href.split('#')[0].split('?')[0];

  const doc = iframe.contentDocument || iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>${title}</title>
      <base href="${baseHref}">
      <style>
        @page {
          margin: 0 !important;
          size: auto;
        }
        * {
          box-sizing: border-box !important;
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
        }
        html, body {
          margin: 0 !important;
          padding: 0 !important;
          background: #ffffff !important;
          color: #000000 !important;
          font-family: 'JetBrains Mono', 'Courier New', Courier, monospace !important;
          font-size: ${is58 ? '10px' : '11px'} !important;
          line-height: 1.35 !important;
          width: 100% !important;
          min-height: 0 !important;
          overflow: visible !important;
        }
        .thermal-paper {
          width: ${widthMm} !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 3mm 1.5mm !important;
          background: #ffffff !important;
          color: #000000 !important;
          box-sizing: border-box !important;
        }
        .kitchen-paper {
          width: ${widthMm} !important;
          max-width: 100% !important;
          margin: 0 auto !important;
          padding: 3mm 1.5mm !important;
          background: #ffffff !important;
          color: #000000 !important;
          box-sizing: border-box !important;
        }
        .cup-sticker-label {
          width: 50mm !important;
          min-height: 30mm !important;
          max-height: 30mm !important;
          margin: 0 auto !important;
          padding: 2mm 3mm !important;
          box-sizing: border-box !important;
          background: #ffffff !important;
          color: #000000 !important;
          border: 1px dashed #000 !important;
          page-break-after: always !important;
          break-after: page !important;
          overflow: hidden !important;
          font-family: system-ui, -apple-system, sans-serif !important;
        }
        .cup-sticker-label:last-child {
          page-break-after: auto !important;
          break-after: auto !important;
        }
        .sticker-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 1px solid #000;
          padding-bottom: 2px;
          margin-bottom: 2px;
        }
        .sticker-title {
          font-size: 0.65rem;
          font-weight: 800;
        }
        .sticker-cup-index {
          font-size: 0.65rem;
          font-weight: 800;
        }
        .sticker-drink-name {
          font-weight: 900;
          margin: 1px 0;
          line-height: 1.15;
        }
        .sticker-drink-mods {
          color: #222;
          margin-bottom: 2px;
          line-height: 1.1;
        }
        .sticker-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.60rem;
          border-top: 1px dashed #000;
          padding-top: 2px;
          margin-top: 2px;
        }
        .sticker-logo-img {
          max-height: 16px;
          max-width: 40px;
          object-fit: contain;
          display: inline-block;
          vertical-align: middle;
        }
        .receipt-logo-img {
          display: block;
          margin: 0 auto 4px auto;
          object-fit: contain;
        }
        .receipt-logo-size-small { max-width: 85px; max-height: 45px; }
        .receipt-logo-size-medium { max-width: 120px; max-height: 65px; }
        .receipt-logo-size-large { max-width: 160px; max-height: 85px; }
        .receipt-logo-mono {
          filter: grayscale(100%) contrast(200%);
        }
      </style>
    </head>
    <body>
      ${htmlContent}
    </body>
    </html>
  `);
  doc.close();

  const triggerPrint = () => {
    try {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    } catch (err) {
      console.warn('Iframe print error, falling back to window.print():', err);
      window.print();
    }
  };

  const images = doc.images;
  if (images && images.length > 0) {
    let loaded = 0;
    let done = false;
    const onImgFinish = () => {
      loaded++;
      if (loaded >= images.length && !done) {
        done = true;
        setTimeout(triggerPrint, 100);
      }
    };
    for (let i = 0; i < images.length; i++) {
      if (images[i].complete) {
        onImgFinish();
      } else {
        images[i].onload = onImgFinish;
        images[i].onerror = onImgFinish;
      }
    }
    setTimeout(() => {
      if (!done) {
        done = true;
        triggerPrint();
      }
    }, 400);
  } else {
    setTimeout(triggerPrint, 60);
  }
}
window.printThermalIframe = printThermalIframe;

// Eksekusi Cetak Thermal Proporsional (Direct Bluetooth ESC/POS / RawBT / Iframe Print)
function executeThermalPrint(mode) {
  const order = State.activePrintOrder || State.currentPrintingOrder;
  if (!order) {
    showToast('Tidak ada data pesanan untuk dicetak', 'error');
    return;
  }

  // 1. PRIORITAS UTAMA: Jika Printer Bluetooth Terhubung, Langsung Kirim Byte ESC/POS!
  if (window.BluetoothPrintManager && window.BluetoothPrintManager.isConnected) {
    showToast('Mengirim langsung ke printer Bluetooth...', 'info');
    let bytes;
    if (mode === 'print-mode-sticker' || mode === 'print-single-sticker') {
      bytes = window.EscPosEncoder.buildLabels(order, null, window.BluetoothPrintManager.paperWidth);
    } else {
      bytes = window.EscPosEncoder.buildReceipt(order, window.BluetoothPrintManager.paperWidth, window.BluetoothPrintManager.autoCut);
    }
    window.BluetoothPrintManager.sendBytes(bytes).then(() => {
      showToast(`✓ Struk ${order.dailySeq || order.invoice} BERHASIL DICETAK ke Printer Bluetooth!`, 'success');
    }).catch(err => {
      console.warn('Bluetooth print failed:', err);
      showToast('Gagal cetak Bluetooth: ' + err.message, 'error');
    });
    return;
  }

  // 2. Jika Mode RawBT Android dipilih
  if (mode === 'rawbt') {
    const bytes = window.EscPosEncoder.buildReceipt(order, window.BluetoothPrintManager ? window.BluetoothPrintManager.paperWidth : 32);
    window.sendBytesToRawBT(bytes);
    return;
  }

  const paperSize = document.getElementById('quickReceiptPaperSize')?.value || localStorage.getItem('caffee_receipt_paper_size') || '80mm';

  const showLogo = localStorage.getItem('caffee_receipt_show_logo') !== 'false';
  let logoUrl = localStorage.getItem('caffee_receipt_logo') || 'assets/saadah_logo.png';
  const logoSize = localStorage.getItem('caffee_receipt_logo_size') || 'medium';
  const isMono = localStorage.getItem('caffee_receipt_logo_mono') === 'mono';

  const logoHtml = showLogo ? `
    <div class="receipt-logo-wrap" style="text-align:center; margin-bottom:6px;">
      <img src="${logoUrl}" alt="Logo" class="receipt-logo-img receipt-logo-size-${logoSize} ${isMono ? 'receipt-logo-mono' : ''}" style="max-height:65px; display:inline-block;">
    </div>
  ` : '';

  const cafeName = localStorage.getItem('caffee_setting_name') || "CAFFEE SA'ADAH";
  const cafeAddr = localStorage.getItem('caffee_setting_addr') || "Coffee, Cake & Bread • Halal Indonesia";
  let cafeFooter = localStorage.getItem('caffee_setting_footer') || "Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah";
  if (cafeFooter.includes('Pemilik: Syukri & Ardan')) {
    cafeFooter = cafeFooter.replace('Pemilik: Syukri & Ardan • ', '').replace('Pemilik: Syukri & Ardan', '').trim();
  }

  let htmlContent = '';
  let printTitle = 'Struk Kasir';

  if (mode === 'print-mode-cashier') {
    printTitle = `Struk #${order.dailySeq}`;
    htmlContent = `
      <div class="thermal-paper">
        <div class="receipt-head" style="text-align:center;">
          ${logoHtml}
          <h3 style="margin:2px 0; font-size:1.05rem; font-weight:800; font-family:'Outfit', sans-serif;">${cafeName}</h3>
          <p style="margin:1px 0; font-size:0.68rem; color:#444;">${cafeAddr}</p>
          <p style="margin:1px 0; font-size:0.68rem; color:#444;">Instagram: @cs.coffeesaadah</p>
        </div>

        <div class="receipt-seq-banner" style="text-align:center; font-size:0.95rem; font-weight:900; margin:6px 0; padding:4px; border-top:1px dashed #000; border-bottom:1px dashed #000;">
          PESANAN ${order.dailySeq}
        </div>

        <div style="font-size:0.68rem; margin-bottom:6px; line-height:1.4;">
          <div>No: ${order.invoice}</div>
          <div>Waktu: ${formatDate(order.date)}</div>
          <div>Kasir: ${order.cashier || 'Karyawan 1'} • ${order.orderType}</div>
          <div>Pelanggan: ${order.customerName || 'Pelanggan Umum'}</div>
        </div>

        <div style="border-top:1px dashed #000; margin:4px 0;"></div>

        <div style="font-size:0.72rem;">
          ${(order.items || []).map(i => `
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span>${i.name} x${i.qty}</span>
              <span style="font-weight:700;">${formatRupiah(i.price * i.qty)}</span>
            </div>
            ${i.mods ? `<div style="font-size:0.62rem; color:#444; margin-left:8px; margin-bottom:2px;">• ${i.mods}</div>` : ''}
          `).join('')}
        </div>

        <div style="border-top:1px dashed #000; margin:4px 0;"></div>

        <div style="font-size:0.72rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
            <span>Subtotal</span>
            <span>${formatRupiah(order.subtotal)}</span>
          </div>
          ${order.discount > 0 ? `
            <div style="display:flex; justify-content:space-between; margin-bottom:2px;">
              <span>Diskon</span>
              <span>-${formatRupiah(order.discount)}</span>
            </div>
          ` : ''}
          <div style="display:flex; justify-content:space-between; font-weight:800; font-size:0.88rem; margin-top:4px; padding-top:4px; border-top:1px solid #000;">
            <span>TOTAL</span>
            <span>${formatRupiah(order.grandTotal)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-top:3px; font-size:0.7rem;">
            <span>Bayar (${order.paymentMethod})</span>
            <span>${formatRupiah(order.cashReceived || order.grandTotal)}</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:0.7rem;">
            <span>Kembalian</span>
            <span>${formatRupiah(order.change || 0)}</span>
          </div>
        </div>

        <div class="receipt-foot" style="text-align:center; margin-top:10px; font-size:0.65rem; border-top:1px dashed #000; padding-top:6px;">
          <p style="margin:2px 0;">${cafeFooter}</p>
          <p style="margin:2px 0; font-size:0.58rem; color:#666;">CAFFEE SA'ADAH Cloud POS</p>
        </div>
      </div>
    `;
  } else if (mode === 'print-mode-kitchen') {
    printTitle = `Dapur #${order.dailySeq}`;
    htmlContent = `
      <div class="thermal-paper kitchen-paper">
        <div style="text-align:center; border-bottom:1px dashed #000; padding-bottom:4px; margin-bottom:6px;">
          <h3 style="margin:0; font-size:0.9rem;">--- ORDER BARISTA & DAPUR ---</h3>
          <div style="font-size:0.68rem;">CAFFEE SA'ADAH • ${formatTime(order.date)}</div>
        </div>

        <div style="text-align:center; font-size:1.1rem; font-weight:900; background:#000; color:#fff; padding:4px; margin-bottom:6px;">
          NO. PESANAN: ${order.dailySeq}
        </div>

        <div style="font-weight:800; font-size:0.85rem; text-align:center; margin-bottom:4px;">
          [ ${(order.orderType || 'Dine In').toUpperCase()} ]
        </div>
        <div style="font-size:0.72rem; margin-bottom:6px;">
          Pelanggan: <strong>${order.customerName || 'Umum'}</strong> • Kasir: ${order.cashier || 'Karyawan 1'}
        </div>

        <div style="border-top:1px dashed #000; margin:6px 0;"></div>

        <div style="font-size:0.82rem;">
          ${(order.items || []).map(i => `
            <div style="margin-bottom:8px; border-bottom:1px dotted #ccc; padding-bottom:4px;">
              <div style="font-weight:900; font-size:0.92rem;">
                <span style="font-size:1.1rem; text-decoration:underline;">${i.qty}x</span> ${i.name}
              </div>
              ${i.mods ? `<div style="font-size:0.72rem; font-weight:700; margin-left:14px; margin-top:2px;">▶ Catatan: ${i.mods}</div>` : ''}
            </div>
          `).join('')}
        </div>

        <div style="border-top:1px dashed #000; margin-top:10px; padding-top:6px; text-align:center; font-size:0.65rem;">
          Waktu Cetak: ${new Date().toLocaleTimeString('id-ID')} • Harap Sajikan Cepat & Higienis
        </div>
      </div>
    `;
  } else if (mode === 'print-mode-single-sticker') {
    printTitle = `Cup #${order.dailySeq}`;
    const st = State.activeCupStickers[State.currentStickerIndex] || {
      drinkName: order.items[0]?.name || 'Minuman',
      modsShort: order.items[0]?.mods || 'Regular • Standard',
      cupNum: 1,
      totalCups: 1,
      orderSeq: order.dailySeq,
      customerName: order.customerName,
      table: order.orderType,
      time: formatTime(order.date)
    };
    const nameLen = (st.drinkName || '').length;
    const titleFontSize = nameLen > 24 ? '0.70rem' : nameLen > 16 ? '0.78rem' : '0.84rem';

    htmlContent = `
      <div class="cup-sticker-label">
        <div class="sticker-header">
          <div style="display:flex; align-items:center; gap:4px;">
            ${showLogo ? `<img src="${logoUrl}" class="sticker-logo-img ${isMono ? 'receipt-logo-mono' : ''}" alt="Logo">` : ''}
            <span class="sticker-title">CAFFEE SA'ADAH</span>
          </div>
          <span class="sticker-cup-index">${st.orderSeq} • Cup ${st.cupNum}/${st.totalCups}</span>
        </div>
        <div class="sticker-drink-name" style="font-size:${titleFontSize}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${st.drinkName}</div>
        <div class="sticker-drink-mods" style="font-size:0.65rem;">${st.modsShort}</div>
        <div class="sticker-footer">
          <span>${st.customerName} (${st.table || order.orderType || 'Dine In'})</span>
          <span>${st.time}</span>
        </div>
      </div>
    `;
  } else if (mode === 'print-mode-all-stickers') {
    printTitle = `Semua Stiker #${order.dailySeq}`;
    const stickers = State.activeCupStickers && State.activeCupStickers.length > 0
      ? State.activeCupStickers
      : [{
          drinkName: order.items[0]?.name || 'Minuman',
          modsShort: order.items[0]?.mods || 'Regular • Standard',
          cupNum: 1,
          totalCups: 1,
          orderSeq: order.dailySeq,
          customerName: order.customerName,
          table: order.orderType,
          time: formatTime(order.date)
        }];

    htmlContent = stickers.map(st => {
      const nameLen = (st.drinkName || '').length;
      const titleFontSize = nameLen > 24 ? '0.70rem' : nameLen > 16 ? '0.78rem' : '0.84rem';
      return `
        <div class="cup-sticker-label">
          <div class="sticker-header">
            <div style="display:flex; align-items:center; gap:4px;">
              ${showLogo ? `<img src="${logoUrl}" class="sticker-logo-img ${isMono ? 'receipt-logo-mono' : ''}" alt="Logo">` : ''}
              <span class="sticker-title">CAFFEE SA'ADAH</span>
            </div>
            <span class="sticker-cup-index">${st.orderSeq} • Cup ${st.cupNum}/${st.totalCups}</span>
          </div>
          <div class="sticker-drink-name" style="font-size:${titleFontSize}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${st.drinkName}</div>
          <div class="sticker-drink-mods" style="font-size:0.65rem;">${st.modsShort}</div>
          <div class="sticker-footer">
            <span>${st.customerName} (${st.table || order.orderType || 'Dine In'})</span>
            <span>${st.time}</span>
          </div>
        </div>
      `;
    }).join('');
  }

  // Sinkronkan ke elemen print DOM utama sebagai cadangan
  const printArea = document.getElementById('printReceiptThermalArea');
  if (printArea) {
    printArea.innerHTML = htmlContent;
    if (mode.includes('sticker')) {
      printArea.classList.add('print-area-sticker');
    } else {
      printArea.classList.remove('print-area-sticker');
    }
  }

  // Cetak dengan Iframe Terisolasi (Presisi 1 Lembar, Tidak Ada Spillage Multi-Halaman Kosong)
  printThermalIframe(htmlContent, paperSize, printTitle);
}

function openPrintHubModal(order, defaultTab = 'cashier') {
  State.currentPrintingOrder = order;
  State.activePrintOrder = order;
  const modal = document.getElementById('printHubModal');
  const title = document.getElementById('printHubTitle');
  const subtitle = document.getElementById('printHubSubtitle');

  if (title) title.innerText = `Pilihan Cetak Pesanan ${order.dailySeq}`;
  if (subtitle) {
    const itemCount = (order.items || []).reduce((s, i) => s + i.qty, 0);
    subtitle.innerText = `Total: ${formatRupiah(order.grandTotal)} • ${order.customerName || 'Pelanggan Umum'} • ${itemCount} Item (${order.paymentMethod || 'Tunai'})`;
  }

  // Sync printer status display
  const currentPrinterEl = document.getElementById('currentPrinterDisplay');
  const btStatusBadge = document.getElementById('btPrinterStatusBadge');
  if (window.BluetoothPrintManager && window.BluetoothPrintManager.isConnected) {
    if (currentPrinterEl) currentPrinterEl.innerText = window.BluetoothPrintManager.deviceName || 'Thermal Bluetooth';
    if (btStatusBadge) {
      btStatusBadge.innerText = 'Terhubung';
      btStatusBadge.className = 'bt-status-pill connected';
    }
  } else {
    if (currentPrinterEl) currentPrinterEl.innerText = 'Thermal Bluetooth / Sistem';
    if (btStatusBadge) {
      btStatusBadge.innerText = 'Siap';
      btStatusBadge.className = 'bt-status-pill';
    }
  }

  // Sync quick paper size and logo toggle
  const paperSelect = document.getElementById('quickReceiptPaperSize');
  if (paperSelect) {
    paperSelect.value = localStorage.getItem('caffee_receipt_paper_size') || '80mm';
  }
  const quickLogoCheck = document.getElementById('quickToggleReceiptLogo');
  if (quickLogoCheck) {
    quickLogoCheck.checked = localStorage.getItem('caffee_receipt_show_logo') !== 'false';
  }

  // Sync Cup Stickers count
  prepareCupStickersList(order);
  const cupCount = State.activeCupStickers ? State.activeCupStickers.length : 0;
  const totalCupsEl = document.getElementById('totalCupsText');
  if (totalCupsEl) totalCupsEl.innerText = `${cupCount} Cup`;

  // Render Hidden Thermal Print Containers
  renderCashierReceipt(order);
  renderKitchenTicket(order);
  renderActiveSingleSticker();
  renderAllStickersForThermalPrint();

  if (modal) modal.classList.add('active');
}

// 1. TAMPILAN PRATINJAU STRUK KASIR OTENTIK (DENGAN GAMBAR LOGO & RINCIAN)
function renderCashierSummaryCard(order) {
  const container = document.getElementById('cashierSummaryCard');
  if (!container) return;

  const showLogo = localStorage.getItem('caffee_receipt_show_logo') !== 'false';
  const logoUrl = localStorage.getItem('caffee_receipt_logo') || 'assets/saadah_logo.png';
  const isMono = localStorage.getItem('caffee_receipt_logo_mono') === 'mono';

  const logoHtml = showLogo ? `
    <div style="text-align:center; margin-bottom:8px;">
      <img src="${logoUrl}" alt="Logo" class="${isMono ? 'receipt-logo-mono' : ''}" style="max-height:60px; max-width:140px; display:inline-block; border-radius:6px; object-fit:contain;">
    </div>
  ` : '';

  const cafeName = localStorage.getItem('caffee_setting_name') || "CAFFEE SA'ADAH";
  const cafeAddr = localStorage.getItem('caffee_setting_addr') || "Coffee, Cake & Bread • Halal Indonesia";
  let cafeFooter = localStorage.getItem('caffee_setting_footer') || "Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah";
  if (cafeFooter.includes('Pemilik: Syukri & Ardan')) {
    cafeFooter = cafeFooter.replace('Pemilik: Syukri & Ardan • ', '').replace('Pemilik: Syukri & Ardan', '').trim();
  }

  container.innerHTML = `
    <!-- Action Bar -->
    <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:12px; flex-wrap:wrap; gap:8px;">
      <div style="display:flex; align-items:center; gap:6px;">
        <span style="font-size:0.75rem; font-weight:700; color:var(--text-dim);"><i class="fa-solid fa-scroll text-caramel"></i> Lebar Kertas:</span>
        <select id="quickReceiptPaperSize" class="quick-paper-select" style="padding:3px 8px; font-size:0.75rem; border-radius:6px; border:1px solid #ccc; background:#fff;">
          <option value="58mm">58 mm (Kecil)</option>
          <option value="80mm" selected>80 mm (Standar)</option>
        </select>
      </div>
      <div style="display:flex; gap:6px; flex-wrap:wrap;">
        <button type="button" class="btn-primary-warm" onclick="executeThermalPrint('print-mode-cashier')" style="padding:6px 14px; font-size:0.78rem; display:inline-flex; align-items:center; gap:6px;">
          <i class="fa-solid fa-print"></i> Cetak Struk
        </button>
        <button type="button" class="btn-secondary" onclick="window.openBluetoothModal()" style="padding:6px 10px; font-size:0.78rem; display:inline-flex; align-items:center; gap:5px;" title="Atur / Hubungkan Printer Bluetooth">
          <i class="fa-brands fa-bluetooth-b text-caramel"></i> Bluetooth
        </button>
        <button type="button" class="btn-secondary" onclick="executeThermalPrint('rawbt')" style="padding:6px 10px; font-size:0.78rem; display:inline-flex; align-items:center; gap:5px; color:#2e7d32;" title="Cetak via RawBT Android">
          <i class="fa-solid fa-bolt"></i> RawBT
        </button>
      </div>
    </div>

    <!-- Authentic Thermal Receipt Preview -->
    <div class="thermal-receipt-preview-card" style="background:#ffffff; border-radius:12px; padding:18px 20px; border:1px solid rgba(201,125,62,0.22); box-shadow:0 4px 16px rgba(43,24,16,0.06); font-family:'JetBrains Mono', Courier, monospace; color:#1a1a1a;">
      <div style="text-align:center;">
        ${logoHtml}
        <h3 style="margin:2px 0; font-size:1.05rem; font-weight:800; color:var(--coffee-dark); font-family:'Outfit', sans-serif;">${cafeName}</h3>
        <p style="margin:2px 0; font-size:0.70rem; color:#666;">${cafeAddr}</p>
        <p style="margin:1px 0; font-size:0.70rem; color:#666;">Instagram: @cs.coffeesaadah</p>
      </div>

      <div style="text-align:center; font-size:1rem; font-weight:900; margin:10px 0; padding:5px; background:rgba(201,125,62,0.12); color:var(--caramel); border-radius:6px;">
        PESANAN ${order.dailySeq}
      </div>

      <div style="font-size:0.72rem; line-height:1.45; color:#333; margin-bottom:8px;">
        <div><strong>No:</strong> ${order.invoice}</div>
        <div><strong>Waktu:</strong> ${formatDate(order.date)}</div>
        <div><strong>Kasir:</strong> ${order.cashier || 'Karyawan 1'} • <span class="badge-sub" style="font-size:0.65rem;">${order.orderType}</span></div>
        <div><strong>Pelanggan:</strong> ${order.customerName || 'Pelanggan Umum'}</div>
      </div>

      <div style="border-top:1.5px dashed #ccc; margin:8px 0;"></div>

      <div style="font-size:0.75rem;">
        ${(order.items || []).map(i => `
          <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
            <span><strong>${i.qty}x</strong> ${i.name}</span>
            <span style="font-weight:700;">${formatRupiah(i.price * i.qty)}</span>
          </div>
          ${i.mods ? `<div style="font-size:0.65rem; color:var(--caramel); margin-left:12px; margin-bottom:3px;">• ${i.mods}</div>` : ''}
        `).join('')}
      </div>

      <div style="border-top:1.5px dashed #ccc; margin:8px 0;"></div>

      <div style="font-size:0.75rem;">
        <div style="display:flex; justify-content:space-between; margin-bottom:3px;">
          <span>Subtotal</span>
          <span>${formatRupiah(order.subtotal)}</span>
        </div>
        ${order.discount > 0 ? `
          <div style="display:flex; justify-content:space-between; margin-bottom:3px; color:#c62828;">
            <span>Diskon</span>
            <span>-${formatRupiah(order.discount)}</span>
          </div>
        ` : ''}
        <div style="display:flex; justify-content:space-between; font-weight:900; font-size:0.95rem; margin-top:6px; padding-top:6px; border-top:1px solid #222; color:var(--coffee-dark);">
          <span>TOTAL</span>
          <span style="color:var(--caramel);">${formatRupiah(order.grandTotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; margin-top:4px; font-size:0.72rem; color:#555;">
          <span>Bayar (${order.paymentMethod})</span>
          <span>${formatRupiah(order.cashReceived || order.grandTotal)}</span>
        </div>
        <div style="display:flex; justify-content:space-between; font-size:0.72rem; color:#555;">
          <span>Kembalian</span>
          <span>${formatRupiah(order.change || 0)}</span>
        </div>
      </div>

      <div style="text-align:center; margin-top:14px; font-size:0.68rem; border-top:1.5px dashed #ccc; padding-top:8px; color:#555;">
        <p style="margin:2px 0;">${cafeFooter}</p>
        <p style="margin:3px 0 0 0; font-size:0.60rem; color:#888;">CAFFEE SA'ADAH Cloud POS</p>
      </div>
    </div>
  `;
}

// 2. KARTU BERSIH STRUK DAPUR / BARISTA (HANYA MENAMPILKAN APA YANG DIPESAN & CATATANNYA)
function renderKitchenSummaryCard(order) {
  const container = document.getElementById('kitchenSummaryCard');
  if (!container) return;

  container.innerHTML = `
    <div class="kitchen-summary-top">
      <div class="kitchen-seq-badge"><i class="fa-solid fa-fire-burner"></i> PESANAN ${order.dailySeq}</div>
      <div class="kitchen-type-pill">[ ${order.orderType.toUpperCase()} ]</div>
      <div class="kitchen-customer-name">Pelanggan: <strong>${order.customerName}</strong> • ${formatTime(order.date)}</div>
    </div>

    <div class="kitchen-items-clean-list">
      ${order.items.map(i => `
        <div class="kitchen-clean-item-card">
          <div class="kitchen-item-main-row">
            <span class="kitchen-qty-tag">${i.qty}x</span>
            <span class="kitchen-item-title">${i.name}</span>
          </div>
          ${i.mods ? `
            <div class="kitchen-item-note-box">
              <i class="fa-solid fa-pen-to-square"></i> <strong>Catatan:</strong> ${i.mods}
            </div>
          ` : `
            <div class="kitchen-item-note-box note-default">
              <i class="fa-solid fa-check"></i> Standar (Normal Ice, Normal Sugar)
            </div>
          `}
        </div>
      `).join('')}
    </div>

    <div class="kitchen-bottom-action">
      <button type="button" class="btn-primary-warm btn-print-main" onclick="executeThermalPrint('print-mode-kitchen')">
        <i class="fa-solid fa-print"></i> Cetak Tiket Dapur / Bar
      </button>
    </div>
  `;
}

// 3. DAFTAR BERSIH STIKER CUP MINUMAN (OPSI CETAK MASING-MASING ATAU SEMUA)
function prepareCupStickersList(order) {
  State.activeCupStickers = [];
  const totalCups = order.items.reduce((s, i) => s + i.qty, 0);
  let cupNum = 1;

  order.items.forEach(item => {
    for (let c = 0; c < item.qty; c++) {
      State.activeCupStickers.push({
        cupNum: cupNum,
        totalCups: totalCups,
        orderSeq: order.dailySeq,
        drinkName: item.name,
        modsShort: item.modsShort || 'Regular • Standard',
        customerName: order.customerName,
        table: order.table || order.orderType || 'Dine In',
        time: formatTime(order.date)
      });
      cupNum++;
    }
  });

  State.currentStickerIndex = 0;
}

function renderCleanCupList(order) {
  const container = document.getElementById('cleanCupListContainer');
  const totalEl = document.getElementById('totalCupsText');
  if (totalEl) totalEl.innerText = `${State.activeCupStickers.length} Cup`;
  if (!container) return;

  if (State.activeCupStickers.length === 0) {
    container.innerHTML = `<div class="empty-cups-notice">Tidak ada minuman yang memerlukan stiker cup pada pesanan ini.</div>`;
    return;
  }

  container.innerHTML = State.activeCupStickers.map((st, idx) => `
    <div class="clean-cup-item-card">
      <div class="cup-info-left">
        <div class="cup-top-meta">
          <span class="cup-number-tag">Cup ${st.cupNum} / ${st.totalCups}</span>
          <span class="cup-order-tag">${st.orderSeq}</span>
        </div>
        <div class="cup-drink-title">${st.drinkName}</div>
        <div class="cup-mods-badge"><i class="fa-solid fa-sliders"></i> ${st.modsShort}</div>
        <div class="cup-customer-sub"><i class="fa-solid fa-user"></i> ${st.customerName} (${st.table || 'Dine In'}) • ${st.time}</div>
      </div>
      <div class="cup-action-right">
        <button type="button" class="btn-print-cup-item" onclick="printSpecificCupSticker(${idx})">
          <i class="fa-solid fa-print"></i> Cetak Cup Ini
        </button>
      </div>
    </div>
  `).join('');
}

window.printSpecificCupSticker = function(index) {
  State.currentStickerIndex = index;
  renderActiveSingleSticker();
  executeThermalPrint('print-mode-single-sticker');
};

// THERMAL OUTPUT 1: Struk Kasir Pelanggan (Untuk Printer Thermal)
function renderCashierReceipt(order) {
  const container = document.getElementById('cashierReceiptContent');
  if (!container) return;

  const showLogo = localStorage.getItem('caffee_receipt_show_logo') !== 'false';
  const logoUrl = localStorage.getItem('caffee_receipt_logo') || 'assets/saadah_logo.png';
  const logoSize = localStorage.getItem('caffee_receipt_logo_size') || 'medium';
  const isMono = localStorage.getItem('caffee_receipt_logo_mono') === 'mono';

  const logoHtml = showLogo ? `
    <div class="receipt-logo-wrap">
      <img src="${logoUrl}" alt="Logo Caffee Sa'adah" class="receipt-logo-img receipt-logo-size-${logoSize} ${isMono ? 'receipt-logo-mono' : ''}">
    </div>
  ` : '';

  const cafeName = localStorage.getItem('caffee_setting_name') || "CAFFEE SA'ADAH";
  const cafeAddr = localStorage.getItem('caffee_setting_addr') || "Coffee, Cake & Bread • Halal Indonesia";
  let cafeFooter = localStorage.getItem('caffee_setting_footer') || "Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah";
  if (cafeFooter.includes('Pemilik: Syukri & Ardan')) {
    cafeFooter = cafeFooter.replace('Pemilik: Syukri & Ardan • ', '').replace('Pemilik: Syukri & Ardan', '').trim();
    localStorage.setItem('caffee_setting_footer', cafeFooter);
  }

  container.innerHTML = `
    <div class="receipt-head">
      ${logoHtml}
      <h3>${cafeName}</h3>
      <p>${cafeAddr}</p>
      <p>Instagram: @cs.coffeesaadah</p>
    </div>

    <div class="receipt-seq-banner">
      PESANAN ${order.dailySeq}
    </div>

    <div style="font-size:0.7rem; margin-bottom: 6px;">
      <div>No: ${order.invoice}</div>
      <div>Waktu: ${formatDate(order.date)}</div>
      <div>Kasir: ${order.cashier} • ${order.orderType}</div>
      <div>Pelanggan: ${order.customerName}</div>
    </div>

    <div class="receipt-dashed-line"></div>

    <div class="receipt-items-wrap">
      ${order.items.map(i => `
        <div class="receipt-item-row">
          <span>${i.name} x${i.qty}</span>
          <span>${formatRupiah(i.price * i.qty)}</span>
        </div>
        ${i.mods ? `<div class="receipt-item-mod">• ${i.mods}</div>` : ''}
      `).join('')}
    </div>

    <div class="receipt-dashed-line"></div>

    <div class="receipt-item-row">
      <span>Subtotal</span>
      <span>${formatRupiah(order.subtotal)}</span>
    </div>
    ${order.discount > 0 ? `
      <div class="receipt-item-row" style="color:#666;">
        <span>Diskon</span>
        <span>-${formatRupiah(order.discount)}</span>
      </div>
    ` : ''}
    <div class="receipt-dashed-line"></div>

    <div class="receipt-total-row">
      <span>TOTAL</span>
      <span>${formatRupiah(order.grandTotal)}</span>
    </div>
    <div class="receipt-item-row">
      <span>Bayar (${order.paymentMethod})</span>
      <span>${formatRupiah(order.cashReceived || order.grandTotal)}</span>
    </div>
    <div class="receipt-item-row">
      <span>Kembalian</span>
      <span>${formatRupiah(order.change || 0)}</span>
    </div>

    <div class="receipt-foot">
      <p>${cafeFooter}</p>
      <p style="margin-top:6px; font-size:0.62rem;">CAFFEE SA'ADAH POS Cloud System</p>
    </div>
  `;
}

// THERMAL OUTPUT 2: Struk Dapur / Barista (TANPA HARGA!)
function renderKitchenTicket(order) {
  const container = document.getElementById('kitchenReceiptContent');
  if (!container) return;

  container.innerHTML = `
    <div class="receipt-head">
      <h3>--- ORDER BARISTA & DAPUR ---</h3>
      <div style="font-size:0.75rem; margin-top:4px;">CAFFEE SA'ADAH • ${formatTime(order.date)}</div>
    </div>

    <div class="receipt-seq-banner" style="background:#000; color:#fff;">
      NO. PESANAN: ${order.dailySeq}
    </div>

    <div style="font-weight:700; font-size:0.85rem; margin:8px 0; text-align:center;">
      [ ${order.orderType.toUpperCase()} ]
    </div>
    <div style="font-size:0.75rem; margin-bottom:8px;">
      Pelanggan: <strong>${order.customerName}</strong>
    </div>

    <div class="receipt-dashed-line"></div>

    <div class="kitchen-items-list">
      ${order.items.map(i => `
        <div class="kitchen-item-box">
          <div class="kitchen-item-name">
            [ ${i.qty}x ] ${i.name}
          </div>
          ${i.mods ? `<div class="kitchen-item-mods">➔ ${i.mods}</div>` : ''}
        </div>
      `).join('')}
    </div>

    <div class="receipt-foot" style="margin-top:14px;">
      <p>Pastikan pesanan disiapkan sesuai catatan takaran gula & es.</p>
    </div>
  `;
}

// THERMAL OUTPUT 3: Stiker Cup 1 Lembar Aktif (Dengan Logo & Judul 1 Baris)
function renderActiveSingleSticker() {
  const container = document.getElementById('singleStickerContainer');
  if (!container || !State.activeCupStickers || State.activeCupStickers.length === 0) return;

  const st = State.activeCupStickers[State.currentStickerIndex] || State.activeCupStickers[0];
  const showLogo = localStorage.getItem('caffee_receipt_show_logo') !== 'false';
  const logoUrl = localStorage.getItem('caffee_receipt_logo') || 'assets/saadah_logo.png';
  const isMono = localStorage.getItem('caffee_receipt_logo_mono') === 'mono';

  const nameLen = (st.drinkName || '').length;
  const titleFontSize = nameLen > 24 ? '0.70rem' : nameLen > 16 ? '0.78rem' : '0.84rem';

  container.innerHTML = `
    <div class="cup-sticker-label">
      <div class="sticker-header">
        <div style="display:flex; align-items:center; gap:4px;">
          ${showLogo ? `<img src="${logoUrl}" class="sticker-logo-img ${isMono ? 'receipt-logo-mono' : ''}" alt="Logo">` : ''}
          <span class="sticker-title">CAFFEE SA'ADAH</span>
        </div>
        <span class="sticker-cup-index">${st.orderSeq} • Cup ${st.cupNum}/${st.totalCups}</span>
      </div>
      <div class="sticker-drink-name" style="font-size:${titleFontSize}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${st.drinkName}</div>
      <div class="sticker-drink-mods" style="font-size:0.65rem;">${st.modsShort}</div>
      <div class="sticker-footer">
        <span>${st.customerName} (${st.table})</span>
        <span>${st.time}</span>
      </div>
    </div>
  `;
}

// THERMAL OUTPUT 4: Bulk Cetak Semua Stiker Cup Berurutan
function renderAllStickersForThermalPrint() {
  const container = document.getElementById('allStickersPrintContainer');
  if (!container || !State.activeCupStickers) return;

  const showLogo = localStorage.getItem('caffee_receipt_show_logo') !== 'false';
  const logoUrl = localStorage.getItem('caffee_receipt_logo') || 'assets/saadah_logo.png';
  const isMono = localStorage.getItem('caffee_receipt_logo_mono') === 'mono';

  container.innerHTML = State.activeCupStickers.map(st => {
    const nameLen = (st.drinkName || '').length;
    const titleFontSize = nameLen > 24 ? '0.70rem' : nameLen > 16 ? '0.78rem' : '0.84rem';

    return `
      <div class="cup-sticker-label">
        <div class="sticker-header">
          <div style="display:flex; align-items:center; gap:4px;">
            ${showLogo ? `<img src="${logoUrl}" class="sticker-logo-img ${isMono ? 'receipt-logo-mono' : ''}" alt="Logo">` : ''}
            <span class="sticker-title">CAFFEE SA'ADAH</span>
          </div>
          <span class="sticker-cup-index">${st.orderSeq} • Cup ${st.cupNum}/${st.totalCups}</span>
        </div>
        <div class="sticker-drink-name" style="font-size:${titleFontSize}; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${st.drinkName}</div>
        <div class="sticker-drink-mods" style="font-size:0.65rem;">${st.modsShort}</div>
        <div class="sticker-footer">
          <span>${st.customerName} (${st.table})</span>
          <span>${st.time}</span>
        </div>
      </div>
    `;
  }).join('');
}

// --- 12. KEUANGAN FLEKSIBEL (RENTANG TANGGAL, REKAP PRODUK TERJUAL, LOG TRANSAKSI & EXPORT EXCEL) ---
function initFinanceFilter() {
  const applyBtn = document.getElementById('applyFinanceFilterBtn');
  const startInput = document.getElementById('financeStartDate');
  const endInput = document.getElementById('financeEndDate');
  const exportBtn = document.getElementById('exportFinanceExcelBtn');

  const now = new Date();
  const formatInputDate = d => {
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };
  const todayStr = formatInputDate(now);

  // Default filter aktif adalah "Hari Ini"
  if (startInput) startInput.value = todayStr;
  if (endInput) endInput.value = todayStr;

  document.querySelectorAll('.btn-preset-date').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.btn-preset-date').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const range = btn.dataset.range;
      const today = new Date();
      let start = new Date();
      let end = new Date();

      if (range === 'today') {
        start = today;
        end = today;
      } else if (range === 'yesterday') {
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
        end = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 1);
      } else if (range === 'thisWeek') {
        start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 6);
        end = today;
      } else if (range === 'thisMonth') {
        start = new Date(today.getFullYear(), today.getMonth(), 1);
        end = new Date(today.getFullYear(), today.getMonth() + 1, 0);
      } else if (range === 'thisYear') {
        start = new Date(today.getFullYear(), 0, 1);
        end = new Date(today.getFullYear(), 11, 31);
      }

      if (startInput) startInput.value = formatInputDate(start);
      if (endInput) endInput.value = formatInputDate(end);

      renderFinanceStatement();
    });
  });

  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      renderFinanceStatement();
      showToast('Laporan keuangan disaring berdasarkan tanggal terpilih');
    });
  }

  // Export Laporan Keuangan ke Excel
  if (exportBtn) {
    exportBtn.addEventListener('click', exportFinanceToExcel);
  }

  // Add Expense Modal
  const openExpenseBtn = document.getElementById('openAddExpenseModalBtn');
  const expenseModal = document.getElementById('addExpenseModal');
  const closeExpenseBtn = document.getElementById('closeAddExpenseBtn');
  const cancelExpenseBtn = document.getElementById('cancelExpenseBtn');
  const saveExpenseBtn = document.getElementById('saveExpenseBtn');

  if (openExpenseBtn) openExpenseBtn.addEventListener('click', () => expenseModal.classList.add('active'));
  if (closeExpenseBtn) closeExpenseBtn.addEventListener('click', () => expenseModal.classList.remove('active'));
  if (cancelExpenseBtn) cancelExpenseBtn.addEventListener('click', () => expenseModal.classList.remove('active'));

  if (saveExpenseBtn) {
    saveExpenseBtn.addEventListener('click', () => {
      const cat = document.getElementById('expenseCategorySelect').value;
      const title = document.getElementById('expenseTitleInput').value.trim();
      const amt = parseFloat(document.getElementById('expenseAmountInput').value) || 0;
      const acc = document.getElementById('expenseAccountSelect').value;

      if (!title || amt <= 0) {
        alert('Mohon isi keterangan dan nominal pengeluaran yang valid!');
        return;
      }

      State.expenses.unshift({
        id: 'EXP-' + Date.now(),
        date: new Date().toISOString().split('T')[0],
        category: cat,
        title: title,
        amount: amt,
        account: acc,
        staff: State.currentShift?.cashierName || 'Karyawan 1'
      });

      saveAppState();
      expenseModal.classList.remove('active');
      renderFinanceStatement();
      showToast('Biaya operasional berhasil dicatat');
    });
  }
}

// HELPER FORMAT DATE YANG AMAN & RAPI (Mencegah ReferenceError di seluruh aplikasi)
function formatDate(d) {
  if (!d) return '-';
  try {
    const dateObj = (typeof d === 'string' || typeof d === 'number') ? new Date(d) : d;
    if (isNaN(dateObj.getTime())) return String(d);
    const pad = n => String(n).padStart(2, '0');
    const day = pad(dateObj.getDate());
    const month = pad(dateObj.getMonth() + 1);
    const year = dateObj.getFullYear();
    const hours = pad(dateObj.getHours());
    const minutes = pad(dateObj.getMinutes());
    return `${day}/${month}/${year} ${hours}:${minutes}`;
  } catch (err) {
    return String(d);
  }
}

// EXPORT EXCEL REAL (.XLSX) DENGAN SHEETJS: KOLOM PEMASUKAN & PENGELUARAN TERPISAH
function exportFinanceToExcel() {
  try {
    const startVal = document.getElementById('financeStartDate')?.value || new Date().toISOString().split('T')[0];
    const endVal = document.getElementById('financeEndDate')?.value || new Date().toISOString().split('T')[0];
    const startDate = new Date(startVal + 'T00:00:00');
    const endDate = new Date(endVal + 'T23:59:59');

    const orders = Array.isArray(State.dailyOrders) ? State.dailyOrders : [];
    const expenses = Array.isArray(State.expenses) ? State.expenses : [];

    const filteredOrders = orders.filter(o => {
      const d = new Date(o.date);
      return d >= startDate && d <= endDate;
    });

    const filteredExpenses = expenses.filter(e => {
      const d = new Date((e.date || '') + 'T00:00:00');
      return !isNaN(d.getTime()) && d >= startDate && d <= endDate;
    });

    const totalRev = filteredOrders.reduce((s, o) => s + (Number(o.grandTotal) || 0), 0);
    const totalCogs = filteredOrders.reduce((s, o) => s + (Number(o.costTotal) || 0), 0);
    const grossProfit = totalRev - totalCogs;
    const totalExp = filteredExpenses.reduce((s, e) => s + (Number(e.amount) || 0), 0);
    const netProfit = grossProfit - totalExp;

    // Rekap produk terjual
    const productMap = {};
    filteredOrders.forEach(o => {
      (o.items || []).forEach(i => {
        const name = i.name;
        if (!productMap[name]) {
          const pObj = State.products.find(p => p.name === name);
          productMap[name] = {
            name: name,
            category: pObj?.category || 'Menu Kafe',
            qty: 0,
            unitPrice: i.price,
            revenue: 0,
            cogsUnit: pObj?.costPrice || (i.price * 0.4),
            costTotal: 0
          };
        }
        productMap[name].qty += i.qty;
        productMap[name].revenue += (i.price * i.qty);
        productMap[name].costTotal += (productMap[name].cogsUnit * i.qty);
      });
    });
    const productList = Object.values(productMap).sort((a, b) => b.qty - a.qty);

    // 1. DATA SHEET 1: Buku Kas & Arus Keuangan (KOLOM PEMASUKAN DAN PENGELUARAN TERPISAH JELAS!)
    const sheet1Data = [
      ["LAPORAN BUKU KAS & ARUS KEUANGAN - CAFFEE SA'ADAH"],
      [`Periode: ${startVal} s/d ${endVal} • Tanggal Ekspor: ${new Date().toLocaleString('id-ID')}`],
      ["Staff Kasir:", State.currentShift?.cashierName || 'Karyawan 1', "", "Total Pesanan:", filteredOrders.length],
      [],
      [
        "No",
        "Tanggal & Waktu",
        "No. Invoice / Bukti",
        "Tipe Transaksi",
        "Kategori / Layanan",
        "Keterangan Transaksi / Menu",
        "PEMASUKAN (Rp)",
        "PENGELUARAN (Rp)",
        "ARUS KAS NET (Rp)",
        "Metode Pembayaran",
        "Kasir / Petugas",
        "Status"
      ]
    ];

    // Combine all orders and expenses chronologically
    const allEvents = [];
    filteredOrders.forEach(o => {
      const itemsText = (o.items || []).map(i => `${i.qty}x ${i.name}`).join(', ');
      allEvents.push({
        date: new Date(o.date),
        dateStr: formatDate(o.date),
        invoice: o.invoice || o.dailySeq || '-',
        type: 'Pemasukan Penjualan',
        category: o.orderType || 'Dine In',
        desc: `${o.customerName || 'Umum'} - ${itemsText}`,
        income: Number(o.grandTotal) || 0,
        expense: 0,
        method: o.paymentMethod || 'Tunai',
        staff: o.cashier || 'Karyawan 1',
        status: o.status || 'Selesai'
      });
    });

    filteredExpenses.forEach(e => {
      allEvents.push({
        date: new Date((e.date || '') + 'T12:00:00'),
        dateStr: e.date || '-',
        invoice: e.id || 'BIAYA',
        type: 'Pengeluaran Beban',
        category: e.category || 'Operasional',
        desc: e.title || 'Biaya Operasional',
        income: 0,
        expense: Number(e.amount) || 0,
        method: e.account || 'Kas Toko',
        staff: e.staff || 'Karyawan 1',
        status: 'Disetujui'
      });
    });

    allEvents.sort((a, b) => b.date - a.date);

    allEvents.forEach((ev, idx) => {
      const net = ev.income - ev.expense;
      sheet1Data.push([
        idx + 1,
        ev.dateStr,
        ev.invoice,
        ev.type,
        ev.category,
        ev.desc,
        ev.income,
        ev.expense,
        net,
        ev.method,
        ev.staff,
        ev.status
      ]);
    });

    sheet1Data.push([]);
    sheet1Data.push([
      "TOTAL",
      "",
      "",
      "",
      "",
      "Total Rekapitulasi Periode Terpilih",
      totalRev,
      totalExp,
      netProfit,
      "",
      "",
      ""
    ]);

    // 2. DATA SHEET 2: Rekap Menu Terjual
    const sheet2Data = [
      ["REKAP PENJUALAN PER MENU (APA SAJA YANG TERJUAL) - CAFFEE SA'ADAH"],
      [`Periode: ${startVal} s/d ${endVal}`],
      [],
      ["No", "Nama Menu Minuman & Makanan", "Kategori", "Jumlah Terjual (Cup)", "Harga Satuan (Rp)", "TOTAL PEMASUKAN (Rp)", "Modal Bahan HPP (Rp)", "Laba Kotor (Rp)", "Margin (%)"]
    ];

    productList.forEach((p, idx) => {
      const gross = p.revenue - p.costTotal;
      const margin = p.revenue > 0 ? ((gross / p.revenue) * 100).toFixed(1) : '0.0';
      sheet2Data.push([
        idx + 1,
        p.name,
        p.category,
        p.qty,
        p.unitPrice,
        p.revenue,
        p.costTotal,
        gross,
        margin + '%'
      ]);
    });

    // 3. DATA SHEET 3: Riwayat Seluruh Transaksi Pesanan
    const sheet3Data = [
      ["RIWAYAT SELURUH PESANAN PELANGGAN - CAFFEE SA'ADAH"],
      [`Periode: ${startVal} s/d ${endVal}`],
      [],
      ["No", "No. Pesanan", "No. Invoice", "Tanggal & Waktu", "Nama Pelanggan", "Tipe Layanan", "Rincian Menu & Modifiers", "Total Cup", "Subtotal (Rp)", "Diskon (Rp)", "TOTAL PEMASUKAN (Rp)", "Modal Bahan HPP (Rp)", "Metode Bayar", "Kasir", "Status"]
    ];

    filteredOrders.forEach((o, idx) => {
      const itemsText = (o.items || []).map(i => {
        const modText = i.mods ? ` [${i.mods}]` : '';
        return `${i.qty}x ${i.name}${modText}`;
      }).join(' | ');
      const totalCup = (o.items || []).reduce((sum, i) => sum + (Number(i.qty) || 1), 0);

      sheet3Data.push([
        idx + 1,
        o.dailySeq || '-',
        o.invoice || '-',
        formatDate(o.date),
        o.customerName || 'Pelanggan Umum',
        o.orderType || 'Dine In',
        itemsText,
        totalCup,
        Number(o.subtotal) || 0,
        Number(o.discount) || 0,
        Number(o.grandTotal) || 0,
        Number(o.costTotal) || 0,
        o.paymentMethod || 'Tunai',
        o.cashier || 'Karyawan 1',
        o.status || 'Selesai'
      ]);
    });

    // 4. DATA SHEET 4: Rincian Beban Operasional
    const sheet4Data = [
      ["RINCIAN PENGELUARAN BEBAN OPERASIONAL - CAFFEE SA'ADAH"],
      [`Periode: ${startVal} s/d ${endVal}`],
      [],
      ["No", "Tanggal Pengeluaran", "Kategori Beban", "Keterangan Keperluan", "Akun Pembayaran", "NOMINAL PENGELUARAN (Rp)", "Petugas Kasir"]
    ];

    filteredExpenses.forEach((e, idx) => {
      sheet4Data.push([
        idx + 1,
        e.date || '-',
        e.category || '-',
        e.title || '-',
        e.account || '-',
        Number(e.amount) || 0,
        e.staff || 'Karyawan 1'
      ]);
    });

    // Ekspor ke .XLSX multi-sheet menggunakan SheetJS jika library tersedia
    if (typeof XLSX !== 'undefined') {
      const wb = XLSX.utils.book_new();

      const ws1 = XLSX.utils.aoa_to_sheet(sheet1Data);
      ws1['!cols'] = [{ wch: 6 }, { wch: 20 }, { wch: 18 }, { wch: 22 }, { wch: 18 }, { wch: 32 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 16 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws1, "Buku Kas & Arus Keuangan");

      const ws2 = XLSX.utils.aoa_to_sheet(sheet2Data);
      ws2['!cols'] = [{ wch: 6 }, { wch: 26 }, { wch: 20 }, { wch: 16 }, { wch: 16 }, { wch: 20 }, { wch: 18 }, { wch: 16 }, { wch: 14 }];
      XLSX.utils.book_append_sheet(wb, ws2, "Rekap Menu Terjual");

      const ws3 = XLSX.utils.aoa_to_sheet(sheet3Data);
      ws3['!cols'] = [{ wch: 6 }, { wch: 14 }, { wch: 20 }, { wch: 20 }, { wch: 20 }, { wch: 16 }, { wch: 36 }, { wch: 12 }, { wch: 14 }, { wch: 12 }, { wch: 18 }, { wch: 18 }, { wch: 14 }, { wch: 14 }, { wch: 12 }];
      XLSX.utils.book_append_sheet(wb, ws3, "Riwayat Pesanan");

      const ws4 = XLSX.utils.aoa_to_sheet(sheet4Data);
      ws4['!cols'] = [{ wch: 6 }, { wch: 16 }, { wch: 20 }, { wch: 30 }, { wch: 16 }, { wch: 20 }, { wch: 16 }];
      XLSX.utils.book_append_sheet(wb, ws4, "Pengeluaran Beban");

      XLSX.writeFile(wb, `Laporan_Keuangan_Caffee_Saadah_${startVal}_sd_${endVal}.xlsx`);
      showToast('Laporan keuangan Caffee Sa\'adah berhasil diekspor ke file Excel (.XLSX)!');
    } else {
      // Fallback CSV berformat UTF-8 BOM dengan pemisah kolom rapi
      let csv = '\uFEFFsep=;\n';
      csv += 'LAPORAN KEUANGAN LENGKAP - CAFFEE SA\'ADAH\n\n';
      csv += 'No;Tanggal & Waktu;No. Invoice / Bukti;Tipe Transaksi;Kategori;Keterangan;PEMASUKAN (Rp);PENGELUARAN (Rp);ARUS KAS NET (Rp);Metode Bayar;Kasir;Status\n';
      allEvents.forEach((ev, idx) => {
        csv += `${idx + 1};"${ev.dateStr}";"${ev.invoice}";"${ev.type}";"${ev.category}";"${ev.desc.replace(/"/g, '""')}";${ev.income};${ev.expense};${ev.income - ev.expense};"${ev.method}";"${ev.staff}";"${ev.status}"\n`;
      });
      csv += `\nTOTAL;;;;;Total Rekapitulasi;${totalRev};${totalExp};${netProfit};;;\n`;

      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Laporan_Keuangan_Caffee_Saadah_${startVal}_sd_${endVal}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Laporan berhasil diekspor ke file Excel!');
    }
  } catch (err) {
    console.error('Export Excel error:', err);
    showToast('Gagal mengekspor laporan: ' + err.message, 'error');
  }
}

function renderFinanceStatement() {
  const startVal = document.getElementById('financeStartDate')?.value;
  const endVal = document.getElementById('financeEndDate')?.value;

  const startDate = startVal ? new Date(startVal + 'T00:00:00') : new Date('2026-01-01');
  const endDate = endVal ? new Date(endVal + 'T23:59:59') : new Date('2026-12-31');

  const filteredOrders = State.dailyOrders.filter(o => {
    const d = new Date(o.date);
    return d >= startDate && d <= endDate;
  });

  const filteredExpenses = State.expenses.filter(e => {
    const d = new Date(e.date + 'T00:00:00');
    return d >= startDate && d <= endDate;
  });

  const totalRev = filteredOrders.reduce((s, o) => s + o.grandTotal, 0);
  const totalCogs = filteredOrders.reduce((s, o) => s + o.costTotal, 0);
  const grossProfit = totalRev - totalCogs;
  const totalExp = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = grossProfit - totalExp;

  // 1. UPDATE SUMMARY CARDS
  const revEl = document.getElementById('finTotalRevenue');
  const cogsEl = document.getElementById('finTotalCogs');
  const grossEl = document.getElementById('finGrossProfit');
  const expEl = document.getElementById('finTotalExpenses');
  const orderCountEl = document.getElementById('finOrderCountText');
  const marginTextEl = document.getElementById('finGrossMarginText');
  const netEl = document.getElementById('finNetProfit');

  if (revEl) revEl.innerText = formatRupiah(totalRev);
  if (cogsEl) cogsEl.innerText = formatRupiah(totalCogs);
  if (grossEl) grossEl.innerText = formatRupiah(grossProfit);
  if (expEl) expEl.innerText = formatRupiah(totalExp);
  if (orderCountEl) orderCountEl.innerText = `Dari ${filteredOrders.length} transaksi pada periode ini`;

  const margin = totalRev > 0 ? ((grossProfit / totalRev) * 100).toFixed(1) : 0;
  if (marginTextEl) marginTextEl.innerText = `Margin: ~${margin}%`;

  if (netEl) {
    netEl.innerText = formatRupiah(netProfit);
    netEl.style.color = netProfit >= 0 ? '#2e7d32' : 'var(--accent-danger)';
  }

  // 2. RENDER RINCIAN MENU TERJUAL (SALES BY PRODUCT)
  const productMap = {};
  filteredOrders.forEach(o => {
    (o.items || []).forEach(i => {
      const name = i.name;
      if (!productMap[name]) {
        const pObj = State.products.find(p => p.name === name);
        productMap[name] = {
          name: name,
          category: pObj?.category || 'Menu Kafe',
          qty: 0,
          unitPrice: i.price,
          revenue: 0,
          cogsUnit: pObj?.costPrice || (i.price * 0.4),
          costTotal: 0
        };
      }
      productMap[name].qty += i.qty;
      productMap[name].revenue += (i.price * i.qty);
      productMap[name].costTotal += (productMap[name].cogsUnit * i.qty);
    });
  });

  const productList = Object.values(productMap).sort((a, b) => b.qty - a.qty);
  const totalItemsSold = productList.reduce((s, p) => s + p.qty, 0);

  const badgeProducts = document.getElementById('finProductsSoldBadge');
  if (badgeProducts) badgeProducts.innerText = `${productList.length} Menu (${totalItemsSold} Terjual)`;

  const tbodyProducts = document.getElementById('finProductSalesTableBody');
  if (tbodyProducts) {
    if (productList.length === 0) {
      tbodyProducts.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-dim); font-size:0.82rem;">Tidak ada menu yang terjual pada rentang tanggal ini.</td></tr>`;
    } else {
      tbodyProducts.innerHTML = productList.map((p, idx) => {
        const gross = p.revenue - p.costTotal;
        const margin = p.revenue > 0 ? ((gross / p.revenue) * 100).toFixed(1) : 0;
        return `
          <tr>
            <td><strong>${idx + 1}</strong></td>
            <td><strong style="color:var(--coffee-dark);">${p.name}</strong></td>
            <td><span class="badge-sub">${p.category}</span></td>
            <td><strong style="color:var(--caramel);">${p.qty} cup</strong></td>
            <td>${formatRupiah(p.unitPrice)}</td>
            <td><strong>${formatRupiah(p.revenue)}</strong></td>
            <td style="color:var(--text-dim);">${formatRupiah(p.costTotal)}</td>
            <td style="color:#2e7d32; font-weight:700;">+${formatRupiah(gross)}</td>
            <td><span class="badge-sub" style="background:rgba(46,125,50,0.12); color:#2e7d32; font-weight:700;">${margin}%</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  // 3. RENDER RIWAYAT SELURUH TRANSAKSI PESANAN
  const badgeOrders = document.getElementById('finOrdersTotalBadge');
  if (badgeOrders) badgeOrders.innerText = `${filteredOrders.length} Pesanan (${formatRupiah(totalRev)})`;

  const tbodyOrders = document.getElementById('finOrdersTableBody');
  if (tbodyOrders) {
    if (filteredOrders.length === 0) {
      tbodyOrders.innerHTML = `<tr><td colspan="9" style="text-align:center; padding:24px; color:var(--text-dim); font-size:0.82rem;">Belum ada pesanan pada rentang tanggal ini.</td></tr>`;
    } else {
      tbodyOrders.innerHTML = filteredOrders.map(o => {
        const itemsDesc = (o.items || []).map(i => {
          const mod = i.mods ? ` <small style="color:var(--caramel); font-size:0.72rem;">(${i.mods})</small>` : '';
          return `<div style="margin-bottom:2px;"><strong>${i.qty}x</strong> ${i.name}${mod}</div>`;
        }).join('');

        const isCash = (o.paymentMethod || '').toLowerCase().includes('tunai') || (o.paymentMethod || '').toLowerCase().includes('cash');

        return `
          <tr>
            <td><span class="order-seq-tag" style="background:var(--coffee-dark); color:#fff; padding:3px 8px; border-radius:6px; font-weight:800; font-size:0.75rem;">${o.dailySeq}</span></td>
            <td>
              <div style="font-weight:700; font-size:0.78rem;">${o.invoice}</div>
              <small style="color:var(--text-dim); font-size:0.7rem;">${formatDate(o.date)}</small>
            </td>
            <td><strong>${o.customerName}</strong></td>
            <td><span class="badge-sub">${o.orderType}</span></td>
            <td style="font-size:0.78rem; max-width:240px;">${itemsDesc}</td>
            <td>
              <span class="badge-sub" style="${isCash ? 'background:rgba(201,125,62,0.12); color:var(--caramel);' : 'background:rgba(33,150,243,0.12); color:#1976d2;'} font-weight:700;">
                <i class="fa-solid ${isCash ? 'fa-money-bill-wave' : 'fa-qrcode'}"></i> ${o.paymentMethod}
              </span>
            </td>
            <td><strong style="color:var(--caramel); font-size:0.88rem;">${formatRupiah(o.grandTotal)}</strong></td>
            <td><small>${o.cashier}</small></td>
            <td>
              <button type="button" class="btn-compact-print" onclick="openPrintSpecificOrder('${o.invoice}', 'cashier')" title="Lihat / Cetak Struk" style="padding:4px 8px; font-size:0.72rem; border-radius:6px; cursor:pointer; background:#fff; border:1px solid rgba(201,125,62,0.3); color:var(--coffee-dark); display:inline-flex; align-items:center; gap:4px; font-weight:700;">
                <i class="fa-solid fa-print"></i> Struk
              </button>
            </td>
          </tr>
        `;
      }).join('');
    }
  }

  // 4. RENDER EXPENSES TABLE
  const tbodyExpenses = document.getElementById('expensesTableBody');
  if (tbodyExpenses) {
    if (filteredExpenses.length === 0) {
      tbodyExpenses.innerHTML = `<tr><td colspan="6" style="text-align:center; padding:18px; color:var(--text-dim); font-size:0.82rem;">Tidak ada catatan pengeluaran biaya operasional pada rentang tanggal ini.</td></tr>`;
    } else {
      tbodyExpenses.innerHTML = filteredExpenses.map(e => `
        <tr>
          <td>${e.date}</td>
          <td><span style="font-weight:700;">${e.category}</span></td>
          <td>${e.title}</td>
          <td>${e.account}</td>
          <td><strong style="color:var(--accent-danger); font-weight:800;">-${formatRupiah(e.amount)}</strong></td>
          <td>${e.staff}</td>
        </tr>
      `).join('');
    }
  }
}

// --- 13. KATALOG & UPLOAD / UBAH FOTO MINUMAN ---
function initPhotoUploadModal() {
  const photoModal = document.getElementById('photoModal');
  const closeBtn = document.getElementById('closePhotoModalBtn');
  const cancelBtn = document.getElementById('cancelPhotoBtn');
  const saveBtn = document.getElementById('savePhotoBtn');
  const fileInput = document.getElementById('photoFileInput');
  const previewImg = document.getElementById('photoModalPreviewImg');
  const presetContainer = document.getElementById('presetPhotosGrid');

  if (closeBtn) closeBtn.addEventListener('click', () => photoModal.classList.remove('active'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => photoModal.classList.remove('active'));

  if (presetContainer) {
    presetContainer.innerHTML = PresetPhotos.map(p => `
      <img src="${p.url}" alt="${p.name}" class="preset-img-thumb" onclick="selectPresetPhoto('${p.url}')" title="${p.name}">
    `).join('');
  }

  if (fileInput) {
    fileInput.addEventListener('change', e => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = event => {
          if (previewImg) previewImg.src = event.target.result;
        };
        reader.readAsDataURL(file);
      }
    });
  }

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!State.editingProduct || !previewImg) return;
      State.editingProduct.image = previewImg.src;

      renderProducts();
      renderCatalogManageGrid();
      photoModal.classList.remove('active');
      showToast(`Foto untuk "${State.editingProduct.name}" berhasil diperbarui!`);
    });
  }
}

window.selectPresetPhoto = function(url) {
  const preview = document.getElementById('photoModalPreviewImg');
  if (preview) preview.src = url;
};

window.openEditPhotoModal = function(prodId) {
  const prod = State.products.find(p => p.id === prodId);
  if (!prod) return;

  State.editingProduct = prod;
  const modal = document.getElementById('photoModal');
  const title = document.getElementById('photoModalTitle');
  const preview = document.getElementById('photoModalPreviewImg');

  if (title) title.innerText = `Ubah Foto: ${prod.name}`;
  if (preview) preview.src = prod.image;

  if (modal) modal.classList.add('active');
};

// Filter dan Search state untuk Katalog
let catalogSelectedCategory = 'Semua Menu';
let catalogSearchQuery = '';

function renderCatalogManageGrid() {
  const grid = document.getElementById('catalogManageGrid');
  if (!grid) return;

  const filtered = State.products.filter(p => {
    const matchCat = catalogSelectedCategory === 'Semua Menu' || p.category === catalogSelectedCategory;
    const matchSearch = catalogSearchQuery === '' ||
      p.name.toLowerCase().includes(catalogSearchQuery) ||
      (p.sku && p.sku.toLowerCase().includes(catalogSearchQuery)) ||
      p.category.toLowerCase().includes(catalogSearchQuery);
    return matchCat && matchSearch;
  });

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div style="grid-column: 1/-1; text-align: center; padding: 40px 20px; color: var(--text-dim);">
        <i class="fa-solid fa-mug-saucer" style="font-size: 2.5rem; opacity: 0.3; margin-bottom: 10px;"></i>
        <p>Tidak ada menu yang sesuai kriteria pencarian di katalog.</p>
      </div>
    `;
    return;
  }

  grid.innerHTML = filtered.map(p => `
    <div class="catalog-edit-card" data-id="${p.id}" style="padding: 12px; border: 1.5px solid #ebd5c1; border-radius: 12px; background: #ffffff;">
      <div class="catalog-text-badge-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px; padding-bottom:6px; border-bottom:1px dashed #ebd5c1;">
        <span class="coffee-category-badge" style="position:static; background:rgba(176,125,80,0.15); color:#8c5427; border:1px solid rgba(176,125,80,0.25); border-radius:6px; padding:2px 8px; font-size:0.72rem; font-weight:700;">${p.category}</span>
        <span style="font-size:0.72rem; font-weight:700; color:#8a6a4e; background:#f7efe6; padding:2px 6px; border-radius:4px; border:1px solid #ebd5c1;">${p.sku || p.id}</span>
      </div>
      <div class="catalog-edit-body">
        <h4>${p.name}</h4>
        <div style="font-size:0.75rem; color:var(--text-dim); margin-bottom:6px;">
          <span class="coffee-category-badge" style="position:static; margin-right:4px;">${p.category}</span>
          SKU: ${p.sku || '-'}
        </div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 8px;">
          <strong style="color:var(--caramel); font-size:0.95rem;">${formatRupiah(p.price)}</strong>
          <span style="font-size:0.75rem; color: var(--text-muted);">HPP: ${formatRupiah(p.costPrice)} | Stok: Unlimited</span>
        </div>
        <div class="catalog-card-btn-row">
          <button class="btn-cat-edit" onclick="openEditProductModal('${p.id}')">
            <i class="fa-solid fa-pen"></i> Edit Menu
          </button>
          <button class="btn-cat-delete" onclick="deleteProduct('${p.id}')" title="Hapus Menu">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      </div>
    </div>
  `).join('');
}

// --- 13B. KATALOG MENU CRUD & MANAJEMEN KATEGORI ---
let currentProductModifiers = [];

window.renderProductModifierList = function() {
  const container = document.getElementById('productModifierListContainer');
  if (!container) return;
  if (!currentProductModifiers || currentProductModifiers.length === 0) {
    container.innerHTML = '<p style="color:var(--text-dim); font-size:0.75rem; text-align:center; padding:8px;">Belum ada opsi modifier khusus. Klik tombol "Tambah Opsi Modifier" atau pilih preset cepat di bawah.</p>';
    return;
  }

  container.innerHTML = currentProductModifiers.map((m, idx) => `
    <div class="mod-builder-row">
      <input type="text" class="mod-row-name" placeholder="Nama Opsi (misal: Large, Extra Shot, Less Sugar)" value="${m.name || ''}" oninput="updateModRowName(${idx}, this.value)">
      <div style="display:flex; align-items:center; gap:4px; min-width:140px;">
        <span style="font-size:0.75rem; font-weight:700; color:var(--caramel);">+Rp</span>
        <input type="number" class="mod-row-price" placeholder="0" value="${m.price || 0}" min="0" step="500" oninput="updateModRowPrice(${idx}, this.value)">
      </div>
      <button type="button" class="btn-remove-mod-row" onclick="removeModRow(${idx})" title="Hapus Opsi"><i class="fa-solid fa-trash-can"></i></button>
    </div>
  `).join('');
};

window.addCustomModifierRow = function(name = '', price = 0) {
  currentProductModifiers.push({ name: name, price: price });
  window.renderProductModifierList();
};

window.addPresetModRow = function(name, price) {
  currentProductModifiers.push({ name: name, price: price });
  window.renderProductModifierList();
  showToast(`Opsi modifier "${name}" ditambahkan!`);
};

window.removeModRow = function(idx) {
  if (idx >= 0 && idx < currentProductModifiers.length) {
    currentProductModifiers.splice(idx, 1);
    window.renderProductModifierList();
  }
};

window.updateModRowName = function(idx, val) {
  if (currentProductModifiers[idx]) currentProductModifiers[idx].name = val;
};

window.updateModRowPrice = function(idx, val) {
  if (currentProductModifiers[idx]) currentProductModifiers[idx].price = parseFloat(val) || 0;
};

function initCatalogManagement() {
  const openAddProductBtn = document.getElementById('openAddProductModalBtn');
  const openCategoryBtn = document.getElementById('openCategoryManageModalBtn');
  const searchInput = document.getElementById('catalogSearchInput');
  const addModRowBtn = document.getElementById('addCustomModifierRowBtn');
  const fileUploadInput = document.getElementById('productFileInput');

  // Direct Photo Upload dari Device (FileReader Data URL)
  if (fileUploadInput) {
    fileUploadInput.addEventListener('change', e => {
      const file = e.target.files && e.target.files[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = ev => {
        const dataUrl = ev.target.result;
        const imgInput = document.getElementById('productImageInput');
        const previewImg = document.getElementById('productModalPreviewImg');
        if (imgInput) imgInput.value = dataUrl;
        if (previewImg) previewImg.src = dataUrl;
        showToast('Foto menu berhasil dimuat langsung dari perangkat!');
      };
      reader.readAsDataURL(file);
    });
  }

  // Tombol Tambah Baris Modifier Kustom
  if (addModRowBtn) {
    addModRowBtn.addEventListener('click', () => {
      window.addCustomModifierRow();
    });
  }

  // Search filter
  if (searchInput) {
    searchInput.addEventListener('input', e => {
      catalogSearchQuery = e.target.value.trim().toLowerCase();
      renderCatalogManageGrid();
    });
  }

  // Render Category Filter Chips in Catalog
  renderCatalogCategoryChips();

  // Modal Tambah / Edit Menu
  if (openAddProductBtn) {
    openAddProductBtn.addEventListener('click', () => openAddProductModal());
  }

  const closeProductBtn = document.getElementById('closeProductModalBtn');
  const cancelProductBtn = document.getElementById('cancelProductBtn');
  const saveProductBtn = document.getElementById('saveProductBtn');
  const productModal = document.getElementById('productModal');

  if (closeProductBtn) closeProductBtn.addEventListener('click', () => productModal.classList.remove('active'));
  if (cancelProductBtn) cancelProductBtn.addEventListener('click', () => productModal.classList.remove('active'));

  if (saveProductBtn) {
    saveProductBtn.addEventListener('click', saveProduct);
  }

  // Modal Kelola Kategori
  if (openCategoryBtn) {
    openCategoryBtn.addEventListener('click', () => openCategoryManageModal());
  }

  const closeCatBtn = document.getElementById('closeCategoryModalBtn');
  const closeCatFooterBtn = document.getElementById('closeCategoryFooterBtn');
  const saveNewCatBtn = document.getElementById('saveNewCategoryBtn');
  const catModal = document.getElementById('categoryManageModal');

  if (closeCatBtn) closeCatBtn.addEventListener('click', () => catModal.classList.remove('active'));
  if (closeCatFooterBtn) closeCatFooterBtn.addEventListener('click', () => catModal.classList.remove('active'));

  if (saveNewCatBtn) {
    saveNewCatBtn.addEventListener('click', saveNewCategory);
  }
}

function renderCatalogCategoryChips() {
  const container = document.getElementById('catalogCategoryChips');
  if (!container) return;

  container.innerHTML = State.categories.map(cat => `
    <button class="chip-catalog-cat ${cat.name === catalogSelectedCategory ? 'active' : ''}" data-cat="${cat.name}">
      <i class="fa-solid ${cat.icon}"></i> ${cat.name}
    </button>
  `).join('');

  container.querySelectorAll('.chip-catalog-cat').forEach(chip => {
    chip.addEventListener('click', () => {
      container.querySelectorAll('.chip-catalog-cat').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      catalogSelectedCategory = chip.dataset.cat;
      renderCatalogManageGrid();
    });
  });
}

function openAddProductModal() {
  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const idInput = document.getElementById('productEditId');
  const nameInput = document.getElementById('productNameInput');
  const catSelect = document.getElementById('productCategorySelect');
  const skuInput = document.getElementById('productSkuInput');
  const priceInput = document.getElementById('productPriceInput');
  const costInput = document.getElementById('productCostPriceInput');
  const stockInput = document.getElementById('productStockInput');
  const descInput = document.getElementById('productDescInput');
  const imgInput = document.getElementById('productImageInput');
  const previewImg = document.getElementById('productModalPreviewImg');

  if (title) title.innerText = 'Tambah Menu Baru ke Katalog';
  if (idInput) idInput.value = '';
  if (nameInput) nameInput.value = '';
  if (skuInput) skuInput.value = 'CS-' + Math.floor(100 + Math.random() * 900);
  if (priceInput) priceInput.value = '';
  if (costInput) costInput.value = '';
  if (stockInput) stockInput.value = '100';
  if (descInput) descInput.value = '';
  const defaultImg = 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80';
  if (imgInput) imgInput.value = defaultImg;
  if (previewImg) previewImg.src = defaultImg;

  // Reset custom modifiers
  currentProductModifiers = [];
  window.renderProductModifierList();

  // Populate Categories
  if (catSelect) {
    catSelect.innerHTML = State.categories
      .filter(c => c.name !== 'Semua Menu')
      .map(c => `<option value="${c.name}">${c.name}</option>`)
      .join('');
  }

  if (modal) modal.classList.add('active');
}

window.openEditProductModal = function(prodId) {
  const prod = State.products.find(p => p.id === prodId);
  if (!prod) return;

  const modal = document.getElementById('productModal');
  const title = document.getElementById('productModalTitle');
  const idInput = document.getElementById('productEditId');
  const nameInput = document.getElementById('productNameInput');
  const catSelect = document.getElementById('productCategorySelect');
  const skuInput = document.getElementById('productSkuInput');
  const priceInput = document.getElementById('productPriceInput');
  const costInput = document.getElementById('productCostPriceInput');
  const stockInput = document.getElementById('productStockInput');
  const descInput = document.getElementById('productDescInput');
  const imgInput = document.getElementById('productImageInput');
  const previewImg = document.getElementById('productModalPreviewImg');

  if (title) title.innerText = `Edit Menu: ${prod.name}`;
  if (idInput) idInput.value = prod.id;
  if (nameInput) nameInput.value = prod.name;
  if (skuInput) skuInput.value = prod.sku || '';
  if (priceInput) priceInput.value = prod.price;
  if (costInput) costInput.value = prod.costPrice;
  if (stockInput) stockInput.value = prod.stock;
  if (descInput) descInput.value = prod.desc || '';
  if (imgInput) imgInput.value = prod.image || '';
  if (previewImg) previewImg.src = prod.image || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80';

  // Load custom modifiers
  currentProductModifiers = (prod.customModifiers && Array.isArray(prod.customModifiers)) 
    ? JSON.parse(JSON.stringify(prod.customModifiers)) 
    : [];
  window.renderProductModifierList();

  if (catSelect) {
    catSelect.innerHTML = State.categories
      .filter(c => c.name !== 'Semua Menu')
      .map(c => `<option value="${c.name}" ${c.name === prod.category ? 'selected' : ''}>${c.name}</option>`)
      .join('');
  }

  if (modal) modal.classList.add('active');
};

function saveProduct() {
  const id = document.getElementById('productEditId')?.value;
  const name = document.getElementById('productNameInput')?.value.trim();
  const category = document.getElementById('productCategorySelect')?.value;
  const sku = document.getElementById('productSkuInput')?.value.trim() || 'CS-MENU';
  const price = parseFloat(document.getElementById('productPriceInput')?.value) || 0;
  const costPrice = parseFloat(document.getElementById('productCostPriceInput')?.value) || 0;
  const stock = parseInt(document.getElementById('productStockInput')?.value) || 0;
  const desc = document.getElementById('productDescInput')?.value.trim() || '';
  const image = document.getElementById('productImageInput')?.value.trim() || 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80';

  if (!name || price <= 0) {
    alert('Mohon isi nama menu dan harga jual yang valid!');
    return;
  }

  // Filter modifier yang memiliki nama
  const validModifiers = currentProductModifiers.filter(m => m.name && m.name.trim().length > 0);
  const hasModifiers = validModifiers.length > 0;

  if (id) {
    // Mode Edit
    const prod = State.products.find(p => p.id === id);
    if (prod) {
      prod.name = name;
      prod.category = category;
      prod.sku = sku;
      prod.price = price;
      prod.costPrice = costPrice;
      prod.stock = stock;
      prod.hasModifiers = hasModifiers;
      prod.customModifiers = validModifiers;
      prod.desc = desc;
      prod.image = image;
      showToast(`Menu "${name}" berhasil diperbarui!`);
    }
  } else {
    // Mode Tambah Baru
    const newId = 'P' + (State.products.length + 1).toString().padStart(2, '0');
    State.products.unshift({
      id: newId,
      name: name,
      category: category,
      sku: sku,
      price: price,
      costPrice: costPrice,
      stock: stock,
      hasModifiers: hasModifiers,
      customModifiers: validModifiers,
      desc: desc,
      image: image,
      unit: 'cup'
    });
    showToast(`Menu baru "${name}" berhasil ditambahkan ke katalog!`);
  }

  document.getElementById('productModal').classList.remove('active');
  renderProducts();
  renderCatalogManageGrid();
}

window.deleteProduct = function(prodId) {
  const prod = State.products.find(p => p.id === prodId);
  if (!prod) return;

  if (confirm(`Apakah Anda yakin ingin menghapus menu "${prod.name}" dari katalog kafe?`)) {
    State.products = State.products.filter(p => p.id !== prodId);
    renderProducts();
    renderCatalogManageGrid();
    showToast(`Menu "${prod.name}" telah dihapus.`);
  }
};

// Kelola Kategori Menu Kafe (Modern, Tersusun, Elegan & Simpel)
function openCategoryManageModal() {
  const modal = document.getElementById('categoryManageModal');
  renderCategoryListManage();
  if (modal) modal.classList.add('active');
}

function renderCategoryListManage() {
  const container = document.getElementById('categoryListManageContainer');
  const totalBadge = document.getElementById('catTotalBadge');
  if (totalBadge) totalBadge.innerText = `${State.categories.length} Kategori`;
  if (!container) return;

  container.innerHTML = State.categories.map(cat => {
    const isSpecial = cat.name === 'Semua Menu';
    const count = State.products.filter(p => cat.name === 'Semua Menu' || p.category === cat.name).length;

    return `
      <div class="cat-manage-item-card">
        <div class="cat-item-left">
          <div class="cat-icon-squircle">
            <i class="fa-solid ${cat.icon}"></i>
          </div>
          <div class="cat-item-info">
            <div class="cat-item-name">${cat.name}</div>
            <div class="cat-item-count-chip">
              <i class="fa-solid fa-mug-hot"></i> ${count} Menu
            </div>
          </div>
        </div>
        <div class="cat-item-actions">
          ${isSpecial ? `
            <span class="cat-badge-primary"><i class="fa-solid fa-lock"></i> Kategori Utama</span>
          ` : `
            <button type="button" class="btn-cat-action btn-cat-edit" onclick="editCategoryName('${cat.name}')" title="Ubah Nama Kategori">
              <i class="fa-solid fa-pen"></i> Edit
            </button>
            <button type="button" class="btn-cat-action btn-cat-delete" onclick="deleteCategory('${cat.name}')" title="Hapus Kategori">
              <i class="fa-solid fa-trash-can"></i> Hapus
            </button>
          `}
        </div>
      </div>
    `;
  }).join('');
}

window.editCategoryName = function(oldName) {
  const newName = prompt(`Ubah nama kategori "${oldName}" menjadi:`, oldName);
  if (!newName || !newName.trim() || newName.trim() === oldName) return;
  const trimmed = newName.trim();
  if (State.categories.some(c => c.name.toLowerCase() === trimmed.toLowerCase() && c.name !== oldName)) {
    alert('Nama kategori tersebut sudah digunakan!');
    return;
  }
  const cat = State.categories.find(c => c.name === oldName);
  if (cat) cat.name = trimmed;
  State.products.forEach(p => {
    if (p.category === oldName) p.category = trimmed;
  });
  if (State.selectedCategory === oldName) State.selectedCategory = trimmed;
  initCategoriesSidebar();
  renderCatalogCategoryChips();
  renderCategoryListManage();
  renderProducts();
  renderCatalogManageGrid();
  saveAppState();
  showToast(`Kategori "${oldName}" berhasil diubah menjadi "${trimmed}"`);
};

function saveNewCategory() {
  const nameInput = document.getElementById('newCategoryNameInput');
  const iconSelect = document.getElementById('newCategoryIconSelect');
  const name = nameInput?.value.trim();
  const icon = iconSelect?.value || 'fa-mug-hot';

  if (!name) {
    alert('Mohon masukkan nama kategori!');
    return;
  }

  if (State.categories.some(c => c.name.toLowerCase() === name.toLowerCase())) {
    alert('Kategori dengan nama tersebut sudah ada!');
    return;
  }

  State.categories.push({ name: name, icon: icon });
  nameInput.value = '';

  initCategoriesSidebar();
  renderCatalogCategoryChips();
  renderCategoryListManage();
  renderProducts();
  saveAppState();
  showToast(`Kategori "${name}" berhasil ditambahkan!`);
}

window.deleteCategory = function(catName) {
  if (confirm(`Hapus kategori "${catName}"? Menu yang terdaftar di kategori ini akan dipindahkan ke kategori "CS Signature".`)) {
    State.categories = State.categories.filter(c => c.name !== catName);

    // Reassign products to CS Signature
    State.products.forEach(p => {
      if (p.category === catName) p.category = 'CS Signature';
    });

    if (State.selectedCategory === catName) State.selectedCategory = 'Semua Menu';

    initCategoriesSidebar();
    renderCatalogCategoryChips();
    renderCategoryListManage();
    renderProducts();
    renderCatalogManageGrid();
    saveAppState();
    showToast(`Kategori "${catName}" telah dihapus.`);
  }
};

// --- 14. SHIFT TATAKAN & REKONSILIASI KAS LACI ---
function renderShiftDetails() {
  const shift = State.currentShift;
  const initial = shift.initialCash;
  const cashSales = shift.totalCashSales;
  const qrisSales = shift.totalQrisSales;

  const sumIn = (shift.movements || []).filter(m => m.type === 'in').reduce((s, m) => s + m.amount, 0);
  const sumOut = (shift.movements || []).filter(m => m.type === 'out').reduce((s, m) => s + m.amount, 0);
  const netMovements = sumIn - sumOut;

  const expectedCash = initial + cashSales + netMovements;

  // 4 Tatakan Kartu Kas Laci
  const elInitial = document.getElementById('hubShiftInitial');
  const elCashSales = document.getElementById('hubShiftCashSales');
  const elMovements = document.getElementById('hubShiftMovements');
  const elExpected = document.getElementById('hubShiftExpectedCash');
  const elDigital = document.getElementById('hubShiftDigitalSales');
  const headerCash = document.getElementById('headerDrawerCash');

  if (elInitial) elInitial.innerText = formatRupiah(initial);
  if (elCashSales) elCashSales.innerText = formatRupiah(cashSales);
  if (elMovements) {
    elMovements.innerText = (netMovements >= 0 ? '+' : '') + formatRupiah(netMovements);
    elMovements.style.color = netMovements >= 0 ? 'var(--coffee-dark)' : 'var(--accent-danger)';
  }
  if (elExpected) elExpected.innerText = formatRupiah(expectedCash);
  if (elDigital) elDigital.innerText = formatRupiah(qrisSales);
  if (headerCash) headerCash.innerText = formatRupiah(expectedCash);

  // Render Riwayat Petty Cash Table
  const tbody = document.getElementById('shiftMovementsTableBody');
  if (tbody) {
    if (!shift.movements || shift.movements.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center; color:var(--text-dim);">Belum ada pencatatan kas masuk atau keluar laci pada shift ini.</td></tr>';
    } else {
      tbody.innerHTML = shift.movements.map(m => `
        <tr>
          <td>${m.time}</td>
          <td>
            <span class="badge-sub" style="background:${m.type === 'in' ? '#e8f5e9' : '#ffebee'}; color:${m.type === 'in' ? '#2e7d32' : '#c62828'}; font-weight:700;">
              <i class="fa-solid ${m.type === 'in' ? 'fa-arrow-down' : 'fa-arrow-up'}"></i> ${m.type === 'in' ? 'Kas Masuk' : 'Kas Keluar'}
            </span>
          </td>
          <td><strong style="color:${m.type === 'in' ? '#2e7d32' : 'var(--accent-danger)'};">${m.type === 'in' ? '+' : '-'}${formatRupiah(m.amount)}</strong></td>
          <td>${m.note}</td>
          <td>${m.officer || 'Rian Pratama'}</td>
        </tr>
      `).join('');
    }
  }
}

function initShiftTatakan() {
  const cashInBtn = document.getElementById('hubCashInBtn');
  const cashOutBtn = document.getElementById('hubCashOutBtn');
  const closeShiftBtn = document.getElementById('hubCloseShiftBtn');

  // Modal Kas Masuk / Keluar
  const movementModal = document.getElementById('cashMovementModal');
  const closeMovementBtn = document.getElementById('closeCashMovementBtn');
  const cancelMovementBtn = document.getElementById('cancelCashMovementBtn');
  const saveMovementBtn = document.getElementById('saveCashMovementBtn');
  const typeSelect = document.getElementById('cashMovementTypeSelect');
  const modalTitle = document.getElementById('cashMovementModalTitle');

  if (cashInBtn) {
    cashInBtn.addEventListener('click', () => {
      if (typeSelect) typeSelect.value = 'in';
      if (modalTitle) modalTitle.innerText = 'Catat Kas Masuk Laci';
      document.getElementById('cashMovementAmountInput').value = '';
      document.getElementById('cashMovementNotesInput').value = '';
      movementModal.classList.add('active');
    });
  }

  if (cashOutBtn) {
    cashOutBtn.addEventListener('click', () => {
      if (typeSelect) typeSelect.value = 'out';
      if (modalTitle) modalTitle.innerText = 'Catat Kas Keluar Laci (Petty Cash)';
      document.getElementById('cashMovementAmountInput').value = '';
      document.getElementById('cashMovementNotesInput').value = '';
      movementModal.classList.add('active');
    });
  }

  if (closeMovementBtn) closeMovementBtn.addEventListener('click', () => movementModal.classList.remove('active'));
  if (cancelMovementBtn) cancelMovementBtn.addEventListener('click', () => movementModal.classList.remove('active'));

  if (saveMovementBtn) {
    saveMovementBtn.addEventListener('click', () => {
      const type = document.getElementById('cashMovementTypeSelect')?.value || 'in';
      const amt = parseFloat(document.getElementById('cashMovementAmountInput')?.value) || 0;
      const note = document.getElementById('cashMovementNotesInput')?.value.trim();
      const officer = document.getElementById('cashMovementOfficerInput')?.value.trim() || 'Rian Pratama';

      if (amt <= 0 || !note) {
        alert('Mohon isi nominal uang dan keterangan keperluan!');
        return;
      }

      const now = new Date();
      const timeStr = now.getHours().toString().padStart(2, '0') + ':' + now.getMinutes().toString().padStart(2, '0');

      if (!State.currentShift.movements) State.currentShift.movements = [];
      State.currentShift.movements.unshift({
        time: timeStr,
        type: type,
        amount: amt,
        note: note,
        officer: officer
      });

      movementModal.classList.remove('active');
      renderShiftDetails();
      showToast(`Catatan kas ${type === 'in' ? 'masuk' : 'keluar'} Rp ${formatRupiah(amt)} berhasil disimpan!`);
    });
  }

  // Modal Tutup Shift & Rekonsiliasi Kas Laci
  const closeShiftModal = document.getElementById('closeShiftModal');
  const closeCloseShiftBtn = document.getElementById('closeCloseShiftModalBtn');
  const cancelCloseShiftBtn = document.getElementById('cancelCloseShiftBtn');
  const confirmCloseShiftBtn = document.getElementById('confirmCloseShiftBtn');
  const actualCashInput = document.getElementById('actualCashInput');

  if (closeShiftBtn) {
    closeShiftBtn.addEventListener('click', () => {
      const shift = State.currentShift;
      const sumIn = (shift.movements || []).filter(m => m.type === 'in').reduce((s, m) => s + m.amount, 0);
      const sumOut = (shift.movements || []).filter(m => m.type === 'out').reduce((s, m) => s + m.amount, 0);
      const netMovements = sumIn - sumOut;
      const expected = shift.initialCash + shift.totalCashSales + netMovements;

      document.getElementById('recInitialCash').innerText = formatRupiah(shift.initialCash);
      document.getElementById('recCashSales').innerText = formatRupiah(shift.totalCashSales);
      document.getElementById('recMovements').innerText = (netMovements >= 0 ? '+' : '') + formatRupiah(netMovements);
      document.getElementById('recExpectedCash').innerText = formatRupiah(expected);

      if (actualCashInput) {
        actualCashInput.value = expected; // Default terisi sesuai hitungan sistem
        updateReconcileDiff(expected, expected);
      }

      closeShiftModal.classList.add('active');
    });
  }

  if (closeCloseShiftBtn) closeCloseShiftBtn.addEventListener('click', () => closeShiftModal.classList.remove('active'));
  if (cancelCloseShiftBtn) cancelCloseShiftBtn.addEventListener('click', () => closeShiftModal.classList.remove('active'));

  if (actualCashInput) {
    actualCashInput.addEventListener('input', () => {
      const shift = State.currentShift;
      const sumIn = (shift.movements || []).filter(m => m.type === 'in').reduce((s, m) => s + m.amount, 0);
      const sumOut = (shift.movements || []).filter(m => m.type === 'out').reduce((s, m) => s + m.amount, 0);
      const netMovements = sumIn - sumOut;
      const expected = shift.initialCash + shift.totalCashSales + netMovements;
      const actual = parseFloat(actualCashInput.value) || 0;

      updateReconcileDiff(expected, actual);
    });
  }

  if (confirmCloseShiftBtn) {
    confirmCloseShiftBtn.addEventListener('click', () => {
      const actual = parseFloat(actualCashInput?.value) || 0;
      const note = document.getElementById('reconcileNotesInput')?.value.trim() || 'Tutup shift reguler';

      showToast(`Shift #${State.currentShift.id} berhasil ditutup! Kas fisik: ${formatRupiah(actual)}.`);
      closeShiftModal.classList.remove('active');
    });
  }
}

function updateReconcileDiff(expected, actual) {
  const diff = actual - expected;
  const alertBox = document.getElementById('differenceAlertBox');
  const diffText = document.getElementById('reconcileDifferenceText');

  if (!diffText) return;

  if (diff === 0) {
    diffText.innerText = 'Rp 0 (Pas / Seimbang Sempurna)';
    diffText.style.color = '#2e7d32';
  } else if (diff > 0) {
    diffText.innerText = `+${formatRupiah(diff)} (Kelebihan Uang Fisik)`;
    diffText.style.color = 'var(--accent-gold)';
  } else {
    diffText.innerText = `-${formatRupiah(Math.abs(diff))} (Kekurangan Uang Fisik)`;
    diffText.style.color = 'var(--accent-danger)';
  }
}

// --- 14B. INTEGRASI GOOGLE APPS SCRIPT SPREADSHEET (REAL-TIME CLOUD) ---
const GOOGLE_APPS_SCRIPT_TEMPLATE = `/**
 * CAFFEE SA'ADAH - Google Apps Script Web App Integration
 * Menghubungkan Kasir POS Caffee Sa'adah secara Real-Time dengan Google Sheets
 */
function setupSheet() {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName("Pesanan Caffee Sa'adah");
  if (!sheet) {
    sheet = ss.insertSheet("Pesanan Caffee Sa'adah");
    sheet.appendRow([
      "Waktu Transaksi", 
      "No. Pesanan", 
      "No. Invoice", 
      "Nama Pelanggan", 
      "Tipe Pesanan / Meja", 
      "Daftar Menu & Modifier", 
      "Total Qty", 
      "Subtotal", 
      "Diskon", 
      "Grand Total", 
      "Metode Pembayaran", 
      "Kasir / Karyawan", 
      "Status Pesanan"
    ]);
    sheet.getRange(1, 1, 1, 13).setBackground("#271a13").setFontColor("#f5ebe0").setFontWeight("bold");
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doGet(e) {
  var sheet = setupSheet();
  var rows = sheet.getDataRange().getValues();
  return ContentService.createTextOutput(JSON.stringify({
    ok: true,
    status: "online",
    kafe: "Caffee Sa'adah",
    totalPesananTersimpan: Math.max(0, rows.length - 1)
  })).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var rawData = e.postData && e.postData.contents ? e.postData.contents : "{}";
    var data = JSON.parse(rawData);
    var sheet = setupSheet();
    
    if (data.action === "PING" || data.action === "TEST") {
      return ContentService.createTextOutput(JSON.stringify({
        status: "success", 
        message: "Koneksi Google Spreadsheet Caffee Sa'adah Berhasil Terhubung!"
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    var order = data.order || data;
    var itemsSummary = (order.items || []).map(function(i) {
      return i.qty + "x " + i.name + (i.mods ? " (" + i.mods + ")" : "");
    }).join(" | ");
    
    var totalQty = (order.items || []).reduce(function(sum, i) { return sum + (i.qty || 1); }, 0);
    var dateStr = order.date ? new Date(order.date).toLocaleString("id-ID", { timeZone: "Asia/Jakarta" }) : new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" });
    
    // Mode Update / Koreksi Pesanan yang Ditarik ke Kasir
    var isUpdated = false;
    if (data.action === "UPDATE") {
      var dataRange = sheet.getDataRange().getValues();
      for (var r = 1; r < dataRange.length; r++) {
        if (dataRange[r][2] === order.invoice || dataRange[r][1] === order.dailySeq) {
          sheet.getRange(r + 1, 1, 1, 13).setValues([[
            dateStr + " (Diperbarui)",
            order.dailySeq || "",
            order.invoice || "",
            order.customerName || "Pelanggan Umum",
            order.orderType || "",
            itemsSummary,
            totalQty,
            order.subtotal || 0,
            order.discount || 0,
            order.grandTotal || 0,
            order.paymentMethod || "Tunai",
            order.cashier || "Karyawan 1",
            order.status || "Selesai"
          ]]);
          isUpdated = true;
          break;
        }
      }
    }
    
    if (!isUpdated) {
      sheet.appendRow([
        dateStr,
        order.dailySeq || "",
        order.invoice || "",
        order.customerName || "Pelanggan Umum",
        order.orderType || "",
        itemsSummary,
        totalQty,
        order.subtotal || 0,
        order.discount || 0,
        order.grandTotal || 0,
        order.paymentMethod || "Tunai",
        order.cashier || "Karyawan 1",
        order.status || "Diproses Barista"
      ]);
    }
    
    return ContentService.createTextOutput(JSON.stringify({
      status: "success",
      invoice: order.invoice,
      action: data.action || "CREATE",
      message: "Data pesanan Caffee Sa'adah berhasil dicatat ke Google Sheets"
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({
      status: "error",
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}`;

function initGoogleSheetsIntegration() {
  const urlInput = document.getElementById('googleSheetUrlInput');
  const saveUrlBtn = document.getElementById('saveSheetUrlBtn');
  const openScriptBtn = document.getElementById('openScriptModalBtn');
  const testSyncBtn = document.getElementById('testGoogleSheetSyncBtn');
  const copyScriptBtn = document.getElementById('copyGoogleAppsScriptBtn');
  const codeArea = document.getElementById('googleAppsScriptCodeArea');
  const modal = document.getElementById('googleScriptModal');
  const closeBtn = document.getElementById('closeGoogleScriptModalBtn');
  const closeFooterBtn = document.getElementById('closeGoogleScriptFooterBtn');

  if (codeArea) codeArea.value = GOOGLE_APPS_SCRIPT_TEMPLATE;

  // Load URL tersimpan
  const savedUrl = localStorage.getItem('caffee_gsheet_url') || localStorage.getItem('tuntun_gsheet_url');
  if (savedUrl && urlInput) {
    urlInput.value = savedUrl;
  }

  function handleSaveUrl() {
    if (!urlInput) return;
    const val = urlInput.value.trim();
    localStorage.setItem('caffee_gsheet_url', val);
    localStorage.setItem('tuntun_gsheet_url', val);
    const badge = document.getElementById('sheetSyncBadge');
    if (val) {
      showToast('URL Google Apps Script berhasil disimpan!');
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> URL Tersimpan & Siap Sinkron';
        badge.style.background = '#e8f5e9';
        badge.style.color = '#2e7d32';
      }
    } else {
      showToast('URL Google Apps Script dikosongkan.', 'info');
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-link-slash"></i> Belum Ada URL';
        badge.style.background = '#f5ebe0';
        badge.style.color = '#5c3d2e';
      }
    }
  }

  if (saveUrlBtn) {
    saveUrlBtn.addEventListener('click', handleSaveUrl);
  }

  if (urlInput) {
    urlInput.addEventListener('change', handleSaveUrl);
  }

  if (openScriptBtn && modal) {
    openScriptBtn.addEventListener('click', () => modal.classList.add('active'));
  }
  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  }
  if (closeFooterBtn && modal) {
    closeFooterBtn.addEventListener('click', () => modal.classList.remove('active'));
  }

  if (copyScriptBtn && codeArea) {
    copyScriptBtn.addEventListener('click', () => {
      codeArea.select();
      navigator.clipboard.writeText(codeArea.value).then(() => {
        showToast('Kode Google Apps Script Caffee Sa\'adah berhasil disalin ke clipboard!');
      }).catch(() => {
        showToast('Silakan salin teks di dalam kotak secara manual');
      });
    });
  }

  if (testSyncBtn) {
    testSyncBtn.addEventListener('click', () => {
      const url = urlInput?.value.trim() || localStorage.getItem('caffee_gsheet_url');
      if (!url) {
        showToast('Masukkan URL Web App Google Sheets terlebih dahulu!', 'error');
        return;
      }

      showToast('Mengirim sinyal tes ke Google Spreadsheet Caffee Sa\'adah...');
      const badge = document.getElementById('sheetSyncBadge');
      if (badge) {
        badge.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Menghubungkan...';
      }

      fetch(url, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TEST',
          timestamp: new Date().toISOString(),
          testMessage: 'Koneksi Caffee Sa\'adah POS Cloud Aktif'
        })
      }).then(() => {
        if (badge) {
          badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> Tersinkronisasi Aktif';
          badge.style.background = '#e8f5e9';
          badge.style.color = '#2e7d32';
        }
        showToast('Sukses! Data uji berhasil terkirim ke Google Spreadsheet.');
      }).catch(err => {
        if (badge) {
          badge.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i> Gagal Terhubung';
          badge.style.background = '#ffebee';
          badge.style.color = '#c62828';
        }
        showToast('Gagal menghubungi Webhook: ' + err.message, 'error');
      });
    });
  }
}

function syncOrderToGoogleSheets(order, action = 'CREATE') {
  const autoSync = document.getElementById('autoSyncSheetsCheck')?.checked;
  if (!autoSync) return;

  const url = document.getElementById('googleSheetUrlInput')?.value.trim() || localStorage.getItem('tuntun_gsheet_url');
  if (!url) return;

  fetch(url, {
    method: 'POST',
    mode: 'no-cors',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: action,
      order: order,
      timestamp: new Date().toISOString()
    })
  }).then(() => {
    const badge = document.getElementById('sheetSyncBadge');
    if (badge) {
      badge.innerHTML = '<i class="fa-solid fa-circle-check"></i> ' + (action === 'UPDATE' ? 'Pesanan Diperbarui di Sheets' : 'Pesanan Tersinkron ke Sheets');
    }
  }).catch(err => {
    console.warn('Google Sheets sync warning:', err);
  });
}

// --- 14C. EDIT PESANAN MODAL (INTERAKTIF + / - / HAPUS MENU) & RECALL KE KASIR ---
function initEditOrderModal() {
  const modal = document.getElementById('editOrderModal');
  const closeBtn = document.getElementById('closeEditOrderModalBtn');
  const cancelBtn = document.getElementById('cancelEditOrderBtn');
  const saveBtn = document.getElementById('saveOrderDetailsBtn');
  const recallBtn = document.getElementById('recallOrderToCartBtn');

  if (closeBtn) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (cancelBtn) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  let targetOrder = null;

  function renderInteractiveOrderItems() {
    const previewContainer = document.getElementById('editOrderItemsPreview');
    if (!previewContainer || !targetOrder) return;

    if (!targetOrder.items || targetOrder.items.length === 0) {
      previewContainer.innerHTML = '<p style="text-align:center; color:var(--text-dim); padding:12px;">Pesanan ini belum memiliki item.</p>';
      return;
    }

    previewContainer.innerHTML = targetOrder.items.map((i, idx) => `
      <div class="edit-order-item-row" data-idx="${idx}">
        <div style="flex:1;">
          <strong style="color:var(--coffee-dark); font-size:0.88rem;">${i.name}</strong>
          ${i.mods ? `<div style="font-size:0.73rem; color:var(--caramel);">${i.mods}</div>` : ''}
          <div style="font-size:0.75rem; color:var(--text-dim);">${formatRupiah(i.price)} / cup</div>
        </div>
        <div class="edit-qty-ctrls">
          <button type="button" class="btn-qty-mini" onclick="stepEditOrderItemQty(${idx}, -1)" title="Kurangi Jumlah"><i class="fa-solid fa-minus"></i></button>
          <span style="font-weight:800; min-width:24px; text-align:center;">${i.qty}</span>
          <button type="button" class="btn-qty-mini" onclick="stepEditOrderItemQty(${idx}, 1)" title="Tambah Jumlah"><i class="fa-solid fa-plus"></i></button>
          <strong style="margin: 0 8px; min-width: 70px; text-align: right; color: var(--caramel); font-size:0.85rem;">${formatRupiah(i.price * i.qty)}</strong>
          <button type="button" class="btn-del-item-mini" onclick="deleteEditOrderItem(${idx})" title="Hapus Menu Ini"><i class="fa-solid fa-trash-can"></i></button>
        </div>
      </div>
    `).join('');
  }

  function recalculateTargetOrder() {
    if (!targetOrder) return;
    const subtotal = targetOrder.items.reduce((s, i) => s + (i.price * i.qty), 0);
    const costTotal = targetOrder.items.reduce((s, i) => s + ((i.costPrice || Math.round(i.price * 0.4)) * i.qty), 0);
    const tax = Math.round(subtotal * 0.1);
    const discount = targetOrder.discount || 0;
    targetOrder.subtotal = subtotal;
    targetOrder.costTotal = costTotal;
    targetOrder.tax = tax;
    targetOrder.grandTotal = Math.max(0, subtotal + tax - discount);
  }

  window.stepEditOrderItemQty = function(idx, delta) {
    if (!targetOrder || !targetOrder.items[idx]) return;
    const item = targetOrder.items[idx];
    if (delta < 0 && item.qty <= 1) {
      window.deleteEditOrderItem(idx);
      return;
    }
    item.qty += delta;
    recalculateTargetOrder();
    renderInteractiveOrderItems();
  };

  window.deleteEditOrderItem = function(idx) {
    if (!targetOrder || !targetOrder.items[idx]) return;
    const itemName = targetOrder.items[idx].name;
    if (confirm(`Hapus "${itemName}" dari pesanan ini?`)) {
      targetOrder.items.splice(idx, 1);
      recalculateTargetOrder();
      renderInteractiveOrderItems();
    }
  };

  window.openEditOrderModal = function(invoice) {
    targetOrder = State.dailyOrders.find(o => o.invoice === invoice);
    if (!targetOrder) return;

    const titleEl = document.getElementById('editOrderModalTitle');
    const statusSelect = document.getElementById('editOrderStatusSelect');
    const typeSelect = document.getElementById('editOrderTypeSelect');
    const tableInput = document.getElementById('editOrderTableInput');
    const custInput = document.getElementById('editOrderCustomerNameInput');

    if (titleEl) titleEl.innerText = `Edit Pesanan ${targetOrder.dailySeq} (${targetOrder.invoice})`;
    if (statusSelect) statusSelect.value = targetOrder.status;
    if (custInput) custInput.value = targetOrder.customerName;
    if (tableInput) tableInput.value = targetOrder.table || '';

    if (typeSelect) {
      if (targetOrder.orderType.includes('Dine In')) typeSelect.value = 'Dine In';
      else if (targetOrder.orderType.includes('Take Away')) typeSelect.value = 'Take Away';
      else typeSelect.value = 'Delivery';
    }

    renderInteractiveOrderItems();
    if (modal) modal.classList.add('active');
  };

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      if (!targetOrder) return;

      const newStatus = document.getElementById('editOrderStatusSelect')?.value;
      const newCust = document.getElementById('editOrderCustomerNameInput')?.value.trim();
      const newType = document.getElementById('editOrderTypeSelect')?.value;
      const newTable = document.getElementById('editOrderTableInput')?.value.trim() || '-';

      targetOrder.status = newStatus;
      targetOrder.customerName = newCust || 'Pelanggan Umum';
      targetOrder.table = newType === 'Dine In' ? newTable : '-';
      targetOrder.orderType = newType === 'Dine In' ? `Dine In • ${newTable}` : newType;

      recalculateTargetOrder();
      syncOrderToGoogleSheets(targetOrder, 'UPDATE');

      modal.classList.remove('active');
      renderDailyOrders();
      renderKDSGrid();
      renderFinanceStatement();
      renderDashboardChartsAndMetrics();
      showToast(`Pesanan ${targetOrder.dailySeq} berhasil diperbarui! Total: ${formatRupiah(targetOrder.grandTotal)}`);
    });
  }

  // Tarik Pesanan Kembali ke Kasir untuk Tambah Menu dari Katalog
  if (recallBtn) {
    recallBtn.addEventListener('click', () => {
      if (!targetOrder) return;

      State.cart = targetOrder.items.map(i => {
        let matchedProduct = State.products.find(p => p.name === i.name);
        if (!matchedProduct) {
          matchedProduct = {
            id: 'RECALLED-' + Math.random(),
            name: i.name,
            price: i.price,
            costPrice: Math.round(i.price * 0.4),
            category: 'Signature Coffee',
            image: 'https://images.unsplash.com/photo-1517701604599-bb29b565090c?auto=format&fit=crop&w=500&q=80',
            hasModifiers: true
          };
        }

        return {
          product: matchedProduct,
          qty: i.qty,
          modifiers: [],
          modsString: i.mods || '',
          modsShort: i.modsShort || i.mods || '',
          notes: ''
        };
      });

      State.editingOrderInvoice = targetOrder.invoice;
      State.tableNumber = targetOrder.table || 'Meja 01';
      State.orderType = targetOrder.orderType.includes('Take Away') ? 'takeAway' : targetOrder.orderType.includes('Delivery') ? 'delivery' : 'dineIn';

      modal.classList.remove('active');

      const tabPos = document.getElementById('tabNavPos');
      if (tabPos) tabPos.click();

      renderCart();
      showToast(`Pesanan ${targetOrder.dailySeq} ditarik ke kasir. Silakan tambahkan menu katalog lalu klik Perbarui Pesanan.`);
    });
  }
}

// --- 14D. PELANGGAN, CRM & PILIH MEMBER DI KASIR ---
function renderCustomersTable() {
  const tbody = document.getElementById('hubCustomerTableBody');
  if (!tbody) return;
  tbody.innerHTML = State.customers.map(c => `
    <tr>
      <td><strong>${c.name}</strong></td>
      <td>${c.phone}</td>
      <td><span style="font-weight:700; color:var(--caramel);">${c.tier}</span> (${c.tierDiscount || 0}%)</td>
      <td><strong>${c.points} Pts</strong></td>
      <td><strong>${formatRupiah(c.deposit)}</strong></td>
      <td style="font-size:0.78rem; color:var(--text-muted);">${c.pref || '-'}</td>
      <td>
        <button class="btn-cat-delete" onclick="deleteCustomer('${c.id}')" title="Hapus Pelanggan">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    </tr>
  `).join('');
}

window.deleteCustomer = function(id) {
  const cust = State.customers.find(c => c.id === id);
  if (!cust) return;
  if (confirm(`Hapus data pelanggan "${cust.name}"?`)) {
    State.customers = State.customers.filter(c => c.id !== id);
    renderCustomersTable();
    renderCustomerPickerList();
    showToast(`Pelanggan "${cust.name}" telah dihapus.`);
  }
};

function initCustomerSelectorAndCrm() {
  const pickerBtn = document.getElementById('customerPickerBtn');
  const selectModal = document.getElementById('customerSelectModal');
  const closeSelectBtn = document.getElementById('closeCustomerSelectBtn');
  const cancelSelectBtn = document.getElementById('cancelCustomerSelectBtn');
  const searchInput = document.getElementById('customerSearchInput');
  const setCommonBtn = document.getElementById('setCommonCustomerBtn');
  const openAddFromSelectBtn = document.getElementById('openAddCustomerFromSelectBtn');

  // Customer Form Modal (Tambah Pelanggan)
  const formModal = document.getElementById('customerFormModal');
  const openAddBtn = document.getElementById('openAddCustomerModalBtn');
  const closeFormBtn = document.getElementById('closeCustomerFormBtn');
  const cancelFormBtn = document.getElementById('cancelCustomerFormBtn');
  const saveCustBtn = document.getElementById('saveCustomerBtn');

  if (pickerBtn && selectModal) {
    pickerBtn.addEventListener('click', () => {
      renderCustomerPickerList();
      selectModal.classList.add('active');
    });
  }

  if (closeSelectBtn && selectModal) closeSelectBtn.addEventListener('click', () => selectModal.classList.remove('active'));
  if (cancelSelectBtn && selectModal) cancelSelectBtn.addEventListener('click', () => selectModal.classList.remove('active'));

  if (searchInput) {
    searchInput.addEventListener('input', e => {
      renderCustomerPickerList(e.target.value.trim().toLowerCase());
    });
  }

  if (setCommonBtn) {
    setCommonBtn.addEventListener('click', () => {
      State.selectedCustomer = null;
      updateCartCustomerDisplay();
      renderCart();
      selectModal.classList.remove('active');
      showToast('Pesanan diset untuk Pelanggan Umum');
    });
  }

  // Buka Form Tambah Member Baru
  if (openAddFromSelectBtn && formModal) {
    openAddFromSelectBtn.addEventListener('click', () => {
      resetCustomerForm();
      formModal.classList.add('active');
    });
  }

  if (openAddBtn && formModal) {
    openAddBtn.addEventListener('click', () => {
      resetCustomerForm();
      formModal.classList.add('active');
    });
  }

  if (closeFormBtn && formModal) closeFormBtn.addEventListener('click', () => formModal.classList.remove('active'));
  if (cancelFormBtn && formModal) cancelFormBtn.addEventListener('click', () => formModal.classList.remove('active'));

  if (saveCustBtn) {
    saveCustBtn.addEventListener('click', () => {
      const name = document.getElementById('custNameInput')?.value.trim();
      const phone = document.getElementById('custPhoneInput')?.value.trim();
      const tier = document.getElementById('custTierSelect')?.value || 'Bronze';
      const points = parseInt(document.getElementById('custPointsInput')?.value) || 0;
      const deposit = parseFloat(document.getElementById('custDepositInput')?.value) || 0;
      const pref = document.getElementById('custPrefInput')?.value.trim() || '';

      if (!name) {
        alert('Mohon isi nama pelanggan!');
        return;
      }

      let discount = 0;
      if (tier === 'Silver') discount = 5;
      else if (tier === 'Gold') discount = 10;
      else if (tier.includes('VIP')) discount = 15;

      const newCust = {
        id: 'C' + (State.customers.length + 1).toString().padStart(2, '0'),
        name: name,
        phone: phone || '-',
        tier: tier,
        tierDiscount: discount,
        points: points,
        deposit: deposit,
        pref: pref
      };

      State.customers.unshift(newCust);
      formModal.classList.remove('active');
      renderCustomersTable();
      renderCustomerPickerList();

      // Otomatis terpilih di kasir
      State.selectedCustomer = newCust;
      updateCartCustomerDisplay();
      renderCart();
      if (selectModal) selectModal.classList.remove('active');

      showToast(`Member baru "${name}" berhasil didaftarkan dan dipilih di kasir!`);
    });
  }
}

function resetCustomerForm() {
  const nameInp = document.getElementById('custNameInput');
  const phoneInp = document.getElementById('custPhoneInput');
  const tierInp = document.getElementById('custTierSelect');
  const pointsInp = document.getElementById('custPointsInput');
  const depositInp = document.getElementById('custDepositInput');
  const prefInp = document.getElementById('custPrefInput');

  if (nameInp) nameInp.value = '';
  if (phoneInp) phoneInp.value = '';
  if (tierInp) tierInp.value = 'Silver';
  if (pointsInp) pointsInp.value = '50';
  if (depositInp) depositInp.value = '0';
  if (prefInp) prefInp.value = '';
}

function renderCustomerPickerList(filterText = '') {
  const container = document.getElementById('customerPickerList');
  if (!container) return;

  const filtered = State.customers.filter(c => {
    if (!filterText) return true;
    return c.name.toLowerCase().includes(filterText) || c.phone.toLowerCase().includes(filterText);
  });

  if (filtered.length === 0) {
    container.innerHTML = '<p style="text-align:center; color:var(--text-dim); padding:16px;">Tidak ada member yang cocok dengan pencarian.</p>';
    return;
  }

  container.innerHTML = filtered.map(c => `
    <div class="cust-pick-row" onclick="selectCustomerForCart('${c.id}')">
      <div class="cust-pick-info">
        <div class="cust-pick-avatar"><i class="fa-solid fa-user"></i></div>
        <div>
          <strong>${c.name}</strong> <span class="tier-pill">${c.tier} (-${c.tierDiscount || 0}%)</span>
          <div style="font-size:0.75rem; color:var(--text-dim); margin-top:2px;">
            <i class="fa-solid fa-phone"></i> ${c.phone} • <i class="fa-solid fa-coins text-caramel"></i> ${c.points} Pts • Saldo: ${formatRupiah(c.deposit)}
          </div>
          ${c.pref ? `<div style="font-size:0.72rem; color:var(--caramel); margin-top:2px;"><i class="fa-solid fa-heart"></i> ${c.pref}</div>` : ''}
        </div>
      </div>
      <i class="fa-solid fa-circle-check" style="color:var(--caramel); font-size:1.1rem;"></i>
    </div>
  `).join('');
}

window.selectCustomerForCart = function(id) {
  const c = State.customers.find(x => x.id === id);
  if (!c) return;
  State.selectedCustomer = c;
  updateCartCustomerDisplay();
  renderCart();
  document.getElementById('customerSelectModal')?.classList.remove('active');
  showToast(`Pelanggan "${c.name}" terpilih! Diskon member ${c.tierDiscount || 0}% otomatis aktif.`);
};

function updateCartCustomerDisplay() {
  const nameEl = document.getElementById('cartCustomerName');
  const tierEl = document.getElementById('cartCustomerTier');
  if (!nameEl || !tierEl) return;

  if (State.selectedCustomer) {
    nameEl.innerHTML = `<span style="color:var(--caramel); font-weight:800;">${State.selectedCustomer.name}</span> (${State.selectedCustomer.tier})`;
    tierEl.innerText = `Diskon Member ${State.selectedCustomer.tierDiscount || 0}% • ${State.selectedCustomer.points} Poin`;
  } else {
    nameEl.innerText = 'Pilih Pelanggan / Member';
    tierEl.innerText = 'Dapatkan poin loyalitas & promo member';
  }
}

// --- 14E. SHIFT SELECTOR DI HEADER & TIM KARYAWAN ---
function initShiftSelectorAndStaff() {
  const quickShiftBtn = document.getElementById('quickShiftBtn');
  const shiftModal = document.getElementById('shiftSelectModal');
  const closeShiftBtn = document.getElementById('closeShiftSelectBtn');
  const cancelShiftBtn = document.getElementById('cancelShiftSelectBtn');
  const saveShiftBtn = document.getElementById('saveShiftSelectionBtn');
  const openStaffFromShiftBtn = document.getElementById('openStaffFromShiftBtn');

  // Staff Management Modal
  const staffModal = document.getElementById('staffManageModal');
  const openStaffBtn = document.getElementById('openStaffManageModalBtn');
  const closeStaffBtn = document.getElementById('closeStaffManageBtn');
  const closeStaffFooterBtn = document.getElementById('closeStaffManageFooterBtn');
  const saveStaffBtn = document.getElementById('saveNewStaffBtn');

  let activeShiftSchedule = 'Shift Pagi (07:00 - 15:00 WIB)';

  // Shift schedule option cards
  document.querySelectorAll('.shift-opt-card').forEach(card => {
    card.addEventListener('click', () => {
      document.querySelectorAll('.shift-opt-card').forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeShiftSchedule = card.querySelector('strong')?.innerText + ' (' + card.querySelector('small')?.innerText + ')';
    });
  });

  function populateCashierSelect() {
    const sel = document.getElementById('shiftActiveCashierSelect');
    const lockNotice = document.getElementById('shiftLockNotice');
    const unlockedFields = document.getElementById('shiftUnlockedFields');
    const saveBtn = document.getElementById('saveShiftSelectionBtn');
    if (!sel) return;

    sel.innerHTML = `
      <option value="">-- Pilih Karyawan Terlebih Dahulu --</option>
      ${State.employees.map(e => `
        <option value="${e.name}">
          ${e.name} (${e.role})
        </option>
      `).join('')}
    `;

    function updateShiftLock() {
      const selected = sel.value;
      if (!selected) {
        if (lockNotice) lockNotice.style.display = 'block';
        if (unlockedFields) unlockedFields.style.display = 'none';
        if (saveBtn) saveBtn.disabled = true;
      } else {
        if (lockNotice) lockNotice.style.display = 'none';
        if (unlockedFields) unlockedFields.style.display = 'block';
        if (saveBtn) saveBtn.disabled = false;
      }
    }

    sel.onchange = updateShiftLock;
    updateShiftLock();
  }

  if (quickShiftBtn && shiftModal) {
    quickShiftBtn.addEventListener('click', () => {
      populateCashierSelect();
      const initialCashInput = document.getElementById('shiftModalInitialCashInput');
      if (initialCashInput) initialCashInput.value = State.currentShift.initialCash;
      shiftModal.classList.add('active');
    });
  }

  if (closeShiftBtn && shiftModal) closeShiftBtn.addEventListener('click', () => shiftModal.classList.remove('active'));
  if (cancelShiftBtn && shiftModal) cancelShiftBtn.addEventListener('click', () => shiftModal.classList.remove('active'));

  if (saveShiftBtn) {
    saveShiftBtn.addEventListener('click', () => {
      const cashier = document.getElementById('shiftActiveCashierSelect')?.value;
      if (!cashier) {
        alert('Silakan pilih karyawan terlebih dahulu sebelum membuka shift!');
        return;
      }
      const initialCash = parseFloat(document.getElementById('shiftModalInitialCashInput')?.value) || 250000;

      State.currentShift.cashierName = cashier;
      State.currentShift.initialCash = initialCash;
      State.currentShift.name = activeShiftSchedule;
      State.currentStaff = cashier;

      // Update header UI
      const headerTitle = document.querySelector('.shift-pill-text .shift-title');
      const headerCash = document.getElementById('headerDrawerCash');
      if (headerTitle) headerTitle.innerText = activeShiftSchedule.split(' ')[0] + ' • ' + cashier.split(' ')[0];
      if (headerCash) headerCash.innerText = formatRupiah(initialCash + State.currentShift.totalCashSales);

      // Update Shift Banner in Management
      const cashierTitle = document.getElementById('shiftCashierTitle');
      if (cashierTitle) cashierTitle.innerText = `Kasir: ${cashier} (${activeShiftSchedule})`;

      shiftModal.classList.remove('active');
      renderShiftDetails();
      showToast(`Shift kasir aktif dibuka untuk ${cashier} (${activeShiftSchedule})!`);
    });
  }

  // Open Staff Modal
  if (openStaffFromShiftBtn && staffModal) {
    openStaffFromShiftBtn.addEventListener('click', () => {
      renderStaffList();
      staffModal.classList.add('active');
    });
  }

  if (openStaffBtn && staffModal) {
    openStaffBtn.addEventListener('click', () => {
      renderStaffList();
      staffModal.classList.add('active');
    });
  }

  if (closeStaffBtn && staffModal) closeStaffBtn.addEventListener('click', () => staffModal.classList.remove('active'));
  if (closeStaffFooterBtn && staffModal) closeStaffFooterBtn.addEventListener('click', () => staffModal.classList.remove('active'));

  if (saveStaffBtn) {
    saveStaffBtn.addEventListener('click', () => {
      const name = document.getElementById('newStaffNameInput')?.value.trim();
      const role = document.getElementById('newStaffRoleSelect')?.value || 'Kasir';
      const phone = document.getElementById('newStaffPhoneInput')?.value.trim() || '-';
      const pin = document.getElementById('newStaffPinInput')?.value.trim() || '1234';

      if (!name) {
        alert('Mohon masukkan nama karyawan baru!');
        return;
      }

      State.employees.push({
        id: 'E' + (State.employees.length + 1).toString().padStart(2, '0'),
        name: name,
        role: role,
        phone: phone,
        pin: pin
      });

      document.getElementById('newStaffNameInput').value = '';
      document.getElementById('newStaffPhoneInput').value = '';
      document.getElementById('newStaffPinInput').value = '';

      renderStaffList();
      populateCashierSelect();
      showToast(`Karyawan baru "${name}" (${role}) berhasil ditambahkan!`);
    });
  }
}

function renderStaffList() {
  const container = document.getElementById('staffListContainer');
  if (!container) return;

  container.innerHTML = State.employees.map(e => `
    <div class="staff-item-row">
      <div class="staff-info-left">
        <div class="staff-avatar-badge">${e.name.charAt(0)}</div>
        <div class="staff-details">
          <strong>${e.name}</strong>
          <span><i class="fa-solid fa-id-badge text-caramel"></i> ${e.role} • WA: ${e.phone}</span>
        </div>
      </div>
      <button class="btn-del-staff" onclick="deleteStaff('${e.id}')" title="Hapus Karyawan">
        <i class="fa-solid fa-trash-can"></i>
      </button>
    </div>
  `).join('');
}

window.deleteStaff = function(id) {
  const emp = State.employees.find(e => e.id === id);
  if (!emp) return;
  if (confirm(`Hapus anggota tim "${emp.name}"?`)) {
    State.employees = State.employees.filter(e => e.id !== id);
    renderStaffList();
    showToast(`Karyawan "${emp.name}" telah dihapus.`);
  }
};

// --- 14F. PROMOSI & VOUCHER CRUD ---
function renderPromoCards() {
  const grid = document.getElementById('promoCardsGrid');
  if (!grid) return;

  grid.innerHTML = State.promotions.map(p => `
    <div class="promo-card">
      <div class="promo-card-top">
        <div>
          <span class="promo-badge-tag">${p.code}</span>
          <h4>${p.name}</h4>
        </div>
        <strong style="color:var(--caramel); font-size:1.1rem;">
          ${p.type === 'percent' ? p.value + '%' : formatRupiah(p.value)}
        </strong>
      </div>
      <p>${p.desc || 'Diskon spesial untuk semua menu minuman kopi & latte di kasir.'}</p>
      <div style="font-size:0.75rem; color:var(--text-dim); margin-top:4px;">
        <i class="fa-solid fa-cart-shopping text-caramel"></i> Minimal Belanja: ${p.minSpend ? formatRupiah(p.minSpend) : 'Tanpa Batas'}
      </div>
      <div class="promo-card-actions">
        <button class="btn-promo-edit" onclick="openEditPromoModal('${p.code}')">
          <i class="fa-solid fa-pen"></i> Edit Promo
        </button>
        <button class="btn-promo-delete" onclick="deletePromo('${p.code}')" title="Hapus Promo">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    </div>
  `).join('');
}

function initPromoCrud() {
  const modal = document.getElementById('promoModal');
  const openBtn = document.getElementById('openAddPromoModalBtn');
  const closeBtn = document.getElementById('closePromoModalBtn');
  const cancelBtn = document.getElementById('cancelPromoBtn');
  const saveBtn = document.getElementById('savePromoBtn');
  const typeSelect = document.getElementById('promoTypeSelect');
  const valueLabel = document.getElementById('promoValueLabel');

  if (typeSelect && valueLabel) {
    typeSelect.addEventListener('change', () => {
      valueLabel.innerHTML = typeSelect.value === 'percent'
        ? '<i class="fa-solid fa-coins text-caramel"></i> Nilai Diskon (%):'
        : '<i class="fa-solid fa-coins text-caramel"></i> Nilai Potongan (Rp):';
    });
  }

  if (openBtn && modal) {
    openBtn.addEventListener('click', () => {
      document.getElementById('promoModalTitle').innerText = 'Tambah Promo Baru';
      document.getElementById('promoEditId').value = '';
      document.getElementById('promoNameInput').value = '';
      document.getElementById('promoCodeInput').value = '';
      document.getElementById('promoTypeSelect').value = 'percent';
      document.getElementById('promoValueInput').value = '20';
      document.getElementById('promoMinSpendInput').value = '50000';
      document.getElementById('promoDescInput').value = '';
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.remove('active'));
  if (cancelBtn && modal) cancelBtn.addEventListener('click', () => modal.classList.remove('active'));

  window.openEditPromoModal = function(code) {
    const p = State.promotions.find(x => x.code === code);
    if (!p) return;

    document.getElementById('promoModalTitle').innerText = `Edit Promo: ${p.code}`;
    document.getElementById('promoEditId').value = p.code;
    document.getElementById('promoNameInput').value = p.name;
    document.getElementById('promoCodeInput').value = p.code;
    document.getElementById('promoTypeSelect').value = p.type;
    document.getElementById('promoValueInput').value = p.value;
    document.getElementById('promoMinSpendInput').value = p.minSpend || 0;
    document.getElementById('promoDescInput').value = p.desc || '';

    modal.classList.add('active');
  };

  window.deletePromo = function(code) {
    if (confirm(`Hapus voucher promo "${code}"?`)) {
      State.promotions = State.promotions.filter(p => p.code !== code);
      renderPromoCards();
      showToast(`Promo "${code}" berhasil dihapus.`);
    }
  };

  if (saveBtn) {
    saveBtn.addEventListener('click', () => {
      const editCode = document.getElementById('promoEditId')?.value;
      const name = document.getElementById('promoNameInput')?.value.trim();
      const code = document.getElementById('promoCodeInput')?.value.trim().toUpperCase();
      const type = document.getElementById('promoTypeSelect')?.value || 'percent';
      const value = parseFloat(document.getElementById('promoValueInput')?.value) || 0;
      const minSpend = parseFloat(document.getElementById('promoMinSpendInput')?.value) || 0;
      const desc = document.getElementById('promoDescInput')?.value.trim() || '';

      if (!name || !code || value <= 0) {
        alert('Mohon isi nama promo, kode voucher, dan nilai diskon yang valid!');
        return;
      }

      if (editCode) {
        const p = State.promotions.find(x => x.code === editCode);
        if (p) {
          p.name = name;
          p.code = code;
          p.type = type;
          p.value = value;
          p.minSpend = minSpend;
          p.desc = desc;
          showToast(`Promo "${code}" berhasil diperbarui!`);
        }
      } else {
        State.promotions.push({
          code: code,
          name: name,
          type: type,
          value: value,
          minSpend: minSpend,
          desc: desc
        });
        showToast(`Promo baru "${code}" berhasil ditambahkan!`);
      }

      modal.classList.remove('active');
      renderPromoCards();
    });
  }
}

// --- 14G. SALES TREND CHART (7 HARI, BULAN INI, TAHUN INI PER BULAN) ---
function initSalesTrendChart() {
  document.querySelectorAll('.trend-pill').forEach(pill => {
    pill.addEventListener('click', () => {
      document.querySelectorAll('.trend-pill').forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      const period = pill.dataset.period;
      renderSalesTrendChart(period);
    });
  });

  renderSalesTrendChart('7days');
}

function renderSalesTrendChart(period = '7days') {
  const wrap = document.getElementById('salesTrendBarsWrap');
  if (!wrap) return;

  let data = [];
  if (period === '7days') {
    data = [
      { label: 'Sen', amount: 0 },
      { label: 'Sel', amount: 0 },
      { label: 'Rab', amount: 0 },
      { label: 'Kam', amount: 0 },
      { label: 'Jum', amount: 0 },
      { label: 'Sab', amount: 0 },
      { label: 'Min', amount: 0 }
    ];
  } else if (period === 'month') {
    data = [
      { label: 'Mgg 1 (1-7)', amount: 0 },
      { label: 'Mgg 2 (8-14)', amount: 0 },
      { label: 'Mgg 3 (15-21)', amount: 0 },
      { label: 'Mgg 4 (22-28)', amount: 0 },
      { label: 'Mgg 5 (29-31)', amount: 0 }
    ];
  } else if (period === 'year') {
    data = [
      { label: 'Jan', amount: 0 }, { label: 'Feb', amount: 0 }, { label: 'Mar', amount: 0 },
      { label: 'Apr', amount: 0 }, { label: 'Mei', amount: 0 }, { label: 'Jun', amount: 0 },
      { label: 'Jul', amount: 0 }, { label: 'Agu', amount: 0 }, { label: 'Sep', amount: 0 },
      { label: 'Okt', amount: 0 }, { label: 'Nov', amount: 0 }, { label: 'Des', amount: 0 }
    ];
  }

  // Kalkulasi akurat dari State.dailyOrders sesuai tanggal riil transaksi
  if (Array.isArray(State.dailyOrders)) {
    State.dailyOrders.forEach(o => {
      const d = new Date(o.date);
      const val = Number(o.grandTotal) || 0;
      if (period === '7days') {
        // getDay(): 0 = Minggu, 1 = Senin, 2 = Selasa, 3 = Rabu, 4 = Kamis, 5 = Jumat, 6 = Sabtu
        // Indeks array: 0:Sen, 1:Sel, 2:Rab, 3:Kam, 4:Jum, 5:Sab, 6:Min
        const day = d.getDay();
        const idx = day === 0 ? 6 : day - 1;
        if (idx >= 0 && idx < data.length) {
          data[idx].amount += val;
        }
      } else if (period === 'month') {
        const dateNum = d.getDate();
        let idx = 0;
        if (dateNum <= 7) idx = 0;
        else if (dateNum <= 14) idx = 1;
        else if (dateNum <= 21) idx = 2;
        else if (dateNum <= 28) idx = 3;
        else idx = 4;
        if (idx >= 0 && idx < data.length) {
          data[idx].amount += val;
        }
      } else if (period === 'year') {
        const mIdx = d.getMonth();
        if (mIdx >= 0 && mIdx < data.length) {
          data[mIdx].amount += val;
        }
      }
    });
  }

  // Update subtitle grafik sesuai periode yang dipilih
  const subTitle = document.getElementById('trendChartSubtitle');
  if (subTitle) {
    const now = new Date();
    const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    if (period === '7days') {
      subTitle.innerText = `Oktober ${now.getFullYear()} • 7 Hari Mingguan`;
    } else if (period === 'month') {
      subTitle.innerText = `${months[now.getMonth()]} ${now.getFullYear()} • Pekan Berjalan`;
    } else if (period === 'year') {
      subTitle.innerText = `Tahun ${now.getFullYear()} • Jan s/d Des ${now.getFullYear()}`;
    }
  }

  const maxAmount = Math.max(1, ...data.map(d => d.amount));

  wrap.innerHTML = data.map(d => {
    const heightPercent = d.amount > 0 ? Math.max(16, Math.round((d.amount / maxAmount) * 100)) : 8;
    return `
      <div class="trend-bar-col">
        <div class="trend-bar-tooltip">${formatRupiah(d.amount)}</div>
        <div class="trend-bar ${d.amount > 0 ? 'highlight' : ''}" style="height: ${heightPercent}%;"></div>
        <span class="trend-bar-label">${d.label}</span>
      </div>
    `;
  }).join('');
}

function renderKDSGrid() {
  const grid = document.getElementById('kdsOrdersGrid');
  if (!grid) return;
  const pending = State.dailyOrders.filter(o => o.status === 'Diproses Barista');

  if (pending.length === 0) {
    grid.innerHTML = '<p style="color:var(--text-dim); text-align:center; grid-column:1/-1;">Semua pesanan barista telah selesai disajikan.</p>';
    return;
  }

  grid.innerHTML = pending.map(order => `
    <div class="kds-card">
      <div class="kds-card-head">
        <strong>${order.dailySeq} • ${order.orderType}</strong>
        <span class="badge-sub">${formatTime(order.date)}</span>
      </div>
      <div class="kds-card-body">
        <p style="font-size:0.75rem; color:var(--text-dim); margin-bottom:8px;">Pelanggan: ${order.customerName}</p>
        ${order.items.map(i => `
          <div style="font-size:0.85rem; margin-bottom:4px;">
            <strong>${i.qty}x</strong> ${i.name}
            ${i.mods ? `<div style="font-size:0.72rem; color:var(--caramel); margin-left:14px;">${i.mods}</div>` : ''}
          </div>
        `).join('')}
      </div>
      <div class="kds-card-foot">
        <button class="btn-primary-warm" style="width:100%; font-size:0.78rem;" onclick="markOrderReady('${order.invoice}')">
          <i class="fa-solid fa-check"></i> Siap Disajikan
        </button>
      </div>
    </div>
  `).join('');
}

window.markOrderReady = function(invoice) {
  const o = State.dailyOrders.find(x => x.invoice === invoice);
  if (o) {
    o.status = 'Selesai';
    renderKDSGrid();
    renderDailyOrders();
    showToast(`Pesanan ${o.dailySeq} selesai disajikan!`);
  }
};

function renderAuditLogsTable() {
  const tbody = document.getElementById('auditLogsTableBody');
  if (!tbody) return;
  tbody.innerHTML = `
    <tr>
      <td>${formatDate(new Date())}</td>
      <td>Rian Pratama (Owner)</td>
      <td><span class="badge-sub">BUKA_SHIFT</span></td>
      <td>Modal Awal Kas: Rp 250.000</td>
      <td>POS Terminal 01</td>
    </tr>
    <tr>
      <td>${formatDate(new Date())}</td>
      <td>Rian Pratama (Kasir)</td>
      <td><span class="badge-sub">TRANSAKSI_SELESAI</span></td>
      <td>Pesanan #001 Selesai (QRIS)</td>
      <td>POS Terminal 01</td>
    </tr>
  `;
}

// --- 15. ASISTEN AI KAFE CHATBOT (REALTIME & SESUAI LAPORAN AKTUAL) ---
function initAiAssistant() {
  const sendBtn = document.getElementById('sendAiQuestionBtn');
  const input = document.getElementById('aiQuestionInput');
  const box = document.getElementById('aiChatMessagesBox');

  // Quick prompt chips
  document.querySelectorAll('.btn-prompt-chip').forEach(btn => {
    btn.addEventListener('click', () => {
      if (input) {
        input.value = btn.dataset.prompt || btn.innerText;
        ask();
      }
    });
  });

  function ask() {
    const q = input?.value.trim();
    if (!q) return;

    const userMsg = document.createElement('div');
    userMsg.className = 'msg user';
    userMsg.innerHTML = `<p>${escapeHtml(q)}</p>`;
    box.appendChild(userMsg);
    input.value = '';
    box.scrollTop = box.scrollHeight;

    setTimeout(() => {
      const ans = getAiResponse(q);
      const aiMsg = document.createElement('div');
      aiMsg.className = 'msg ai';
      aiMsg.innerHTML = `<p>${formatAiText(ans)}</p>`;
      box.appendChild(aiMsg);
      box.scrollTop = box.scrollHeight;
    }, 300);
  }

  sendBtn?.addEventListener('click', ask);
  input?.addEventListener('keydown', e => {
    if (e.key === 'Enter') ask();
  });

  updateAiExecutiveBriefing();
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.innerText = text;
  return div.innerHTML;
}

function formatAiText(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/\n\n/g, '</p><p style="margin-top:8px;">')
    .replace(/\n/g, '<br>');
}

function updateAiExecutiveBriefing() {
  const el = document.getElementById('aiBriefingText');
  if (!el) return;

  const totalRev = State.dailyOrders.reduce((s, o) => s + o.grandTotal, 0);
  const totalOrders = State.dailyOrders.length;
  const totalCost = State.dailyOrders.reduce((s, o) => s + (o.costTotal || 0), 0);
  const gross = totalRev - totalCost;
  const cashier = State.currentShift?.cashierName || 'Karyawan 1';

  if (totalOrders === 0) {
    el.innerText = `Belum ada transaksi hari ini (Omzet Rp 0). Kasir bertugas: ${cashier}. Saldo laci kas: ${formatRupiah(State.currentShift?.initialCash || 250000)}. POS Caffee Sa'adah siap melayani pelanggan!`;
  } else {
    // Find top menu
    const itemMap = {};
    State.dailyOrders.forEach(o => {
      (o.items || []).forEach(i => {
        itemMap[i.name] = (itemMap[i.name] || 0) + i.qty;
      });
    });
    let topItem = '-';
    let topQty = 0;
    for (const [name, qty] of Object.entries(itemMap)) {
      if (qty > topQty) { topQty = qty; topItem = name; }
    }
    el.innerText = `Penjualan hari ini berjalan lancar dengan total omzet ${formatRupiah(totalRev)} (${totalOrders} transaksi). Menu paling laris: ${topItem} (${topQty} cup). Estimasi laba kotor: ${formatRupiah(gross)}. Kasir bertugas: ${cashier}.`;
  }
}

function getAiResponse(q) {
  const query = q.toLowerCase();
  const orders = State.dailyOrders || [];
  const totalOrders = orders.length;
  const totalRev = orders.reduce((s, o) => s + o.grandTotal, 0);
  const totalCost = orders.reduce((s, o) => s + (o.costTotal || 0), 0);
  const grossProfit = totalRev - totalCost;
  const marginPercent = totalRev > 0 ? ((grossProfit / totalRev) * 100).toFixed(1) : '0.0';
  const totalExpense = (State.expenses || []).reduce((s, e) => s + e.amount, 0);
  const netProfit = grossProfit - totalExpense;

  const cashSales = orders
    .filter(o => (o.paymentMethod || '').toLowerCase().includes('tunai') || (o.paymentMethod || '').toLowerCase().includes('cash'))
    .reduce((s, o) => s + o.grandTotal, 0);
  const qrisSales = orders
    .filter(o => !(o.paymentMethod || '').toLowerCase().includes('tunai') && !(o.paymentMethod || '').toLowerCase().includes('cash'))
    .reduce((s, o) => s + o.grandTotal, 0);

  const initialCash = State.currentShift?.initialCash || 250000;
  const cashier = State.currentShift?.cashierName || 'Karyawan 1';

  // 1. TANYA UNTUNG / LABA / PROFIT / MARGIN / CUAN
  if (query.includes('untung') || query.includes('laba') || query.includes('profit') || query.includes('margin') || query.includes('cuan') || query.includes('bersih')) {
    if (totalOrders === 0) {
      return `Saat ini **belum ada transaksi penjualan** hari ini (Omzet Rp 0), sehingga estimasi laba kotor tercatat **Rp 0**.\n\n💡 *Katalog Menu Caffee Sa'adah memiliki rata-rata margin 55% - 72%*. Menu dengan margin tertinggi di antaranya:\n• **Aren Butter Sea Salt** (Margin: ~60%)\n• **Iced Americano Doppio** (Margin: ~72%)\n• **Brown Butter Pandan** (Margin: ~56%)\n\nBegitu kasir menyelesaikan pesanan, estimasi laba kotor & bersih akan otomatis terhitung realtime di sini.`;
    }

    return `Berikut rincian **Keuntungan (Laba) Caffee Sa'adah Hari Ini** secara realtime:\n\n` +
      `• **Total Omzet Penjualan:** ${formatRupiah(totalRev)}\n` +
      `• **Total Modal Bahan (HPP):** ${formatRupiah(totalCost)}\n` +
      `• **Estimasi Laba Kotor:** **${formatRupiah(grossProfit)}** (Margin: **${marginPercent}%**)\n` +
      (totalExpense > 0 ? `• **Pengeluaran Operasional:** -${formatRupiah(totalExpense)}\n• **Estimasi Laba Bersih:** **${formatRupiah(netProfit)}**\n` : '') +
      `\nSeluruh data ini dihitung langsung dari ${totalOrders} transaksi pesanan yang telah selesai hari ini.`;
  }

  // 2. TANYA OMZET / PENJUALAN / PEMASUKAN / TRANSAKSI / LAPORAN
  if (query.includes('omzet') || query.includes('penjualan') || query.includes('pemasukan') || query.includes('laku') || query.includes('transaksi') || query.includes('laporan') || query.includes('rekap')) {
    if (totalOrders === 0) {
      return `Laporan Penjualan Caffee Sa'adah Hari Ini:\n\n` +
        `• **Total Omzet:** **Rp 0**\n` +
        `• **Jumlah Transaksi:** **0 Pesanan Selesai**\n` +
        `• **Kasir Bertugas:** ${cashier}\n` +
        `• **Saldo Kas Laci:** ${formatRupiah(initialCash)} (Modal Awal)\n\n` +
        `Belum ada pesanan yang masuk hari ini. Kasir siap melayani transaksi!`;
    }

    const avgBasket = totalRev / totalOrders;
    return `Laporan Penjualan Realtime Caffee Sa'adah Hari Ini:\n\n` +
      `• **Total Omzet:** **${formatRupiah(totalRev)}**\n` +
      `• **Total Transaksi:** **${totalOrders} Pesanan Selesai**\n` +
      `• **Rata-rata Belanja:** **${formatRupiah(Math.round(avgBasket))}** / pesanan\n` +
      `• **Pembayaran Tunai (Cash):** ${formatRupiah(cashSales)}\n` +
      `• **Pembayaran Non-Tunai (QRIS):** ${formatRupiah(qrisSales)}\n` +
      `• **Estimasi Laba Kotor:** ${formatRupiah(grossProfit)} (${marginPercent}%)\n\n` +
      `Semua transaksi tercatat rapi dan tersinkronisasi ke Google Spreadsheet.`;
  }

  // 3. TANYA MENU TERLARIS / PALING LAKU / FAVORIT / POPULER
  if (query.includes('terlaris') || query.includes('paling laku') || query.includes('paling banyak') || query.includes('favorit') || query.includes('populer') || query.includes('menu apa') || query.includes('best seller')) {
    if (totalOrders === 0) {
      return `Hari ini belum ada pesanan yang selesai. Berdasarkan menu andalan Caffee Sa'adah, produk favorit pelanggan adalah:\n\n` +
        `1. **Aren Butter Sea Salt** (Signature paling dicari)\n` +
        `2. **Brown Butter Pandan** (Kopi wangi gurih)\n` +
        `3. **Aren Latte** (Klasik espresso & susu aren)\n` +
        `4. **Iced Americano Doppio** (Favorit penikmat kopi hitam)`;
    }

    const counts = {};
    const revs = {};
    orders.forEach(o => {
      (o.items || []).forEach(i => {
        counts[i.name] = (counts[i.name] || 0) + i.qty;
        revs[i.name] = (revs[i.name] || 0) + (i.price * i.qty);
      });
    });

    const sortedItems = Object.keys(counts).sort((a, b) => counts[b] - counts[a]);
    let listText = sortedItems.slice(0, 5).map((name, idx) => {
      return `${idx + 1}. **${name}** — Terjual **${counts[name]} cup/porsi** (${formatRupiah(revs[name])})`;
    }).join('\n');

    return `🏆 Peringkat **Menu Terlaris Caffee Sa'adah Hari Ini**:\n\n${listText}\n\n*Total minuman/makanan terjual hari ini: ${Object.values(counts).reduce((s, v) => s + v, 0)} item.*`;
  }

  // 4. TANYA STOK / BAHAN BAKU / HABIS / SISA / RESTOCK
  if (query.includes('stok') || query.includes('bahan') || query.includes('habis') || query.includes('sisa') || query.includes('restock') || query.includes('inventory')) {
    const products = State.products || [];
    const lowStock = products.filter(p => p.stock <= 15).sort((a, b) => a.stock - b.stock);

    if (lowStock.length > 0) {
      let listLow = lowStock.slice(0, 6).map(p => `• **${p.name}**: sisa **${p.stock} ${p.unit}** (Kategori: ${p.category})`).join('\n');
      return `⚠️ **Peringatan Sisa Stok Menipis:**\n\n${listLow}\n\n💡 *Disarankan segera siapkan restock bahan sebelum jam ramai kafe!*`;
    }

    const lowest = [...products].sort((a, b) => a.stock - b.stock)[0];
    return `Seluruh stok menu dan bahan baku Caffee Sa'adah saat ini dalam kondisi **AMAN & TERSEDIA**.\n\nProduk dengan sisa stok paling sedikit adalah **${lowest.name}** (sisa **${lowest.stock} ${lowest.unit}**). Belum ada menu yang berstatus kritis.`;
  }

  // 5. TANYA STATUS KASIR / SHIFT / LACI KAS / UANG KAS / KARYAWAN
  if (query.includes('kasir') || query.includes('shift') || query.includes('laci') || query.includes('uang kas') || query.includes('karyawan') || query.includes('modal') || query.includes('drawer')) {
    const currentCashInDrawer = initialCash + cashSales;
    return `Status Shift & Rekonsiliasi Kas Laci Realtime:\n\n` +
      `• **Shift Aktif:** ${State.currentShift?.name || 'Shift Pagi'}\n` +
      `• **Kasir Bertugas:** **${cashier}**\n` +
      `• **Modal Awal Laci:** ${formatRupiah(initialCash)}\n` +
      `• **Penjualan Tunai (Cash):** +${formatRupiah(cashSales)}\n` +
      `• **Total Fisik Uang di Laci Kas:** **${formatRupiah(currentCashInDrawer)}**\n` +
      `• **Penjualan Non-Tunai (QRIS):** ${formatRupiah(qrisSales)} (Langsung masuk rekening)`;
  }

  // 6. TANYA MEJA / DINE IN / TAKE AWAY
  if (query.includes('meja') || query.includes('dine in') || query.includes('take away') || query.includes('bungkus')) {
    const dineInCount = orders.filter(o => (o.orderType || '').toLowerCase().includes('dine')).length;
    const takeAwayCount = orders.filter(o => (o.orderType || '').toLowerCase().includes('take') || (o.orderType || '').toLowerCase().includes('away')).length;
    return `Statistik Layanan Pesanan Hari Ini:\n\n` +
      `• **Dine In (Makan di Tempat):** **${dineInCount} pesanan**\n` +
      `• **Take Away (Bungkus/Bawa Pulang):** **${takeAwayCount} pesanan**\n` +
      `• **Total Pesanan:** ${totalOrders} transaksi`;
  }

  // 7. GREETING / APA / CAPABILITY
  if (query.includes('halo') || query.includes('hai') || query.includes('apa') || query.includes('bisa apa') || query.includes('bantu apa') || query.includes('siapa') || query.includes('tes') || query === 'p') {
    return `Halo! Saya **Asisten AI Caffee Sa'adah Intelligence**.\n\n` +
      `Saya terhubung langsung secara realtime dengan data transaksi kasir, pesanan, laci kas, stok bahan, dan laporan keuangan kafe hari ini.\n\n` +
      `Anda dapat menanyakan hal-hal berikut:\n` +
      `• **Keuntungan**: *"Berapa untung kita hari ini?"* atau *"Berapa margin laba?"*\n` +
      `• **Omzet**: *"Berapa total omzet penjualan hari ini?"*\n` +
      `• **Menu Terlaris**: *"Menu apa yang paling laris hari ini?"*\n` +
      `• **Stok Bahan**: *"Cek sisa stok bahan baku"* atau *"Ada menu habis?"*\n` +
      `• **Kasir & Laci**: *"Berapa uang tunai di laci kasir saat ini?"*\n\n` +
      `Ada informasi operasional kafe yang ingin Anda cek sekarang?`;
  }

  // 8. FALLBACK CERDAS & REALTIME
  return `Informasi Operasional Caffee Sa'adah Saat Ini:\n\n` +
    `• **Omzet Hari Ini:** **${formatRupiah(totalRev)}** (${totalOrders} pesanan)\n` +
    `• **Estimasi Laba Kotor:** **${formatRupiah(grossProfit)}** (Margin: ${marginPercent}%)\n` +
    `• **Kasir Bertugas:** ${cashier}\n` +
    `• **Uang Tunai di Laci Kas:** ${formatRupiah(initialCash + cashSales)}\n\n` +
    `*💡 Anda bisa menanyakan lebih spesifik, contohnya: 'Berapa untung kita hari ini?', 'Menu apa paling laris?', atau 'Cek sisa stok bahan'.*`;
}

// --- 16. THEME & DEVICE SIMULATOR ---
function initThemeAndDevice() {
  const themeBtn = document.getElementById('themeToggleBtn');
  const deviceBtn = document.getElementById('deviceViewToggleBtn');
  const appContainer = document.getElementById('appContainer');

  if (themeBtn) {
    themeBtn.addEventListener('click', () => {
      document.body.classList.toggle('theme-dark');
      const isDark = document.body.classList.contains('theme-dark');
      themeBtn.innerHTML = isDark ? '<i class="fa-solid fa-sun text-gold"></i>' : '<i class="fa-solid fa-moon"></i>';
      showToast(isDark ? 'Tema Espresso Dark Aktif' : 'Tema Cream Latte Aktif');
    });
  }

  if (deviceBtn && appContainer) {
    deviceBtn.addEventListener('click', () => {
      appContainer.classList.toggle('android-frame-view');
      const isMobile = appContainer.classList.contains('android-frame-view');
      deviceBtn.innerHTML = isMobile ? '<i class="fa-solid fa-desktop"></i>' : '<i class="fa-solid fa-mobile-screen-button"></i>';
      showToast(isMobile ? 'Tampilan HP Android APK Aktif' : 'Tampilan Layar Desktop POS Aktif');
    });
  }
}

// --- TOAST HELPER ---
function showToast(message, type = 'info') {
  const container = document.getElementById('toastContainer');
  if (!container) return;

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <i class="fa-solid ${type === 'error' ? 'fa-triangle-exclamation' : 'fa-circle-check'}"></i>
    <span>${message}</span>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 250);
  }, 2400);
}

// =========================================================================
// SISTEM CETAK THERMAL BLUETOOTH ESC/POS & RAWBT (TABLET & ANDROID FRIENDLY)
// =========================================================================

let bluetoothDevice = null;
let bluetoothCharacteristic = null;

const BluetoothPrintManager = {
  device: null,
  server: null,
  characteristic: null,
  isConnected: false,
  isConnecting: false,
  paperWidth: 32, // 32 kolom (58mm) atau 48 kolom (80mm)
  autoCut: true,
  lastDeviceName: '',

  KNOWN_PRINTER_SERVICES: [
    '000018f0-0000-1000-8000-00805f9b34fb', // Standard SIG Printer
    '0000ffe0-0000-1000-8000-00805f9b34fb', // Common BLE VSC / Panda / RPP02N / ZJ-58 / POS-5802
    '0000ff00-0000-1000-8000-00805f9b34fb',
    '0000fee7-0000-1000-8000-00805f9b34fb', // Tencent / Chinese POS
    '0000af30-0000-1000-8000-00805f9b34fb',
    'e7810a71-73ae-499d-8c15-faa9aef0c3f2',
    '49535343-fe7d-4ae5-8fa9-9fafd205e455'  // ISSC Microchip
  ],

  init() {
    const savedWidth = localStorage.getItem('caffee_bt_paper_width') || '58';
    this.paperWidth = savedWidth === '80' ? 48 : 32;
    this.autoCut = localStorage.getItem('caffee_bt_auto_cut') !== 'false';
    this.lastDeviceName = localStorage.getItem('caffee_bt_device_name') || '';

    const widthSelect = document.getElementById('btPaperWidthSelect');
    if (widthSelect) {
      widthSelect.value = savedWidth;
      widthSelect.addEventListener('change', (e) => {
        localStorage.setItem('caffee_bt_paper_width', e.target.value);
        this.paperWidth = e.target.value === '80' ? 48 : 32;
        showToast(`Lebar kertas diatur ke ${e.target.value}mm (${this.paperWidth} kolom)`);
      });
    }

    const autoCutCheck = document.getElementById('btAutoFeedCheck');
    if (autoCutCheck) {
      autoCutCheck.checked = this.autoCut;
      autoCutCheck.addEventListener('change', (e) => {
        this.autoCut = e.target.checked;
        localStorage.setItem('caffee_bt_auto_cut', e.target.checked ? 'true' : 'false');
      });
    }

    this.updateUI();

    // Auto-reconnect jika browser mendukung navigator.bluetooth.getDevices
    if (navigator.bluetooth && typeof navigator.bluetooth.getDevices === 'function') {
      navigator.bluetooth.getDevices().then(devices => {
        if (devices && devices.length > 0) {
          const match = devices.find(d => d.name === this.lastDeviceName) || devices[0];
          if (match) {
            console.log('Menghubungkan ulang printer Bluetooth tersimpan:', match.name);
            this.reconnectDevice(match);
          }
        }
      }).catch(e => console.log('Bluetooth getDevices auto-reconnect error:', e));
    }
  },

  async connect() {
    if (!navigator.bluetooth) {
      alert('Fitur Web Bluetooth memerlukan Google Chrome di Android Tablet / HTTPS.\n\nJika perangkat Anda tidak mendukung Web Bluetooth langsung, Anda bisa menggunakan fitur "Cetak via RawBT Android" yang dapat mencetak ke semua printer Bluetooth.');
      return false;
    }

    try {
      this.isConnecting = true;
      this.updateUI();

      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [
          ...this.KNOWN_PRINTER_SERVICES,
          0x18f0, 0xffe0, 0xff00, 0xfee7, 0xaf30
        ]
      });

      if (!device) {
        this.isConnecting = false;
        this.updateUI();
        return false;
      }

      return await this.setupDevice(device);
    } catch (err) {
      console.warn('Bluetooth connect error/cancelled:', err);
      this.isConnecting = false;
      this.updateUI();
      if (err.name !== 'NotFoundError') {
        showToast('Koneksi Bluetooth: ' + (err.message || 'Dibatalkan'), 'info');
      }
      return false;
    }
  },

  async reconnectDevice(device) {
    try {
      this.isConnecting = true;
      this.updateUI();
      await this.setupDevice(device);
    } catch (err) {
      console.log('Reconnect failed:', err);
      this.isConnecting = false;
      this.isConnected = false;
      this.updateUI();
    }
  },

  async setupDevice(device) {
    this.device = device;
    this.lastDeviceName = device.name || 'Printer Bluetooth';
    localStorage.setItem('caffee_bt_device_name', this.lastDeviceName);

    device.addEventListener('gattserverdisconnected', () => {
      console.warn('Printer Bluetooth terputus!');
      this.isConnected = false;
      this.characteristic = null;
      this.server = null;
      bluetoothDevice = null;
      bluetoothCharacteristic = null;
      this.updateUI();
      showToast(`Printer Bluetooth "${this.lastDeviceName}" terputus.`, 'warning');
    });

    const server = await device.gatt.connect();
    this.server = server;

    // Cari characteristic yang bisa di-write
    let foundChar = null;
    const services = await server.getPrimaryServices();
    for (const service of services) {
      try {
        const chars = await service.getCharacteristics();
        for (const char of chars) {
          if (char.properties.write || char.properties.writeWithoutResponse) {
            foundChar = char;
            break;
          }
        }
      } catch (e) {
        console.warn('Char scan error:', e);
      }
      if (foundChar) break;
    }

    if (!foundChar) {
      throw new Error('Tidak ditemukan karakteristik penulisan ESC/POS pada printer ini.');
    }

    this.characteristic = foundChar;
    this.isConnected = true;
    this.isConnecting = false;
    bluetoothDevice = device;
    bluetoothCharacteristic = foundChar;

    this.updateUI();
    showToast(`Printer Bluetooth "${this.lastDeviceName}" BERHASIL TERHUBUNG! Siap mencetak langsung.`, 'success');
    return true;
  },

  disconnect() {
    if (this.device && this.device.gatt && this.device.gatt.connected) {
      this.device.gatt.disconnect();
    }
    this.isConnected = false;
    this.isConnecting = false;
    this.device = null;
    this.server = null;
    this.characteristic = null;
    bluetoothDevice = null;
    bluetoothCharacteristic = null;
    this.updateUI();
    showToast('Koneksi printer Bluetooth telah diputuskan.', 'info');
  },

  updateUI() {
    // 1. Header Pill Indicator
    const headerDot = document.getElementById('headerBtDot');
    const headerLabel = document.getElementById('headerBtLabel');

    if (headerDot) {
      headerDot.className = 'bt-dot ' + (this.isConnected ? 'connected' : this.isConnecting ? 'connecting' : 'disconnected');
    }
    if (headerLabel) {
      if (this.isConnected) {
        headerLabel.innerText = this.lastDeviceName || 'Terhubung';
      } else if (this.isConnecting) {
        headerLabel.innerText = 'Menyambung...';
      } else {
        headerLabel.innerText = 'Sambung Printer';
      }
    }

    // 2. Modal Status Card Elements
    const statusIconWrap = document.getElementById('btStatusIconWrap');
    const statusMain = document.getElementById('btStatusMain');
    const statusSub = document.getElementById('btStatusSub');
    const badgeInd = document.getElementById('btBadgeIndicator');
    const btnScanText = document.getElementById('btnBtScanText');
    const btnTest = document.getElementById('btnBtTestPrint');
    const btnDisc = document.getElementById('btnBtDisconnect');

    if (statusMain) {
      if (this.isConnected) {
        statusMain.innerText = 'Terhubung: ' + this.lastDeviceName;
        statusSub.innerText = `Siap mencetak struk langsung dengan kertas thermal ${this.paperWidth === 48 ? '80mm' : '58mm'}.`;
        if (badgeInd) {
          badgeInd.innerText = 'Terhubung ✓';
          badgeInd.className = 'bt-badge-indicator connected';
        }
        if (statusIconWrap) statusIconWrap.className = 'bt-status-icon-wrap connected';
        if (btnTest) btnTest.disabled = false;
        if (btnDisc) btnDisc.style.display = 'inline-flex';
        if (btnScanText) btnScanText.innerText = 'Ganti Printer';
      } else if (this.isConnecting) {
        statusMain.innerText = 'Menghubungkan ke Printer...';
        statusSub.innerText = 'Sedang memasangkan koneksi Bluetooth GATT...';
        if (badgeInd) {
          badgeInd.innerText = 'Menyambung...';
          badgeInd.className = 'bt-badge-indicator connecting';
        }
        if (statusIconWrap) statusIconWrap.className = 'bt-status-icon-wrap connecting';
        if (btnTest) btnTest.disabled = true;
        if (btnDisc) btnDisc.style.display = 'none';
        if (btnScanText) btnScanText.innerText = 'Sedang Mencari...';
      } else {
        statusMain.innerText = 'Printer Belum Terhubung';
        statusSub.innerText = 'Tekan tombol "Cari & Sambungkan Printer" di bawah untuk mendeteksi printer Bluetooth thermal.';
        if (badgeInd) {
          badgeInd.innerText = 'Terputus';
          badgeInd.className = 'bt-badge-indicator disconnected';
        }
        if (statusIconWrap) statusIconWrap.className = 'bt-status-icon-wrap disconnected';
        if (btnTest) btnTest.disabled = true;
        if (btnDisc) btnDisc.style.display = 'none';
        if (btnScanText) btnScanText.innerText = 'Cari & Sambungkan Printer';
      }
    }

    // 3. Print Hub Modal status pill
    const hubBadge = document.getElementById('btPrinterStatusBadge');
    if (hubBadge) {
      if (this.isConnected) {
        hubBadge.innerText = 'Terhubung: ' + this.lastDeviceName;
        hubBadge.className = 'bt-status-pill connected';
      } else {
        hubBadge.innerText = 'Belum Konek';
        hubBadge.className = 'bt-status-pill';
      }
    }
  },

  async sendBytes(uint8Data) {
    if (!this.isConnected || !this.characteristic) {
      throw new Error('Printer Bluetooth belum terhubung.');
    }

    // Chunking 32 bytes untuk keamanan transfer buffer pada printer thermal murah
    const CHUNK_SIZE = 32;
    for (let i = 0; i < uint8Data.length; i += CHUNK_SIZE) {
      const chunk = uint8Data.slice(i, i + CHUNK_SIZE);
      if (this.characteristic.properties.writeWithoutResponse) {
        await this.characteristic.writeValueWithoutResponse(chunk);
      } else {
        await this.characteristic.writeValue(chunk);
      }
      await new Promise(r => setTimeout(r, 25));
    }
  }
};
window.BluetoothPrintManager = BluetoothPrintManager;

// =========================================================================
// ESC/POS COMMAND GENERATOR (58MM & 80MM)
// =========================================================================
const EscPosEncoder = {
  encodeText(str) {
    const cleanStr = (str || '').replace(/[^\x20-\x7E\n\r]/g, ' ');
    const bytes = [];
    for (let i = 0; i < cleanStr.length; i++) {
      bytes.push(cleanStr.charCodeAt(i) & 0xFF);
    }
    return bytes;
  },

  formatTwoCols(left, right, width = 32) {
    const l = (left || '').trim();
    const r = (right || '').trim();
    const totalLen = l.length + r.length + 1;

    if (totalLen <= width) {
      const spaceCount = width - l.length - r.length;
      return l + ' '.repeat(spaceCount) + r + '\n';
    }

    const maxLeftLen = width - r.length - 2;
    if (maxLeftLen > 4) {
      const line1 = l.substring(0, maxLeftLen);
      const rem = l.substring(maxLeftLen).trim();
      const spaceCount = width - line1.length - r.length;
      return line1 + ' '.repeat(spaceCount) + r + '\n' + (rem ? '  ' + rem + '\n' : '');
    }

    return l + '\n' + ' '.repeat(width - r.length) + r + '\n';
  },

  buildReceipt(order, width = 32, autoCut = true) {
    const bytes = [];
    const push = (arr) => { for (let b of arr) bytes.push(b); };
    const pushText = (str) => { push(this.encodeText(str)); };

    // 1. Initialize Printer (ESC @)
    push([0x1B, 0x40]);
    // Code Page PC437
    push([0x1B, 0x74, 0x00]);

    // 2. Center Align (ESC a 1)
    push([0x1B, 0x61, 0x01]);

    // Double Height & Width for Cafe Name (GS ! 0x11)
    push([0x1D, 0x21, 0x11]);
    push([0x1B, 0x45, 0x01]); // Bold ON
    const cafeName = (State.activeStore?.name || "CAFFEE SA'ADAH (PUSAT)").toUpperCase();
    pushText(cafeName + '\n');

    // Normal Text
    push([0x1D, 0x21, 0x00]);
    push([0x1B, 0x45, 0x00]); // Bold OFF
    const cafeAddr = State.activeStore?.address || "Coffee, Cake & Bread • Halal Indonesia";
    pushText(cafeAddr + '\n');
    pushText('-'.repeat(width) + '\n');

    // Queue Number (Bold, Center, Double Height)
    push([0x1D, 0x21, 0x01]); // Double height
    push([0x1B, 0x45, 0x01]); // Bold
    pushText(`NO. ANTRIAN : ${order.dailySeq || 'P0001'}\n`);
    push([0x1D, 0x21, 0x00]); // Normal
    push([0x1B, 0x45, 0x00]); // Bold off
    pushText('-'.repeat(width) + '\n');

    // 3. Left Align Order Metadata (ESC a 0)
    push([0x1B, 0x61, 0x00]);
    pushText(this.formatTwoCols('Invoice', order.invoice || '-', width));
    pushText(this.formatTwoCols('Waktu', `${formatDate(order.date || new Date())}`, width));
    pushText(this.formatTwoCols('Jam', `${formatTime(order.date || new Date())}`, width));
    pushText(this.formatTwoCols('Kasir', order.cashierName || order.cashier || 'Karyawan 1', width));
    pushText(this.formatTwoCols('Pelanggan', order.customerName || 'GUEST', width));
    const typeLabel = (order.orderType === 'dineIn' ? 'DINE IN' : 'TAKE AWAY') + (order.tableNumber || order.table ? ` (${order.tableNumber || order.table})` : '');
    pushText(this.formatTwoCols('Tipe Pesanan', typeLabel, width));
    pushText('-'.repeat(width) + '\n');

    // 4. Items List
    push([0x1B, 0x45, 0x01]); // Bold ON
    pushText(this.formatTwoCols('ITEM MENU', 'TOTAL', width));
    push([0x1B, 0x45, 0x00]); // Bold OFF

    (order.items || []).forEach(it => {
      const itemTitle = `${it.qty}x ${it.name}`;
      const itemTotal = formatRupiah(it.price * it.qty);
      pushText(this.formatTwoCols(itemTitle, itemTotal, width));
      if (it.mods || it.modsShort) {
        pushText(`  [${it.modsShort || it.mods}]\n`);
      }
      if (it.notes) {
        pushText(`  *Catatan: ${it.notes}\n`);
      }
    });

    pushText('-'.repeat(width) + '\n');

    // 5. Totals
    pushText(this.formatTwoCols('Subtotal', formatRupiah(order.subtotal || order.grandTotal), width));
    if (order.discount && order.discount > 0) {
      pushText(this.formatTwoCols('Diskon Promo', `-${formatRupiah(order.discount)}`, width));
    }
    if (order.tax && order.tax > 0) {
      pushText(this.formatTwoCols('Pajak PB1 (10%)', formatRupiah(order.tax), width));
    }

    // Grand Total (Bold, Double height)
    push([0x1B, 0x45, 0x01]); // Bold ON
    push([0x1D, 0x21, 0x01]); // Double height
    pushText(this.formatTwoCols('TOTAL BAYAR', formatRupiah(order.grandTotal), width));
    push([0x1D, 0x21, 0x00]); // Normal
    push([0x1B, 0x45, 0x00]); // Bold OFF

    pushText(this.formatTwoCols(`Bayar (${order.paymentMethod || 'TUNAI'})`, formatRupiah(order.cashGiven || order.cashReceived || order.grandTotal), width));
    if (order.change !== undefined && order.change > 0) {
      pushText(this.formatTwoCols('Kembalian', formatRupiah(order.change), width));
    }

    pushText('-'.repeat(width) + '\n');

    // 6. Footer (Center)
    push([0x1B, 0x61, 0x01]);
    push([0x1B, 0x45, 0x01]);
    pushText('*** LUNAS ***\n');
    push([0x1B, 0x45, 0x00]);
    const footerMsg = State.activeStore?.footer || "Terima Kasih Telah Berkunjung ke Caffee Sa'adah! • IG: @cs.coffeesaadah";
    pushText(footerMsg + '\n\n');

    // Line Feeds (ESC d 4)
    push([0x1B, 0x64, 0x04]);

    // Cut Paper (GS V 66 0)
    if (autoCut) {
      push([0x1D, 0x56, 0x42, 0x00]);
    }

    return new Uint8Array(bytes);
  },

  buildTestTicket(deviceName = 'POS-5802', width = 32) {
    const bytes = [];
    const push = (arr) => { for (let b of arr) bytes.push(b); };
    const pushText = (str) => { push(this.encodeText(str)); };

    push([0x1B, 0x40]);
    push([0x1B, 0x61, 0x01]); // Center
    push([0x1D, 0x21, 0x11]); // Double size
    push([0x1B, 0x45, 0x01]); // Bold
    pushText("CAFFEE SA'ADAH\n");
    push([0x1D, 0x21, 0x00]); // Normal
    pushText("TES PRINTER BLUETOOTH\n");
    push([0x1B, 0x45, 0x00]);
    pushText('='.repeat(width) + '\n');

    push([0x1B, 0x61, 0x00]); // Left
    pushText(this.formatTwoCols('Status', 'BERHASIL KONEK [OK]', width));
    pushText(this.formatTwoCols('Perangkat', deviceName, width));
    pushText(this.formatTwoCols('Lebar Kertas', `${width} Karakter (${width === 32 ? '58mm' : '80mm'})`, width));
    pushText(this.formatTwoCols('Waktu Tes', formatDate(new Date()) + ' ' + formatTime(new Date()), width));
    pushText('-'.repeat(width) + '\n');

    push([0x1B, 0x61, 0x01]); // Center
    push([0x1B, 0x45, 0x01]);
    pushText("PRINTER SIAP DIGUNAKAN!\n");
    push([0x1B, 0x45, 0x00]);
    pushText("Struk & Label akan dicetak\nlangsung ke printer ini.\n");
    pushText('='.repeat(width) + '\n\n');

    push([0x1B, 0x64, 0x04]);
    push([0x1D, 0x56, 0x42, 0x00]); // Cut

    return new Uint8Array(bytes);
  },

  buildLabels(order, selectedItems = null, width = 32) {
    const bytes = [];
    const push = (arr) => { for (let b of arr) bytes.push(b); };
    const pushText = (str) => { push(this.encodeText(str)); };

    push([0x1B, 0x40]);

    const items = selectedItems || (order.items || []);
    let cupSeq = 0;
    const totalCups = items.reduce((sum, it) => sum + (it.qty || 1), 0);

    items.forEach(it => {
      const count = it.qty || 1;
      for (let c = 1; c <= count; c++) {
        cupSeq++;
        push([0x1B, 0x61, 0x01]); // Center
        push([0x1B, 0x45, 0x01]);
        pushText("CAFFEE SA'ADAH\n");
        push([0x1D, 0x21, 0x11]); // Double height & width
        pushText(`[ ${order.dailySeq || 'P0001'} ]\n`);
        push([0x1D, 0x21, 0x00]); // Normal

        push([0x1B, 0x61, 0x00]); // Left
        pushText('-'.repeat(width) + '\n');
        push([0x1B, 0x45, 0x01]);
        pushText(`${it.name}\n`);
        push([0x1B, 0x45, 0x00]);
        pushText(`  ${it.modsShort || it.mods || 'Standar (Reg, Normal Ice)'}\n`);
        if (it.notes) pushText(`  *Catatan: ${it.notes}\n`);

        pushText('-'.repeat(width) + '\n');
        const cust = `${order.customerName || 'GUEST'} (${order.tableNumber || order.table || (order.orderType === 'dineIn' ? 'Dine In' : 'Take Away')})`;
        pushText(this.formatTwoCols(cust, `${cupSeq}/${totalCups}`, width));
        pushText(this.formatTwoCols('Waktu', formatTime(order.date || new Date()), width));
        pushText('-'.repeat(width) + '\n\n');

        push([0x1B, 0x64, 0x03]); // Feed
        push([0x1D, 0x56, 0x42, 0x00]); // Cut
      }
    });

    return new Uint8Array(bytes);
  }
};
window.EscPosEncoder = EscPosEncoder;

// RawBT Android Direct Intent Fallback
function sendBytesToRawBT(uint8Data) {
  let binary = '';
  const len = uint8Data.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(uint8Data[i]);
  }
  const base64 = btoa(binary);
  const rawbtUrl = 'rawbt:data:application/octet-stream;base64,' + base64;
  const a = document.createElement('a');
  a.href = rawbtUrl;
  a.style.display = 'none';
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    try { a.remove(); } catch(e) {}
  }, 1000);
  showToast('Struk dikirim ke aplikasi RawBT Android...', 'success');
}
window.sendBytesToRawBT = sendBytesToRawBT;

// Public Handlers untuk UI Modal & Header
window.openBluetoothModal = function(order = null) {
  if (order) State.activePrintOrder = order;
  const modal = document.getElementById('modalBluetoothPrinter');
  if (!modal) return;
  modal.classList.add('active');
  modal.style.display = 'flex';
  if (BluetoothPrintManager) BluetoothPrintManager.updateUI();
};

window.closeBluetoothModal = function() {
  const modal = document.getElementById('modalBluetoothPrinter');
  if (!modal) return;
  modal.classList.remove('active');
  modal.style.display = 'none';
};

window.connectBluetoothPrinter = async function() {
  await BluetoothPrintManager.connect();
};

window.disconnectBluetoothPrinter = function() {
  BluetoothPrintManager.disconnect();
};

window.testPrintBluetooth = async function() {
  if (!BluetoothPrintManager.isConnected) {
    showToast('Printer Bluetooth belum terhubung. Silakan sambungkan dulu.', 'warning');
    return;
  }
  try {
    showToast('Mengirim tes cetak ke printer Bluetooth...', 'info');
    const bytes = EscPosEncoder.buildTestTicket(
      BluetoothPrintManager.lastDeviceName,
      BluetoothPrintManager.paperWidth
    );
    await BluetoothPrintManager.sendBytes(bytes);
    showToast('✓ Tes Cetak Bluetooth Berhasil Keluar di Printer!', 'success');
  } catch (err) {
    showToast('Gagal tes cetak: ' + err.message, 'error');
  }
};

window.testRawBtPrint = function() {
  const bytes = EscPosEncoder.buildTestTicket('RawBT Android', BluetoothPrintManager.paperWidth);
  sendBytesToRawBT(bytes);
};

function initBluetoothPrinter() {
  BluetoothPrintManager.init();

  const scanBtn = document.getElementById('btnConnectBluetoothPrinter');
  if (scanBtn) {
    scanBtn.addEventListener('click', () => {
      window.openBluetoothModal();
    });
  }

  const headerBtn = document.getElementById('btnHeaderBluetooth');
  if (headerBtn) {
    headerBtn.addEventListener('click', () => {
      window.openBluetoothModal();
    });
  }
}

// --- 18. LIVE CLOCK & MIDNIGHT (JAM 12 MALAM) AUTO RESET ---
function initLiveClockAndMidnightReset() {
  const clockEl = document.getElementById('liveHeaderDate');
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

  function updateClock() {
    const d = new Date();
    const day = days[d.getDay()];
    const dateNum = d.getDate();
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    if (clockEl) {
      clockEl.innerText = `${day}, ${dateNum} ${month} ${year} • ${hh}:${mm} WIB`;
    }
  }

  function checkMidnightAutoReset() {
    const now = new Date();
    const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    const lastActive = localStorage.getItem('caffee_last_active_date');

    if (lastActive && lastActive !== todayKey) {
      console.log('Pergantian hari jam 12 malam terdeteksi. Merotasi shift kasir baru...');
      // Start fresh shift for today's cashier, while preserving full transaction history for monthly & yearly reports
      State.currentShift.id = 'SH-' + todayKey.replace(/-/g, '');
      State.currentShift.totalCashSales = 0;
      State.currentShift.totalQrisSales = 0;
      State.currentShift.totalBankSales = 0;
      saveAppState();

      renderDashboardChartsAndMetrics();
      renderShiftDetails();
    }

    localStorage.setItem('caffee_last_active_date', todayKey);
  }

  updateClock();
  setInterval(updateClock, 1000);

  checkMidnightAutoReset();
  setInterval(checkMidnightAutoReset, 30000);

  // Wire up export pesanan hari ini button
  const exportDailyBtn = document.getElementById('exportDailyOrdersBtn');
  if (exportDailyBtn) {
    exportDailyBtn.addEventListener('click', () => {
      exportFinanceToExcel();
    });
  }
}



window.testPrintKasir = function() {
  const sampleOrder = (State.dailyOrders && State.dailyOrders[0]) || {
    dailySeq: '#001',
    invoice: 'INV-SAMPLE-001',
    date: new Date(),
    customerName: 'Pelanggan Umum',
    cashier: State.currentShift?.cashierName || 'Karyawan 1',
    orderType: 'Langsung',
    table: '-',
    items: [
      { name: 'Aren Butter Sea Salt', qty: 1, price: 18000, mods: 'Iced, Normal Sugar' },
      { name: 'Roti Coklat Premium', qty: 1, price: 5000, mods: '' }
    ],
    subtotal: 23000,
    discount: 0,
    grandTotal: 23000,
    paymentMethod: 'Tunai',
    cashReceived: 25000,
    change: 2000
  };
  State.activePrintOrder = sampleOrder;
  executeThermalPrint('print-mode-cashier');
};

window.testPrintDapur = function() {
  const sampleOrder = (State.dailyOrders && State.dailyOrders[0]) || {
    dailySeq: '#001',
    invoice: 'INV-SAMPLE-001',
    date: new Date(),
    customerName: 'Pelanggan Umum',
    cashier: State.currentShift?.cashierName || 'Karyawan 1',
    orderType: 'Langsung',
    table: '-',
    items: [
      { name: 'Aren Butter Sea Salt', qty: 1, price: 18000, mods: 'Iced, Normal Sugar (70%)' },
      { name: 'Roti Coklat Premium', qty: 1, price: 5000, mods: 'Hangatkan' }
    ],
    subtotal: 23000,
    discount: 0,
    grandTotal: 23000
  };
  State.activePrintOrder = sampleOrder;
  executeThermalPrint('print-mode-kitchen');
};


// =========================================================================
// REALTIME MULTI-DEVICE INTEGRATION (SINKRONISASI SEMUA HP SESUAI ID TOKO)
// =========================================================================
let isServerSyncBusy = false;
let lastSyncTimestamp = 0;

function getSyncServerEndpoint() {
  const custom = localStorage.getItem('tuntun_custom_server_ip');
  if (custom && custom.trim()) return custom.trim().replace(/\/$/, '');
  if (window.location && window.location.origin && window.location.origin.startsWith('http')) {
    return window.location.origin;
  }
  return 'http://192.168.100.108:3000';
}

async function pushStoreStateToServer() {
  if (isServerSyncBusy) return;
  const base = getSyncServerEndpoint();
  const storeId = (State.activeStore?.id || localStorage.getItem('tuntun_active_store_id') || 'SAADAH').trim().toUpperCase();

  try {
    const payload = {
      storeId: storeId,
      timestamp: Date.now(),
      state: {
        dailyOrders: State.dailyOrders || [],
        products: State.products || [],
        categories: State.categories || [],
        currentShift: State.currentShift || {},
        expenses: State.expenses || [],
        customers: State.customers || [],
        promotions: State.promotions || []
      }
    };

    fetch(`${base}/api/sync`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch(() => {});
    lastSyncTimestamp = Date.now();
  } catch (err) {}
}

async function pullStoreStateFromServer(force = false) {
  if (isServerSyncBusy) return;
  const base = getSyncServerEndpoint();
  const storeId = (State.activeStore?.id || localStorage.getItem('tuntun_active_store_id') || 'SAADAH').trim().toUpperCase();

  try {
    const res = await fetch(`${base}/api/sync?storeId=${storeId}`, { cache: 'no-store' });
    if (!res.ok) return;
    const json = await res.json();
    if (json && json.success && json.data) {
      const s = json.data.state || json.data;
      const serverOrders = Array.isArray(s.dailyOrders) ? s.dailyOrders : [];
      const localOrders = Array.isArray(State.dailyOrders) ? State.dailyOrders : [];

      // Update jika dipaksa atau server memiliki data pesanan berbeda / lebih baru
      if (force || serverOrders.length !== localOrders.length || (json.lastModified && json.lastModified > lastSyncTimestamp)) {
        isServerSyncBusy = true;
        State.dailyOrders = serverOrders;
        if (s.currentShift && Object.keys(s.currentShift).length > 0) State.currentShift = s.currentShift;
        if (Array.isArray(s.products) && s.products.length > 0) State.products = s.products;
        if (Array.isArray(s.categories) && s.categories.length > 0) State.categories = s.categories;
        if (Array.isArray(s.expenses)) State.expenses = s.expenses;
        if (Array.isArray(s.customers)) State.customers = s.customers;
        if (Array.isArray(s.promotions)) State.promotions = s.promotions;

        lastSyncTimestamp = json.lastModified || Date.now();

        // Simpan cache ke memori lokal
        try {
          localStorage.setItem(`tuntun_${storeId}_daily_orders`, JSON.stringify(State.dailyOrders));
          localStorage.setItem(`tuntun_${storeId}_current_shift`, JSON.stringify(State.currentShift));
          if (storeId === 'SAADAH') {
            localStorage.setItem('caffee_daily_orders', JSON.stringify(State.dailyOrders));
            localStorage.setItem('caffee_current_shift', JSON.stringify(State.currentShift));
          }
        } catch (e) {}

        // Segarkan UI Dashboard dan Pesanan di HP ini secara langsung
        if (typeof renderDailyOrders === 'function') renderDailyOrders();
        if (typeof renderDashboardChartsAndMetrics === 'function') renderDashboardChartsAndMetrics();
        if (typeof updateDrawerStatusUI === 'function') updateDrawerStatusUI();
        isServerSyncBusy = false;
      }
    }
  } catch (err) {
    isServerSyncBusy = false;
  }
}

// Background poll sinkronisasi setiap 3.5 detik ke server
setInterval(() => {
  pullStoreStateFromServer(false);
}, 3500);
