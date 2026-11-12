// lib/models/product.dart

import 'business_type.dart';

class ModifierOption {
  final String id;
  final String name;
  final double extraPrice;
  final bool isDefault;

  ModifierOption({
    required this.id,
    required this.name,
    this.extraPrice = 0.0,
    this.isDefault = false,
  });

  Map<String, dynamic> toMap() => {
    'id': id,
    'name': name,
    'extraPrice': extraPrice,
    'isDefault': isDefault,
  };
}

class ModifierGroup {
  final String id;
  final String name;
  final bool isRequired;
  final int minSelection;
  final int maxSelection;
  final List<ModifierOption> options;

  ModifierGroup({
    required this.id,
    required this.name,
    this.isRequired = false,
    this.minSelection = 0,
    this.maxSelection = 1,
    required this.options,
  });
}

class Product {
  final String id;
  final String name;
  final String category;
  final BusinessType businessType;
  final String sku;
  final String barcode;
  final double costPrice; // HPP (Harga Pokok Penjualan)
  final double sellingPrice; // Harga Jual
  int stock;
  final int minStockAlert;
  final String unit;
  final String icon;
  final List<ModifierGroup> modifierGroups;

  // Retail specific
  final int wholesaleMinQty;
  final double wholesalePrice;

  // Electronic specific
  final bool requiresSerialNumber;
  final String warrantyPeriod;

  // Salon & Service specific
  final double commissionRate; // Komisi kapster / teknisi dlm % (misal 15%)
  final int serviceDurationMinutes;

  Product({
    required this.id,
    required this.name,
    required this.category,
    required this.businessType,
    required this.sku,
    required this.barcode,
    required this.costPrice,
    required this.sellingPrice,
    required this.stock,
    this.minStockAlert = 5,
    this.unit = 'pcs',
    this.icon = 'tag',
    this.modifierGroups = const [],
    this.wholesaleMinQty = 0,
    this.wholesalePrice = 0.0,
    this.requiresSerialNumber = false,
    this.warrantyPeriod = 'Tanpa Garansi',
    this.commissionRate = 0.0,
    this.serviceDurationMinutes = 0,
  });

  bool get isLowStock => stock <= minStockAlert;
  double get profitMargin => sellingPrice > 0 ? ((sellingPrice - costPrice) / sellingPrice) * 100 : 0.0;
}
