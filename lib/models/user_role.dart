// lib/models/user_role.dart

enum UserRole {
  pemilik('Pemilik (Owner)', 'Akses penuh ke seluruh bisnis dan laporan keuangan tingkat lanjut'),
  admin('Admin Toko', 'Pengaturan katalog, harga, modifier, pengguna, dan hak akses'),
  manajer('Manajer Operasional', 'Operasional toko, persetujuan diskon/stok, dan pemantauan performa'),
  supervisor('Supervisor Kasir', 'Pengawasan kasir, approval buka/tutup shift, refund, dan void transaksi'),
  kasir('Kasir', 'Melayani transaksi penjualan, keranjang belanja, dan pembayaran'),
  gudang('Petugas Gudang', 'Manajemen stok, opname fisik, penerimaan, dan transfer barang'),
  pembelian('Petugas Pembelian', 'Pengadaan bahan baku, supplier, dan purchase order'),
  akuntan('Akuntan', 'Pencatatan kas operasional, jurnal, arus kas, dan laba rugi');

  final String label;
  final String description;
  const UserRole(this.label, this.description);
}

class AppUser {
  final String id;
  final String name;
  final UserRole role;
  final String pin;
  final String branchId;

  AppUser({
    required this.id,
    required this.name,
    required this.role,
    required this.pin,
    required this.branchId,
  });

  bool canAccessAllReports() => role == UserRole.pemilik || role == UserRole.manajer || role == UserRole.akuntan;
  bool canApproveRefund() => role == UserRole.pemilik || role == UserRole.manajer || role == UserRole.supervisor;
  bool canManageCatalog() => role == UserRole.pemilik || role == UserRole.admin;
  bool canManageStock() => role == UserRole.pemilik || role == UserRole.admin || role == UserRole.gudang;
  bool canViewCosts() => role == UserRole.pemilik || role == UserRole.admin || role == UserRole.akuntan;
}
