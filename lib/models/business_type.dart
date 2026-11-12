// lib/models/business_type.dart

enum BusinessType {
  fnb('Kafe & Resto (F&B)', 'Dine-in, meja, modifier gula/es/topping, layar dapur KDS'),
  retail('Retail & Minimarket', 'Barcode scanner, label rak, harga grosir volume'),
  electronic('Elektronik & Gadget', 'Serial number / IMEI, kartu garansi, riwayat servis'),
  salon('Salon, Barbershop & Jasa', 'Daftar layanan, jadwal kapster, sistem komisi pegawai');

  final String title;
  final String description;
  const BusinessType(this.title, this.description);
}

enum OrderType {
  dineIn('Dine In (Makan di Tempat)'),
  takeAway('Take Away (Bungkus)'),
  delivery('Delivery (Pesan Antar)');

  final String label;
  const OrderType(this.label);
}
