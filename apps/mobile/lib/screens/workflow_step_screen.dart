import 'package:flutter/material.dart';
import 'dart:async';

class WorkflowStepScreen extends StatefulWidget {
  const WorkflowStepScreen({Key? key}) : super(key: key);

  @override
  State<WorkflowStepScreen> createState() => _WorkflowStepScreenState();
}

class _WorkflowStepScreenState extends State<WorkflowStepScreen> {
  // Mock data representing a loaded WorkflowStepDefinition
  final String _stepName = 'Frame Placement';
  final List<String> _checklist = [
    'Sashes/glazing removed',
    'Frame positioned',
    'Safety: Secured against falling'
  ];
  final List<String> _tools = ['Wedges', 'Inflatable Cushions'];
  final List<String> _evidenceNeeded = ['SECURED_FRAME_PHOTO'];
  
  final Map<String, bool> _checklistState = {};
  int _photosCaptured = 0;
  
  // Timer state
  final int _timerDurationMins = 0; // Set to 40 for SEALING step
  int _secondsRemaining = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    for (var item in _checklist) {
      _checklistState[item] = false;
    }
    
    if (_timerDurationMins > 0) {
      _secondsRemaining = _timerDurationMins * 60;
      _timer = Timer.periodic(const Duration(seconds: 1), (timer) {
        if (_secondsRemaining > 0) {
          setState(() => _secondsRemaining--);
        } else {
          timer.cancel();
        }
      });
    }
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  void _captureEvidence() {
    // Stub to PhotoCaptureService
    setState(() {
      _photosCaptured++;
    });
  }

  void _completeStep() {
    // Validate
    bool allChecked = _checklistState.values.every((v) => v);
    if (!allChecked) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Complete all checklist items first.')),
      );
      return;
    }
    if (_photosCaptured < _evidenceNeeded.length) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Missing required evidence photos.')),
      );
      return;
    }
    
    // Move to next step or finalizing
    Navigator.pushNamed(context, '/opening_finalisation');
  }

  @override
  Widget build(BuildContext context) {
    bool isTimerActive = _timerDurationMins > 0 && _secondsRemaining > 0;
    
    return Scaffold(
      appBar: AppBar(title: Text(_stepName)),
      body: ListView(
        padding: const EdgeInsets.all(16.0),
        children: [
          // Tools Section
          if (_tools.isNotEmpty)
            Card(
              color: Colors.blue.shade50,
              child: Padding(
                padding: const EdgeInsets.all(16.0),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Required Tools', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
                    const SizedBox(height: 8),
                    Wrap(
                      spacing: 8,
                      children: _tools.map((t) => Chip(
                        avatar: const Icon(Icons.handyman, size: 16),
                        label: Text(t),
                      )).toList(),
                    )
                  ],
                ),
              ),
            ),
            
          const SizedBox(height: 16),
          
          // Checklist
          const Text('Checklist', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 8),
          ..._checklist.map((item) => Padding(
            padding: const EdgeInsets.only(bottom: 8.0),
            child: InkWell(
              onTap: () {
                setState(() => _checklistState[item] = !_checklistState[item]!);
              },
              child: Container(
                padding: const EdgeInsets.all(16.0),
                decoration: BoxDecoration(
                  border: Border.all(color: _checklistState[item]! ? Colors.green : Colors.grey.shade300, width: 2),
                  borderRadius: BorderRadius.circular(8),
                  color: _checklistState[item]! ? Colors.green.shade50 : Colors.white,
                ),
                child: Row(
                  children: [
                    Icon(
                      _checklistState[item]! ? Icons.check_circle : Icons.radio_button_unchecked,
                      size: 32, // Large touch target
                      color: _checklistState[item]! ? Colors.green : Colors.grey,
                    ),
                    const SizedBox(width: 16),
                    Expanded(child: Text(item, style: const TextStyle(fontSize: 16))),
                  ],
                ),
              ),
            ),
          )).toList(),
          
          const SizedBox(height: 24),
          
          // Evidence
          const Text('Evidence Required', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18)),
          const SizedBox(height: 8),
          ElevatedButton.icon(
            onPressed: _captureEvidence,
            icon: const Icon(Icons.camera_alt, size: 30),
            label: Text('Capture $_photosCaptured / ${_evidenceNeeded.length} Photos'),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size.fromHeight(60),
              backgroundColor: _photosCaptured >= _evidenceNeeded.length ? Colors.green : Colors.blue,
              foregroundColor: Colors.white,
            ),
          ),
          
          const SizedBox(height: 24),
          
          // Blocking Timer Display (FR-5.25)
          if (isTimerActive)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(color: Colors.orange.shade100, borderRadius: BorderRadius.circular(8)),
              child: Column(
                children: [
                  const Icon(Icons.timer, size: 40, color: Colors.deepOrange),
                  const SizedBox(height: 8),
                  Text('Wait ${(_secondsRemaining / 60).ceil()} minutes before continuing.', 
                    style: const TextStyle(fontWeight: FontWeight.bold, color: Colors.deepOrange)),
                  const Text('Suggestion: Move to another opening.', textAlign: TextAlign.center),
                ],
              ),
            ),
            
          const SizedBox(height: 40),
          
          // Final Actions
          Row(
            children: [
              Expanded(
                child: OutlinedButton(
                  onPressed: () => Navigator.pushNamed(context, '/override_request'),
                  style: OutlinedButton.styleFrom(minimumSize: const Size.fromHeight(60)),
                  child: const Text('Request Override', style: TextStyle(color: Colors.red)),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                flex: 2,
                child: ElevatedButton(
                  onPressed: isTimerActive ? null : _completeStep,
                  style: ElevatedButton.styleFrom(
                    minimumSize: const Size.fromHeight(60),
                    backgroundColor: Colors.green.shade700,
                  ),
                  child: const Text('Complete Step', style: TextStyle(color: Colors.white, fontSize: 18)),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}
