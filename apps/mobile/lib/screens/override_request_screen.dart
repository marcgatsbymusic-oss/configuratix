import 'package:flutter/material.dart';

class OverrideRequestScreen extends StatefulWidget {
  const OverrideRequestScreen({Key? key}) : super(key: key);

  @override
  State<OverrideRequestScreen> createState() => _OverrideRequestScreenState();
}

class _OverrideRequestScreenState extends State<OverrideRequestScreen> {
  final _reasonController = TextEditingController();
  final _methodController = TextEditingController();
  int _photosCaptured = 0;

  void _capturePhoto() {
    setState(() => _photosCaptured++);
  }

  void _submitRequest() {
    if (_reasonController.text.isEmpty || _methodController.text.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please fill out all fields.')),
      );
      return;
    }
    if (_photosCaptured == 0) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('At least one photo is required.')),
      );
      return;
    }

    // Submit to outbox, mark local state as BLOCKED
    print('Override requested. Local state BLOCKED pending supervisor approval.');
    
    // Return to dashboard, as they cannot continue this opening
    Navigator.popUntil(context, ModalRoute.withName('/dashboard'));
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Opening blocked. Waiting for supervisor approval.')),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Request Override'),
        backgroundColor: Colors.red.shade700,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(12),
              color: Colors.red.shade50,
              child: const Row(
                children: [
                  Icon(Icons.warning, color: Colors.red),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Requesting an override will immediately halt work on this opening until a Supervisor approves the alternative method.',
                      style: TextStyle(color: Colors.red),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),
            
            const Text('Why is the standard method impossible?', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _reasonController,
              maxLines: 3,
              decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'e.g. Substrate crumbled when drilled'),
            ),
            const SizedBox(height: 16),
            
            const Text('Proposed Alternative Method', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            TextField(
              controller: _methodController,
              maxLines: 3,
              decoration: const InputDecoration(border: OutlineInputBorder(), hintText: 'e.g. Use 10mm chemical anchors instead'),
            ),
            const SizedBox(height: 24),
            
            const Text('Photographic Evidence', style: TextStyle(fontWeight: FontWeight.bold)),
            const SizedBox(height: 8),
            ElevatedButton.icon(
              onPressed: _capturePhoto,
              icon: const Icon(Icons.camera_alt),
              label: Text('Capture Situation Photo ($_photosCaptured)'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size.fromHeight(60),
                backgroundColor: Colors.blueGrey,
              ),
            ),
            
            const SizedBox(height: 40),
            ElevatedButton(
              onPressed: _submitRequest,
              style: ElevatedButton.styleFrom(
                backgroundColor: Colors.red.shade700,
                foregroundColor: Colors.white,
                minimumSize: const Size.fromHeight(60),
              ),
              child: const Text('Submit to Supervisor', style: TextStyle(fontSize: 18)),
            )
          ],
        ),
      ),
    );
  }
}
