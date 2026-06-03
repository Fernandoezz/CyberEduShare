class AnswerModel {
  final String id;
  final String body;
  final String answeredByName;
  final int upvoteCount;
  final bool isAccepted;
  final String createdAt;

  AnswerModel({
    required this.id,
    required this.body,
    required this.answeredByName,
    required this.upvoteCount,
    required this.isAccepted,
    required this.createdAt,
  });

  factory AnswerModel.fromJson(Map<String, dynamic> json) => AnswerModel(
        id:              json['_id'] ?? '',
        body:            json['body'] ?? '',
        answeredByName:  json['answeredByName'] ?? '',
        upvoteCount:     (json['upvotes'] as List?)?.length ?? 0,
        isAccepted:      json['isAccepted'] ?? false,
        createdAt:       json['createdAt'] ?? '',
      );
}

class QuestionModel {
  final String id;
  final String title;
  final String body;
  final String subject;
  final List<String> tags;
  final String askedByName;
  final int upvoteCount;
  final int answerCount;
  final bool isSolved;
  final List<AnswerModel> answers;
  final String createdAt;

  QuestionModel({
    required this.id,
    required this.title,
    required this.body,
    required this.subject,
    required this.tags,
    required this.askedByName,
    required this.upvoteCount,
    required this.answerCount,
    required this.isSolved,
    required this.answers,
    required this.createdAt,
  });

  factory QuestionModel.fromJson(Map<String, dynamic> json) => QuestionModel(
        id:          json['_id'] ?? '',
        title:       json['title'] ?? '',
        body:        json['body'] ?? '',
        subject:     json['subject'] ?? '',
        tags:        List<String>.from(json['tags'] ?? []),
        askedByName: json['askedByName'] ?? '',
        upvoteCount: (json['upvotes'] as List?)?.length ?? 0,
        answerCount: (json['answers'] as List?)?.length ?? 0,
        isSolved:    json['isSolved'] ?? false,
        answers:     (json['answers'] as List? ?? [])
            .map((a) => AnswerModel.fromJson(a))
            .toList(),
        createdAt:   json['createdAt'] ?? '',
      );
}