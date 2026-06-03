import 'package:flutter/material.dart';
import '../models/challenge_model.dart';
import '../services/challenge_service.dart';

enum ChallengeStatus { idle, loading, success, error }

class ChallengeProvider extends ChangeNotifier {
  final ChallengeService _service = ChallengeService();

  ChallengeStatus _status = ChallengeStatus.idle;
  String _errorMessage = '';
  List<ChallengeModel> _challenges = [];
  ChallengeModel? _selectedChallenge;
  List<LeaderboardEntry> _leaderboard = [];

  ChallengeStatus get status => _status;
  String get errorMessage => _errorMessage;
  List<ChallengeModel> get challenges => _challenges;
  ChallengeModel? get selectedChallenge => _selectedChallenge;
  List<LeaderboardEntry> get leaderboard => _leaderboard;
  bool get isLoading => _status == ChallengeStatus.loading;

  Future<void> loadChallenges({
    required String token,
    String? category,
    String? difficulty,
  }) async {
    _setStatus(ChallengeStatus.loading);
    try {
      _challenges = await _service.getChallenges(
          token: token, category: category, difficulty: difficulty);
      _setStatus(ChallengeStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(ChallengeStatus.error);
    }
  }

  Future<void> loadChallenge({
    required String token,
    required String id,
  }) async {
    _setStatus(ChallengeStatus.loading);
    try {
      _selectedChallenge = await _service.getChallenge(token: token, id: id);
      _setStatus(ChallengeStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(ChallengeStatus.error);
    }
  }

  // Returns result map or throws error string
  Future<Map<String, dynamic>> submitFlag({
    required String token,
    required String challengeId,
    required String flag,
  }) async {
    try {
      final result = await _service.submitFlag(
          token: token, challengeId: challengeId, flag: flag);
      // Update local state
      if (_selectedChallenge?.id == challengeId) {
        final c = _selectedChallenge!;
        _selectedChallenge = ChallengeModel(
          id: c.id, title: c.title, description: c.description,
          category: c.category, difficulty: c.difficulty,
          points: c.points, hints: c.hints,
          solveCount: (result['solveCount'] ?? c.solveCount + 1),
          isSolved: true,
          pointsEarned: result['pointsEarned'],
          fileUrl: c.fileUrl, createdAt: c.createdAt,
        );
        notifyListeners();
      }
      return result;
    } catch (e) {
      throw e.toString();
    }
  }

  Future<String> unlockHint({
    required String token,
    required String challengeId,
    required int hintIndex,
  }) async {
    try {
      final result = await _service.unlockHint(
          token: token, challengeId: challengeId, hintIndex: hintIndex);
      // Update hint text locally
      if (_selectedChallenge != null) {
        final hints = List<HintModel>.from(_selectedChallenge!.hints);
        if (hintIndex < hints.length) {
          hints[hintIndex].unlockedText = result['text'];
        }
        _selectedChallenge = ChallengeModel(
          id: _selectedChallenge!.id,
          title: _selectedChallenge!.title,
          description: _selectedChallenge!.description,
          category: _selectedChallenge!.category,
          difficulty: _selectedChallenge!.difficulty,
          points: _selectedChallenge!.points,
          hints: hints,
          solveCount: _selectedChallenge!.solveCount,
          isSolved: _selectedChallenge!.isSolved,
          pointsEarned: _selectedChallenge!.pointsEarned,
          fileUrl: _selectedChallenge!.fileUrl,
          createdAt: _selectedChallenge!.createdAt,
        );
        notifyListeners();
      }
      return result['text'] ?? '';
    } catch (e) {
      throw e.toString();
    }
  }

  Future<void> loadLeaderboard({required String token}) async {
    try {
      _leaderboard = await _service.getLeaderboard(token: token);
      notifyListeners();
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  void clearError() {
    _errorMessage = '';
    _status = ChallengeStatus.idle;
    notifyListeners();
  }

  void _setStatus(ChallengeStatus s) {
    _status = s;
    notifyListeners();
  }
}