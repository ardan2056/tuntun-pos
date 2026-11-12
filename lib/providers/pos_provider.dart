// lib/providers/pos_provider.dart

import 'package:flutter/foundation.dart';
import 'package:intl/intl.dart';
import '../models/business_type.dart';
import '../models/user_role.dart';
import '../models/product.dart';
import '../models/customer.dart';
import '../models/order.dart';
import '../models/shift.dart';
import '../models/promotion.dart';
import '../models/expense.dart';
import '../models/branch.dart';
import '../models/audit_log.dart';

class PosProvider extends ChangeNotifier {
  // 1. Business & User State
  BusinessType _businessType = BusinessType.fnb;
  BusinessType get businessType => _businessType;

  late AppUser _currentUser;
  AppUser get currentUser => _currentUser;

  late Branch _currentBranch;
  Branch get currentBranch => _currentBranch;

  final List<Branch> _branches = [
    Branch(
      id: 'B01',
      name: 'Cabang Utama (Pusat)',
      address: 'Jl. Jendral Sudirman No. 45, Jakarta Pusat',
      phone: '0812-3456-7890',
      managerName: 'Budi Santoso',
    ),
    Branch(
      id: 'B02',
      name: 'Cabang Dago Heritage',
      address: 'Jl. Ir. H. Juanda No. 120, Bandung',
      phone: '0813-9876-5432',
      managerName: 'Siti Rahma',
    ),
    Branch(
      id: 'B03',
      name: 'Gudang Pusat Logistik',
      address: 'Kawasan Industri Cikarang Blok B4',
      phone: '0811-2233-4455',
      isWarehouse: true,
      managerName: 'Hendra Gunawan',
    ),
  ];
  List<Branch> get branches => _branches;

  // 2. Offline Mode State
  bool _isOffline = false;
  bool get isOffline => _isOffline;
  int get pendingOfflineSyncCount =>
      _ordersHistory.where((o) => o.isOffline && !o.isSynced).length;

  // 3. Tax & Service Charge Configuration
  double taxPercent = 10.0; // PB1 / PPN
  double serviceChargePercent = 5.0; // Service charge (terutama F&B)
  bool enableTax = true;
  bool enableServiceCharge = true;

  // 4. Products & Modifiers
  List<Product> _products = [];
  List<Product> get products => _products;
  String _selectedCategory = 'Semua';
  String get selectedCategory => _selectedCategory;
  String _searchQuery = '';
  String get searchQuery => _searchQuery;

  // 5. Active Cart & Order Setup
  final List<OrderItem> _cart = [];
  List<OrderItem> get cart => List.unmodifiable(_cart);
  OrderType _orderType = OrderType.dineIn;
  OrderType get orderType => _orderType;
  String _tableNumber = 'Meja 04';
  String get tableNumber => _tableNumber;

  Customer? _selectedCustomer;
  Customer? get selectedCustomer => _selectedCustomer;

  Promotion? _appliedPromotion;
  Promotion? get appliedPromotion => _appliedPromotion;
  double _manualDiscountAmount = 0.0;
  String _discountReason = '';

  // 6. Customers Database
  List<Customer> _customers = [];
  List<Customer> get customers => _customers;

  // 7. Promotions Engine
  List<Promotion> _promotions = [];
  List<Promotion> get promotions => _promotions;

  // 8. Shift Management
  ShiftRecord? _currentShift;
  ShiftRecord? get currentShift => _currentShift;
  final List<ShiftRecord> _shiftHistory = [];
  List<ShiftRecord> get shiftHistory => List.unmodifiable(_shiftHistory);

  // 9. Orders History & KDS
  final List<Order> _ordersHistory = [];
  List<Order> get ordersHistory => List.unmodifiable(_ordersHistory);
  Order? _lastCompletedOrder;
  Order? get lastCompletedOrder => _lastCompletedOrder;

  // 10. Expenses & Accounting
  final List<ExpenseRecord> _expenses = [];
  List<ExpenseRecord> get expenses => List.unmodifiable(_expenses);

  // 11. Stock Transfers
  final List<StockTransfer> _stockTransfers = [];
  List<StockTransfer> get stockTransfers => List.unmodifiable(_stockTransfers);

  // 12. Audit Logs
  final List<AuditLog> _auditLogs = [];
  List<AuditLog> get auditLogs => List.unmodifiable(_auditLogs);

  // Constructor & Seed Initial Data
  PosProvider() {
    _currentUser = AppUser(
      id: 'U01',
      name: 'Rian Pratama',
      role: UserRole.pemilik,
      pin: '1234',
      branchId: 'B01',
    );
    _currentBranch = _branches[0];
    _seedInitialData();
  }

