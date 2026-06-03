import 'dart:convert';
import 'dart:io';
import 'package:http/http.dart' as http;
import 'package:http_parser/http_parser.dart';
import '../models/content_model.dart';

class ContentService {
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  // ── SEARCH RESOURCES
  Future<Map<String, dynamic>> searchResources({
    required String token,
    String query = '',
    String? subject,
    String? difficulty,
    String? type,
    int page = 1,
  }) async {
    final params = <String, String>{'page': page.toString()};
    if (query.isNotEmpty) params['q'] = query;
    if (subject != null && subject.isNotEmpty) params['subject'] = subject;
    if (difficulty != null && difficulty.isNotEmpty)
      params['difficulty'] = difficulty;
    if (type != null && type.isNotEmpty) params['type'] = type;

    final uri = Uri.parse(
      '$_baseUrl/content/search',
    ).replace(queryParameters: params);

    final response = await http.get(
      uri,
      headers: {'Authorization': 'Bearer $token'},
    );

    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {
        'results':
            (data['results'] as List)
                .map((e) => ContentModel.fromJson(e))
                .toList(),
        'total': data['total'],
        'totalPages': data['totalPages'],
      };
    }
    throw data['message'] ?? 'Search failed';
  }

  // ── GET SINGLE RESOURCE
  Future<Map<String, dynamic>> getResource({
    required String token,
    required String id,
  }) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/content/$id'),
      headers: {'Authorization': 'Bearer $token'},
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {
        'content': ContentModel.fromJson(data['content']),
        'related':
            (data['related'] as List)
                .map((e) => ContentModel.fromJson(e))
                .toList(),
      };
    }
    throw data['message'] ?? 'Failed to fetch resource';
  }

  // ── UPLOAD RESOURCE
  Future<ContentModel> uploadResource({
    required String token,
    required String title,
    required String subject,
    required String difficulty,
    required String type,
    required String tags,
    required String description,
    required File file,
  }) async {
    final request = http.MultipartRequest(
      'POST',
      Uri.parse('$_baseUrl/content'),
    );

    request.headers['Authorization'] = 'Bearer $token';
    request.fields['title'] = title;
    request.fields['subject'] = subject;
    request.fields['difficulty'] = difficulty;
    request.fields['type'] = type;
    request.fields['tags'] = tags;
    request.fields['description'] = description;

    // Detect content type
    String mimeType = 'application/octet-stream';
    final ext = file.path.split('.').last.toLowerCase();
    const mimeMap = {
      'pdf': 'application/pdf',
      'zip': 'application/zip',
      'mp4': 'video/mp4',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'png': 'image/png',
    };
    mimeType = mimeMap[ext] ?? mimeType;
    final parts = mimeType.split('/');

    request.files.add(
      await http.MultipartFile.fromPath(
        'file',
        file.path,
        contentType: MediaType(parts[0], parts[1]),
      ),
    );

    final streamed = await request.send();
    final response = await http.Response.fromStream(streamed);
    final data = jsonDecode(response.body);

    if (response.statusCode == 201) return ContentModel.fromJson(data);
    throw data['message'] ?? 'Upload failed';
  }

  // ── TOGGLE BOOKMARK
  Future<bool> toggleBookmark({
    required String token,
    required String contentId,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/content/$contentId/bookmark'),
      headers: {'Authorization': 'Bearer $token'},
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return data['bookmarked'] as bool;
    throw data['message'] ?? 'Failed to bookmark';
  }

  // ── RATE RESOURCE
  Future<void> rateResource({
    required String token,
    required String contentId,
    required int score,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/content/$contentId/rate'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'score': score}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode != 200) throw data['message'] ?? 'Failed to rate';
  }

  // ── GET BOOKMARKS
  Future<List<ContentModel>> getBookmarks({required String token}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/content/bookmarks'),
      headers: {'Authorization': 'Bearer $token'},
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return (data as List).map((e) => ContentModel.fromJson(e)).toList();
    }
    throw data['message'] ?? 'Failed to fetch bookmarks';
  }
}
