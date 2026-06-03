import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/auth/models/user_model.dart';

class ProfileScreen extends StatefulWidget {
  const ProfileScreen({super.key});

  @override
  State<ProfileScreen> createState() => _ProfileScreenState();
}

class _ProfileScreenState extends State<ProfileScreen> {
  late NotificationPreferences _prefs;
  bool _saving = false;

  // Course management
  final TextEditingController _courseController = TextEditingController();
  List<String> _courses = [];
  bool _savingCourses = false;

  @override
  void initState() {
    super.initState();
    final user = context.read<AuthProvider>().currentUser;
    _prefs   = user?.notificationPreferences ?? NotificationPreferences();
    _courses = List<String>.from(user?.enrolledCourses ?? []);
    WidgetsBinding.instance.addPostFrameCallback((_) {
      context.read<AuthProvider>().refreshProfile();
    });
  }

  @override
  void dispose() {
    _courseController.dispose();
    super.dispose();
  }

  // ── Notification toggle
  Future<void> _togglePref({
    bool? emailNotifications,
    bool? pushNotifications,
    bool? labAlerts,
    bool? newResourceAlerts,
  }) async {
    final updated = _prefs.copyWith(
      emailNotifications: emailNotifications,
      pushNotifications:  pushNotifications,
      labAlerts:          labAlerts,
      newResourceAlerts:  newResourceAlerts,
    );
    setState(() { _prefs = updated; _saving = true; });
    await context.read<AuthProvider>().updateNotifications(updated);
    if (mounted) setState(() => _saving = false);
  }

