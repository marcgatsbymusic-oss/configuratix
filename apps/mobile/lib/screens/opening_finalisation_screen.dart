import 'package:flutter/material.dart';

class OpeningFinalisationScreen extends StatelessWidget {
  const OpeningFinalisationScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Mock state mapping to FR-5.30 requirements
    // For demonstration, let's say they missed some evidence in step 2.
    final bool isReady = false;
    final List<String> blockingIssues = [
      'Missing evidence photo: CLEARED_OPENING_PHOTO',
      'Step "Mechanical Fixing" not marked as completed.'
    ];

    return Scaffold(
      appBar: AppBar(title: const Text('Finalise Opening')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Opening Status Check',
              style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 24),
            
            if (!isReady) ...[
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: Colors.red.shade100,
                  borderRadius: BorderRadius.circular(8),
                  border: Border.all(color: Colors.red, width: 2),
                ),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Row(
                      children: [
                        Icon(Icons.error_outline, color: Colors.red, size: 30),
                        SizedBox(width: 8),
                        Text('CANNOT FINALISE', style: TextStyle(color: Colors.red, fontWeight: FontWeight.bold, fontSize: 18)),
                      ],
                    ),
                    const SizedBox(height: 16),
                    const Text('You must resolve the following issues before closing this opening:', style: TextStyle(fontWeight: FontWeight.bold)),
                    const SizedBox(height: 8),
                    ...blockingIssues.map((issue) => Padding(
                      padding: const EdgeInsets.symmetric(vertical: 4.0),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text('• ', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                          Expanded(child: Text(issue, style: const TextStyle(fontSize: 16))),
                        ],
                      ),
                    )),
                  ],
                ),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () => Navigator.pop(context),
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                  backgroundColor: Colors.grey.shade300,
                  foregroundColor: Colors.black,
                ),
                child: const Text('Return to Workflow', style: TextStyle(fontSize: 18)),
              ),
            ] else ...[
              const Center(
                child: Column(
                  children: [
                    Icon(Icons.check_circle, color: Colors.green, size: 100),
                    SizedBox(height: 16),
                    Text('All steps completed.\nAll evidence captured.', textAlign: TextAlign.center, style: TextStyle(fontSize: 18)),
                  ],
                ),
              ),
              const Spacer(),
              ElevatedButton(
                onPressed: () {
                  // Submit finalisation to outbox, return to dashboard
                  Navigator.popUntil(context, ModalRoute.withName('/dashboard'));
                },
                style: ElevatedButton.styleFrom(
                  minimumSize: const Size.fromHeight(60),
                  backgroundColor: Colors.green,
                ),
                child: const Text('Finalise Opening', style: TextStyle(color: Colors.white, fontSize: 18)),
              ),
            ]
          ],
        ),
      ),
    );
  }
}
