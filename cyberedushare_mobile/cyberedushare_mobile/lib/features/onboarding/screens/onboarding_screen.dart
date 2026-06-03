import 'package:flutter/material.dart';
import '../widgets/onboarding_page.dart';

class OnboardingScreen extends StatefulWidget {
  const OnboardingScreen({super.key});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen> {
  final PageController _controller = PageController();
  int currentIndex = 0;

  void nextPage() {
    if (currentIndex < 3) {
      _controller.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOut,
      );
    } else {
      // ✅ Last page — go to login
      Navigator.pushReplacementNamed(context, '/login');
    }
  }

  void goToPage(int index) {
    _controller.animateToPage(
      index,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeInOut,
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Stack(
        children: [
          PageView(
            controller: _controller,
            onPageChanged: (index) {
              setState(() => currentIndex = index);
            },
            children: [
              OnboardingPage(
                image: "assets/images/onboarding1.png",
                title: "Welcome To CyberEduShare",
                description:
                    "Access shared cybersecurity resources from past students.",
                buttonText: "Next",
                onPressed: nextPage,
              ),
              OnboardingPage(
                image: "assets/images/onboarding2.png",
                title: "Find Hard Exam Questions From Past Students.",
                description:
                    "Explore challenging exam questions shared by peers.",
                buttonText: "Next",
                onPressed: nextPage,
                splitLayout: true,
              ),
              OnboardingPage(
                image: "assets/images/onboarding1.png",
                title: "Launch VMware Labs From Home",
                description:
                    "Practice cybersecurity labs directly from your device.",
                buttonText: "Next",
                onPressed: nextPage,
              ),
              OnboardingPage(
                image: "assets/images/onboarding2.png",
                title: "Ask The AI That Knows Your Course.",
                description: "Get personalized recommendations powered by AI.",
                buttonText: "Get Started",
                onPressed: nextPage,
                splitLayout: true,
              ),
            ],
          ),

          // 🔵 CLICKABLE Animated Dots
          Positioned(
            bottom: 110,
            left: 0,
            right: 0,
            child: Row(
              mainAxisAlignment: MainAxisAlignment.center,
              children: List.generate(
                4,
                (index) => GestureDetector(
                  onTap: () => goToPage(index),
                  child: AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    margin: const EdgeInsets.symmetric(horizontal: 6),
                    width: currentIndex == index ? 24 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      color:
                          currentIndex == index
                              ? const Color(0xFF5B7BFF)
                              : Colors.grey.shade300,
                      borderRadius: BorderRadius.circular(20),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}