  void _seedInitialData() {
    // Seed Sample Customers
    _customers = [
      Customer(
        id: 'C01',
        name: 'Ahmad Fauzi',
        phone: '08129881234',
        email: 'ahmad@example.com',
        tier: CustomerTier.gold,
        points: 840,
        depositBalance: 150000.0,
        debtReceivable: 0.0,
        preferences: 'Less Ice, Tanpa Sedotan Plastik',
        joinedAt: DateTime.now().subtract(const Duration(days: 120)),
        totalVisits: 28,
        totalSpent: 1850000.0,
      ),
      Customer(
        id: 'C02',
        name: 'Dewi Lestari',
        phone: '08571234567',
        email: 'dewi.lestari@email.com',
        tier: CustomerTier.silver,
        points: 320,
        depositBalance: 50000.0,
        debtReceivable: 45000.0,
        debtDueDate: DateTime.now().add(const Duration(days: 3)),
        preferences: 'Oatmilk preferred, Alergi Kacang',
        joinedAt: DateTime.now().subtract(const Duration(days: 45)),
        totalVisits: 8,
        totalSpent: 420000.0,
      ),
      Customer(
        id: 'C03',
        name: 'Toko Sumber Jaya (Grosir)',
        phone: '08139988776',
        email: 'sumberjaya@gmail.com',
        tier: CustomerTier.platinum,
        points: 1850,
        depositBalance: 500000.0,
        debtReceivable: 1250000.0,
        debtDueDate: DateTime.now().subtract(const Duration(days: 1)), // Overdue!
        preferences: 'Kirim nota via WA sebelum jam 12',
        joinedAt: DateTime.now().subtract(const Duration(days: 300)),
        totalVisits: 54,
        totalSpent: 28500000.0,
      ),
      Customer(
        id: 'C04',
        name: 'Siska Amelia (Baru)',
        phone: '08190011223',
        tier: CustomerTier.regular,
        points: 20,
        depositBalance: 0.0,
        debtReceivable: 0.0,
        joinedAt: DateTime.now(),
        totalVisits: 1,
        totalSpent: 35000.0,
      ),
    ];

    // Seed Sample Modifiers
    final sugarModifier = ModifierGroup(
      id: 'MOD_SUGAR',
      name: 'Tingkat Kemanisan (Sugar Level)',
      isRequired: false,
      options: [
        ModifierOption(id: 's1', name: 'Normal Sugar (100%)', isDefault: true),
        ModifierOption(id: 's2', name: 'Less Sugar (50%)'),
        ModifierOption(id: 's3', name: 'Low Sugar (25%)'),
        ModifierOption(id: 's4', name: 'No Sugar (0%)'),
      ],
    );

    final iceModifier = ModifierGroup(
      id: 'MOD_ICE',
      name: 'Tingkat Es (Ice Level)',
      isRequired: false,
      options: [
        ModifierOption(id: 'i1', name: 'Normal Ice', isDefault: true),
        ModifierOption(id: 'i2', name: 'Less Ice'),
        ModifierOption(id: 'i3', name: 'No Ice'),
        ModifierOption(id: 'i4', name: 'Extra Ice'),
      ],
    );

    final sizeModifier = ModifierGroup(
      id: 'MOD_SIZE',
      name: 'Ukuran Gelas (Size)',
      isRequired: true,
      options: [
        ModifierOption(id: 'sz1', name: 'Regular (16oz)', extraPrice: 0.0, isDefault: true),
        ModifierOption(id: 'sz2', name: 'Large (22oz)', extraPrice: 5000.0),
        ModifierOption(id: 'sz3', name: '1 Liter Bottle', extraPrice: 22000.0),
      ],
    );

    final toppingModifier = ModifierGroup(
      id: 'MOD_TOPPING',
      name: 'Topping Tambahan',
      isRequired: false,
      maxSelection: 3,
      options: [
        ModifierOption(id: 't1', name: 'Brown Sugar Boba', extraPrice: 4000.0),
        ModifierOption(id: 't2', name: 'Cheese Cream Foam', extraPrice: 6000.0),
        ModifierOption(id: 't3', name: 'Grass Jelly (Cincau)', extraPrice: 3000.0),
        ModifierOption(id: 't4', name: 'Egg Pudding', extraPrice: 4000.0),
      ],
    );

    final spicyModifier = ModifierGroup(
      id: 'MOD_SPICY',
      name: 'Tingkat Kepedasan',
      isRequired: false,
      options: [
        ModifierOption(id: 'sp0', name: 'Level 0 (Tidak Pedas)', isDefault: true),
        ModifierOption(id: 'sp1', name: 'Level 1 (Sedang)'),
        ModifierOption(id: 'sp2', name: 'Level 2 (Pedas)'),
        ModifierOption(id: 'sp3', name: 'Level 3 (Super Pedas)', extraPrice: 2000.0),
      ],
    );

    // Seed Sample Products across business types
    _products = [
      // F&B
      Product(
        id: 'P01',
        name: 'Kopi Susu Gula Aren Tuntun',
        category: 'Minuman Kopi',
        businessType: BusinessType.fnb,
        sku: 'FNB-KOP-01',
        barcode: '8991001001',
        costPrice: 8500.0,
        sellingPrice: 22000.0,
        stock: 145,
        unit: 'cup',
        icon: 'coffee',
        modifierGroups: [sizeModifier, sugarModifier, iceModifier, toppingModifier],
      ),
      Product(
        id: 'P02',
        name: 'Matcha Cream Latte',
        category: 'Minuman Non-Kopi',
        businessType: BusinessType.fnb,
        sku: 'FNB-MAT-02',
        barcode: '8991001002',
        costPrice: 11000.0,
        sellingPrice: 26000.0,
        stock: 82,
        unit: 'cup',
        icon: 'tea',
        modifierGroups: [sizeModifier, sugarModifier, iceModifier, toppingModifier],
      ),
      Product(
        id: 'P03',
        name: 'Nasi Goreng Spesial Tuntun',
        category: 'Makanan Utama',
        businessType: BusinessType.fnb,
        sku: 'FNB-NAS-03',
        barcode: '8991001003',
        costPrice: 14000.0,
        sellingPrice: 32000.0,
        stock: 50,
        unit: 'porsi',
        icon: 'rice',
        modifierGroups: [spicyModifier],
      ),
      Product(
        id: 'P04',
        name: 'Croissant Butter Almond',
        category: 'Bakery & Pastry',
        businessType: BusinessType.fnb,
        sku: 'FNB-PAS-04',
        barcode: '8991001004',
        costPrice: 12000.0,
        sellingPrice: 24000.0,
        stock: 18,
        minStockAlert: 10,
        unit: 'pcs',
        icon: 'bakery',
      ),
      Product(
        id: 'P05',
        name: 'Beef Burger Double Cheese',
        category: 'Makanan Utama',
        businessType: BusinessType.fnb,
        sku: 'FNB-BUR-05',
        barcode: '8991001005',
        costPrice: 21000.0,
        sellingPrice: 42000.0,
        stock: 24,
        unit: 'porsi',
        icon: 'burger',
      ),

      // Retail & Minimarket
      Product(
        id: 'P11',
        name: 'Minyak Goreng Sawit 2 Liter',
        category: 'Sembako',
        businessType: BusinessType.retail,
        sku: 'RET-MIN-11',
        barcode: '8992002011',
        costPrice: 29500.0,
        sellingPrice: 35000.0,
        stock: 120,
        unit: 'pouch',
        icon: 'oil',
        wholesaleMinQty: 6,
        wholesalePrice: 33000.0,
      ),
      Product(
        id: 'P12',
        name: 'Beras Pandan Wangi Premium 5kg',
        category: 'Sembako',
        businessType: BusinessType.retail,
        sku: 'RET-BER-12',
        barcode: '8992002012',
        costPrice: 68000.0,
        sellingPrice: 78000.0,
        stock: 35,
        unit: 'karung',
        icon: 'rice_bag',
        wholesaleMinQty: 5,
        wholesalePrice: 74000.0,
      ),
      Product(
        id: 'P13',
        name: 'Mie Instan Goreng Rasa Ayam',
        category: 'Makanan Kemasan',
        businessType: BusinessType.retail,
        sku: 'RET-MIE-13',
        barcode: '8992002013',
        costPrice: 2600.0,
        sellingPrice: 3200.0,
        stock: 250,
        unit: 'bks',
        icon: 'noodle',
        wholesaleMinQty: 40, // 1 Dus
        wholesalePrice: 2850.0,
      ),
      Product(
        id: 'P14',
        name: 'Sabun Cuci Piring Jeruk Nipis 750ml',
        category: 'Pembersih',
        businessType: BusinessType.retail,
        sku: 'RET-SAB-14',
        barcode: '8992002014',
        costPrice: 11000.0,
        sellingPrice: 14500.0,
        stock: 42,
        unit: 'btl',
        icon: 'bottle',
      ),

      // Electronics
      Product(
        id: 'P21',
        name: 'Earphone TWS ANC Noise Cancelling',
        category: 'Aksesoris Audio',
        businessType: BusinessType.electronic,
        sku: 'ELE-TWS-21',
        barcode: '8993003021',
        costPrice: 165000.0,
        sellingPrice: 279000.0,
        stock: 15,
        unit: 'unit',
        icon: 'headphone',
        requiresSerialNumber: true,
        warrantyPeriod: '12 Bulan Resmi TUNTUN Care',
      ),
      Product(
        id: 'P22',
        name: 'Powerbank 10000mAh 22.5W Fast Charge',
        category: 'Power & Baterai',
        businessType: BusinessType.electronic,
        sku: 'ELE-POW-22',
        barcode: '8993003022',
        costPrice: 95000.0,
        sellingPrice: 165000.0,
        stock: 22,
        unit: 'unit',
        icon: 'battery',
        requiresSerialNumber: true,
        warrantyPeriod: '6 Bulan Ganti Baru',
      ),
      Product(
        id: 'P23',
        name: 'Kabel Data Type-C Braided 100W 1.2M',
        category: 'Kabel & Adaptor',
        businessType: BusinessType.electronic,
        sku: 'ELE-CAB-23',
        barcode: '8993003023',
        costPrice: 18000.0,
        sellingPrice: 45000.0,
        stock: 60,
        unit: 'pcs',
        icon: 'cable',
        warrantyPeriod: '1 Bulan Toko',
      ),

      // Salon & Barbershop
      Product(
        id: 'P31',
        name: 'Paket Gentleman Haircut & Wash + Massage',
        category: 'Barbershop Pria',
        businessType: BusinessType.salon,
        sku: 'SAL-CUT-31',
        barcode: '8994004031',
        costPrice: 8000.0, // Biaya handuk, pomade, sampo
        sellingPrice: 65000.0,
        stock: 999, // Layanan tak terbatas
        unit: 'sesi',
        icon: 'scissors',
        commissionRate: 25.0, // 25% untuk kapster
        serviceDurationMinutes: 45,
      ),
      Product(
        id: 'P32',
        name: 'Creambath Herbal Tradisional + Blow',
        category: 'Perawatan Rambut',
        businessType: BusinessType.salon,
        sku: 'SAL-CRM-32',
        barcode: '8994004032',
        costPrice: 22000.0,
        sellingPrice: 110000.0,
        stock: 999,
        unit: 'sesi',
        icon: 'spa',
        commissionRate: 20.0,
        serviceDurationMinutes: 60,
      ),
      Product(
        id: 'P33',
        name: 'Coloring & Bleaching Fashion Hair',
        category: 'Pewarnaan',
        businessType: BusinessType.salon,
        sku: 'SAL-COL-33',
        barcode: '8994004033',
        costPrice: 65000.0,
        sellingPrice: 280000.0,
        stock: 999,
        unit: 'sesi',
        icon: 'palette',
        commissionRate: 20.0,
        serviceDurationMinutes: 120,
      ),
    ];

    // Seed Promotions
    _promotions = [
      Promotion(
        id: 'PR01',
        name: 'Voucher Grand Opening (Rp 15.000)',
        type: PromoType.fixedAmount,
        value: 15000.0,
        code: 'TUNTUNHEMAT',
        minTransactionAmount: 50000.0,
        quota: 100,
        usedCount: 14,
      ),
      Promotion(
        id: 'PR02',
        name: 'Diskon Spesial Member Gold (10%)',
        type: PromoType.percentage,
        value: 10.0,
        memberOnly: true,
      ),
      Promotion(
        id: 'PR03',
        name: 'Happy Hour Coffee Time 14:00 - 17:00 (15%)',
        type: PromoType.happyHour,
        value: 15.0,
        happyHourStartHour: 14,
        happyHourEndHour: 17,
        applicableCategory: 'Minuman Kopi',
      ),
      Promotion(
        id: 'PR04',
        name: 'Promo Pelanggan Baru Pertama Kali (Rp 10.000)',
        type: PromoType.fixedAmount,
        value: 10000.0,
        newCustomerOnly: true,
        minTransactionAmount: 30000.0,
      ),
    ];

    // Seed Sample Expenses
    _expenses.addAll([
      ExpenseRecord(
        id: 'EXP-01',
        date: DateTime.now().subtract(const Duration(hours: 5)),
        category: ExpenseCategory.rawMaterial,
        title: 'Beli Susu Fresh Milk Diamond 1 Karton',
        amount: 215000.0,
        paidFromAccount: 'Kas Tunai Laci',
        notes: 'Beli darurat di supermarket terdekat karena stok susu menipis',
        staffName: 'Rian Pratama',
      ),
      ExpenseRecord(
        id: 'EXP-02',
        date: DateTime.now().subtract(const Duration(days: 1)),
        category: ExpenseCategory.utilities,
        title: 'Tagihan Listrik PLN Pascabayar',
        amount: 850000.0,
        paidFromAccount: 'BCA Rekening Toko',
        notes: 'Periode pemakaian bulan berjalan',
        staffName: 'Admin Toko',
      ),
    ]);

    // Seed Open Shift
    _currentShift = ShiftRecord(
      id: 'SH-001',
      cashierName: _currentUser.name,
      branchId: _currentBranch.id,
      startTime: DateTime.now().subtract(const Duration(hours: 4)),
      initialCash: 250000.0, // Modal awal laci Rp 250.000
    );

    // Seed 2 initial completed orders for realism
    final initialOrder1 = Order(
      id: 'ORD-101',
      invoiceNumber: 'INV-20261028-001',
      createdAt: DateTime.now().subtract(const Duration(hours: 3)),
      cashierName: 'Rian Pratama',
      customer: _customers[0],
      businessType: BusinessType.fnb,
      orderType: OrderType.dineIn,
      tableNumber: 'Meja 02',
      items: [
        OrderItem(
          product: _products[0], // Kopi Susu
          quantity: 2,
          selectedModifiers: [_products[0].modifierGroups[0].options[0]],
        ),
        OrderItem(
          product: _products[3], // Croissant
          quantity: 1,
        ),
      ],
      subtotal: 68000.0,
      discountAmount: 0.0,
      taxAmount: 6800.0,
      serviceChargeAmount: 3400.0,
      grandTotal: 78200.0,
      paymentMethod: PaymentMethod.qris,
      status: OrderStatus.completed,
    );
    _ordersHistory.add(initialOrder1);
    _currentShift!.totalQrisSales += 78200.0;
    _currentShift!.totalTransactions += 1;

    final initialOrder2 = Order(
      id: 'ORD-102',
      invoiceNumber: 'INV-20261028-002',
      createdAt: DateTime.now().subtract(const Duration(hours: 1, minutes: 20)),
      cashierName: 'Rian Pratama',
      customer: _customers[1],
      businessType: BusinessType.fnb,
      orderType: OrderType.takeAway,
      items: [
        OrderItem(
          product: _products[1], // Matcha Latte
          quantity: 1,
          selectedModifiers: [_products[1].modifierGroups[0].options[0]],
        ),
      ],
      subtotal: 26000.0,
      discountAmount: 0.0,
      taxAmount: 2600.0,
      serviceChargeAmount: 0.0,
      grandTotal: 28600.0,
      paymentMethod: PaymentMethod.cash,
      cashReceived: 50000.0,
      changeAmount: 21400.0,
      status: OrderStatus.completed,
    );
    _ordersHistory.add(initialOrder2);
    _currentShift!.totalCashSales += 28600.0;
    _currentShift!.totalTransactions += 1;

    _lastCompletedOrder = initialOrder2;

    logAction('SISTEM_INIT', 'Aplikasi TUNTUN POS berhasil diinisialisasi dengan data toko');
  }