  // ── Add course
  void _addCourse() {
    final course = _courseController.text.trim().toUpperCase();
    if (course.isEmpty) return;
    if (_courses.contains(course)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Course already added'),
            backgroundColor: Colors.orange),
      );
      return;
    }
    setState(() => _courses.add(course));
    _courseController.clear();
  }

  // ── Remove course
  void _removeCourse(String course) {
    setState(() => _courses.remove(course));
  }

  // ── Save courses to backend
  Future<void> _saveCourses() async {
    setState(() => _savingCourses = true);
    final success = await context
        .read<AuthProvider>()
        .updateEnrolledCourses(_courses);
    if (mounted) {
      setState(() => _savingCourses = false);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(success
              ? 'Courses saved successfully!'
              : 'Failed to save courses'),
          backgroundColor: success ? Colors.green : Colors.red,
        ),
      );
    }
  }

  // ── Show add course bottom sheet
  void _showAddCourseSheet() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.white,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20, right: 20, top: 20,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 20,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('Add Enrolled Course',
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 6),
            const Text('Enter your course code (e.g. CS205, Networks)',
                style: TextStyle(fontSize: 12, color: Colors.black54)),
            const SizedBox(height: 16),
            TextField(
              controller: _courseController,
              autofocus: true,
              textCapitalization: TextCapitalization.characters,
              decoration: InputDecoration(
                hintText: 'e.g. CS205',
                filled: true,
                fillColor: const Color(0xFFF5F5F5),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(10),
                  borderSide: BorderSide.none,
                ),
                prefixIcon: const Icon(Icons.book_rounded,
                    color: Color(0xFF5B7BFF)),
              ),
              onSubmitted: (_) {
                _addCourse();
                Navigator.pop(ctx);
              },
            ),
            const SizedBox(height: 12),
            // Quick suggestions
            const Text('Quick add:',
                style: TextStyle(fontSize: 12, color: Colors.black45)),
            const SizedBox(height: 8),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: ['CS101', 'CS102', 'CS201', 'CS205',
                         'Networks', 'Cryptography', 'OS']
                  .where((c) => !_courses.contains(c))
                  .map((c) => GestureDetector(
                        onTap: () {
                          setState(() => _courses.add(c));
                          Navigator.pop(ctx);
                        },
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFFEEF1FF),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: Text(c,
                              style: const TextStyle(
                                  fontSize: 12,
                                  color: Color(0xFF5B7BFF),
                                  fontWeight: FontWeight.w500)),
                        ),
                      ))
                  .toList(),
            ),
            const SizedBox(height: 16),
            SizedBox(
              width: double.infinity,
              height: 48,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5B7BFF),
                  shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(10)),
                  elevation: 0,
                ),
                onPressed: () {
                  _addCourse();
                  Navigator.pop(ctx);
                },
                child: const Text('Add Course',
                    style: TextStyle(color: Colors.white,
                        fontWeight: FontWeight.w600)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Future<void> _handleLogout() async {
    context.read<AuthProvider>().logout();
    Navigator.pushReplacementNamed(context, '/login');
  }

  Future<void> _handleDeleteAccount() async {
    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Delete Account'),
        content: const Text(
          'This will permanently delete your account and all your data. This cannot be undone.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          TextButton(
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Delete',
                style: TextStyle(color: Colors.red)),
          ),
        ],
      ),
    );
    if (confirmed != true) return;
    final success = await context.read<AuthProvider>().deleteAccount();
    if (!mounted) return;
    if (success) {
      Navigator.pushReplacementNamed(context, '/login');
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(context.read<AuthProvider>().errorMessage),
          backgroundColor: Colors.red,
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;

    if (user != null && user.notificationPreferences != _prefs && !_saving) {
      _prefs = user.notificationPreferences;
    }

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Title
              const Text('Profile & Settings',
                  style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF1E1E1E))),

              const SizedBox(height: 24),

              // ── Avatar + Info
              Center(
                child: Column(
                  children: [
                    Stack(
                      children: [
                        CircleAvatar(
                          radius: 48,
                          backgroundColor: const Color(0xFFD0D7FF),
                          child: const Icon(Icons.person_rounded,
                              size: 52, color: Color(0xFF5B7BFF)),
                        ),
                        Positioned(
                          bottom: 0, right: 0,
                          child: Container(
                            width: 28, height: 28,
                            decoration: const BoxDecoration(
                                color: Color(0xFF5B7BFF),
                                shape: BoxShape.circle),
                            child: const Icon(Icons.edit_rounded,
                                color: Colors.white, size: 16),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 12),
                    Text('Name: ${user?.username ?? "—"}',
                        style: const TextStyle(
                            fontSize: 15, fontWeight: FontWeight.w600)),
                    const SizedBox(height: 4),
                    Text('Role: ${user?.role ?? "—"}',
                        style: const TextStyle(
                            fontSize: 13, color: Colors.black54)),
                    const SizedBox(height: 4),
                    Text('Email: ${user?.email ?? "—"}',
                        style: const TextStyle(
                            fontSize: 13, color: Colors.black54)),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // ── Enrolled Courses
              const _SectionLabel('Enrolled Courses'),
              const SizedBox(height: 10),

              _Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(children: [
                      const Expanded(
                        child: Text('My Courses',
                            style: TextStyle(
                                fontWeight: FontWeight.w600, fontSize: 14)),
                      ),
                      // Add button
                      GestureDetector(
                        onTap: _showAddCourseSheet,
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 12, vertical: 6),
                          decoration: BoxDecoration(
                            color: const Color(0xFF5B7BFF).withOpacity(0.1),
                            borderRadius: BorderRadius.circular(8),
                          ),
                          child: const Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              Icon(Icons.add_rounded,
                                  color: Color(0xFF5B7BFF), size: 16),
                              SizedBox(width: 4),
                              Text('Add',
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: Color(0xFF5B7BFF),
                                      fontWeight: FontWeight.w500)),
                            ],
                          ),
                        ),
                      ),
                    ]),
                    const SizedBox(height: 12),

                    // Course chips
                    if (_courses.isEmpty)
                      const Text('No enrolled courses yet. Tap Add to get started.',
                          style: TextStyle(
                              fontSize: 12, color: Colors.black45))
                    else
                      Wrap(
                        spacing: 8,
                        runSpacing: 8,
                        children: _courses
                            .map((c) => Container(
                                  padding: const EdgeInsets.symmetric(
                                      horizontal: 10, vertical: 6),
                                  decoration: BoxDecoration(
                                    color: const Color(0xFF5B7BFF).withOpacity(0.1),
                                    borderRadius: BorderRadius.circular(8),
                                    border: Border.all(
                                        color: const Color(0xFF5B7BFF)
                                            .withOpacity(0.3)),
                                  ),
                                  child: Row(
                                    mainAxisSize: MainAxisSize.min,
                                    children: [
                                      Text(c,
                                          style: const TextStyle(
                                              fontSize: 12,
                                              color: Color(0xFF5B7BFF),
                                              fontWeight: FontWeight.w500)),
                                      const SizedBox(width: 6),
                                      GestureDetector(
                                        onTap: () => _removeCourse(c),
                                        child: const Icon(Icons.close_rounded,
                                            size: 14,
                                            color: Color(0xFF5B7BFF)),
                                      ),
                                    ],
                                  ),
                                ))
                            .toList(),
                      ),

                    // Save button — only show if courses changed from backend
                    if (_courses.isNotEmpty) ...[
                      const SizedBox(height: 14),
                      SizedBox(
                        width: double.infinity,
                        height: 42,
                        child: ElevatedButton(
                          style: ElevatedButton.styleFrom(
                            backgroundColor: const Color(0xFF5B7BFF),
                            shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10)),
                            elevation: 0,
                          ),
                          onPressed: _savingCourses ? null : _saveCourses,
                          child: _savingCourses
                              ? const SizedBox(
                                  width: 18, height: 18,
                                  child: CircularProgressIndicator(
                                      color: Colors.white, strokeWidth: 2))
                              : const Text('Save Courses',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontWeight: FontWeight.w600,
                                      fontSize: 13)),
                        ),
                      ),
                    ],
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // ── Linked Accounts
              _Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: const [
                    Text('Linked Accounts',
                        style: TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14)),
                    SizedBox(height: 8),
                    Text('LMS: Connected (Moodle)',
                        style: TextStyle(fontSize: 13)),
                    SizedBox(height: 4),
                    Text('Google Drive: Not Connected',
                        style: TextStyle(fontSize: 13, color: Colors.black45)),
                  ],
                ),
              ),

              const SizedBox(height: 24),

              // ── Notification Preferences
              const _SectionLabel('Notification Preferences'),
              const SizedBox(height: 10),

              _Card(
                child: Column(
                  children: [
                    _PrefToggle(
                      label: 'Email Notifications',
                      value: _prefs.emailNotifications,
                      onChanged: (v) => _togglePref(emailNotifications: v),
                    ),
                    const Divider(height: 1),
                    _PrefToggle(
                      label: 'Push Notifications',
                      value: _prefs.pushNotifications,
                      onChanged: (v) => _togglePref(pushNotifications: v),
                    ),
                    const Divider(height: 1),
                    _PrefToggle(
                      label: 'Lab Alerts',
                      value: _prefs.labAlerts,
                      onChanged: (v) => _togglePref(labAlerts: v),
                    ),
                    const Divider(height: 1),
                    _PrefToggle(
                      label: 'New Resource Alerts',
                      value: _prefs.newResourceAlerts,
                      onChanged: (v) => _togglePref(newResourceAlerts: v),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 12),

              // ── Privacy & Data
              _Card(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text('Privacy & Data',
                        style: TextStyle(
                            fontWeight: FontWeight.w600, fontSize: 14)),
                    const SizedBox(height: 10),
                    _PrivacyLink('Export my data →', onTap: () {}),
                    _PrivacyLink('Manage permissions →', onTap: () {}),
                    _PrivacyLink('Delete history →', onTap: () {}),
                  ],
                ),
              ),

              const SizedBox(height: 28),

              // ── Logout
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5B7BFF),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  onPressed: _handleLogout,
                  child: const Text('Logout',
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white)),
                ),
              ),

              const SizedBox(height: 12),

              // ── Delete Account
              SizedBox(
                width: double.infinity,
                height: 50,
                child: ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.red,
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                    elevation: 0,
                  ),
                  onPressed: _handleDeleteAccount,
                  child: const Text('Delete Account',
                      style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w600,
                          color: Colors.white)),
                ),
              ),

              const SizedBox(height: 32),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Reusable widgets

