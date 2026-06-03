import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/challenges/providers/challenge_provider.dart';
import '../../../features/challenges/models/challenge_model.dart';

class ChallengesScreen extends StatefulWidget {
  const ChallengesScreen({super.key});

  @override
  State<ChallengesScreen> createState() => _ChallengesScreenState();
}

class _ChallengesScreenState extends State<ChallengesScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;
  String? _selectedCategory;
  String? _selectedDifficulty;

  final List<String> _categories = [
    'Web', 'Crypto', 'Forensics', 'Reverse', 'Pwn', 'OSINT', 'Misc',
  ];
  final List<String> _difficulties = ['Easy', 'Medium', 'Hard'];

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
    _tabController.addListener(() {
      if (_tabController.index == 1) _loadLeaderboard();
    });
    _load();
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  String get _token => context.read<AuthProvider>().token ?? '';

  void _load({String? category, String? difficulty}) {
    context.read<ChallengeProvider>().loadChallenges(
          token: _token,
          category: category,
          difficulty: difficulty,
        );
  }

  void _loadLeaderboard() {
    context.read<ChallengeProvider>().loadLeaderboard(token: _token);
  }

  Color _difficultyColor(String d) {
    switch (d) {
      case 'Easy':   return Colors.green;
      case 'Hard':   return Colors.red;
      default:       return Colors.orange;
    }
  }

  Color _categoryColor(String cat) {
    const map = {
      'Web':       Color(0xFF5B7BFF),
      'Crypto':    Color(0xFF9B59B6),
      'Forensics': Color(0xFF1ABC9C),
      'Reverse':   Color(0xFFE74C3C),
      'Pwn':       Color(0xFFE67E22),
      'OSINT':     Color(0xFF2ECC71),
      'Misc':      Color(0xFF95A5A6),
    };
    return map[cat] ?? const Color(0xFF5B7BFF);
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
                  const Text('CTF Challenges',
                      style: TextStyle(
                          fontSize: 22,
                          fontWeight: FontWeight.bold,
                          color: Colors.white)),
                  const SizedBox(height: 4),
                  const Text('Capture The Flag — submit flags to earn points',
                      style: TextStyle(fontSize: 13, color: Colors.white70)),
                  const SizedBox(height: 16),
                  TabBar(
                    controller: _tabController,
                    indicatorColor: Colors.white,
                    labelColor: Colors.white,
                    unselectedLabelColor: Colors.white54,
                    tabs: const [
                      Tab(text: 'Challenges'),
                      Tab(text: 'Leaderboard'),
                    ],
                  ),
                ],
              ),
            ),

            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _ChallengesTab(
                    categories: _categories,
                    difficulties: _difficulties,
                    selectedCategory: _selectedCategory,
                    selectedDifficulty: _selectedDifficulty,
                    onCategoryChanged: (c) {
                      setState(() => _selectedCategory = c);
                      _load(category: c, difficulty: _selectedDifficulty);
                    },
                    onDifficultyChanged: (d) {
                      setState(() => _selectedDifficulty = d);
                      _load(category: _selectedCategory, difficulty: d);
                    },
                    difficultyColor: _difficultyColor,
                    categoryColor: _categoryColor,
                  ),
                  const _LeaderboardTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Challenges Tab
class _ChallengesTab extends StatelessWidget {
  final List<String> categories;
  final List<String> difficulties;
  final String? selectedCategory;
  final String? selectedDifficulty;
  final Function(String?) onCategoryChanged;
  final Function(String?) onDifficultyChanged;
  final Color Function(String) difficultyColor;
  final Color Function(String) categoryColor;

  const _ChallengesTab({
    required this.categories,
    required this.difficulties,
    required this.selectedCategory,
    required this.selectedDifficulty,
    required this.onCategoryChanged,
    required this.onDifficultyChanged,
    required this.difficultyColor,
    required this.categoryColor,
  });

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ChallengeProvider>();

