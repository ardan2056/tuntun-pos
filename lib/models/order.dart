// lib/models/order.dart

import 'business_type.dart';
import 'customer.dart';
import 'product.dart';

enum PaymentMethod {
  cash('Tunai (Cash)', 'Uang fisik laci kasir'),
  qris('QRIS Dinamis', 'Pembayaran QR digital (non-tunai)'),
  transferBank('Transfer Bank', 'BCA / Mandiri / BRI'),
  edcCard('Kartu Debit / Kredit (EDC)', 'Mesin EDC gesek / tap'),
  customerDeposit('Saldo Deposit Pelanggan', 'Potong saldo dompet member'),
  receivables('Piutang / Kasbon', 'Catat hutang bayar nanti');

  final String label;
  final String note;
  const PaymentMethod(this.label, this.note);
}

enum OrderStatus {
  pendingKds('Antrean Dapur'),
  preparing('Sedang Disiapkan'),
  ready('Siap Diambil/Disajikan'),
  completed('Selesai'),
  refunded('Di-Refund / Retur'),
  cancelled('Dibatalkan');

  final String label;
  const OrderStatus(this.label);
}

class OrderItem {
  final Product product;
  int quantity;
  final List<ModifierOption> selectedModifiers;
  final String? serialNumber;
  final String? notes;
  final String? staffAssigned; // Misal nama kapster/barista

  OrderItem({
    required this.product,
    this.quantity = 1,
    this.selectedModifiers = const [],
    this.serialNumber,
    this.notes,
    this.staffAssigned,
  });

  double get unitModifierTotal =>
      selectedModifiers.fold(0.0, (sum, mod) => sum + mod.extraPrice);

  double get effectiveUnitPrice {
    // Cek grosir jika ada
    if (product.wholesaleMinQty > 0 && quantity >= product.wholesaleMinQty) {
      return product.wholesalePrice + unitModifierTotal;
    }
    return product.sellingPrice + unitModifierTotal;
  }

  double get subtotal => effectiveUnitPrice * quantity;
  double get totalCost => product.costPrice * quantity;
  double get profit => subtotal - totalCost;
}

class Order {
  final String id;
  final String invoiceNumber;
  final DateTime createdAt;
  final String cashierName;
  final Customer? customer;
  final BusinessType businessType;
  final OrderType orderType;
  final String? tableNumber;
  final List<OrderItem> items;

  final double subtotal;
  final double discountAmount;
  final String discountReason;
  final double taxAmount; // PB1 / PPN
  final double serviceChargeAmount;
  final double grandTotal;

  final PaymentMethod paymentMethod;
  final double cashReceived;
  final double changeAmount;
  final String? paymentReference;

  OrderStatus status;
  final bool isOffline;
  bool isSynced;

  // Refund / Cancellation info
  bool isRefunded;
  double refundedAmount;
  String? refundReason;
  String? supervisorApproval;

  Order({
    required this.id,
    required this.invoiceNumber,
    required this.createdAt,
    required this.cashierName,
    this.customer,
    required this.businessType,
    required this.orderType,
    this.tableNumber,
    required this.items,
    required this.subtotal,
    this.discountAmount = 0.0,
    this.discountReason = '',
    this.taxAmount = 0.0,
    this.serviceChargeAmount = 0.0,
    required this.grandTotal,
    required this.paymentMethod,
    this.cashReceived = 0.0,
    this.changeAmount = 0.0,
    this.paymentReference,
    this.status = OrderStatus.completed,
    this.isOffline = false,
    this.isSynced = true,
    this.isRefunded = false,
    this.refundedAmount = 0.0,
    this.refundReason,
    this.supervisorApproval,
  });

  double get totalCost => items.fold(0.0, (sum, item) => sum + item.totalCost);
  double get grossProfit => grandTotal - totalCost - taxAmount - serviceChargeAmount;
}
