import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'features/auth/providers/auth_provider.dart';
import 'features/content/providers/content_provider.dart';
import 'features/questions/providers/question_provider.dart';
import 'features/projects/providers/project_provider.dart';
import 'features/labs/providers/lab_provider.dart';
import 'features/challenges/providers/challenge_provider.dart';
import 'features/performance/providers/performance_provider.dart';
import 'routes/app_routes.dart';

void main() {
  runApp(const CyberEduShareApp());
}

class CyberEduShareApp extends StatelessWidget {
  const CyberEduShareApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ContentProvider()),
        ChangeNotifierProvider(create: (_) => QuestionProvider()),
        ChangeNotifierProvider(create: (_) => ProjectProvider()),
        ChangeNotifierProvider(create: (_) => LabProvider()),
        ChangeNotifierProvider(create: (_) => ChallengeProvider()),
        ChangeNotifierProvider(create: (_) => PerformanceProvider()),
      ],
      child: MaterialApp(
        debugShowCheckedModeBanner: false,
        title: 'CyberEduShare',
        theme: ThemeData(
          scaffoldBackgroundColor: Colors.white,
          fontFamily: 'Poppins',
        ),
        initialRoute: AppRoutes.onboarding,
        routes: AppRoutes.routes,
      ),
    );
  }
}