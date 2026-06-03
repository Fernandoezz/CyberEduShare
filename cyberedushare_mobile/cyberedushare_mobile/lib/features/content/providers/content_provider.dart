import 'dart:io';
import 'package:flutter/material.dart';
import '../models/content_model.dart';
import '../services/content_service.dart';

enum ContentStatus { idle, loading, success, error }

class ContentProvider extends ChangeNotifier {
  final ContentService _service = ContentService();

  ContentStatus _status = ContentStatus.idle;
  String _errorMessage = '';
  List<ContentModel> _searchResults = [];
  List<ContentModel> _bookmarks = [];
  ContentModel? _selectedContent;
  List<ContentModel> _relatedContent = [];
  int _totalResults = 0;

  ContentStatus get status => _status;
  String get errorMessage => _errorMessage;
  List<ContentModel> get searchResults => _searchResults;
  List<ContentModel> get bookmarks => _bookmarks;
  ContentModel? get selectedContent => _selectedContent;
  List<ContentModel> get relatedContent => _relatedContent;
  int get totalResults => _totalResults;
  bool get isLoading => _status == ContentStatus.loading;

  // ── SEARCH
  Future<void> search({
    required String token,
    String query = '',
    String? subject,
    String? difficulty,
    String? type,
  }) async {
    _setStatus(ContentStatus.loading);
    try {
      final result = await _service.searchResources(
        token: token,
        query: query,
        subject: subject,
        difficulty: difficulty,
        type: type,
      );
      _searchResults = result['results'];
      _totalResults = result['total'];
      _setStatus(ContentStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(ContentStatus.error);
    }
  }

  // ── GET SINGLE RESOURCE
  Future<void> loadResource({
    required String token,
    required String id,
  }) async {
    _setStatus(ContentStatus.loading);
    try {
      final result = await _service.getResource(token: token, id: id);
      _selectedContent = result['content'];
      _relatedContent = result['related'];
      _setStatus(ContentStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(ContentStatus.error);
    }
  }

  // ── UPLOAD
  Future<bool> upload({
    required String token,
    required String title,
    required String subject,
    required String difficulty,
    required String type,
    required String tags,
    required String description,
    required File file,
  }) async {
    _setStatus(ContentStatus.loading);
    try {
      await _service.uploadResource(
        token: token,
        title: title,
        subject: subject,
        difficulty: difficulty,
        type: type,
        tags: tags,
        description: description,
        file: file,
      );
      _setStatus(ContentStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(ContentStatus.error);
      return false;
    }
  }

  // ── TOGGLE BOOKMARK
  Future<void> toggleBookmark({
    required String token,
    required String contentId,
  }) async {
    try {
      final isNowBookmarked =
          await _service.toggleBookmark(token: token, contentId: contentId);
      // Update selected content bookmark state locally
      if (_selectedContent?.id == contentId) {
        notifyListeners();
      }
      // Refresh bookmarks list
      await loadBookmarks(token: token);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // ── RATE
  Future<bool> rate({
    required String token,
    required String contentId,
    required int score,
  }) async {
    try {
      await _service.rateResource(
          token: token, contentId: contentId, score: score);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  // ── LOAD BOOKMARKS
  Future<void> loadBookmarks({required String token}) async {
    try {
      _bookmarks = await _service.getBookmarks(token: token);
      notifyListeners();
    } catch (e) {
      // silently fail
    }
  }

  bool isBookmarked(String contentId) =>
      _bookmarks.any((b) => b.id == contentId);

  void clearError() {
    _errorMessage = '';
    _status = ContentStatus.idle;
    notifyListeners();
  }

  void _setStatus(ContentStatus status) {
    _status = status;
    notifyListeners();
  }
}