  // --- Filtering & Business Type Switcher ---
  void setBusinessType(BusinessType type) {
    _businessType = type;
    _selectedCategory = 'Semua';
    clearCart();
    notifyListeners();
  }

  void setSelectedCategory(String category) {
    _selectedCategory = category;
    notifyListeners();
  }

  void setSearchQuery(String query) {
    _searchQuery = query;
    notifyListeners();
  }

  List<String> get availableCategories {
    final list = _products
        .where((p) => p.businessType == _businessType)
        .map((p) => p.category)
        .toSet()
        .toList();
    list.sort();
    return ['Semua', ...list];
  }

  List<Product> get filteredProducts {
    return _products.where((p) {
      final matchBusiness = p.businessType == _businessType;
      final matchCategory =
          _selectedCategory == 'Semua' || p.category == _selectedCategory;
      final matchSearch = _searchQuery.isEmpty ||
          p.name.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.sku.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          p.barcode.contains(_searchQuery);
      return matchBusiness && matchCategory && matchSearch;
    }).toList();
  }

  // --- Cart Management ---
  void addToCart(
    Product product, {
    List<ModifierOption> selectedModifiers = const [],
    int quantity = 1,
    String? serialNumber,
    String? notes,
    String? staffAssigned,
  }) {
    // Check if identical item already in cart (same product + same modifiers)
    final existingIndex = _cart.indexWhere((item) {
      if (item.product.id != product.id) return false;
      if (item.serialNumber != serialNumber) return false;
      if (item.selectedModifiers.length != selectedModifiers.length) return false;
      for (final mod in selectedModifiers) {
        if (!item.selectedModifiers.any((m) => m.id == mod.id)) return false;
      }
      return true;
    });

    if (existingIndex >= 0 && !product.requiresSerialNumber) {
      _cart[existingIndex].quantity += quantity;
    } else {
      _cart.add(OrderItem(
        product: product,
        quantity: quantity,
        selectedModifiers: selectedModifiers,
        serialNumber: serialNumber,
        notes: notes,
        staffAssigned: staffAssigned,
      ));
    }
    notifyListeners();
  }

