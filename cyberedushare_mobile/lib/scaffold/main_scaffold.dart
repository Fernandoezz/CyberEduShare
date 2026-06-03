import 'package:flutter/material.dart';
import '../features/home/screens/home_screen.dart';
import '../features/content/screens/search_screen.dart';
import '../features/labs/screens/virtual_labs_screen.dart';
import '../features/notifications/screens/notifications_screen.dart';
import '../features/profile/screens/profile_screen.dart';

class MainScaffold extends StatefulWidget {
  const MainScaffold({super.key});

  // Global key so child screens can switch tabs
  static final GlobalKey<_MainScaffoldState> scaffoldKey =
      GlobalKey<_MainScaffoldState>();

  static void switchTab(int index) {
    scaffoldKey.currentState?.switchTab(index);
  }

  @override
  State<MainScaffold> createState() => _MainScaffoldState();
}

class _MainScaffoldState extends State<MainScaffold> {
  int _currentIndex = 0;

  void switchTab(int index) {
    setState(() => _currentIndex = index);
  }

  final List<Widget> _screens = const [
    HomeScreen(),
    SearchScreen(),
    VirtualLabsScreen(),
    NotificationsScreen(),
    ProfileScreen(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _screens,
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: Colors.white,
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.06),
              blurRadius: 10,
              offset: const Offset(0, -2),
            ),
          ],
        ),
        child: SafeArea(
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceAround,
              children: [
                _NavItem(
                  icon: Icons.home_rounded,
                  label: 'Home',
                  selected: _currentIndex == 0,
                  onTap: () => setState(() => _currentIndex = 0),
                ),
                _NavItem(
                  icon: Icons.search_rounded,
                  label: 'Search',
                  selected: _currentIndex == 1,
                  onTap: () => setState(() => _currentIndex = 1),
                ),
                _NavItem(
                  icon: Icons.laptop_rounded,
                  label: 'Labs',
                  selected: _currentIndex == 2,
                  onTap: () => setState(() => _currentIndex = 2),
                ),
                _NavItem(
                  icon: Icons.notifications_rounded,
                  label: 'Alerts',
                  selected: _currentIndex == 3,
                  onTap: () => setState(() => _currentIndex = 3),
                ),
                _NavItem(
                  icon: Icons.person_rounded,
                  label: 'Profile',
                  selected: _currentIndex == 4,
                  onTap: () => setState(() => _currentIndex = 4),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _NavItem extends StatelessWidget {
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _NavItem({
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      behavior: HitTestBehavior.opaque,
      child: Container(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 6),
        decoration: selected
            ? BoxDecoration(
                color: const Color(0xFF5B7BFF).withOpacity(0.12),
                borderRadius: BorderRadius.circular(20),
              )
            : null,
        child: Row(
          children: [
            Icon(
              icon,
              size: 22,
              color: selected ? const Color(0xFF5B7BFF) : Colors.grey,
            ),
            if (selected) ...[
              const SizedBox(width: 6),
              Text(
                label,
                style: const TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w600,
                  color: Color(0xFF5B7BFF),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }
}