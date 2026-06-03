class ContentModel {
  final String id;
  final String title;
  final String description;
  final String subject;
  final String difficulty;
  final String type;
  final List<String> tags;
  final String fileUrl;
  final String uploaderName;
  final bool isVerified;
  final int bookmarkCount;
  final double averageRating;
  final String createdAt;

  ContentModel({
    required this.id,
    required this.title,
    required this.description,
    required this.subject,
    required this.difficulty,
    required this.type,
    required this.tags,
    required this.fileUrl,
    required this.uploaderName,
    required this.isVerified,
    required this.bookmarkCount,
    required this.averageRating,
    required this.createdAt,
  });

  factory ContentModel.fromJson(Map<String, dynamic> json) {
    return ContentModel(
      id:            json['_id'] ?? '',
      title:         json['title'] ?? '',
      description:   json['description'] ?? '',
      subject:       json['subject'] ?? '',
      difficulty:    json['difficulty'] ?? 'Medium',
      type:          json['type'] ?? 'PDF',
      tags:          List<String>.from(json['tags'] ?? []),
      fileUrl:       json['fileUrl'] ?? '',
      uploaderName:  json['uploaderName'] ?? '',
      isVerified:    json['isVerified'] ?? false,
      bookmarkCount: (json['bookmarks'] as List?)?.length ?? 0,
      averageRating: double.tryParse(
              json['averageRating']?.toString() ?? '0') ?? 0.0,
      createdAt:     json['createdAt'] ?? '',
    );
  }
}