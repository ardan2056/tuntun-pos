// lib/models/audit_log.dart

class AuditLog {
  final String id;
  final DateTime timestamp;
  final String userName;
  final String userRole;
  final String action;
  final String details;
  final String ipOrDevice;

  AuditLog({
    required this.id,
    required this.timestamp,
    required this.userName,
    required this.userRole,
    required this.action,
    required this.details,
    this.ipOrDevice = 'POS Terminal 01',
  });
}
