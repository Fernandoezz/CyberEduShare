class NotificationPreferences {
  final bool emailNotifications;
  final bool pushNotifications;
  final bool labAlerts;
  final bool newResourceAlerts;

  NotificationPreferences({
    this.emailNotifications = true,
    this.pushNotifications = true,
    this.labAlerts = false,
    this.newResourceAlerts = true,
  });

  factory NotificationPreferences.fromJson(Map<String, dynamic> json) {
    return NotificationPreferences(
      emailNotifications: json['emailNotifications'] ?? true,
      pushNotifications:  json['pushNotifications']  ?? true,
      labAlerts:          json['labAlerts']           ?? false,
      newResourceAlerts:  json['newResourceAlerts']   ?? true,
    );
  }

  Map<String, dynamic> toJson() => {
    'emailNotifications': emailNotifications,
    'pushNotifications':  pushNotifications,
    'labAlerts':          labAlerts,
    'newResourceAlerts':  newResourceAlerts,
  };

  NotificationPreferences copyWith({
    bool? emailNotifications,
    bool? pushNotifications,
    bool? labAlerts,
    bool? newResourceAlerts,
  }) {
    return NotificationPreferences(
      emailNotifications: emailNotifications ?? this.emailNotifications,
      pushNotifications:  pushNotifications  ?? this.pushNotifications,
      labAlerts:          labAlerts          ?? this.labAlerts,
      newResourceAlerts:  newResourceAlerts  ?? this.newResourceAlerts,
    );
  }
}

class UserModel {
  final String id;
  final String username;
  final String email;
  final String role;
  final List<String> enrolledCourses;
  final NotificationPreferences notificationPreferences;

  UserModel({
    required this.id,
    required this.username,
    required this.email,
    required this.role,
    this.enrolledCourses = const [],
    NotificationPreferences? notificationPreferences,
  }) : notificationPreferences =
           notificationPreferences ?? NotificationPreferences();

  factory UserModel.fromJson(Map<String, dynamic> json) {
    return UserModel(
      id:       json['_id'] ?? '',
      username: json['username'] ?? '',
      email:    json['email'] ?? '',
      role:     json['role'] ?? 'student',
      enrolledCourses: List<String>.from(json['enrolledCourses'] ?? []),
      notificationPreferences: json['notificationPreferences'] != null
          ? NotificationPreferences.fromJson(json['notificationPreferences'])
          : NotificationPreferences(),
    );
  }

  UserModel copyWith({
    NotificationPreferences? notificationPreferences,
  }) {
    return UserModel(
      id:       id,
      username: username,
      email:    email,
      role:     role,
      enrolledCourses: enrolledCourses,
      notificationPreferences:
          notificationPreferences ?? this.notificationPreferences,
    );
  }
}