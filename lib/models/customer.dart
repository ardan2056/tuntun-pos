// lib/models/customer.dart

enum CustomerTier {
  regular('Reguler', 0, 0.0),
  bronze('Bronze', 100, 2.0),
  silver('Silver', 300, 5.0),
  gold('Gold', 700, 8.0),
  platinum('Platinum', 1500, 12.0);

  final String label;
  final int minPoints;
  final double discountPercent;
  const CustomerTier(this.label, this.minPoints, this.discountPercent);
}

class Customer {
  final String id;
  String name;
  String phone;
  String email;
  CustomerTier tier;
  int points;
  double depositBalance;
  double debtReceivable; // Piutang yang belum dibayar
  DateTime? debtDueDate;
  String preferences; // e.g. "Less sugar, alergi kacang"
  bool marketingConsent;
  DateTime joinedAt;
  int totalVisits;
  double totalSpent;
  double rating; // Rating umpan balik (1-5)

  Customer({
    required this.id,
    required this.name,
    required this.phone,
    this.email = '',
    this.tier = CustomerTier.regular,
    this.points = 0,
    this.depositBalance = 0.0,
    this.debtReceivable = 0.0,
    this.debtDueDate,
    this.preferences = '',
    this.marketingConsent = true,
    required this.joinedAt,
    this.totalVisits = 1,
    this.totalSpent = 0.0,
    this.rating = 5.0,
  });

  bool get hasOverdueDebt => debtReceivable > 0 && debtDueDate != null && DateTime.now().isAfter(debtDueDate!);
}
