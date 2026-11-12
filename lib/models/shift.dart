// lib/models/shift.dart

enum CashMovementType {
  cashIn('Kas Masuk (Tambah Modal/Uang Pecahan)'),
  cashOut('Kas Keluar (Beli Keperluan/Ambil Setoran)');

  final String label;
  const CashMovementType(this.label);
}

class CashMovement {
  final String id;
  final DateTime timestamp;
  final CashMovementType type;
  final double amount;
  final String reason;
  final String staffName;

  CashMovement({
    required this.id,
    required this.timestamp,
    required this.type,
    required this.amount,
    required this.reason,
    required this.staffName,
  });
}

class ShiftRecord {
  final String id;
  final String cashierName;
  final String branchId;
  final DateTime startTime;
  DateTime? endTime;
  final double initialCash; // Modal awal di laci

  double totalCashSales; // Penjualan tunai murni
  double totalQrisSales; // Non-tunai (tidak masuk laci)
  double totalBankSales; // Non-tunai (tidak masuk laci)
  int totalTransactions;

  final List<CashMovement> movements;

  double actualEndingCash; // Kas fisik yang dihitung kasir saat tutup shift
  String? supervisorApproval;
  String? closeNotes;
  bool isClosed;

  ShiftRecord({
    required this.id,
    required this.cashierName,
    required this.branchId,
    required this.startTime,
    this.endTime,
    required this.initialCash,
    this.totalCashSales = 0.0,
    this.totalQrisSales = 0.0,
    this.totalBankSales = 0.0,
    this.totalTransactions = 0,
    List<CashMovement>? movements,
    this.actualEndingCash = 0.0,
    this.supervisorApproval,
    this.closeNotes,
    this.isClosed = false,
  }) : movements = movements ?? [];

  double get totalCashIn => movements
      .where((m) => m.type == CashMovementType.cashIn)
      .fold(0.0, (sum, m) => sum + m.amount);

  double get totalCashOut => movements
      .where((m) => m.type == CashMovementType.cashOut)
      .fold(0.0, (sum, m) => sum + m.amount);

  // Kas yang seharusnya di laci = Modal awal + Tunai Penjualan + Kas Masuk - Kas Keluar
  double get expectedCash => initialCash + totalCashSales + totalCashIn - totalCashOut;

  // Selisih = Kas Fisik - Kas yang Seharusnya (positif = lebih/surplus, negatif = kurang/minus)
  double get discrepancy => actualEndingCash - expectedCash;
}
