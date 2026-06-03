class PerformanceStats {
  final int resourcesBookmarked;
  final int resourcesUploaded;
  final int questionsAsked;
  final int answersGiven;
  final int projectsSubmitted;
  final int labsCompleted;
  final int challengesSolved;
  final int ctfScore;
  final int? ctfRank;

  PerformanceStats({
    required this.resourcesBookmarked,
    required this.resourcesUploaded,
    required this.questionsAsked,
    required this.answersGiven,
    required this.projectsSubmitted,
    required this.labsCompleted,
    required this.challengesSolved,
    required this.ctfScore,
    this.ctfRank,
  });

  factory PerformanceStats.fromJson(Map<String, dynamic> json) =>
      PerformanceStats(
        resourcesBookmarked: json['resourcesBookmarked'] ?? 0,
        resourcesUploaded:   json['resourcesUploaded'] ?? 0,
        questionsAsked:      json['questionsAsked'] ?? 0,
        answersGiven:        json['answersGiven'] ?? 0,
        projectsSubmitted:   json['projectsSubmitted'] ?? 0,
        labsCompleted:       json['labsCompleted'] ?? 0,
        challengesSolved:    json['challengesSolved'] ?? 0,
        ctfScore:            json['ctfScore'] ?? 0,
        ctfRank:             json['ctfRank'],
      );
}

class LearningTask {
  final String type;
  final String label;
  final String description;
  final String icon;
  final bool completed;

  LearningTask({
    required this.type,
    required this.label,
    required this.description,
    required this.icon,
    required this.completed,
  });

  factory LearningTask.fromJson(Map<String, dynamic> json) => LearningTask(
        type:        json['type'] ?? '',
        label:       json['label'] ?? '',
        description: json['description'] ?? '',
        icon:        json['icon'] ?? '',
        completed:   json['completed'] ?? false,
      );
}

class LearningPathStep {
  final int step;
  final String course;
  final String title;
  final String description;
  final List<LearningTask> tasks;

  LearningPathStep({
    required this.step,
    required this.course,
    required this.title,
    required this.description,
    required this.tasks,
  });

  factory LearningPathStep.fromJson(Map<String, dynamic> json) =>
      LearningPathStep(
        step:        json['step'] ?? 0,
        course:      json['course'] ?? '',
        title:       json['title'] ?? '',
        description: json['description'] ?? '',
        tasks: (json['tasks'] as List? ?? [])
            .map((t) => LearningTask.fromJson(t))
            .toList(),
      );

  int get completedCount => tasks.where((t) => t.completed).length;
  double get progress => tasks.isEmpty ? 0 : completedCount / tasks.length;
}

class PerformanceData {
  final String username;
  final List<String> enrolledCourses;
  final PerformanceStats stats;

  PerformanceData({
    required this.username,
    required this.enrolledCourses,
    required this.stats,
  });

  factory PerformanceData.fromJson(Map<String, dynamic> json) => PerformanceData(
        username:        json['username'] ?? '',
        enrolledCourses: List<String>.from(json['enrolledCourses'] ?? []),
        stats:           PerformanceStats.fromJson(json['stats'] ?? {}),
      );
}