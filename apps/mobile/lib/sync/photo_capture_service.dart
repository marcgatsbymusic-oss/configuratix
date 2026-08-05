import 'dart:io';
import 'package:image/image.dart' as img;
import 'outbox_manager.dart';

class PhotoCaptureService {
  final OutboxManager outboxManager;

  PhotoCaptureService(this.outboxManager);

  /// Captures a photo, compresses it per policy, and queues it in the outbox.
  Future<void> captureAndQueuePhoto({
    required File rawImageFile,
    required String openingId,
    required String stepInstanceId,
    required String photoTag,
  }) async {
    // 1. Read raw image
    final rawBytes = await rawImageFile.readAsBytes();
    final decodedImage = img.decodeImage(rawBytes);

    if (decodedImage == null) {
      throw Exception('Failed to decode image');
    }

    // 2. Compress (e.g. max width 1920, 80% JPEG quality)
    // This addresses the bandwidth constraints calculated in Prompt 7.
    final resized = img.copyResize(decodedImage, width: 1920);
    final compressedBytes = img.encodeJpg(resized, quality: 80);

    // In a real app, write compressedBytes to local storage and get path
    final localPath = '${rawImageFile.parent.path}/compressed_${DateTime.now().millisecondsSinceEpoch}.jpg';
    final compressedFile = File(localPath);
    await compressedFile.writeAsBytes(compressedBytes);

    // 3. Queue to outbox
    final outboxItem = OutboxItem(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      entityType: 'EvidencePhoto',
      entityId: localPath, // Will be replaced by UUID on server
      operation: 'CREATE',
      payload: {
        'openingId': openingId,
        'stepInstanceId': stepInstanceId,
        'tag': photoTag,
        'localPath': localPath, // Sync agent will upload file alongside payload
      },
      timestamp: DateTime.now(),
    );

    outboxManager.enqueue(outboxItem);
  }
}
