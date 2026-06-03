class ProjectComment {
  final String id;
  final String body;
  final String commentedByName;
  final String createdAt;

  ProjectComment({
    required this.id,
    required this.body,
    required this.commentedByName,
    required this.createdAt,
  });

  factory ProjectComment.fromJson(Map<String, dynamic> json) => ProjectComment(
        id:                json['_id'] ?? '',
        body:              json['body'] ?? '',
        commentedByName:   json['commentedByName'] ?? '',
        createdAt:         json['createdAt'] ?? '',
      );
}

class ProjectModel {
  final String id;
  final String title;
  final String description;
  final String subject;
  final List<String> techStack;
  final String submittedByName;
  final int likeCount;
  final int commentCount;
  final String? fileUrl;
  final List<ProjectComment> comments;
  final String createdAt;

  ProjectModel({
    required this.id,
    required this.title,
    required this.description,
    required this.subject,
    required this.techStack,
    required this.submittedByName,
    required this.likeCount,
    required this.commentCount,
    this.fileUrl,
    required this.comments,
    required this.createdAt,
  });

  factory ProjectModel.fromJson(Map<String, dynamic> json) => ProjectModel(
        id:              json['_id'] ?? '',
        title:           json['title'] ?? '',
        description:     json['description'] ?? '',
        subject:         json['subject'] ?? '',
        techStack:       List<String>.from(json['techStack'] ?? []),
        submittedByName: json['submittedByName'] ?? '',
        likeCount:       (json['likes'] as List?)?.length ?? 0,
        commentCount:    (json['comments'] as List?)?.length ?? 0,
        fileUrl:         json['fileUrl'],
        comments:        (json['comments'] as List? ?? [])
            .map((c) => ProjectComment.fromJson(c))
            .toList(),
        createdAt:       json['createdAt'] ?? '',
      );
}