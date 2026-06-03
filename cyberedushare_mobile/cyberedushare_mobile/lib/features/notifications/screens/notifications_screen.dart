import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:http/http.dart' as http;
import '../../../features/auth/providers/auth_provider.dart';

class NotificationsScreen extends StatefulWidget {
  const NotificationsScreen({super.key});
  @override
  State<NotificationsScreen> createState() => _NotificationsScreenState();
}

class _NotificationsScreenState extends State<NotificationsScreen> {
  List<dynamic> _notifications = [];
  int _unreadCount = 0;
  bool _loading = true;

  // Change to your laptop IP
  static const String _baseUrl = 'http://10.0.2.2:5000/api';

  String get _token => context.read<AuthProvider>().token ?? '';

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() => _loading = true);
    try {
      final response = await http.get(
        Uri.parse('$_baseUrl/notifications'),
        headers: {
          'Authorization': 'Bearer $_token',
          'Content-Type': 'application/json',
        },
      );
      final data = jsonDecode(response.body);
      if (mounted && response.statusCode == 200) {
        setState(() {
          _notifications = data['notifications'] ?? [];
          _unreadCount = data['unreadCount'] ?? 0;
        });
      }
    } catch (_) {}
    if (mounted) setState(() => _loading = false);
  }

  Future<void> _markAllRead() async {
    try {
      await http.put(
        Uri.parse('$_baseUrl/notifications/mark-all-read'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      setState(() {
        _notifications =
            _notifications.map((n) {
              return {...n, 'isRead': true};
            }).toList();
        _unreadCount = 0;
      });
    } catch (_) {}
  }

  Future<void> _markRead(String id, int index) async {
    try {
      await http.put(
        Uri.parse('$_baseUrl/notifications/$id/read'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      setState(() {
        _notifications[index] = {..._notifications[index], 'isRead': true};
        if (_unreadCount > 0) _unreadCount--;
      });
    } catch (_) {}
  }

  Future<void> _delete(String id) async {
    try {
      await http.delete(
        Uri.parse('$_baseUrl/notifications/$id'),
        headers: {'Authorization': 'Bearer $_token'},
      );
      setState(() {
        _notifications.removeWhere((n) => n['_id'] == id);
      });
    } catch (_) {}
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
      case 'lab_reminder':
        return Icons.science_rounded;
      default:
        return Icons.notifications_rounded;
    }
  }

  Color _colorForType(String type) {
    switch (type) {
      case 'answer_received':
        return const Color(0xFF5B7BFF);
      case 'resource_uploaded':
        return const Color(0xFF1ABC9C);
      case 'challenge_available':
        return const Color(0xFFE74C3C);
      case 'project_liked':
        return const Color(0xFFE91E63);
      case 'project_commented':
        return const Color(0xFFE67E22);
      case 'lab_reminder':
        return const Color(0xFF9B59B6);
      default:
        return Colors.grey;
    }
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

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      body: SafeArea(
        child: Column(
          children: [
            // ── Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 24),
              decoration: const BoxDecoration(
                color: Color(0xFF5B7BFF),
                borderRadius: BorderRadius.only(
                  bottomLeft: Radius.circular(24),
                  bottomRight: Radius.circular(24),
                ),
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text(
                          'Notifications',
                          style: TextStyle(
                            fontSize: 22,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                        if (_unreadCount > 0)
                          Text(
                            '$_unreadCount unread',
                            style: const TextStyle(
                              fontSize: 13,
                              color: Colors.white70,
                            ),
                          ),
                      ],
                    ),
                  ),
                  if (_unreadCount > 0)
                    TextButton(
                      onPressed: _markAllRead,
                      child: const Text(
                        'Mark all read',
                        style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                    ),
                  IconButton(
                    icon: const Icon(
                      Icons.refresh_rounded,
                      color: Colors.white,
                    ),
                    onPressed: _load,
                  ),
                ],
              ),
            ),

            // ── Notification list
            Expanded(
              child:
                  _loading
                      ? const Center(
                        child: CircularProgressIndicator(
                          color: Color(0xFF5B7BFF),
                        ),
                      )
                      : _notifications.isEmpty
                      ? Center(
                        child: Column(
                          mainAxisSize: MainAxisSize.min,
                          children: const [
                            Text('🔔', style: TextStyle(fontSize: 48)),
                            SizedBox(height: 16),
                            Text(
                              'No notifications yet',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            SizedBox(height: 8),
                            Text(
                              'You\'ll be notified about answers,\nnew resources and more.',
                              textAlign: TextAlign.center,
                              style: TextStyle(
                                color: Colors.black45,
                                fontSize: 13,
                              ),
                            ),
                          ],
                        ),
                      )
                      : RefreshIndicator(
                        onRefresh: _load,
                        color: const Color(0xFF5B7BFF),
                        child: ListView.separated(
                          padding: const EdgeInsets.all(16),
                          itemCount: _notifications.length,
                          separatorBuilder:
                              (_, __) => const SizedBox(height: 10),
                          itemBuilder: (ctx, i) {
                            final n = _notifications[i];
                            final type = n['type'] ?? '';
                            final isRead = n['isRead'] ?? false;
                            final color = _colorForType(type);

                            return Dismissible(
                              key: Key(n['_id'] ?? i.toString()),
                              direction: DismissDirection.endToStart,
                              background: Container(
                                alignment: Alignment.centerRight,
                                padding: const EdgeInsets.only(right: 20),
                                decoration: BoxDecoration(
                                  color: Colors.red,
                                  borderRadius: BorderRadius.circular(14),
                                ),
                                child: const Icon(
                                  Icons.delete_rounded,
                                  color: Colors.white,
                                ),
                              ),
                              onDismissed: (_) => _delete(n['_id']),
                              child: GestureDetector(
                                onTap: () {
                                  if (!isRead) _markRead(n['_id'], i);
                                },
                                child: Container(
                                  padding: const EdgeInsets.all(14),
                                  decoration: BoxDecoration(
                                    color:
                                        isRead
                                            ? Colors.white
                                            : const Color(0xFFEEF1FF),
                                    borderRadius: BorderRadius.circular(14),
                                    border:
                                        isRead
                                            ? null
                                            : Border.all(
                                              color: const Color(
                                                0xFF5B7BFF,
                                              ).withOpacity(0.3),
                                            ),
                                    boxShadow: [
                                      BoxShadow(
                                        color: Colors.black.withOpacity(0.04),
                                        blurRadius: 6,
                                        offset: const Offset(0, 2),
                                      ),
                                    ],
                                  ),
                                  child: Row(
                                    crossAxisAlignment:
                                        CrossAxisAlignment.start,
                                    children: [
                                      // Icon
                                      Container(
                                        width: 42,
                                        height: 42,
                                        decoration: BoxDecoration(
                                          color: color.withOpacity(0.12),
                                          borderRadius: BorderRadius.circular(
                                            12,
                                          ),
                                        ),
                                        child: Icon(
                                          _iconForType(type),
                                          color: color,
                                          size: 20,
                                        ),
                                      ),
                                      const SizedBox(width: 12),
                                      Expanded(
                                        child: Column(
                                          crossAxisAlignment:
                                              CrossAxisAlignment.start,
                                          children: [
                                            Row(
                                              children: [
                                                Expanded(
                                                  child: Text(
                                                    n['title'] ?? '',
                                                    style: TextStyle(
                                                      fontSize: 13,
                                                      fontWeight:
                                                          isRead
                                                              ? FontWeight
                                                                  .normal
                                                              : FontWeight.bold,
                                                      color: const Color(
                                                        0xFF1E1E1E,
                                                      ),
                                                    ),
                                                  ),
                                                ),
                                                if (!isRead)
                                                  Container(
                                                    width: 8,
                                                    height: 8,
                                                    decoration:
                                                        const BoxDecoration(
                                                          color: Color(
                                                            0xFF5B7BFF,
                                                          ),
                                                          shape:
                                                              BoxShape.circle,
                                                        ),
                                                  ),
                                              ],
                                            ),
                                            if ((n['body'] ?? '')
                                                .isNotEmpty) ...[
                                              const SizedBox(height: 3),
                                              Text(
                                                n['body'],
                                                style: const TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.black54,
                                                ),
                                                maxLines: 2,
                                                overflow: TextOverflow.ellipsis,
                                              ),
                                            ],
                                            const SizedBox(height: 4),
                                            Text(
                                              _timeAgo(n['createdAt'] ?? ''),
                                              style: const TextStyle(
                                                fontSize: 11,
                                                color: Colors.black38,
                                              ),
                                            ),
                                          ],
                                        ),
                                      ),
                                    ],
                                  ),
                                ),
                              ),
                            );
                          },
                        ),
                      ),
            ),
          ],
        ),
      ),
    );
  }
}