    return Column(
      children: [
        const SizedBox(height: 12),
        // Category filters
        SizedBox(
          height: 36,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: categories.length + 1,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (ctx, i) {
              if (i == 0) {
                return _Chip(
                  label: 'All',
                  active: selectedCategory == null,
                  color: const Color(0xFF5B7BFF),
                  onTap: () => onCategoryChanged(null),
                );
              }
              final cat = categories[i - 1];
              return _Chip(
                label: cat,
                active: selectedCategory == cat,
                color: categoryColor(cat),
                onTap: () => onCategoryChanged(
                    selectedCategory == cat ? null : cat),
              );
            },
          ),
        ),
        const SizedBox(height: 8),
        // Difficulty filters
        SizedBox(
          height: 36,
          child: ListView.separated(
            scrollDirection: Axis.horizontal,
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: difficulties.length,
            separatorBuilder: (_, __) => const SizedBox(width: 8),
            itemBuilder: (ctx, i) {
              final d = difficulties[i];
              return _Chip(
                label: d,
                active: selectedDifficulty == d,
                color: difficultyColor(d),
                onTap: () => onDifficultyChanged(
                    selectedDifficulty == d ? null : d),
              );
            },
          ),
        ),
        const SizedBox(height: 12),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 20),
          child: Row(
            children: [
              Text('${provider.challenges.length} Challenges',
                  style: const TextStyle(
                      fontSize: 14, fontWeight: FontWeight.bold)),
              const Spacer(),
              Text(
                '${provider.challenges.where((c) => c.isSolved).length} solved',
                style: const TextStyle(fontSize: 12, color: Colors.green),
              ),
            ],
          ),
        ),
        const SizedBox(height: 10),
        Expanded(
          child: provider.isLoading
              ? const Center(
                  child: CircularProgressIndicator(color: Color(0xFF5B7BFF)))
              : provider.challenges.isEmpty
                  ? const Center(
                      child: Text('No challenges found.',
                          style: TextStyle(color: Colors.black45)))
                  : ListView.separated(
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: provider.challenges.length,
                      separatorBuilder: (_, __) =>
                          const SizedBox(height: 12),
                      itemBuilder: (ctx, i) => _ChallengeCard(
                        challenge: provider.challenges[i],
                        categoryColor: categoryColor,
                        difficultyColor: difficultyColor,
                      ),
                    ),
        ),
      ],
    );
  }
}

// ── Challenge Card
class _ChallengeCard extends StatelessWidget {
  final ChallengeModel challenge;
  final Color Function(String) categoryColor;
  final Color Function(String) difficultyColor;

  const _ChallengeCard({
    required this.challenge,
    required this.categoryColor,
    required this.difficultyColor,
  });

