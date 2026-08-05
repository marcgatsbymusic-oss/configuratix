import 'package:flutter/material.dart';
import '../services/method_validator.dart';

class MethodDeclarationScreen extends StatefulWidget {
  const MethodDeclarationScreen({Key? key}) : super(key: key);

  @override
  State<MethodDeclarationScreen> createState() => _MethodDeclarationScreenState();
}

class _MethodDeclarationScreenState extends State<MethodDeclarationScreen> {
  InstallationMethod _selectedMethod = InstallationMethod.manualTwoWorkers;
  bool _usedAutoLevelling = false;
  String? _errorMessage;

  void _confirmMethod() {
    setState(() => _errorMessage = null);
    try {
      // Mock weight of this window is 150kg.
      // If the threshold in config is set to 100kg, this will throw for manual methods.
      MethodValidator.validateMethod(_selectedMethod, 150.0);
      
      // Proceed to execution workflow
      // Navigator.pushNamed(context, '/workflow_step_1');
      print('Method validated. Proceeding...');
    } catch (e) {
      setState(() {
        _errorMessage = e.toString();
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Declare Method')),
      body: Padding(
        padding: const EdgeInsets.all(16.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('How are you installing this window?', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
            const SizedBox(height: 16),
            
            RadioListTile<InstallationMethod>(
              title: const Text('Large Installation Machine'),
              value: InstallationMethod.largeMachine,
              groupValue: _selectedMethod,
              onChanged: (val) => setState(() => _selectedMethod = val!),
            ),
            RadioListTile<InstallationMethod>(
              title: const Text('Small Installation Machine'),
              value: InstallationMethod.smallMachine,
              groupValue: _selectedMethod,
              onChanged: (val) => setState(() => _selectedMethod = val!),
            ),
            RadioListTile<InstallationMethod>(
              title: const Text('Manual (2 Workers)'),
              value: InstallationMethod.manualTwoWorkers,
              groupValue: _selectedMethod,
              onChanged: (val) => setState(() => _selectedMethod = val!),
            ),
            RadioListTile<InstallationMethod>(
              title: const Text('Manual (1 Worker)'),
              value: InstallationMethod.manualOneWorker,
              groupValue: _selectedMethod,
              onChanged: (val) => setState(() => _selectedMethod = val!),
            ),
            
            const Divider(height: 40),
            
            SwitchListTile(
              title: const Text('Using Auto-Levelling Equipment?'),
              subtitle: const Text('Capture this for method analytics.'),
              value: _usedAutoLevelling,
              onChanged: (val) => setState(() => _usedAutoLevelling = val),
            ),
            
            const Spacer(),
            
            if (_errorMessage != null)
              Container(
                padding: const EdgeInsets.all(12),
                margin: const EdgeInsets.only(bottom: 16),
                color: Colors.red.shade100,
                child: Text(_errorMessage!, style: const TextStyle(color: Colors.red)),
              ),
              
            ElevatedButton(
              onPressed: _confirmMethod,
              style: ElevatedButton.styleFrom(minimumSize: const Size.fromHeight(50)),
              child: const Text('Start Installation'),
            ),
          ],
        ),
      ),
    );
  }
}