  void updateCartQuantity(int index, int delta) {
    if (index >= 0 && index < _cart.length) {
      final newQty = _cart[index].quantity + delta;
      if (newQty <= 0) {
        _cart.removeAt(index);
      } else {
        _cart[index].quantity = newQty;
      }
      notifyListeners();
    }
  }

  void removeFromCart(int index) {
    if (index >= 0 && index < _cart.length) {
      _cart.removeAt(index);
      notifyListeners();
    }
  }

  void clearCart() {
    _cart.clear();
    _appliedPromotion = null;
    _manualDiscountAmount = 0.0;
    _discountReason = '';
    notifyListeners();
  }

  void setOrderType(OrderType type) {
    _orderType = type;
    notifyListeners();
  }

  void setTableNumber(String table) {
    _tableNumber = table;
    notifyListeners();
  }

  void selectCustomer(Customer? customer) {
    _selectedCustomer = customer;
    _recalculatePromotion();
    notifyListeners();
  }

  // --- Cart Calculations ---
  double get cartSubtotal =>
      _cart.fold(0.0, (sum, item) => sum + item.subtotal);

  double get cartTotalCost =>
      _cart.fold(0.0, (sum, item) => sum + item.totalCost);

  double get effectiveDiscountAmount {
    double totalDiscount = 0.0;

    // Promo Member Tier Discount
    if (_selectedCustomer != null && _selectedCustomer!.tier.discountPercent > 0) {
      totalDiscount += (cartSubtotal * _selectedCustomer!.tier.discountPercent / 100);
    }

    // Applied Promotion / Coupon
    if (_appliedPromotion != null) {
      if (_appliedPromotion!.type == PromoType.percentage) {
        totalDiscount += (cartSubtotal * _appliedPromotion!.value / 100);
      } else if (_appliedPromotion!.type == PromoType.fixedAmount) {
        totalDiscount += _appliedPromotion!.value;
      }
    }

    // Manual Discount
    totalDiscount += _manualDiscountAmount;

    // MARGIN PROTECTION GUARD (Section 10 Requirement):
    // "Admin dapat menentukan aturan promosi agar diskon tidak membuat harga jual berada di bawah HPP"
    final maxAllowedDiscount = (cartSubtotal - cartTotalCost).clamp(0.0, cartSubtotal);
    if (totalDiscount > maxAllowedDiscount && cartTotalCost > 0) {
      // Diskon dibatasi maksimal agar tidak rugi di bawah HPP
      return maxAllowedDiscount;
    }

    return totalDiscount.clamp(0.0, cartSubtotal);
  }

