import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/performance_model.dart';

class PerformanceService {
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  Map<String, String> _headers(String token) => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  Future<PerformanceData> getPerformance({required String token}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/performance'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return PerformanceData.fromJson(data);
    throw data['message'] ?? 'Failed to fetch performance';
  }

  Future<List<LearningPathStep>> getLearningPath({
    required String token,
  }) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/performance/learning-path'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return (data['learningPath'] as List? ?? [])
          .map((s) => LearningPathStep.fromJson(s))
          .toList();
    }
    throw data['message'] ?? 'Failed to fetch learning path';
  }
}
