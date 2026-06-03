import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class ResetPasswordScreen extends StatefulWidget {
  const ResetPasswordScreen({super.key});

  @override
  State<ResetPasswordScreen> createState() => _ResetPasswordScreenState();
}

class _ResetPasswordScreenState extends State<ResetPasswordScreen> {
  final _passwordController = TextEditingController();
  bool _obscurePassword = true;
  String _email = '';

  // Strength state
  double _strength = 0;
  String _strengthLabel = '';
  Color _strengthColor = Colors.transparent;
  List<String> _validationErrors = [];

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is String) _email = args;
  }

  @override
  void dispose() {
    _passwordController.dispose();
    super.dispose();
  }

  void _onPasswordChanged(String value) {
    final errors = <String>[];
    int score = 0;

    if (value.length >= 8) {
      score++;
    } else {
      errors.add('Must be at least 8 characters!');
    }

    if (RegExp(r'[A-Za-z]').hasMatch(value)) {
      score++;
    } else {
      errors.add('Must have alphabetical character!');
    }

    if (RegExp(r'[0-9]').hasMatch(value)) {
      score++;
    } else {
      errors.add('Must have special numbers from 0-9!');
    }

    if (RegExp(r'[!@#\$%^&*(),.?":{}|<>]').hasMatch(value)) {
      score++;
    } else {
      errors.add('Must have a special character (!@#\$...)');
    }

    String label;
    Color color;
    double strengthValue;

    switch (score) {
      case 0:
      case 1:
        label = 'Weak password! Kindly increase strength!';
        color = Colors.red;
        strengthValue = 0.25;
        break;
      case 2:
        label = 'Fair password. Could be stronger.';
        color = Colors.orange;
        strengthValue = 0.5;
        break;
      case 3:
        label = 'Good password!';
        color = Colors.yellow.shade700;
        strengthValue = 0.75;
        break;
      case 4:
        label = 'Strong password!';
        color = Colors.green;
        strengthValue = 1.0;
        errors.clear();
        break;
      default:
        label = '';
        color = Colors.transparent;
        strengthValue = 0;
    }

    setState(() {
      _strength = value.isEmpty ? 0 : strengthValue;
      _strengthLabel = value.isEmpty ? '' : label;
      _strengthColor = color;
      _validationErrors = errors;
    });
  }

  Future<void> _handleReset() async {
    final password = _passwordController.text;

    if (password.isEmpty) {
      _showError('Please enter a new password.');
      return;
    }

    if (_validationErrors.isNotEmpty) {
      _showError('Please fix the password issues before continuing.');
      return;
    }

    final authProvider = context.read<AuthProvider>();
    authProvider.clearError();

    final success = await authProvider.resetPassword(
      email: _email,
      newPassword: password,
    );

    if (!mounted) return;

    if (success) {
      Navigator.pushNamedAndRemoveUntil(
        context,
        '/reset-success',
        (route) => false,
      );
    } else {
      _showError(authProvider.errorMessage);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const SizedBox(height: 16),

              IconButton(
                icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                onPressed: () => Navigator.pop(context),
                padding: EdgeInsets.zero,
              ),

              const SizedBox(height: 32),

              const Text(
                "Reset Password",
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E1E1E),
                ),
              ),

              const SizedBox(height: 6),

              const Text(
                "Lets Set Up Your Password",
                style: TextStyle(fontSize: 14, color: Colors.black54),
              ),

              const SizedBox(height: 36),

              // ── Password Label
              const Text(
                "Password",
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w500,
                  color: Color(0xFF1E1E1E),
                ),
              ),

              const SizedBox(height: 8),

              // ── Password Field
              Container(
                decoration: BoxDecoration(
                  color: const Color(0xFFF5F5F5),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: TextField(
                  controller: _passwordController,
                  obscureText: _obscurePassword,
                  onChanged: _onPasswordChanged,
                  decoration: InputDecoration(
                    hintText: "Enter Your Password",
                    hintStyle: const TextStyle(
                        color: Colors.black38, fontSize: 14),
                    border: InputBorder.none,
                    contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 14),
                    suffixIcon: IconButton(
                      icon: Icon(
                        _obscurePassword
                            ? Icons.visibility_off_outlined
                            : Icons.visibility_outlined,
                        color: Colors.black38,
                        size: 20,
                      ),
                      onPressed: () =>
                          setState(() => _obscurePassword = !_obscurePassword),
                    ),
                  ),
                ),
              ),

              const SizedBox(height: 12),

              // ── Strength Bar
              if (_strength > 0) ...[
                ClipRRect(
                  borderRadius: BorderRadius.circular(4),
                  child: LinearProgressIndicator(
                    value: _strength,
                    backgroundColor: Colors.grey.shade200,
                    color: _strengthColor,
                    minHeight: 6,
                  ),
                ),
                const SizedBox(height: 6),
                Text(
                  _strengthLabel,
                  style: TextStyle(
                    fontSize: 12,
                    color: _strengthColor,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ],

              const SizedBox(height: 12),

              // ── Validation Errors
              ...(_validationErrors.map((error) => Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 12, vertical: 10),
                    decoration: BoxDecoration(
                      color: const Color(0xFFFFF0F0),
                      border: Border.all(color: Colors.red.shade200),
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: Row(
                      children: [
                        const Icon(Icons.warning_amber_rounded,
                            color: Colors.red, size: 16),
                        const SizedBox(width: 8),
                        Expanded(
                          child: Text(
                            error,
                            style: const TextStyle(
                                color: Colors.red, fontSize: 13),
                          ),
                        ),
                      ],
                    ),
                  ))),

              const SizedBox(height: 24),

              // ── Continue Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5B7BFF),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(12),
                    ),
                    elevation: 0,
                  ),
                  onPressed: isLoading ? null : _handleReset,
                  child: isLoading
                      ? const SizedBox(
                          height: 22,
                          width: 22,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2.5,
                          ),
                        )
                      : const Text(
                          "Continue",
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.w600,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),

              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}