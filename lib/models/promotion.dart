// lib/models/promotion.dart

enum PromoType {
  percentage('Diskon Persentase (%)'),
  fixedAmount('Diskon Nominal (Rp)'),
  bogo('Beli 1 Gratis 1 (BOGO)'),
  bundling('Paket Bundling Produk'),
  happyHour('Happy Hour (Jam Tertentu)');

  final String label;
  const PromoType(this.label);
}

class Promotion {
  final String id;
  final String name;
  final PromoType type;
  final double value; // Persentase (e.g. 15%) atau nominal (e.g. 10000)
  final String? code; // Kode voucher jika ada, e.g. "TUNTUNHEMAT"
  final double minTransactionAmount;
  final int? quota;
  int usedCount;
  final bool memberOnly;
  final bool newCustomerOnly;
  final String? applicableCategory;
  final int? happyHourStartHour; // e.g. 14 (14:00)
  final int? happyHourEndHour; // e.g. 17 (17:00)
  final bool isActive;

  Promotion({
    required this.id,
    required this.name,
    required this.type,
    required this.value,
    this.code,
    this.minTransactionAmount = 0.0,
    this.quota,
    this.usedCount = 0,
    this.memberOnly = false,
    this.newCustomerOnly = false,
    this.applicableCategory,
    this.happyHourStartHour,
    this.happyHourEndHour,
    this.isActive = true,
  });

  bool isValidNow({
    required double transactionTotal,
    required bool isMember,
    required bool isNewCustomer,
  }) {
    if (!isActive) return false;
    if (quota != null && usedCount >= quota!) return false;
    if (transactionTotal < minTransactionAmount) return false;
    if (memberOnly && !isMember) return false;
    if (newCustomerOnly && !isNewCustomer) return false;

    if (type == PromoType.happyHour &&
        happyHourStartHour != null &&
        happyHourEndHour != null) {
      final hour = DateTime.now().hour;
      if (hour < happyHourStartHour! || hour >= happyHourEndHour!) return false;
    }
    return true;
  }
}
