import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../models/project_model.dart';

class ProjectService {
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  Map<String, String> _headers(String token) => {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  };

  // ── GET PROJECTS
  Future<Map<String, dynamic>> getProjects({
    required String token,
    String query = '',
    String? subject,
    String? tech,
    int page = 1,
  }) async {
    final params = <String, String>{'page': page.toString()};
    if (query.isNotEmpty) params['q'] = query;
    if (subject != null && subject.isNotEmpty) params['subject'] = subject;
    if (tech != null && tech.isNotEmpty) params['tech'] = tech;

    final uri = Uri.parse(
      '$_baseUrl/projects',
    ).replace(queryParameters: params);

    final response = await http.get(uri, headers: _headers(token));
    final data = jsonDecode(response.body);

    if (response.statusCode == 200) {
      return {
        'projects':
            (data['projects'] as List)
                .map((p) => ProjectModel.fromJson(p))
                .toList(),
        'total': data['total'],
      };
    }
    throw data['message'] ?? 'Failed to fetch projects';
  }

  // ── GET SINGLE PROJECT
  Future<ProjectModel> getProject({
    required String token,
    required String id,
  }) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/projects/$id'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return ProjectModel.fromJson(data);
    throw data['message'] ?? 'Failed to fetch project';
  }

  // ── SUBMIT PROJECT
  Future<ProjectModel> submitProject({
    required String token,
    required String title,
    required String description,
    required String subject,
    required String techStack,
    File? file,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$_baseUrl/projects'),
    );

    request.headers['Authorization'] = 'Bearer $token';
    request.fields['title'] = title;
    request.fields['description'] = description;
    request.fields['subject'] = subject;
    request.fields['techStack'] = techStack;

    if (file != null) {
      final ext = file.path.split('.').last.toLowerCase();
      const mimeMap = {
        'pdf': 'application/pdf',
        'zip': 'application/zip',
        'mp4': 'video/mp4',
        'jpg': 'image/jpeg',
        'jpeg': 'image/jpeg',
        'png': 'image/png',
      };
      final mime = mimeMap[ext] ?? 'application/octet-stream';
      final parts = mime.split('/');
      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          file.path,
          contentType: MediaType(parts[0], parts[1]),
        ),
      );
    }

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final data = jsonDecode(response.body);

    if (response.statusCode == 201) return ProjectModel.fromJson(data);
    throw data['message'] ?? 'Failed to submit project';
  }

  // ── TOGGLE LIKE
  Future<Map<String, dynamic>> toggleLike({
    required String token,
    required String id,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/projects/$id/like'),
      headers: _headers(token),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return data;
    throw data['message'] ?? 'Failed to like project';
  }

  // ── POST COMMENT
  Future<ProjectModel> postComment({
    required String token,
    required String projectId,
    required String body,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/projects/$projectId/comments'),
      headers: _headers(token),
      body: jsonEncode({'body': body}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 201) return ProjectModel.fromJson(data);
    throw data['message'] ?? 'Failed to post comment';
  }
}
