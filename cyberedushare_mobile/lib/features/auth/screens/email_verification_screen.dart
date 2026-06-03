import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class EmailVerificationScreen extends StatefulWidget {
  const EmailVerificationScreen({super.key});

  @override
  State<EmailVerificationScreen> createState() =>
      _EmailVerificationScreenState();
}

class _EmailVerificationScreenState extends State<EmailVerificationScreen> {
  final List<TextEditingController> _controllers =
      List.generate(4, (_) => TextEditingController());
  final List<FocusNode> _focusNodes = List.generate(4, (_) => FocusNode());

  bool _hasError = false;
  String _errorMessage = '';
  int _resendCountdown = 0;
  Timer? _timer;
  String _email = '';

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Receive the email passed from RegisterScreen via Navigator arguments
    final args = ModalRoute.of(context)?.settings.arguments;
    if (args is String) {
      _email = args;
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) c.dispose();
    for (final f in _focusNodes) f.dispose();
    _timer?.cancel();
    super.dispose();
  }

  void _startResendTimer() {
    setState(() => _resendCountdown = 30);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_resendCountdown == 0) {
        t.cancel();
      } else {
        setState(() => _resendCountdown--);
      }
    });
  }

  void _onOtpChanged(String value, int index) {
    if (value.length == 1 && index < 3) {
      _focusNodes[index + 1].requestFocus();
    }
    if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }
    setState(() => _hasError = false);
  }

  Future<void> _onContinue() async {
    final otp = _controllers.map((c) => c.text).join();
    if (otp.length < 4) {
      setState(() {
        _hasError = true;
        _errorMessage = 'Please enter the complete 4-digit OTP.';
      });
      return;
    }

    final authProvider = context.read<AuthProvider>();
    authProvider.clearError();

    final success = await authProvider.verifyOtp(email: _email, otp: otp);

    if (!mounted) return;

    if (success) {
      Navigator.pushReplacementNamed(context, '/home');
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Email verified! Welcome to CyberEduShare+'),
          backgroundColor: Color(0xFF5B7BFF),
        ),
      );
    } else {
      setState(() {
        _hasError = true;
        _errorMessage = authProvider.errorMessage;
      });
      // Clear boxes so the user can re-enter cleanly
      for (final c in _controllers) c.clear();
      _focusNodes[0].requestFocus();
    }
  }

  Future<void> _onResend() async {
    _startResendTimer();

    final authProvider = context.read<AuthProvider>();
    authProvider.clearError();

    final success = await authProvider.resendOtp(email: _email);

    if (!mounted) return;

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          success
              ? 'A new OTP has been sent to your email.'
              : authProvider.errorMessage,
        ),
        backgroundColor: success ? const Color(0xFF5B7BFF) : Colors.red,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<AuthProvider>().isLoading;

    return Scaffold(
      backgroundColor: const Color(0xFFF5F5F5),
      body: SafeArea(
        child: Padding(
          padding: const EdgeInsets.symmetric(horizontal: 24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.center,
            children: [
              Align(
                alignment: Alignment.centerLeft,
                child: IconButton(
                  icon: const Icon(Icons.arrow_back_ios_new_rounded, size: 20),
                  onPressed: () => Navigator.pop(context),
                  padding: EdgeInsets.zero,
                ),
              ),

              const SizedBox(height: 40),

              const Text(
                "Email Verification",
                style: TextStyle(
                  fontSize: 26,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E1E1E),
                ),
              ),

              const SizedBox(height: 12),

              const Text(
                "Kindly enter the 4-digit OTP that we sent to\nyour email.",
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: Colors.black54,
                  height: 1.5,
                ),
              ),

              const SizedBox(height: 40),

              // ── OTP Boxes
              Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(4, (index) {
                  return Container(
                    margin: const EdgeInsets.symmetric(horizontal: 8),
                    width: 60,
                    height: 60,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(
                        color: _focusNodes[index].hasFocus
                            ? const Color(0xFF5B7BFF)
                            : Colors.grey.shade300,
                        width: _focusNodes[index].hasFocus ? 2 : 1,
                      ),
                    ),
                    child: TextField(
                      controller: _controllers[index],
                      focusNode: _focusNodes[index],
                      textAlign: TextAlign.center,
                      keyboardType: TextInputType.number,
                      maxLength: 1,
                      style: const TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF5B7BFF),
                      ),
                      decoration: const InputDecoration(
                        counterText: '',
                        border: InputBorder.none,
                      ),
                      onChanged: (val) => _onOtpChanged(val, index),
                    ),
                  );
                }),
              ),

              const SizedBox(height: 20),

              // ── Error Banner
              AnimatedSwitcher(
                duration: const Duration(milliseconds: 300),
                child: _hasError
                    ? Container(
                        key: const ValueKey('error'),
                        width: double.infinity,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 10),
                        decoration: BoxDecoration(
                          color: const Color(0xFFFFF0F0),
                          border: Border.all(color: Colors.red.shade200),
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: Row(
                          children: [
                            const Icon(Icons.warning_amber_rounded,
                                color: Colors.red, size: 18),
                            const SizedBox(width: 8),
                            Expanded(
                              child: Text(
                                _errorMessage,
                                style: const TextStyle(
                                    color: Colors.red, fontSize: 13),
                              ),
                            ),
                          ],
                        ),
                      )
                    : const SizedBox.shrink(key: ValueKey('no-error')),
              ),

              const SizedBox(height: 24),

              // ── Continue Button
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5B7BFF),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10),
                    ),
                    elevation: 0,
                  ),
                  onPressed: isLoading ? null : _onContinue,
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

              const SizedBox(height: 16),

              // ── Resend Link
              GestureDetector(
                onTap: _resendCountdown == 0 ? _onResend : null,
                child: Text(
                  _resendCountdown > 0
                      ? "Resend in ${_resendCountdown}s"
                      : "Resend OTP",
                  style: TextStyle(
                    color: _resendCountdown > 0
                        ? Colors.grey
                        : const Color(0xFF5B7BFF),
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}