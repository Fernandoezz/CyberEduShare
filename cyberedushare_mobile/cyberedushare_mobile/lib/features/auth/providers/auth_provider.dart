import 'package:flutter/material.dart';
import '../models/user_model.dart';
import '../services/auth_service.dart';

enum AuthStatus { idle, loading, success, error }

class AuthProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();

  AuthStatus _status = AuthStatus.idle;
  String _errorMessage = '';
  UserModel? _currentUser;
  String? _token;

  AuthStatus get status => _status;
  String get errorMessage => _errorMessage;
  UserModel? get currentUser => _currentUser;
  String? get token => _token;
  bool get isLoading => _status == AuthStatus.loading;

  // ── REGISTER
  Future<String?> register({
    required String username,
    required String email,
    required String password,
  }) async {
    _setStatus(AuthStatus.loading);
    try {
      final registeredEmail = await _authService.register(
        username: username.trim(),
        email: email.trim(),
        password: password,
      );
      _setStatus(AuthStatus.success);
      return registeredEmail;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return null;
    }
  }

  // ── LOGIN
  Future<bool> login({required String email, required String password}) async {
    _setStatus(AuthStatus.loading);
    try {
      final result = await _authService.login(
          email: email.trim(), password: password);
      _token = result['token'];
      _currentUser = result['user'];
      _setStatus(AuthStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return false;
    }
  }

  // ── VERIFY OTP (registration)
  Future<bool> verifyOtp({required String email, required String otp}) async {
    _setStatus(AuthStatus.loading);
    try {
      final result = await _authService.verifyOtp(email: email, otp: otp);
      _token = result['token'];
      _currentUser = result['user'];
      _setStatus(AuthStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return false;
    }
  }

  // ── RESEND OTP
  Future<bool> resendOtp({required String email}) async {
    _setStatus(AuthStatus.loading);
    try {
      await _authService.resendOtp(email: email);
      _setStatus(AuthStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return false;
    }
  }

  // ── FORGOT PASSWORD
  Future<String?> forgotPassword({required String email}) async {
    _setStatus(AuthStatus.loading);
    try {
      final result = await _authService.forgotPassword(email: email.trim());
      _setStatus(AuthStatus.success);
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return null;
    }
  }

  // ── VERIFY RESET OTP
  Future<String?> verifyResetOtp({
    required String email,
    required String otp,
  }) async {
    _setStatus(AuthStatus.loading);
    try {
      final result =
          await _authService.verifyResetOtp(email: email, otp: otp);
      _setStatus(AuthStatus.success);
      return result;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return null;
    }
  }

  // ── RESET PASSWORD
  Future<bool> resetPassword({
    required String email,
    required String newPassword,
  }) async {
    _setStatus(AuthStatus.loading);
    try {
      await _authService.resetPassword(email: email, newPassword: newPassword);
      _setStatus(AuthStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return false;
    }
  }

  // ── GET PROFILE (refresh from backend)
  Future<void> refreshProfile() async {
    if (_token == null) return;
    try {
      final user = await _authService.getProfile(token: _token!);
      _currentUser = user;
      notifyListeners();
    } catch (e) {
      // silently fail — user still sees cached data
    }
  }

  // ── UPDATE NOTIFICATION PREFERENCES
  Future<bool> updateNotifications(NotificationPreferences prefs) async {
    if (_token == null) return false;
    _setStatus(AuthStatus.loading);
    try {
      final updated = await _authService.updateNotifications(
          token: _token!, prefs: prefs);
      _currentUser = _currentUser?.copyWith(notificationPreferences: updated);
      _setStatus(AuthStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return false;
    }
  }

  // ── UPDATE ENROLLED COURSES
  Future<bool> updateEnrolledCourses(List<String> courses) async {
  try {
    final updated = await _authService.updateEnrolledCourses(
      token: _token ?? '',
      enrolledCourses: courses,
    );
    if (_currentUser != null) {
      _currentUser = UserModel(
        id:                      _currentUser!.id,
        username:                _currentUser!.username,
        email:                   _currentUser!.email,
        role:                    _currentUser!.role,
        enrolledCourses:         updated,
        notificationPreferences: _currentUser!.notificationPreferences,
      );
      notifyListeners();
    }
    return true;
  } catch (e) {
    _errorMessage = e.toString();
    notifyListeners();
    return false;
  }
}

  // ── DELETE ACCOUNT
  Future<bool> deleteAccount() async {
    if (_token == null) return false;
    _setStatus(AuthStatus.loading);
    try {
      await _authService.deleteAccount(token: _token!);
      _token = null;
      _currentUser = null;
      _setStatus(AuthStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(AuthStatus.error);
      return false;
    }
  }

  // ── LOGOUT
  void logout() {
    _token = null;
    _currentUser = null;
    _setStatus(AuthStatus.idle);
  }

  void clearError() {
    _errorMessage = '';
    _status = AuthStatus.idle;
    notifyListeners();
  }

  void _setStatus(AuthStatus status) {
    _status = status;
    notifyListeners();
  }
}