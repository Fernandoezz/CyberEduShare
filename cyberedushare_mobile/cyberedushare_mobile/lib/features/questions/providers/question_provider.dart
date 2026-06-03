import 'package:flutter/material.dart';
import '../models/question_model.dart';
import '../services/question_service.dart';

enum QuestionStatus { idle, loading, success, error }

class QuestionProvider extends ChangeNotifier {
  final QuestionService _service = QuestionService();

  QuestionStatus _status = QuestionStatus.idle;
  String _errorMessage = '';
  List<QuestionModel> _questions = [];
  QuestionModel? _selectedQuestion;
  int _total = 0;

  QuestionStatus get status => _status;
  String get errorMessage => _errorMessage;
  List<QuestionModel> get questions => _questions;
  QuestionModel? get selectedQuestion => _selectedQuestion;
  int get total => _total;
  bool get isLoading => _status == QuestionStatus.loading;

  // ── LOAD QUESTIONS
  Future<void> loadQuestions({
    required String token,
    String query = '',
    String? subject,
  }) async {
    _setStatus(QuestionStatus.loading);
    try {
      final result = await _service.getQuestions(
          token: token, query: query, subject: subject);
      _questions = result['questions'];
      _total = result['total'];
      _setStatus(QuestionStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(QuestionStatus.error);
    }
  }

  // ── LOAD SINGLE QUESTION
  Future<void> loadQuestion({
    required String token,
    required String id,
  }) async {
    _setStatus(QuestionStatus.loading);
    try {
      _selectedQuestion = await _service.getQuestion(token: token, id: id);
      _setStatus(QuestionStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(QuestionStatus.error);
    }
  }

  // ── POST QUESTION
  Future<bool> postQuestion({
    required String token,
    required String title,
    required String body,
    required String subject,
    required String tags,
  }) async {
    _setStatus(QuestionStatus.loading);
    try {
      final newQ = await _service.postQuestion(
        token: token,
        title: title,
        body: body,
        subject: subject,
        tags: tags,
      );
      _questions.insert(0, newQ);
      _setStatus(QuestionStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(QuestionStatus.error);
      return false;
    }
  }

  // ── UPVOTE QUESTION
  Future<void> upvoteQuestion({
    required String token,
    required String id,
  }) async {
    try {
      await _service.upvoteQuestion(token: token, id: id);
      // Refresh the question list item locally
      await loadQuestions(token: token);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // ── POST ANSWER
  Future<bool> postAnswer({
    required String token,
    required String questionId,
    required String body,
  }) async {
    _setStatus(QuestionStatus.loading);
    try {
      _selectedQuestion = await _service.postAnswer(
          token: token, questionId: questionId, body: body);
      _setStatus(QuestionStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(QuestionStatus.error);
      return false;
    }
  }

  // ── UPVOTE ANSWER
  Future<void> upvoteAnswer({
    required String token,
    required String questionId,
    required String answerId,
  }) async {
    try {
      await _service.upvoteAnswer(
          token: token, questionId: questionId, answerId: answerId);
      await loadQuestion(token: token, id: questionId);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // ── ACCEPT ANSWER
  Future<void> acceptAnswer({
    required String token,
    required String questionId,
    required String answerId,
  }) async {
    try {
      await _service.acceptAnswer(
          token: token, questionId: questionId, answerId: answerId);
      await loadQuestion(token: token, id: questionId);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = '';
    _status = QuestionStatus.idle;
    notifyListeners();
  }

  void _setStatus(QuestionStatus status) {
    _status = status;
    notifyListeners();
  }
}