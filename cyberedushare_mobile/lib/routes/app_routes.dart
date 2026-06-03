import 'package:flutter/material.dart';

// Onboarding
import '../features/onboarding/screens/onboarding_screen.dart';

// Auth
import '../features/auth/screens/login_screen.dart';
import '../features/auth/screens/register_screen.dart';
import '../features/auth/screens/email_verification_screen.dart';
import '../features/auth/screens/forgot_password_screen.dart';
import '../features/auth/screens/reset_otp_screen.dart';
import '../features/auth/screens/reset_password_screen.dart';
import '../features/auth/screens/reset_success_screen.dart';

// Main scaffold (home + bottom nav)
import '../scaffold/main_scaffold.dart';

// Content
import '../features/content/screens/search_screen.dart';
import '../features/content/screens/resource_detail_screen.dart';
import '../features/content/screens/upload_resource_screen.dart';

// Questions
import '../features/questions/screens/questions_screen.dart';
import '../features/questions/screens/question_detail_screen.dart';

// Projects
import '../features/projects/screens/projects_screen.dart';
import '../features/projects/screens/project_detail_screen.dart';

// Labs
import '../features/labs/screens/virtual_labs_screen.dart';
import '../features/labs/screens/lab_session_screen.dart';

// Challenges
import '../features/challenges/screens/challenges_screen.dart';
import '../features/challenges/screens/challenge_detail_screen.dart';

// Performance
import '../features/performance/screens/performance_screen.dart';

class AppRoutes {
  // ── Route Name Constants
  static const String onboarding     = '/';
  static const String login          = '/login';
  static const String register       = '/register';
  static const String verifyEmail    = '/verify-email';
  static const String forgotPassword = '/forgot-password';
  static const String resetOtp       = '/reset-otp';
  static const String resetPassword  = '/reset-password';
  static const String resetSuccess   = '/reset-success';
  static const String home           = '/home';
  static const String search          = '/search';
  static const String resourceDetail  = '/resource-detail';
  static const String uploadResource  = '/upload-resource';
  static const String questions       = '/questions';
  static const String questionDetail  = '/question-detail';
  static const String projects        = '/projects';
  static const String projectDetail   = '/project-detail';
  static const String labs            = '/labs';
  static const String labSession      = '/lab-session';
  static const String challenges      = '/challenges';
  static const String challengeDetail = '/challenge-detail';
  static const String performance     = '/performance';

  // ── Route Map
  static Map<String, WidgetBuilder> get routes => {
    onboarding     : (_) => const OnboardingScreen(),
    login          : (_) => const LoginScreen(),
    register       : (_) => const RegisterScreen(),
    verifyEmail    : (_) => const EmailVerificationScreen(),
    forgotPassword : (_) => const ForgotPasswordScreen(),
    resetOtp       : (_) => const ResetOtpScreen(),
    resetPassword  : (_) => const ResetPasswordScreen(),
    resetSuccess   : (_) => const ResetSuccessScreen(),
    home : (_) => MainScaffold(key: MainScaffold.scaffoldKey),
    search         : (_) => const SearchScreen(),
    resourceDetail : (_) => const ResourceDetailScreen(),
    uploadResource : (_) => const UploadResourceScreen(),
    questions      : (_) => const QuestionsScreen(),
    questionDetail : (_) => const QuestionDetailScreen(),
    projects       : (_) => const ProjectsScreen(),
    projectDetail  : (_) => const ProjectDetailScreen(),
    labs           : (_) => const VirtualLabsScreen(),
    labSession     : (_) => const LabSessionScreen(),
    challenges     : (_) => const ChallengesScreen(),
    challengeDetail: (_) => const ChallengeDetailScreen(),
    performance    : (_) => const PerformanceScreen(),
  };
}