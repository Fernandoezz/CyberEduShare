class LabModel {
  final String id;
  final String title;
  final String description;
  final String subject;
  final String difficulty;
  final int duration; // minutes
  final List<String> instructions;
  final String vmUrl;
  final String vmUsername;
  final String vmPassword;
  final bool isActive;
  final bool alreadyCompleted;

  LabModel({
    required this.id,
    required this.title,
    required this.description,
    required this.subject,
    required this.difficulty,
    required this.duration,
    required this.instructions,
    required this.vmUrl,
    required this.vmUsername,
    required this.vmPassword,
    required this.isActive,
    this.alreadyCompleted = false,
  });

  factory LabModel.fromJson(Map<String, dynamic> json) => LabModel(
        id:               json['_id'] ?? '',
        title:            json['title'] ?? '',
        description:      json['description'] ?? '',
        subject:          json['subject'] ?? '',
        difficulty:       json['difficulty'] ?? 'Medium',
        duration:         json['duration'] ?? 60,
        instructions:     List<String>.from(json['instructions'] ?? []),
        vmUrl:            json['vmUrl'] ?? '',
        vmUsername:       json['vmUsername'] ?? '',
        vmPassword:       json['vmPassword'] ?? '',
        isActive:         json['isActive'] ?? true,
        alreadyCompleted: json['alreadyCompleted'] ?? false,
      );
}