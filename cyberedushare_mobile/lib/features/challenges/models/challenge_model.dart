class HintModel {
  final String id;
  final int index;
  final int penalty;
  String? unlockedText; // null until unlocked

  HintModel({
    required this.id,
    required this.index,
    required this.penalty,
    this.unlockedText,
  });

  factory HintModel.fromJson(Map<String, dynamic> json) => HintModel(
        id:      json['_id'] ?? '',
        index:   json['index'] ?? 1,
        penalty: json['penalty'] ?? 10,
      );
}

class ChallengeModel {
  final String id;
  final String title;
  final String description;
  final String category;
  final String difficulty;
  final int points;
  final List<HintModel> hints;
  final int solveCount;
  final bool isSolved;
  final int? pointsEarned;
  final String fileUrl;
  final DateTime createdAt;

  ChallengeModel({
    required this.id,
    required this.title,
    required this.description,
    required this.category,
    required this.difficulty,
    required this.points,
    required this.hints,
    required this.solveCount,
    required this.isSolved,
    this.pointsEarned,
    required this.fileUrl,
    required this.createdAt,
  });

  factory ChallengeModel.fromJson(Map<String, dynamic> json) => ChallengeModel(
        id:          json['_id'] ?? '',
        title:       json['title'] ?? '',
        description: json['description'] ?? '',
        category:    json['category'] ?? '',
        difficulty:  json['difficulty'] ?? 'Medium',
        points:      json['points'] ?? 250,
        hints:       (json['hints'] as List? ?? [])
            .map((h) => HintModel.fromJson(h))
            .toList(),
        solveCount:  json['solveCount'] ?? 0,
        isSolved:    json['isSolved'] ?? false,
        pointsEarned: json['pointsEarned'],
        fileUrl:     json['fileUrl'] ?? '',
        createdAt:   DateTime.tryParse(json['createdAt'] ?? '') ?? DateTime.now(),
      );
}

class LeaderboardEntry {
  final int rank;
  final String userId;
  final String username;
  final int totalPoints;
  final int solveCount;

  LeaderboardEntry({
    required this.rank,
    required this.userId,
    required this.username,
    required this.totalPoints,
    required this.solveCount,
  });

  factory LeaderboardEntry.fromJson(Map<String, dynamic> json) => LeaderboardEntry(
        rank:        json['rank'] ?? 0,
        userId:      json['userId'] ?? '',
        username:    json['username'] ?? '',
        totalPoints: json['totalPoints'] ?? 0,
        solveCount:  json['solveCount'] ?? 0,
      );
}