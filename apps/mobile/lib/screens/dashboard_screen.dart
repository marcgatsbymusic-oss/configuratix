import 'package:flutter/material.dart';

class DashboardScreen extends StatelessWidget {
  const DashboardScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    // Scaffold UI designed for FR-4.1
    return Scaffold(
      appBar: AppBar(
        title: const Text('My Assignments'),
        actions: [
          // Sync Status Indicator
          Center(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16.0),
              child: Row(
                children: const [
                  Icon(Icons.cloud_upload_outlined, size: 20),
                  SizedBox(width: 4),
                  Text('3 pending', style: TextStyle(fontSize: 12)),
                ],
              ),
            ),
          )
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Greeting (FR-4.1)
          const Text(
            'Hello, Jan',
            style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 8),
          const Text(
            'You have 4 windows assigned today at "Project Alpha".',
            style: TextStyle(color: Colors.grey),
          ),
          const SizedBox(height: 24),
          
          // List of windows
          Card(
            child: ListTile(
              leading: const Icon(Icons.window, size: 40, color: Colors.blue),
              title: const Text('Living Room - W01'),
              subtitle: const Text('IGLO 5 • 1200x1500'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.pushNamed(context, '/method_declaration');
              },
            ),
          ),
          Card(
            child: ListTile(
              leading: const Icon(Icons.window, size: 40, color: Colors.blue),
              title: const Text('Kitchen - W02'),
              subtitle: const Text('IGLO 5 • 800x1200'),
              trailing: const Icon(Icons.chevron_right),
              onTap: () {
                Navigator.pushNamed(context, '/method_declaration');
              },
            ),
          )
        ],
      ),
    );
  }
}
