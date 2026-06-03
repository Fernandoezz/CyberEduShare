import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/question_model.dart';

class QuestionService {
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  Map<String, String> _headers(String token) => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  // ── GET QUESTIONS
  Future<Map<String, dynamic>> getQuestions({
    required String token,
    String query = '',
    String? subject,
    int page = 1,
  }) async {
    final params = <String, String>{'page': page.toString()};
    if (query.isNotEmpty) params['q'] = query;
    if (subject != null && subject.isNotEmpty) params['subject'] = subject;

    final uri = Uri.parse(
      '$_baseUrl/questions',
    ).replace(queryParameters: params);

    final response = await http.get(uri, headers: _headers(token));
    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return {
        'questions':
            (data['questions'] as List)
                .map((q) => QuestionModel.fromJson(q))
                .toList(),
        'total': data['total'],
      };
    }
    throw data['message'] ?? 'Failed to fetch questions';
  }

  // ── GET SINGLE QUESTION
  Future<QuestionModel> getQuestion({
    required String token,
    required String id,
  }) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/questions/$id'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return QuestionModel.fromJson(data);
    throw data['message'] ?? 'Failed to fetch question';
  }

  // ── POST QUESTION
  Future<QuestionModel> postQuestion({
    required String token,
    required String title,
    required String body,
    required String subject,
    required String tags,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/questions'),
      headers: _headers(token),
      body: jsonEncode({
        'title': title,
        'body': body,
        'subject': subject,
        'tags': tags,
      }),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 201) return QuestionModel.fromJson(data);
    throw data['message'] ?? 'Failed to post question';
  }

  // ── UPVOTE QUESTION
  Future<Map<String, dynamic>> upvoteQuestion({
    required String token,
    required String id,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/questions/$id/upvote'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return data;
    throw data['message'] ?? 'Failed to upvote';
  }

  // ── POST ANSWER
  Future<QuestionModel> postAnswer({
    required String token,
    required String questionId,
    required String body,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/questions/$questionId/answers'),
      headers: _headers(token),
      body: jsonEncode({'body': body}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 201) return QuestionModel.fromJson(data);
    throw data['message'] ?? 'Failed to post answer';
  }

  // ── UPVOTE ANSWER
  Future<Map<String, dynamic>> upvoteAnswer({
    required String token,
    required String questionId,
    required String answerId,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/questions/$questionId/answers/$answerId/upvote'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return data;
    throw data['message'] ?? 'Failed to upvote answer';
  }

  // ── ACCEPT ANSWER
  Future<void> acceptAnswer({
    required String token,
    required String questionId,
    required String answerId,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/questions/$questionId/answers/$answerId/accept'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode != 200)
      throw data['message'] ?? 'Failed to accept answer';
  }
}
