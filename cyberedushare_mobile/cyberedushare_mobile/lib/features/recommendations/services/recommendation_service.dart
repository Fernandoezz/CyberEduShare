import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/recommendation_model.dart';

class RecommendationService {
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  Map<String, String> _headers(String token) => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  Future<List<RecommendationModel>> getRecommendations({
    required String token,
  }) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/recommendations'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      final list = data['recommendations'] as List? ?? [];
      return list.map((r) => RecommendationModel.fromJson(r)).toList();
    }
    throw data['message'] ?? 'Failed to fetch recommendations';
  }
}
