import 'dart:convert';
import 'dart:async';

/// Represents a mutation that occurred offline and needs syncing to the server.
class OutboxItem {
  final String id;
  final String entityType; // e.g., 'EvidencePhoto', 'MeasurementRecord', 'WorkflowStepInstance'
  final String entityId;
  final String operation; // 'CREATE', 'UPDATE', 'DELETE'
  final Map<String, dynamic> payload;
  final DateTime timestamp;

  OutboxItem({
    required this.id,
    required this.entityType,
    required this.entityId,
    required this.operation,
    required this.payload,
    required this.timestamp,
  });

  Map<String, dynamic> toJson() => {
    'id': id,
    'entityType': entityType,
    'entityId': entityId,
    'operation': operation,
    'payload': jsonEncode(payload),
    'timestamp': timestamp.toIso8601String(),
  };
}

/// Sync status for UI binding
class SyncStatus {
  final int pendingCount;
  final bool isSyncing;
  final String? lastError;

  SyncStatus(this.pendingCount, this.isSyncing, this.lastError);
}

/// Manages the offline-first Outbox Sync Pattern.
/// Policy: 
/// - Last-Write-Wins (LWW) based on local timestamps for simple properties.
/// - Complex state (like workflow completion) is authoritative on the server.
///   If the server rejects a state transition (e.g., due to missing evidence or pending overrides),
///   the app must apply the server's rejection.
class OutboxManager {
  // In a real app, this would be backed by sqflite or Hive.
  final List<OutboxItem> _queue = [];
  
  final _statusController = StreamController<SyncStatus>.broadcast();
  Stream<SyncStatus> get statusStream => _statusController.stream;

  bool _isSyncing = false;
  String? _lastError;

  void enqueue(OutboxItem item) {
    _queue.add(item);
    _emitStatus();
    _attemptSync();
  }

  void _emitStatus() {
    _statusController.add(SyncStatus(_queue.length, _isSyncing, _lastError));
  }

  Future<void> _attemptSync() async {
    if (_isSyncing || _queue.isEmpty) return;
    
    // Simulate connectivity check
    bool hasConnection = true; // Assume online for this mock
    if (!hasConnection) return;

    _isSyncing = true;
    _lastError = null;
    _emitStatus();

    try {
      // Process queue sequentially
      while (_queue.isNotEmpty) {
        final item = _queue.first;
        
        // Mock server push
        await _pushToServer(item);
        
        // Remove on success
        _queue.removeAt(0);
        _emitStatus();
      }
    } catch (e) {
      _lastError = e.toString();
    } finally {
      _isSyncing = false;
      _emitStatus();
    }
  }

  Future<void> _pushToServer(OutboxItem item) async {
    // In a real implementation:
    // final response = await http.post('/api/sync', body: item.toJson());
    // if (response.statusCode == 409 || response.statusCode == 400) {
    //   // SERVER REJECTION HANDLING:
    //   // e.g., rollback local state, notify user, etc.
    // }
    
    // Mock network delay
    await Future.delayed(const Duration(milliseconds: 200));
    
    print('[OutboxManager] Synced ${item.operation} for ${item.entityType} ${item.entityId}');
  }
}