class _SectionLabel extends StatelessWidget {
  final String text;
  const _SectionLabel(this.text);
  @override
  Widget build(BuildContext context) => Text(text,
      style: const TextStyle(
          fontSize: 15, fontWeight: FontWeight.bold, color: Color(0xFF1E1E1E)));
}

class _Card extends StatelessWidget {
  final Widget child;
  const _Card({required this.child});
  @override
  Widget build(BuildContext context) => Container(
        width: double.infinity,
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
          boxShadow: [
            BoxShadow(color: Colors.black.withOpacity(0.04),
                blurRadius: 8, offset: const Offset(0, 2)),
          ],
        ),
        child: child,
      );
}

class _PrefToggle extends StatelessWidget {
  final String label;
  final bool value;
  final ValueChanged<bool> onChanged;
  const _PrefToggle({required this.label, required this.value, required this.onChanged});
  @override
  Widget build(BuildContext context) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 4),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text(label, style: const TextStyle(fontSize: 14, color: Color(0xFF1E1E1E))),
            Switch(value: value, onChanged: onChanged, activeColor: const Color(0xFF5B7BFF)),
          ],
        ),
      );
}

class _PrivacyLink extends StatelessWidget {
  final String label;
  final VoidCallback onTap;
  const _PrivacyLink(this.label, {required this.onTap});
  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Padding(
          padding: const EdgeInsets.symmetric(vertical: 5),
          child: Text(label,
              style: const TextStyle(fontSize: 13, color: Color(0xFF5B7BFF))),
        ),
      );
}