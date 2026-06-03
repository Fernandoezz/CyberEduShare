class RecommendationModel {
  final String id;
  final String title;
  final String description;
  final String subject;
  final String difficulty;
  final String type;
  final String uploaderName;
  final String fileUrl;
  final double averageRating;
  final double score;

  RecommendationModel({
    required this.id,
    required this.title,
    required this.description,
    required this.subject,
    required this.difficulty,
    required this.type,
    required this.uploaderName,
    required this.fileUrl,
    required this.averageRating,
    required this.score,
  });

  factory RecommendationModel.fromJson(Map<String, dynamic> json) =>
      RecommendationModel(
        id:            json['id']?.toString() ?? '',
        title:         json['title'] ?? '',
        description:   json['description'] ?? '',
        subject:       json['subject'] ?? '',
        difficulty:    json['difficulty'] ?? 'Medium',
        type:          json['type'] ?? '',
        uploaderName:  json['uploaderName'] ?? '',
        fileUrl:       json['fileUrl'] ?? '',
        averageRating: (json['averageRating'] ?? 0).toDouble(),
        score:         (json['score'] ?? 0).toDouble(),
      );
}