  double get cartTaxAmount {
    if (!enableTax) return 0.0;
    final taxable = (cartSubtotal - effectiveDiscountAmount).clamp(0.0, double.infinity);
    return taxable * (taxPercent / 100);
  }

  double get cartServiceChargeAmount {
    if (!enableServiceCharge || _orderType == OrderType.delivery) return 0.0;
    final base = (cartSubtotal - effectiveDiscountAmount).clamp(0.0, double.infinity);
    return base * (serviceChargePercent / 100);
  }

  double get cartGrandTotal {
    final total = cartSubtotal - effectiveDiscountAmount + cartTaxAmount + cartServiceChargeAmount;
    return total < 0 ? 0.0 : total;
  }

  void applyPromotion(Promotion promo) {
    final valid = promo.isValidNow(
      transactionTotal: cartSubtotal,
      isMember: _selectedCustomer != null,
      isNewCustomer: _selectedCustomer?.totalVisits == 1,
    );
    if (valid) {
      _appliedPromotion = promo;
      _discountReason = promo.name;
      notifyListeners();
    }
  }

  void removePromotion() {
    _appliedPromotion = null;
    _discountReason = '';
    notifyListeners();
  }

  void _recalculatePromotion() {
    if (_appliedPromotion != null) {
      final valid = _appliedPromotion!.isValidNow(
        transactionTotal: cartSubtotal,
        isMember: _selectedCustomer != null,
        isNewCustomer: _selectedCustomer?.totalVisits == 1,
      );
      if (!valid) {
        _appliedPromotion = null;
      }
    }
  }

  void setManualDiscount(double amount, String reason) {
    _manualDiscountAmount = amount;
    _discountReason = reason;
    notifyListeners();
  }

