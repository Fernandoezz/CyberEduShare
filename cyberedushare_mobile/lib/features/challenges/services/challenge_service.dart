import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/challenge_model.dart';

class ChallengeService {
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  Map<String, String> _headers(String token) => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  Future<List<ChallengeModel>> getChallenges({
    required String token,
    String? category,
    String? difficulty,
  }) async {
    final params = <String, String>{};
    if (category != null && category.isNotEmpty) params['category'] = category;
    if (difficulty != null && difficulty.isNotEmpty)
      params['difficulty'] = difficulty;

    final uri = Uri.parse(
      '$_baseUrl/challenges',
    ).replace(queryParameters: params);
    final response = await http.get(uri, headers: _headers(token));
    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return (data as List).map((c) => ChallengeModel.fromJson(c)).toList();
    }
    throw data['message'] ?? 'Failed to fetch challenges';
  }

  Future<ChallengeModel> getChallenge({
    required String token,
    required String id,
  }) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/challenges/$id'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return ChallengeModel.fromJson(data);
    throw data['message'] ?? 'Failed to fetch challenge';
  }

  Future<Map<String, dynamic>> submitFlag({
    required String token,
    required String challengeId,
    required String flag,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/challenges/$challengeId/submit'),
      headers: _headers(token),
      body: jsonEncode({'flag': flag}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return data;
    throw data['message'] ?? 'Failed to submit flag';
  }

  Future<Map<String, dynamic>> unlockHint({
    required String token,
    required String challengeId,
    required int hintIndex,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/challenges/$challengeId/hint'),
      headers: _headers(token),
      body: jsonEncode({'hintIndex': hintIndex}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return data;
    throw data['message'] ?? 'Failed to unlock hint';
  }

  Future<List<LeaderboardEntry>> getLeaderboard({required String token}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/challenges/leaderboard'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return (data as List).map((e) => LeaderboardEntry.fromJson(e)).toList();
    }
    throw data['message'] ?? 'Failed to fetch leaderboard';
  }
}
