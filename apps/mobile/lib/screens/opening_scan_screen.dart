import 'package:flutter/material.dart';

class OpeningScanScreen extends StatefulWidget {
  const OpeningScanScreen({Key? key}) : super(key: key);

  @override
  State<OpeningScanScreen> createState() => _OpeningScanScreenState();
}

class _OpeningScanScreenState extends State<OpeningScanScreen> {
  String? _errorMsg;

  void _simulateScan(bool isMatch) {
    if (!isMatch) {
      // Hard block on mismatch (FR-5.2)
      setState(() {
        _errorMsg = "SAFETY BLOCK: The scanned window does not match the wall opening label.";
      });
    } else {
      setState(() {
        _errorMsg = null;
      });
      // Transition to active workflow
      Navigator.pushNamed(context, '/workflow_step');
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Unlock Opening')),
      body: Center(
        child: Padding(
          padding: const EdgeInsets.all(24.0),
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Icon(Icons.qr_code_scanner, size: 100, color: Colors.blueGrey),
              const SizedBox(height: 24),
              const Text(
                'Scan the wall QR code to unlock the workflow for this opening.',
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 18),
              ),
              const SizedBox(height: 40),
              
              if (_errorMsg != null)
                Container(
                  padding: const EdgeInsets.all(16),
                  color: Colors.red.shade900,
                  child: Text(
                    _errorMsg!,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ),
                
              const SizedBox(height: 40),
              
              // Simulation buttons
              Row(
                mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                children: [
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.red,
                      minimumSize: const Size(120, 60),
                    ),
                    onPressed: () => _simulateScan(false),
                    child: const Text('Simulate\nMismatch', textAlign: TextAlign.center, style: TextStyle(color: Colors.white)),
                  ),
                  ElevatedButton(
                    style: ElevatedButton.styleFrom(
                      backgroundColor: Colors.green,
                      minimumSize: const Size(120, 60),
                    ),
                    onPressed: () => _simulateScan(true),
                    child: const Text('Simulate\nMatch', textAlign: TextAlign.center, style: TextStyle(color: Colors.white)),
                  ),
                ],
              )
            ],
          ),
        ),
      ),
    );
  }
}
