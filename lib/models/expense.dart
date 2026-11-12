// lib/models/expense.dart

enum ExpenseCategory {
  salary('Gaji & Insentif Karyawan'),
  utilities('Listrik, Air & Internet'),
  rent('Sewa Tempat & Bangunan'),
  rawMaterial('Pembelian Bahan Baku & Stok'),
  marketing('Iklan & Promosi Pemasaran'),
  maintenance('Perawatan Alat & Perbaikan'),
  transport('Transportasi & Pengiriman'),
  other('Operasional Lain-Lain');

  final String label;
  const ExpenseCategory(this.label);
}

class ExpenseRecord {
  final String id;
  final DateTime date;
  final ExpenseCategory category;
  final String title;
  final double amount;
  final String paidFromAccount; // e.g. "Kas Tunai", "BCA", "Mandiri"
  final String notes;
  final String staffName;
  final String? receiptPhotoUrl; // Bukti nota / bon

  ExpenseRecord({
    required this.id,
    required this.date,
    required this.category,
    required this.title,
    required this.amount,
    required this.paidFromAccount,
    this.notes = '',
    required this.staffName,
    this.receiptPhotoUrl,
  });
}
