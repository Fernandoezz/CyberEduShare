import 'dart:convert';
import 'package:http/http.dart' as http;
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../scaffold/main_scaffold.dart';

class HomeScreen extends StatelessWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AuthProvider>().currentUser;
    final username = user?.username ?? 'Student';

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      body: SafeArea(
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              _Header(username: username),
              const SizedBox(height: 20),
              _SectionTitle('Recommended For You ✨'),
              const SizedBox(height: 12),
              _RecommendationsRow(),
              const SizedBox(height: 24),
              _SectionTitle('Quick Actions'),
              const SizedBox(height: 12),
              _QuickActions(),
              const SizedBox(height: 24),
              _SectionTitle('Recent Activity Feed'),
              const SizedBox(height: 12),
              const _ActivityFeed(),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Header Widget
class _Header extends StatelessWidget {
  final String username;
  const _Header({required this.username});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.fromLTRB(20, 20, 20, 28),
      decoration: const BoxDecoration(
        color: Color(0xFF5B7BFF),
        borderRadius: BorderRadius.only(
          bottomLeft: Radius.circular(24),
          bottomRight: Radius.circular(24),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Expanded(
                child: Text(
                  'Hi, $username 👋\nReady to learn today?',
                  style: const TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                    color: Colors.white,
                    height: 1.4,
                  ),
                ),
              ),

              // ── Profile icon — switches to profile tab
              GestureDetector(
                onTap: () => MainScaffold.switchTab(4),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.person_outline_rounded,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
              ),

              const SizedBox(width: 10),

              // ── Notifications icon — switches to notifications tab
              GestureDetector(
                onTap: () => MainScaffold.switchTab(3),
                child: Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: Colors.white.withOpacity(0.2),
                    shape: BoxShape.circle,
                  ),
                  child: const Icon(
                    Icons.notifications_outlined,
                    color: Colors.white,
                    size: 22,
                  ),
                ),
              ),
            ],
          ),

          const SizedBox(height: 16),

          // ── Search bar — switches to search tab
          GestureDetector(
            onTap: () => MainScaffold.switchTab(1),
            child: Container(
              height: 44,
              padding: const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: const [
                  Icon(Icons.search_rounded, color: Colors.black38, size: 20),
                  SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Search',
                      style: TextStyle(color: Colors.black38, fontSize: 14),
                    ),
                  ),
                  Text(
                    'All ▾',
                    style: TextStyle(color: Colors.black38, fontSize: 13),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

// ── Section Title
class _SectionTitle extends StatelessWidget {
  final String title;
  const _SectionTitle(this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: Text(
        title,
        style: const TextStyle(
          fontSize: 16,
          fontWeight: FontWeight.bold,
          color: Color(0xFF1E1E1E),
        ),
      ),
    );
  }
}

// ── Recommendations Row
class _RecommendationsRow extends StatefulWidget {
  const _RecommendationsRow();

  @override
  State<_RecommendationsRow> createState() => _RecommendationsRowState();
}

class _RecommendationsRowState extends State<_RecommendationsRow> {
  List<dynamic> _recs = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final token = context.read<AuthProvider>().token ?? '';
      final response = await http.get(
        Uri.parse('http://10.0.2.2:5000/api/recommendations'),
        headers: {
          'Authorization': 'Bearer $token',
          'Content-Type': 'application/json',
        },
      );
      final data = jsonDecode(response.body);
      if (mounted && response.statusCode == 200) {
        setState(() => _recs = data['recommendations'] ?? []);
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Color _diffColor(String d) {
    switch (d) {
      case 'Easy':
        return Colors.green;
      case 'Hard':
        return Colors.red;
      default:
        return Colors.orange;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SizedBox(
        height: 130,
        child: Center(
          child: CircularProgressIndicator(color: Color(0xFF5B7BFF)),
        ),
      );
    }

    if (_recs.isEmpty) {
      return Padding(
        padding: const EdgeInsets.symmetric(horizontal: 20),
        child: Container(
          width: double.infinity,
          padding: const EdgeInsets.all(20),
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(14),
          ),
          child: const Column(
            children: [
              Text('🎓', style: TextStyle(fontSize: 28)),
              SizedBox(height: 8),
              Text(
                'Enroll in courses in your profile to get AI-powered recommendations',
                textAlign: TextAlign.center,
                style: TextStyle(color: Colors.black54, fontSize: 12),
              ),
            ],
          ),
        ),
      );
    }

    return SizedBox(
      height: 160,
      child: ListView.separated(
        scrollDirection: Axis.horizontal,
        padding: const EdgeInsets.symmetric(horizontal: 20),
        itemCount: _recs.length,
        separatorBuilder: (_, __) => const SizedBox(width: 12),
        itemBuilder: (ctx, i) {
          final r = _recs[i];
          return GestureDetector(
            onTap:
                () => Navigator.pushNamed(
                  context,
                  '/resource-detail',
                  arguments: r['id']?.toString(),
                ),
            child: Container(
              width: 200,
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: Colors.white,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withOpacity(0.04),
                    blurRadius: 8,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 8,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: const Color(0xFF5B7BFF).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          r['subject'] ?? '',
                          style: const TextStyle(
                            fontSize: 10,
                            color: Color(0xFF5B7BFF),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                      const Spacer(),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 6,
                          vertical: 3,
                        ),
                        decoration: BoxDecoration(
                          color: _diffColor(
                            r['difficulty'] ?? '',
                          ).withOpacity(0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          r['difficulty'] ?? '',
                          style: TextStyle(
                            fontSize: 9,
                            color: _diffColor(r['difficulty'] ?? ''),
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 10),
                  Text(
                    r['title'] ?? '',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1E1E1E),
                    ),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                  const Spacer(),
                  Row(
                    children: [
                      const Icon(
                        Icons.person_outline_rounded,
                        size: 12,
                        color: Colors.black38,
                      ),
                      const SizedBox(width: 4),
                      Expanded(
                        child: Text(
                          r['uploaderName'] ?? '',
                          style: const TextStyle(
                            fontSize: 11,
                            color: Colors.black38,
                          ),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

class _QuickActions extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final actions = [
      {'label': 'Start Lab', 'route': '/labs'},
      {'label': 'Upload\nResource', 'route': '/upload-resource'},
      {'label': 'Ask Question', 'route': '/questions'},
      {'label': 'Projects\nRepository', 'route': '/projects'},
      {'label': 'Challenges', 'route': '/challenges'},
      {'label': 'Performance &\nLearning Path', 'route': '/performance'},
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      child: GridView.builder(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: actions.length,
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 3,
          crossAxisSpacing: 10,
          mainAxisSpacing: 10,
          childAspectRatio: 1.3,
        ),
        itemBuilder: (context, index) {
          final action = actions[index];
          return GestureDetector(
            onTap: () => Navigator.pushNamed(context, action['route']!),
            child: Container(
              decoration: BoxDecoration(
                color: const Color(0xFF5B7BFF),
                borderRadius: BorderRadius.circular(14),
              ),
              alignment: Alignment.center,
              padding: const EdgeInsets.all(10),
              child: Text(
                action['label']!,
                textAlign: TextAlign.center,
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                  color: Colors.white,
                  height: 1.3,
                ),
              ),
            ),
          );
        },
      ),
    );
  }
}

// ── Activity Feed
// ── Activity Feed — real notifications
class _ActivityFeed extends StatefulWidget {
  const _ActivityFeed();
  @override
  State<_ActivityFeed> createState() => _ActivityFeedState();
}

class _ActivityFeedState extends State<_ActivityFeed> {
  List<dynamic> _items = [];
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    try {
      final token = context.read<AuthProvider>().token ?? '';
      final response = await http.get(
        Uri.parse('http://10.0.2.2:5000/api/notifications'),
        headers: {'Authorization': 'Bearer $token'},
      );
      final data = jsonDecode(response.body);
      if (mounted && response.statusCode == 200) {
        final all = data['notifications'] as List? ?? [];
        setState(() => _items = all.take(5).toList());
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  String _timeAgo(String createdAt) {
    final date = DateTime.tryParse(createdAt);
    if (date == null) return '';
    final diff = DateTime.now().difference(date);
    if (diff.inMinutes < 1) return 'Just now';
    if (diff.inMinutes < 60) return '${diff.inMinutes}m ago';
    if (diff.inHours < 24) return '${diff.inHours}h ago';
    if (diff.inDays < 7) return '${diff.inDays}d ago';
    return '${date.day}/${date.month}/${date.year}';
  }

  IconData _iconForType(String type) {
    switch (type) {
      case 'answer_received':
        return Icons.chat_bubble_rounded;
      case 'resource_uploaded':
        return Icons.menu_book_rounded;
      case 'challenge_available':
        return Icons.flag_rounded;
      case 'project_liked':
        return Icons.favorite_rounded;
      case 'project_commented':
        return Icons.comment_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_loading) {
      return const SizedBox(
        height: 80,
        child: Center(
          child: CircularProgressIndicator(color: Color(0xFF5B7BFF)),
        ),
      );
    }

    if (_items.isEmpty) {
      return Container(
        margin: const EdgeInsets.symmetric(horizontal: 20),
        padding: const EdgeInsets.all(20),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(14),
        ),
        child: const Center(
          child: Text(
            'No recent activity yet.',
            style: TextStyle(color: Colors.black45, fontSize: 13),
          ),
        ),
      );
    }

    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 20),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(14),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: ListView.separated(
        shrinkWrap: true,
        physics: const NeverScrollableScrollPhysics(),
        itemCount: _items.length,
        separatorBuilder: (_, __) => const Divider(height: 1, indent: 16),
        itemBuilder: (context, index) {
          final item = _items[index];
          final isRead = item['isRead'] ?? true;
          return Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Row(
              children: [
                Icon(
                  _iconForType(item['type'] ?? ''),
                  color: const Color(0xFF5B7BFF),
                  size: 18,
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Text(
                    item['title'] ?? '',
                    style: TextStyle(
                      fontSize: 13,
                      color: const Color(0xFF1E1E1E),
                      fontWeight: isRead ? FontWeight.normal : FontWeight.w600,
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                Text(
                  _timeAgo(item['createdAt'] ?? ''),
                  style: const TextStyle(fontSize: 11, color: Colors.black45),
                ),
                if (!isRead) ...[
                  const SizedBox(width: 6),
                  Container(
                    width: 7,
                    height: 7,
                    decoration: const BoxDecoration(
                      color: Color(0xFF5B7BFF),
                      shape: BoxShape.circle,
                    ),
                  ),
                ],
              ],
            ),
          );
        },
      ),
    );
  }
}
