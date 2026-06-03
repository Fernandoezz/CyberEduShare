import 'dart:convert';
import 'package:http/http.dart' as http;
import '../models/user_model.dart';

class AuthService {
  // 🔧 Android emulator → http://10.0.2.2:5000
  // 🔧 Physical device  → http://YOUR_LOCAL_IP:5000
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  // ── REGISTER
  Future<String> register({
    required String username,
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/register'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({
        'username': username,
        'email': email,
        'password': password,
      }),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 201) return data['email'] as String;
    throw data['message'] ?? 'Registration failed';
  }

  // ── LOGIN
  Future<Map<String, dynamic>> login({
    required String email,
    required String password,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/login'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'password': password}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'token': data['token'], 'user': UserModel.fromJson(data['user'])};
    }
    throw data['message'] ?? 'Login failed';
  }

  // ── VERIFY OTP (registration)
  Future<Map<String, dynamic>> verifyOtp({
    required String email,
    required String otp,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/verify-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'otp': otp}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return {'token': data['token'], 'user': UserModel.fromJson(data['user'])};
    }
    throw data['message'] ?? 'OTP verification failed';
  }

  // ── RESEND OTP (registration)
  Future<void> resendOtp({required String email}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/resend-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode != 200)
      throw data['message'] ?? 'Failed to resend OTP';
  }

  // ── FORGOT PASSWORD
  Future<String> forgotPassword({required String email}) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/forgot-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return data['email'] as String;
    throw data['message'] ?? 'Failed to send reset OTP';
  }

  // ── VERIFY RESET OTP
  Future<String> verifyResetOtp({
    required String email,
    required String otp,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/verify-reset-otp'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'otp': otp}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return data['email'] as String;
    throw data['message'] ?? 'Invalid OTP';
  }

  // ── RESET PASSWORD
  Future<void> resetPassword({
    required String email,
    required String newPassword,
  }) async {
    final response = await http.post(
      Uri.parse('$_baseUrl/auth/reset-password'),
      headers: {'Content-Type': 'application/json'},
      body: jsonEncode({'email': email, 'newPassword': newPassword}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode != 200)
      throw data['message'] ?? 'Failed to reset password';
  }

  // ── GET PROFILE
  Future<UserModel> getProfile({required String token}) async {
    final response = await http.get(
      Uri.parse('$_baseUrl/auth/profile'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) return UserModel.fromJson(data);
    throw data['message'] ?? 'Failed to fetch profile';
  }

  // ── UPDATE NOTIFICATION PREFERENCES
  Future<NotificationPreferences> updateNotifications({
    required String token,
    required NotificationPreferences prefs,
  }) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/auth/profile/notifications'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode(prefs.toJson()),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return NotificationPreferences.fromJson(data['notificationPreferences']);
    }
    throw data['message'] ?? 'Failed to update preferences';
  }

  // ── ENROLL IN COURSES
  Future<List<String>> updateEnrolledCourses({
    required String token,
    required List<String> enrolledCourses,
  }) async {
    final response = await http.put(
      Uri.parse('$_baseUrl/auth/profile/courses'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
      body: jsonEncode({'enrolledCourses': enrolledCourses}),
    );
    final data = jsonDecode(response.body);
    if (response.statusCode == 200) {
      return List<String>.from(data['enrolledCourses'] ?? []);
    }
    throw data['message'] ?? 'Failed to update enrolled courses';
  }

  // ── DELETE ACCOUNT
  Future<void> deleteAccount({required String token}) async {
    final response = await http.delete(
      Uri.parse('$_baseUrl/auth/profile/delete-account'),
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer $token',
      },
    );
    final data = jsonDecode(response.body);
    if (response.statusCode != 200)
      throw data['message'] ?? 'Failed to delete account';
  }
}
