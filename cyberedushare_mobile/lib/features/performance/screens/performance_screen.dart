import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/performance/providers/performance_provider.dart';
import '../../../features/performance/models/performance_model.dart';

class PerformanceScreen extends StatefulWidget {
  const PerformanceScreen({super.key});

  @override
  State<PerformanceScreen> createState() => _PerformanceScreenState();
}

class _PerformanceScreenState extends State<PerformanceScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.index == 1) _loadLearningPath();
    });
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String get _token => context.read<AuthProvider>().token ?? '';

  void _load() {
    context.read<PerformanceProvider>().loadPerformance(token: _token);
  }

  void _loadLearningPath() {
    context.read<PerformanceProvider>().loadLearningPath(token: _token);
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<PerformanceProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      body: SafeArea(
        child: Column(
          children: [
            // ── Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 0),
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
                  const Text('Performance',
                      style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white)),
                  const SizedBox(height: 4),
                  Text(
                    provider.data != null
                        ? 'Hello, ${provider.data!.username} 👋'
                        : 'Your progress and learning path',
                    style: const TextStyle(
                        fontSize: 13, color: Colors.white70),
                  ),
                  const SizedBox(height: 16),
                  TabBar(
                    controller: _tabController,
                    indicatorColor: Colors.white,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white54,
                    tabs: const [
                      Tab(text: 'My Stats'),
                      Tab(text: 'Learning Path'),
                    ],
                  ),
                ],
              ),
            ),

            Expanded(
              child: provider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: Color(0xFF5B7BFF)))
                  : TabBarView(
                      controller: _tabController,
                      children: [
                        _StatsTab(data: provider.data),
                        _LearningPathTab(
                          steps: provider.learningPath,
                          loading: provider.learningPathLoading,
                          enrolledCourses:
                              provider.data?.enrolledCourses ?? [],
                        ),
                      ],
                    ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─────────────────────────────────────────
// STATS TAB
// ─────────────────────────────────────────
class _StatsTab extends StatelessWidget {
  final PerformanceData? data;
  const _StatsTab({required this.data});

  @override
  Widget build(BuildContext context) {
    if (data == null) {
      return const Center(
          child: Text('No data available.',
              style: TextStyle(color: Colors.black45)));
    }

    final s = data!.stats;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const SizedBox(height: 4),

          // ── CTF Score banner
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF5B7BFF), Color(0xFF9B59B6)],
              ),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('CTF Score',
                          style: TextStyle(
                              color: Colors.white70, fontSize: 13)),
                      const SizedBox(height: 4),
                      Text('${s.ctfScore} pts',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 32,
                              fontWeight: FontWeight.bold)),
                      if (s.ctfRank != null)
                        Text('Rank #${s.ctfRank}',
                            style: const TextStyle(
                                color: Colors.white70,
                                fontSize: 13)),
                    ],
                  ),
                ),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.end,
                  children: [
                    const Text('🏆',
                        style: TextStyle(fontSize: 40)),
                    const SizedBox(height: 4),
                    Text('${s.challengesSolved} solved',
                        style: const TextStyle(
                            color: Colors.white70,
                            fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),

          const SizedBox(height: 20),
          const Text('Activity Overview',
              style: TextStyle(
                  fontSize: 15, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),

          // ── Stats grid
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
            children: [
              _StatCard(
                icon: Icons.science_rounded,
                label: 'Labs Completed',
                value: '${s.labsCompleted}',
                color: const Color(0xFF1ABC9C),
              ),
              _StatCard(
                icon: Icons.folder_rounded,
                label: 'Projects Submitted',
                value: '${s.projectsSubmitted}',
                color: const Color(0xFFE67E22),
              ),
              _StatCard(
                icon: Icons.bookmark_rounded,
                label: 'Resources Saved',
                value: '${s.resourcesBookmarked}',
                color: const Color(0xFF5B7BFF),
              ),
              _StatCard(
                icon: Icons.upload_rounded,
                label: 'Resources Uploaded',
                value: '${s.resourcesUploaded}',
                color: const Color(0xFF9B59B6),
              ),
              _StatCard(
                icon: Icons.help_rounded,
                label: 'Questions Asked',
                value: '${s.questionsAsked}',
                color: const Color(0xFFE74C3C),
              ),
              _StatCard(
                icon: Icons.chat_bubble_rounded,
                label: 'Answers Given',
                value: '${s.answersGiven}',
                color: const Color(0xFF2ECC71),
              ),
            ],
          ),

          const SizedBox(height: 20),

          // ── Enrolled courses
          if (data!.enrolledCourses.isNotEmpty) ...[
            const Text('Enrolled Courses',
                style: TextStyle(
                    fontSize: 15, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: data!.enrolledCourses
                  .map((c) => Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 8),
                        decoration: BoxDecoration(
                          color: const Color(0xFF5B7BFF)
                              .withOpacity(0.1),
                          borderRadius: BorderRadius.circular(10),
                          border: Border.all(
                              color: const Color(0xFF5B7BFF)
                                  .withOpacity(0.3)),
                        ),
                        child: Text(c,
                            style: const TextStyle(
                                fontSize: 13,
                                color: Color(0xFF5B7BFF),
                                fontWeight: FontWeight.w500)),
                      ))
                  .toList(),
            ),
          ],

          const SizedBox(height: 32),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────
// LEARNING PATH TAB
// ─────────────────────────────────────────
class _LearningPathTab extends StatelessWidget {
  final List<LearningPathStep> steps;
  final bool loading;
  final List<String> enrolledCourses;

  const _LearningPathTab({
    required this.steps,
    required this.loading,
    required this.enrolledCourses,
  });

  @override
  Widget build(BuildContext context) {
    if (loading) {
      return const Center(
          child:
              CircularProgressIndicator(color: Color(0xFF5B7BFF)));
    }

    if (enrolledCourses.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text('📚',
                  style: TextStyle(fontSize: 48)),
              const SizedBox(height: 16),
              const Text('No Enrolled Courses',
                  style: TextStyle(
                      fontSize: 16, fontWeight: FontWeight.bold)),
              const SizedBox(height: 8),
              const Text(
                  'Add your enrolled courses in your profile to get a personalized learning path.',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                      color: Colors.black54, height: 1.5)),
              const SizedBox(height: 20),
              ElevatedButton(
                style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5B7BFF)),
                onPressed: () =>
                    Navigator.pushNamed(context, '/profile'),
                child: const Text('Go to Profile',
                    style: TextStyle(color: Colors.white)),
              ),
            ],
          ),
        ),
      );
    }

    if (steps.isEmpty) {
      return const Center(
          child: Text('Loading your learning path...',
              style: TextStyle(color: Colors.black45)));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: steps.length,
      separatorBuilder: (_, __) => const SizedBox(height: 16),
      itemBuilder: (ctx, i) => _LearningStepCard(step: steps[i]),
    );
  }
}

