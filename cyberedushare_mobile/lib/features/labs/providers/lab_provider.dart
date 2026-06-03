import 'package:flutter/material.dart';
import '../models/lab_model.dart';
import '../services/lab_service.dart';

enum LabStatus { idle, loading, success, error }

class LabProvider extends ChangeNotifier {
  final LabService _service = LabService();

  LabStatus _status = LabStatus.idle;
  String _errorMessage = '';
  List<LabModel> _labs = [];
  LabModel? _selectedLab;

  LabStatus get status => _status;
  String get errorMessage => _errorMessage;
  List<LabModel> get labs => _labs;
  LabModel? get selectedLab => _selectedLab;
  bool get isLoading => _status == LabStatus.loading;

  // ── LOAD LABS
  Future<void> loadLabs({
    required String token,
    String? subject,
    String? difficulty,
  }) async {
    _setStatus(LabStatus.loading);
    try {
      _labs = await _service.getLabs(
          token: token, subject: subject, difficulty: difficulty);
      _setStatus(LabStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(LabStatus.error);
    }
  }

  // ── LOAD SINGLE LAB
  Future<void> loadLab({
    required String token,
    required String id,
  }) async {
    _setStatus(LabStatus.loading);
    try {
      _selectedLab = await _service.getLab(token: token, id: id);
      _setStatus(LabStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(LabStatus.error);
    }
  }

  // ── SUBMIT COMPLETION
  Future<bool> submitCompletion({
    required String token,
    required String labId,
    required int timeTaken,
  }) async {
    try {
      await _service.submitCompletion(
          token: token, labId: labId, timeTaken: timeTaken);
      // Mark locally as completed
      if (_selectedLab?.id == labId) {
        _selectedLab = LabModel(
          id: _selectedLab!.id,
          title: _selectedLab!.title,
          description: _selectedLab!.description,
          subject: _selectedLab!.subject,
          difficulty: _selectedLab!.difficulty,
          duration: _selectedLab!.duration,
          instructions: _selectedLab!.instructions,
          vmUrl: _selectedLab!.vmUrl,
          vmUsername: _selectedLab!.vmUsername,
          vmPassword: _selectedLab!.vmPassword,
          isActive: _selectedLab!.isActive,
          alreadyCompleted: true,
        );
        notifyListeners();
      }
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _errorMessage = '';
    _status = LabStatus.idle;
    notifyListeners();
  }

  void _setStatus(LabStatus s) {
    _status = s;
    notifyListeners();
  }
}