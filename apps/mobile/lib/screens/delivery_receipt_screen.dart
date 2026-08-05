import 'package:flutter/material.dart';
import '../sync/outbox_manager.dart';

class DeliveryReceiptScreen extends StatefulWidget {
  final OutboxManager outboxManager;

  const DeliveryReceiptScreen({Key? key, required this.outboxManager}) : super(key: key);

  @override
  State<DeliveryReceiptScreen> createState() => _DeliveryReceiptScreenState();
}

class _DeliveryReceiptScreenState extends State<DeliveryReceiptScreen> {
  final _barcodeController = TextEditingController();
  
  // Mocked items for the order
  final List<Map<String, dynamic>> _items = [
    {'id': 'ITEM_1', 'desc': 'IGLO 5 W01', 'status': 'PENDING'},
    {'id': 'ITEM_2', 'desc': 'IGLO 5 W02', 'status': 'PENDING'},
  ];

  void _scanBarcode() {
    // Stub for camera barcode scanner
    // A failed scan due to bad light would fall back to manual entry.
    print('Camera scanner opened...');
  }

  void _markItem(int index, String status) {
    setState(() {
      _items[index]['status'] = status;
    });

    widget.outboxManager.enqueue(OutboxItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      entityType: 'InstallationItem',
      entityId: _items[index]['id'],
      operation: 'UPDATE',
      payload: {'barcodeStatus': status},
      timestamp: DateTime.now(),
    ));
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Receive Delivery')),
      body: Column(
        children: [
          // Manual Fallback Input / Scan Trigger
          Padding(
            padding: const EdgeInsets.all(16.0),
            child: Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: _barcodeController,
                    decoration: const InputDecoration(
                      labelText: 'Manual Barcode Entry',
                      border: OutlineInputBorder(),
                    ),
                  ),
                ),
                const SizedBox(width: 16),
                SizedBox(
                  height: 60,
                  width: 60, // Large touch target
                  child: ElevatedButton(
                    onPressed: _scanBarcode,
                    child: const Icon(Icons.qr_code_scanner, size: 30),
                  ),
                )
              ],
            ),
          ),
          
          Expanded(
            child: ListView.builder(
              itemCount: _items.length,
              itemBuilder: (context, index) {
                final item = _items[index];
                return Card(
                  margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(item['desc'], style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                        const SizedBox(height: 16),
                        // Large touch targets for gloved hands
                        Row(
                          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                          children: [
                            _buildActionButton('CONFIRM', Colors.green, () => _markItem(index, 'CONFIRMED')),
                            _buildActionButton('MISSING', Colors.orange, () => _markItem(index, 'MISSING')),
                            _buildActionButton('DAMAGED', Colors.red, () => _markItem(index, 'DAMAGED')),
                          ],
                        ),
                        const SizedBox(height: 8),
                        Text('Current: ${item['status']}', style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildActionButton(String label, Color color, VoidCallback onPressed) {
    return SizedBox(
      height: 60, // Large touch target
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(backgroundColor: color),
        onPressed: onPressed,
        child: Text(label, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}