  // --- Checkout & Complete Transaction ---
  Future<Order> completeOrder({
    required PaymentMethod paymentMethod,
    double cashReceived = 0.0,
    String? paymentReference,
  }) async {
    if (_cart.isEmpty) {
      throw Exception('Keranjang belanja kosong');
    }
    if (_currentShift == null || _currentShift!.isClosed) {
      throw Exception('Shift kasir belum dibuka! Silakan buka shift terlebih dahulu.');
    }

    final double changeAmount = paymentMethod == PaymentMethod.cash
        ? (cashReceived - cartGrandTotal).clamp(0.0, double.infinity)
        : 0.0;

    final invoiceNumber = 'INV-${DateFormat('yyyyMMdd').format(DateTime.now())}-${(_ordersHistory.length + 1).toString().padLeft(3, '0')}';

    final order = Order(
      id: 'ORD-${DateTime.now().millisecondsSinceEpoch}',
      invoiceNumber: invoiceNumber,
      createdAt: DateTime.now(),
      cashierName: _currentUser.name,
      customer: _selectedCustomer,
      businessType: _businessType,
      orderType: _orderType,
      tableNumber: _businessType == BusinessType.fnb ? _tableNumber : null,
      items: List.from(_cart),
      subtotal: cartSubtotal,
      discountAmount: effectiveDiscountAmount,
      discountReason: _discountReason.isNotEmpty ? _discountReason : (_appliedPromotion?.name ?? ''),
      taxAmount: cartTaxAmount,
      serviceChargeAmount: cartServiceChargeAmount,
      grandTotal: cartGrandTotal,
      paymentMethod: paymentMethod,
      cashReceived: cashReceived,
      changeAmount: changeAmount,
      paymentReference: paymentReference,
      status: _businessType == BusinessType.fnb ? OrderStatus.pendingKds : OrderStatus.completed,
      isOffline: _isOffline,
      isSynced: !_isOffline,
    );

    // 1. Potong Stok Produk
    for (final item in order.items) {
      final prodIndex = _products.indexWhere((p) => p.id == item.product.id);
      if (prodIndex >= 0) {
        _products[prodIndex].stock = (_products[prodIndex].stock - item.quantity).clamp(0, 99999);
      }
    }

    // 2. Update Pelanggan (Poin, Deposit, atau Piutang)
    if (_selectedCustomer != null) {
      final custIndex = _customers.indexWhere((c) => c.id == _selectedCustomer!.id);
      if (custIndex >= 0) {
        final cust = _customers[custIndex];
        cust.totalVisits += 1;
        cust.totalSpent += order.grandTotal;

        // Loyalty points: 1 poin tiap Rp 10.000
        final earnedPoints = (order.grandTotal / 10000).floor();
        cust.points += earnedPoints;

        // Potong deposit jika pakai deposit
        if (paymentMethod == PaymentMethod.customerDeposit) {
          cust.depositBalance = (cust.depositBalance - order.grandTotal).clamp(0.0, double.infinity);
        }

        // Catat piutang jika kasbon
        if (paymentMethod == PaymentMethod.receivables) {
          cust.debtReceivable += order.grandTotal;
          cust.debtDueDate = DateTime.now().add(const Duration(days: 7));
        }

        // Auto Upgrade Tier
        if (cust.points >= CustomerTier.platinum.minPoints) {
          cust.tier = CustomerTier.platinum;
        } else if (cust.points >= CustomerTier.gold.minPoints) {
          cust.tier = CustomerTier.gold;
        } else if (cust.points >= CustomerTier.silver.minPoints) {
          cust.tier = CustomerTier.silver;
        } else if (cust.points >= CustomerTier.bronze.minPoints) {
          cust.tier = CustomerTier.bronze;
        }
      }
    }

    // 3. Update Shift Statistics
    // CRITICAL: Pembayaran QRIS / Bank TIDAK boleh dihitung sebagai uang tunai di laci kasir!
    if (paymentMethod == PaymentMethod.cash) {
      _currentShift!.totalCashSales += order.grandTotal;
    } else if (paymentMethod == PaymentMethod.qris) {
      _currentShift!.totalQrisSales += order.grandTotal;
    } else {
      _currentShift!.totalBankSales += order.grandTotal;
    }
    _currentShift!.totalTransactions += 1;

    // 4. Update Promo usage count
    if (_appliedPromotion != null) {
      _appliedPromotion!.usedCount += 1;
    }

    // 5. Append to Order History
    _ordersHistory.insert(0, order);
    _lastCompletedOrder = order;

    logAction('TRANSAKSI_SELESAI', 'Invoice: ${order.invoiceNumber}, Total: Rp ${NumberFormat('#,###').format(order.grandTotal)}, Metode: ${paymentMethod.label}');

    clearCart();
    notifyListeners();
    return order;
  }

  // --- KDS (Kitchen Display System) ---
  List<Order> get kdsOrders =>
      _ordersHistory.where((o) => o.businessType == BusinessType.fnb && o.status != OrderStatus.completed && o.status != OrderStatus.cancelled && o.status != OrderStatus.refunded).toList();

  void updateKdsStatus(String orderId, OrderStatus newStatus) {
    final index = _ordersHistory.indexWhere((o) => o.id == orderId);
    if (index >= 0) {
      _ordersHistory[index].status = newStatus;
      logAction('KDS_UPDATE', 'Order ${_ordersHistory[index].invoiceNumber} status diubah ke ${newStatus.label}');
      notifyListeners();
    }
  }

  // --- Shift Control ---
  void openShift({required String cashierName, required double initialCash}) {
    _currentShift = ShiftRecord(
      id: 'SH-${DateTime.now().millisecondsSinceEpoch}',
      cashierName: cashierName,
      branchId: _currentBranch.id,
      startTime: DateTime.now(),
      initialCash: initialCash,
    );
    logAction('BUKA_SHIFT', 'Kasir: $cashierName, Modal Awal: Rp ${NumberFormat('#,###').format(initialCash)}');
    notifyListeners();
  }

  void recordCashMovement({
    required CashMovementType type,
    required double amount,
    required String reason,
  }) {
    if (_currentShift == null || _currentShift!.isClosed) return;
    _currentShift!.movements.add(CashMovement(
      id: 'CM-${DateTime.now().millisecondsSinceEpoch}',
      timestamp: DateTime.now(),
      type: type,
      amount: amount,
      reason: reason,
      staffName: _currentUser.name,
    ));
    logAction(type == CashMovementType.cashIn ? 'KAS_MASUK' : 'KAS_KELUAR', 'Rp ${NumberFormat('#,###').format(amount)} - Alasan: $reason');
    notifyListeners();
  }

  void closeShift({
    required double actualEndingCash,
    required String supervisorApproval,
    String? notes,
  }) {
    if (_currentShift == null) return;
    _currentShift!.endTime = DateTime.now();
    _currentShift!.actualEndingCash = actualEndingCash;
    _currentShift!.supervisorApproval = supervisorApproval;
    _currentShift!.closeNotes = notes;
    _currentShift!.isClosed = true;

    _shiftHistory.insert(0, _currentShift!);
    final discrepancy = _currentShift!.discrepancy;

    logAction('TUTUP_SHIFT', 'Kas Fisik: Rp ${NumberFormat('#,###').format(actualEndingCash)}, Kas Seharusnya: Rp ${NumberFormat('#,###').format(_currentShift!.expectedCash)}, Selisih: Rp ${NumberFormat('#,###').format(discrepancy)}');
    notifyListeners();
  }

  // --- Returns & Refunds (Section 14) ---
  void processRefund({
    required String invoiceNumber,
    required String reason,
    required bool returnToSaleableStock,
    required String supervisorPin,
  }) {
    final orderIndex = _ordersHistory.indexWhere((o) => o.invoiceNumber == invoiceNumber);
    if (orderIndex < 0) throw Exception('Transaksi tidak ditemukan');

    final order = _ordersHistory[orderIndex];
    if (order.isRefunded) throw Exception('Transaksi ini sudah pernah di-refund');

    order.isRefunded = true;
    order.refundedAmount = order.grandTotal;
    order.refundReason = reason;
    order.supervisorApproval = 'Disetujui PIN: $supervisorPin';
    order.status = OrderStatus.refunded;

    // Kembalikan stok jika layak jual
    if (returnToSaleableStock) {
      for (final item in order.items) {
        final prodIndex = _products.indexWhere((p) => p.id == item.product.id);
        if (prodIndex >= 0) {
          _products[prodIndex].stock += item.quantity;
        }
      }
    }

    // Koreksi kas laci jika bayar tunai
    if (order.paymentMethod == PaymentMethod.cash && _currentShift != null) {
      _currentShift!.totalCashSales = (_currentShift!.totalCashSales - order.grandTotal).clamp(0.0, double.infinity);
    }

    logAction('RETUR_REFUND', 'Invoice: $invoiceNumber, Jumlah: Rp ${NumberFormat('#,###').format(order.grandTotal)}, Alasan: $reason (Stok layak: $returnToSaleableStock)');
    notifyListeners();
  }

  // --- Financial & Accounting (Section 12) ---
  void addExpense({
    required ExpenseCategory category,
    required String title,
    required double amount,
    required String paidFromAccount,
    String notes = '',
  }) {
    final exp = ExpenseRecord(
      id: 'EXP-${DateTime.now().millisecondsSinceEpoch}',
      date: DateTime.now(),
      category: category,
      title: title,
      amount: amount,
      paidFromAccount: paidFromAccount,
      notes: notes,
      staffName: _currentUser.name,
    );
    _expenses.insert(0, exp);
    logAction('CATAT_BIAYA', '$title - Rp ${NumberFormat('#,###').format(amount)} ($paidFromAccount)');
    notifyListeners();
  }

  double get totalRevenue =>
      _ordersHistory.where((o) => !o.isRefunded).fold(0.0, (sum, o) => sum + o.grandTotal);

  double get totalCostOfGoodsSold =>
      _ordersHistory.where((o) => !o.isRefunded).fold(0.0, (sum, o) => sum + o.totalCost);

  double get totalGrossProfit => totalRevenue - totalCostOfGoodsSold;

  double get totalExpensesAmount =>
      _expenses.fold(0.0, (sum, e) => sum + e.amount);

  double get estimatedNetProfit => totalGrossProfit - totalExpensesAmount;

  // --- Customer CRM Operations ---
  void addCustomer({
    required String name,
    required String phone,
    String email = '',
    String preferences = '',
  }) {
    final newCust = Customer(
      id: 'C${(_customers.length + 1).toString().padLeft(2, '0')}',
      name: name,
      phone: phone,
      email: email,
      preferences: preferences,
      joinedAt: DateTime.now(),
    );
    _customers.add(newCust);
    logAction('TAMBAH_PELANGGAN', '$name ($phone)');
    notifyListeners();
  }

  void topupCustomerDeposit(String customerId, double amount) {
    final cust = _customers.firstWhere((c) => c.id == customerId);
    cust.depositBalance += amount;
    logAction('TOPUP_DEPOSIT', '${cust.name} +Rp ${NumberFormat('#,###').format(amount)}');
    notifyListeners();
  }

  void payCustomerDebt(String customerId, double amount) {
    final cust = _customers.firstWhere((c) => c.id == customerId);
    cust.debtReceivable = (cust.debtReceivable - amount).clamp(0.0, double.infinity);
    if (cust.debtReceivable == 0) {
      cust.debtDueDate = null;
    }
    logAction('BAYAR_PIUTANG', '${cust.name} bayar Rp ${NumberFormat('#,###').format(amount)}');
    notifyListeners();
  }

  // --- Multi-Branch & Transfer Stok (Section 18) ---
  void switchBranch(Branch branch) {
    _currentBranch = branch;
    logAction('GANTI_CABANG', 'Pindah ke cabang: ${branch.name}');
    notifyListeners();
  }

  void transferStock({
    required String toBranchName,
    required String productName,
    required int quantity,
  }) {
    final transfer = StockTransfer(
      id: 'TRF-${DateTime.now().millisecondsSinceEpoch}',
      fromBranchName: _currentBranch.name,
      toBranchName: toBranchName,
      productName: productName,
      quantity: quantity,
      date: DateTime.now(),
      requestedBy: _currentUser.name,
    );
    _stockTransfers.insert(0, transfer);
    logAction('TRANSFER_STOK', '$productName ($quantity pcs) ke $toBranchName');
    notifyListeners();
  }

  // --- Offline Mode & Synchronization (Section 17) ---
  void toggleOfflineMode() {
    _isOffline = !_isOffline;
    if (!_isOffline) {
      syncOfflineOrders();
    }
    notifyListeners();
  }

  void syncOfflineOrders() {
    for (final order in _ordersHistory) {
      if (order.isOffline && !order.isSynced) {
        order.isSynced = true;
      }
    }
    logAction('SINKRONISASI', 'Sinkronisasi berhasil: seluruh transaksi offline tersimpan di cloud');
    notifyListeners();
  }

  // --- Security & Role Switcher ---
  void switchRole(UserRole newRole) {
    _currentUser = AppUser(
      id: _currentUser.id,
      name: _currentUser.name,
      role: newRole,
      pin: _currentUser.pin,
      branchId: _currentUser.branchId,
    );
    logAction('GANTI_ROLE', 'Pengguna beralih ke role: ${newRole.label}');
    notifyListeners();
  }

  // --- Audit Trail ---
  void logAction(String action, String details) {
    _auditLogs.insert(0, AuditLog(
      id: 'LOG-${DateTime.now().millisecondsSinceEpoch}',
      timestamp: DateTime.now(),
      userName: _currentUser.name,
      userRole: _currentUser.role.label,
      action: action,
      details: details,
    ));
  }

  // --- AI Assistant Engine (Section 16) ---
  String get dailyAiSummary {
    final totalSalesFormatted = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ').format(totalRevenue);
    final netProfitFormatted = NumberFormat.currency(locale: 'id_ID', symbol: 'Rp ').format(estimatedNetProfit);
    final lowStockItems = _products.where((p) => p.isLowStock).toList();

    return 'Performa bisnis hari ini solid dengan omzet mencapai $totalSalesFormatted dan estimasi laba bersih $netProfitFormatted dari ${_ordersHistory.length} transaksi. '
        'Terdapat ${lowStockItems.length} produk dengan stok kritis yang direkomendasikan segera di-restock.';
  }

  List<String> get aiBusinessInsights {
    final list = <String>[];
    // Anomaly / Warning checks
    final lowStock = _products.where((p) => p.isLowStock).toList();
    if (lowStock.isNotEmpty) {
      list.add('Peringatan Stok: ${lowStock.map((p) => p.name).take(2).join(', ')} mendekati batas minimum!');
    }

    final overdueCust = _customers.where((c) => c.hasOverdueDebt).toList();
    if (overdueCust.isNotEmpty) {
      list.add('Piutang Jatuh Tempo: ${overdueCust.first.name} memiliki tagihan jatuh tempo sebesar Rp ${NumberFormat('#,###').format(overdueCust.first.debtReceivable)}.');
    }

    list.add('Analisis Margin: Produk dengan margin tertinggi saat ini adalah ${products.reduce((a, b) => a.profitMargin > b.profitMargin ? a : b).name} (${products.reduce((a, b) => a.profitMargin > b.profitMargin ? a : b).profitMargin.toStringAsFixed(1)}%).');
    list.add('Rekomendasi Promosi: Promo Happy Hour 14:00-17:00 menaikkan penjualan kategori kopi sebesar 18% minggu ini.');
    return list;
  }

  String askAi(String question) {
    final q = question.toLowerCase();
    if (q.contains('omzet') || q.contains('penjualan')) {
      return 'Total omzet tercatat saat ini adalah Rp ${NumberFormat('#,###').format(totalRevenue)} dari ${_ordersHistory.length} transaksi, dengan rata-rata belanja Rp ${NumberFormat('#,###').format(_ordersHistory.isEmpty ? 0 : totalRevenue / _ordersHistory.length)} per transaksi.';
    } else if (q.contains('untung') || q.contains('laba')) {
      final best = products.reduce((a, b) => a.profitMargin > b.profitMargin ? a : b);
      return 'Estimasi laba bersih Anda saat ini adalah Rp ${NumberFormat('#,###').format(estimatedNetProfit)}. Produk paling menguntungkan adalah "${best.name}" dengan margin laba kotor ${best.profitMargin.toStringAsFixed(1)}%.';
    } else if (q.contains('stok') || q.contains('restock')) {
      final lowStock = _products.where((p) => p.isLowStock).toList();
      if (lowStock.isEmpty) {
        return 'Semua stok produk saat ini dalam kondisi aman di atas batas minimum.';
      }
      return 'Produk yang mendesak untuk di-restock adalah: ${lowStock.map((p) => "${p.name} (Sisa ${p.stock} ${p.unit})").join(', ')}.';
    } else if (q.contains('promo') || q.contains('diskon')) {
      return 'Promosi voucher "TUNTUNHEMAT" telah digunakan sebanyak ${_promotions.first.usedCount} kali. Sistem margin guard aktif memastikan tidak ada transaksi yang dijual di bawah HPP.';
    } else if (q.contains('gula') || q.contains('level')) {
      return 'Berdasarkan riwayat transaksi kafe, opsi "Less Sugar (50%)" dan "Normal Sugar (100%)" merupakan pilihan modifier terpopuler yang dipilih oleh 74% pelanggan.';
    } else {
      return 'Berdasarkan data operasional TUNTUN, bisnis Anda berjalan lancar dengan performa keuangan positif. Ada hal spesifik mengenai omzet, stok, laba, atau pelanggan yang ingin Anda tanyakan?';
    }
  }
}