  @override
  Widget build(BuildContext context) {
    final catColor  = categoryColor(challenge.category);
    final diffColor = difficultyColor(challenge.difficulty);

    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context,
        '/challenge-detail',
        arguments: challenge.id,
      ),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: challenge.isSolved
              ? Colors.green.shade50
              : Colors.white,
          borderRadius: BorderRadius.circular(16),
          border: challenge.isSolved
              ? Border.all(color: Colors.green.shade200)
              : null,
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
                // Category icon
                Container(
                  width: 42,
                  height: 42,
                  decoration: BoxDecoration(
                    color: catColor.withOpacity(0.12),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  alignment: Alignment.center,
                  child: Text(
                    challenge.category.substring(0, 1),
                    style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: catColor),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(challenge.title,
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1E1E1E))),
                      const SizedBox(height: 2),
                      Text(challenge.category,
                          style: TextStyle(
                              fontSize: 12, color: catColor)),
                    ],
                  ),
                ),
                // Points badge
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 10, vertical: 4),
                  decoration: BoxDecoration(
                    color: const Color(0xFF5B7BFF).withOpacity(0.1),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text('${challenge.points} pts',
                      style: const TextStyle(
                          fontSize: 12,
                          color: Color(0xFF5B7BFF),
                          fontWeight: FontWeight.bold)),
                ),
              ],
            ),
            if (challenge.description.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(challenge.description,
                  style: const TextStyle(
                      fontSize: 12, color: Colors.black54),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                _Badge(challenge.difficulty, diffColor),
                const SizedBox(width: 8),
                _Badge('${challenge.solveCount} solves', Colors.grey),
                if (challenge.hints.isNotEmpty) ...[
                  const SizedBox(width: 8),
                  _Badge('${challenge.hints.length} hints',
                      Colors.amber.shade700),
                ],
                const Spacer(),
                if (challenge.isSolved)
                  const Row(children: [
                    Icon(Icons.check_circle_rounded,
                        color: Colors.green, size: 16),
                    SizedBox(width: 4),
                    Text('Solved',
                        style: TextStyle(
                            color: Colors.green,
                            fontSize: 12,
                            fontWeight: FontWeight.w600)),
                  ]),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Leaderboard Tab
class _LeaderboardTab extends StatelessWidget {
  const _LeaderboardTab();

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ChallengeProvider>();
    final entries  = provider.leaderboard;

    if (entries.isEmpty) {
      return const Center(
          child: Text('No scores yet.',
              style: TextStyle(color: Colors.black45)));
    }

    return ListView.separated(
      padding: const EdgeInsets.all(16),
      itemCount: entries.length,
      separatorBuilder: (_, __) => const SizedBox(height: 10),
      itemBuilder: (ctx, i) {
        final e = entries[i];
        final isTop3 = e.rank <= 3;
        final medalColors = [
          const Color(0xFFFFD700),
          const Color(0xFFC0C0C0),
          const Color(0xFFCD7F32),
        ];

        return Container(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          decoration: BoxDecoration(
            color: isTop3
                ? medalColors[e.rank - 1].withOpacity(0.08)
                : Colors.white,
            borderRadius: BorderRadius.circular(14),
            border: isTop3
                ? Border.all(
                    color: medalColors[e.rank - 1].withOpacity(0.4))
                : null,
            boxShadow: [
              BoxShadow(
                  color: Colors.black.withOpacity(0.03),
                  blurRadius: 6,
                  offset: const Offset(0, 2)),
            ],
          ),
          child: Row(
            children: [
              // Rank
              SizedBox(
                width: 36,
                child: isTop3
                    ? Text(
                        ['🥇', '🥈', '🥉'][e.rank - 1],
                        style: const TextStyle(fontSize: 22),
                        textAlign: TextAlign.center,
                      )
                    : Text('#${e.rank}',
                        style: const TextStyle(
                            fontSize: 13,
                            fontWeight: FontWeight.w600,
                            color: Colors.black45),
                        textAlign: TextAlign.center),
              ),
              const SizedBox(width: 12),
              // Avatar
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF1FF),
                  borderRadius: BorderRadius.circular(10),
                ),
                alignment: Alignment.center,
                child: Text(
                  e.username.isNotEmpty
                      ? e.username[0].toUpperCase()
                      : '?',
                  style: const TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF5B7BFF)),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(e.username,
                        style: const TextStyle(
                            fontSize: 14,
                            fontWeight: FontWeight.w600)),
                    Text('${e.solveCount} challenges solved',
                        style: const TextStyle(
                            fontSize: 11, color: Colors.black45)),
                  ],
                ),
              ),
              Text('${e.totalPoints} pts',
                  style: const TextStyle(
                      fontSize: 15,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFF5B7BFF))),
            ],
          ),
        );
      },
    );
  }
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge(this.label, this.color);

  @override
  Widget build(BuildContext context) => Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color.withOpacity(0.1),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(label,
            style: TextStyle(
                fontSize: 11,
                color: color,
                fontWeight: FontWeight.w500)),
      );
}

class _Chip extends StatelessWidget {
  final String label;
  final bool active;
  final Color color;
  final VoidCallback onTap;

  const _Chip({
    required this.label,
    required this.active,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding: const EdgeInsets.symmetric(
              horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: active ? color : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
                color: active ? color : Colors.grey.shade300),
          ),
          child: Text(label,
              style: TextStyle(
                  fontSize: 12,
                  color: active ? Colors.white : Colors.black54,
                  fontWeight: FontWeight.w500)),
        ),
      );
}