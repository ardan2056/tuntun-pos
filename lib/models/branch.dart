// lib/models/branch.dart

class Branch {
  final String id;
  final String name;
  final String address;
  final String phone;
  final bool isWarehouse;
  final String managerName;

  Branch({
    required this.id,
    required this.name,
    required this.address,
    required this.phone,
    this.isWarehouse = false,
    required this.managerName,
  });
}

class StockTransfer {
  final String id;
  final String fromBranchName;
  final String toBranchName;
  final String productName;
  final int quantity;
  final DateTime date;
  final String requestedBy;
  final String status; // 'Menunggu Persetujuan', 'Disetujui & Dikirim', 'Diterima'

  StockTransfer({
    required this.id,
    required this.fromBranchName,
    required this.toBranchName,
    required this.productName,
    required this.quantity,
    required this.date,
    required this.requestedBy,
    this.status = 'Disetujui & Dikirim',
  });
}
