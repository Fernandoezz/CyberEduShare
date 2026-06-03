import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/lab_model.dart';

class LabService {
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  Map<String, String> _headers(String token) => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  // ── GET ALL LABS
  Future<List<LabModel>> getLabs({
    required String token,
    String? subject,
    String? difficulty,
  }) async {
    final params = <String, String>{};
    if (subject != null && subject.isNotEmpty) params['subject'] = subject;
    if (difficulty != null && difficulty.isNotEmpty)
      params['difficulty'] = difficulty;

    final uri = Uri.parse('$_baseUrl/labs').replace(queryParameters: params);

    final response = await http.get(uri, headers: _headers(token));
    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return (data as List).map((l) => LabModel.fromJson(l)).toList();
    }
    throw data['message'] ?? 'Failed to fetch labs';
  }

  // ── GET SINGLE LAB
  Future<LabModel> getLab({required String token, required String id}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/labs/$id'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return LabModel.fromJson(data);
    throw data['message'] ?? 'Failed to fetch lab';
  }

  // ── SUBMIT COMPLETION
  Future<void> submitCompletion({
    required String token,
    required String labId,
    required int timeTaken,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/labs/$labId/complete'),
      headers: _headers(token),
      body: jsonEncode({'timeTaken': timeTaken}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode != 200)
      throw data['message'] ?? 'Failed to submit completion';
  }
}
