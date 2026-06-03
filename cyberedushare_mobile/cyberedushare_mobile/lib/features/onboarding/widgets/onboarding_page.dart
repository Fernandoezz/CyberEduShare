import 'package:flutter/material.dart';

class OnboardingPage extends StatefulWidget {
  final String image;
  final String title;
  final String description;
  final String buttonText;
  final VoidCallback onPressed;
  final bool splitLayout;

  const OnboardingPage({
    super.key,
    required this.image,
    required this.title,
    required this.description,
    required this.buttonText,
    required this.onPressed,
    this.splitLayout = false,
  });

  @override
  State<OnboardingPage> createState() => _OnboardingPageState();
}

class _OnboardingPageState extends State<OnboardingPage>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> fadeAnimation;
  late Animation<double> scaleAnimation;
  bool _initialized = false;

  @override
  void initState() {
    super.initState();

    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );

    fadeAnimation = Tween<double>(
      begin: 0,
      end: 1,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeIn));

    scaleAnimation = Tween<double>(
      begin: 0.9,
      end: 1,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOut));

    // ✅ Mark initialized BEFORE calling forward
    setState(() => _initialized = true);
    _controller.forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    // ✅ Guard — render nothing until animations are ready
    if (!_initialized) return const Scaffold();

    return Scaffold(
      body: Stack(
        children: [
          // Decorative circles
          _circle(160, const Color(0xFFF4C430), top: 60, right: -80),
          _circle(130, const Color(0xFF5B7BFF), top: 140, left: -70),
          _circle(120, const Color(0xFFE74C3C), bottom: 280, left: 60),
          _circle(16, const Color(0xFFF4C430), top: 220, left: 110),
          _circle(18, const Color(0xFF1ABCFE), bottom: 260, right: 90),

          SafeArea(
            child: widget.splitLayout
                ? _buildSplitLayout()
                : Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 24),
                    child: _buildCenterLayout(),
                  ),
          ),
        ],
      ),
    );
  }

  // ---------------- CENTER LAYOUT (Page 1 & 3)

  Widget _buildCenterLayout() {
    return Column(
      children: [
        const SizedBox(height: 40),
        Expanded(
          flex: 5,
          child: Center(
            child: FadeTransition(
              opacity: fadeAnimation,
              child: ScaleTransition(
                scale: scaleAnimation,
                child: Image.asset(widget.image, height: 300),
              ),
            ),
          ),
        ),
        _buildTextSection(TextAlign.center),
        _buildButton(horizontalPadding: 0),
      ],
    );
  }

  // ---------------- SPLIT LAYOUT (Page 2 & 4)

  Widget _buildSplitLayout() {
    return Column(
      children: [
        const SizedBox(height: 40),
        Expanded(
          flex: 6,
          child: Stack(
            clipBehavior: Clip.none,
            children: [
              // LEFT TEXT
              Positioned.fill(
                child: Padding(
                  padding: const EdgeInsets.only(left: 24, right: 160),
                  child: FadeTransition(
                    opacity: fadeAnimation,
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          widget.title,
                          style: const TextStyle(
                            fontSize: 28,
                            fontWeight: FontWeight.bold,
                            height: 1.2,
                          ),
                        ),
                        const SizedBox(height: 16),
                        Text(
                          widget.description,
                          style: const TextStyle(
                            fontSize: 15,
                            color: Colors.black87,
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),

              // RIGHT IMAGE — pinned to right edge
              Positioned(
                top: 0,
                right: 0,
                bottom: 0,
                width: 170,
                child: Align(
                  alignment: Alignment.centerRight,
                  child: FadeTransition(
                    opacity: fadeAnimation,
                    child: ScaleTransition(
                      scale: scaleAnimation,
                      child: Image.asset(
                        widget.image,
                        height: 420,
                        fit: BoxFit.contain,
                        alignment: Alignment.centerRight,
                      ),
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
        _buildButton(horizontalPadding: 24),
      ],
    );
  }

  // ---------------- TEXT SECTION (center layout)

  Widget _buildTextSection(TextAlign align) {
    return Expanded(
      flex: 3,
      child: Column(
        children: [
          Text(
            widget.title,
            textAlign: align,
            style: const TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.bold,
              color: Color(0xFF1E1E1E),
            ),
          ),
          const SizedBox(height: 14),
          Text(
            widget.description,
            textAlign: align,
            style: const TextStyle(
              fontSize: 14,
              color: Colors.black87,
              height: 1.6,
            ),
          ),
        ],
      ),
    );
  }

  // ---------------- BUTTON

  Widget _buildButton({double horizontalPadding = 24}) {
    return Padding(
      padding: EdgeInsets.symmetric(horizontal: horizontalPadding),
      child: Column(
        children: [
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            height: 55,
            child: ElevatedButton(
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5B7BFF),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(14),
                ),
              ),
              onPressed: widget.onPressed,
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: [
                  Text(widget.buttonText),
                  const SizedBox(width: 8),
                  const Icon(Icons.arrow_forward_ios_rounded, size: 16),
                ],
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }

  // ---------------- DECORATIVE CIRCLE

  Widget _circle(
    double size,
    Color color, {
    double? top,
    double? bottom,
    double? left,
    double? right,
  }) {
    return Positioned(
      top: top,
      bottom: bottom,
      left: left,
      right: right,
      child: FadeTransition(
        opacity: fadeAnimation,
        child: Container(
          width: size,
          height: size,
          decoration: BoxDecoration(color: color, shape: BoxShape.circle),
        ),
      ),
    );
  }
}