// ── Learning Step Card
class _LearningStepCard extends StatefulWidget {
  final LearningPathStep step;
  const _LearningStepCard({required this.step});

  @override
  State<_LearningStepCard> createState() => _LearningStepCardState();
}

class _LearningStepCardState extends State<_LearningStepCard> {
  bool _expanded = false;

  IconData _taskIcon(String icon) {
    switch (icon) {
      case 'book':    return Icons.menu_book_rounded;
      case 'laptop':  return Icons.laptop_rounded;
      case 'chat':    return Icons.chat_bubble_rounded;
      case 'flag':    return Icons.flag_rounded;
      default:        return Icons.check_circle_rounded;
    }
  }

  Color _taskColor(String type) {
    switch (type) {
      case 'resource':  return const Color(0xFF5B7BFF);
      case 'lab':       return const Color(0xFF1ABC9C);
      case 'qa':        return const Color(0xFFE67E22);
      case 'challenge': return const Color(0xFFE74C3C);
      default:          return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final step     = widget.step;
    final progress = step.progress;

    return Container(
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        children: [
          // ── Header
          GestureDetector(
            onTap: () => setState(() => _expanded = !_expanded),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Container(
                        width: 36,
                        height: 36,
                        decoration: BoxDecoration(
                          color: const Color(0xFF5B7BFF),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        alignment: Alignment.center,
                        child: Text('${step.step}',
                            style: const TextStyle(
                                color: Colors.white,
                                fontWeight: FontWeight.bold,
                                fontSize: 16)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Text(step.title,
                                style: const TextStyle(
                                    fontSize: 14,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E1E1E))),
                            Text(step.course,
                                style: const TextStyle(
                                    fontSize: 12,
                                    color: Color(0xFF5B7BFF))),
                          ],
                        ),
                      ),
                      Text(
                          '${step.completedCount}/${step.tasks.length}',
                          style: const TextStyle(
                              fontSize: 12,
                              color: Colors.black45)),
                      const SizedBox(width: 8),
                      Icon(
                        _expanded
                            ? Icons.keyboard_arrow_up_rounded
                            : Icons.keyboard_arrow_down_rounded,
                        color: Colors.black38,
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),
                  // Progress bar
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: progress,
                      backgroundColor: const Color(0xFFEEF1FF),
                      valueColor: const AlwaysStoppedAnimation<Color>(
                          Color(0xFF5B7BFF)),
                      minHeight: 6,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                      '${(progress * 100).toInt()}% complete',
                      style: const TextStyle(
                          fontSize: 11, color: Colors.black45)),
                ],
              ),
            ),
          ),

          // ── Tasks (expanded)
          if (_expanded) ...[
            const Divider(height: 1),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: step.tasks
                    .map((task) => Padding(
                          padding:
                              const EdgeInsets.only(bottom: 12),
                          child: Row(
                            children: [
                              Container(
                                width: 36,
                                height: 36,
                                decoration: BoxDecoration(
                                  color: task.completed
                                      ? Colors.green
                                          .withOpacity(0.1)
                                      : _taskColor(task.type)
                                          .withOpacity(0.1),
                                  borderRadius:
                                      BorderRadius.circular(10),
                                ),
                                child: Icon(
                                  task.completed
                                      ? Icons.check_rounded
                                      : _taskIcon(task.icon),
                                  color: task.completed
                                      ? Colors.green
                                      : _taskColor(task.type),
                                  size: 18,
                                ),
                              ),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    Text(task.label,
                                        style: TextStyle(
                                            fontSize: 13,
                                            fontWeight:
                                                FontWeight.w600,
                                            color: task.completed
                                                ? Colors.green
                                                : const Color(
                                                    0xFF1E1E1E),
                                            decoration: task
                                                    .completed
                                                ? TextDecoration
                                                    .lineThrough
                                                : null)),
                                    Text(task.description,
                                        style: const TextStyle(
                                            fontSize: 11,
                                            color: Colors.black45,
                                            height: 1.4)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ))
                    .toList(),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

// ── Stat Card
class _StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
  });

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.all(16),
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
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: color.withOpacity(0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, color: color, size: 20),
            ),
            const Spacer(),
            Text(value,
                style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: color)),
            const SizedBox(height: 2),
            Text(label,
                style: const TextStyle(
                    fontSize: 11, color: Colors.black45),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ],
        ),
      );
}