import 'package:flutter/material.dart';
import '../models/performance_model.dart';
import '../services/performance_service.dart';

enum PerformanceStatus { idle, loading, success, error }

class PerformanceProvider extends ChangeNotifier {
  final PerformanceService _service = PerformanceService();

  PerformanceStatus _status = PerformanceStatus.idle;
  String _errorMessage = '';
  PerformanceData? _data;
  List<LearningPathStep> _learningPath = [];
  bool _learningPathLoading = false;

  PerformanceStatus get status => _status;
  String get errorMessage => _errorMessage;
  PerformanceData? get data => _data;
  List<LearningPathStep> get learningPath => _learningPath;
  bool get isLoading => _status == PerformanceStatus.loading;
  bool get learningPathLoading => _learningPathLoading;

  Future<void> loadPerformance({required String token}) async {
    _setStatus(PerformanceStatus.loading);
    try {
      _data = await _service.getPerformance(token: token);
      _setStatus(PerformanceStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(PerformanceStatus.error);
    }
  }

  Future<void> loadLearningPath({required String token}) async {
    _learningPathLoading = true;
    notifyListeners();
    try {
      _learningPath = await _service.getLearningPath(token: token);
    } catch (e) {
      _errorMessage = e.toString();
    }
    _learningPathLoading = false;
    notifyListeners();
  }

  void _setStatus(PerformanceStatus s) {
    _status = s;
    notifyListeners();
  }
}