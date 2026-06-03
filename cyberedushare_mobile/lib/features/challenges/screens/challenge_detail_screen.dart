import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/challenges/providers/challenge_provider.dart';

class ChallengeDetailScreen extends StatefulWidget {
  const ChallengeDetailScreen({super.key});

  @override
  State<ChallengeDetailScreen> createState() =>
      _ChallengeDetailScreenState();
}

class _ChallengeDetailScreenState extends State<ChallengeDetailScreen> {
  bool _loadedArgs = false;
  final TextEditingController _flagController = TextEditingController();
  bool _submitting = false;
  String? _submitError;
  bool _submitSuccess = false;
  int? _pointsEarned;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loadedArgs) {
      _loadedArgs = true;
      final id =
          ModalRoute.of(context)?.settings.arguments as String?;
      if (id != null) {
        final token = context.read<AuthProvider>().token ?? '';
        context.read<ChallengeProvider>().loadChallenge(
            token: token, id: id);
      }
    }
  }

  @override
  void dispose() {
    _flagController.dispose();
    super.dispose();
  }

  String get _token => context.read<AuthProvider>().token ?? '';

  Future<void> _submitFlag(String challengeId) async {
    final flag = _flagController.text.trim();
    if (flag.isEmpty) return;

    setState(() {
      _submitting   = true;
      _submitError  = null;
      _submitSuccess = false;
    });

    try {
      final result = await context.read<ChallengeProvider>().submitFlag(
            token: _token,
            challengeId: challengeId,
            flag: flag,
          );
      setState(() {
        _submitSuccess = true;
        _pointsEarned  = result['pointsEarned'];
        _submitting    = false;
      });
    } catch (e) {
      setState(() {
        _submitError = e.toString();
        _submitting  = false;
      });
    }
  }

  Future<void> _unlockHint(String challengeId, int hintIndex) async {
    final confirm = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Unlock Hint?'),
        content: const Text(
            'Using a hint may deduct points from your score. Continue?'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx, false),
              child: const Text('Cancel')),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: Colors.amber.shade700),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Unlock',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirm != true) return;

    try {
      await context.read<ChallengeProvider>().unlockHint(
            token: _token,
            challengeId: challengeId,
            hintIndex: hintIndex,
          );
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(content: Text(e.toString()),
              backgroundColor: Colors.red),
        );
      }
    }
  }

  Color _difficultyColor(String d) {
    switch (d) {
      case 'Easy':  return Colors.green;
      case 'Hard':  return Colors.red;
      default:      return Colors.orange;
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
    final provider   = context.watch<ChallengeProvider>();
    final challenge  = provider.selectedChallenge;

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFF5B7BFF),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Colors.white, size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: Text(
          challenge?.title ?? 'Challenge',
          style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600),
        ),
      ),
      body: provider.isLoading
          ? const Center(
              child:
                  CircularProgressIndicator(color: Color(0xFF5B7BFF)))
          : challenge == null
              ? const Center(child: Text('Challenge not found'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Info card
                      _Card(
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            Row(children: [
                              _Badge(
                                  challenge.category,
                                  _categoryColor(
                                      challenge.category)),
                              const SizedBox(width: 8),
                              _Badge(
                                  challenge.difficulty,
                                  _difficultyColor(
                                      challenge.difficulty)),
                              const SizedBox(width: 8),
                              _Badge(
                                  '${challenge.points} pts',
                                  const Color(0xFF5B7BFF)),
                              const Spacer(),
                              Text(
                                  '${challenge.solveCount} solves',
                                  style: const TextStyle(
                                      fontSize: 12,
                                      color: Colors.black45)),
                            ]),
                            const SizedBox(height: 12),
                            Text(challenge.title,
                                style: const TextStyle(
                                    fontSize: 18,
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF1E1E1E))),
                            if (challenge.description.isNotEmpty) ...[
                              const SizedBox(height: 10),
                              Text(challenge.description,
                                  style: const TextStyle(
                                      fontSize: 13,
                                      height: 1.6,
                                      color: Colors.black87)),
                            ],
                          ],
                        ),
                      ),

                      const SizedBox(height: 16),

                      // ── Solved banner
                      if (challenge.isSolved || _submitSuccess)
                        Container(
                          width: double.infinity,
                          padding: const EdgeInsets.all(16),
                          margin: const EdgeInsets.only(bottom: 16),
                          decoration: BoxDecoration(
                            color: Colors.green.shade50,
                            borderRadius: BorderRadius.circular(14),
                            border: Border.all(
                                color: Colors.green.shade300),
                          ),
                          child: Row(
                            children: [
                              const Icon(
                                  Icons.check_circle_rounded,
                                  color: Colors.green,
                                  size: 28),
                              const SizedBox(width: 12),
                              Expanded(
                                child: Column(
                                  crossAxisAlignment:
                                      CrossAxisAlignment.start,
                                  children: [
                                    const Text(
                                        'Challenge Solved! 🎉',
                                        style: TextStyle(
                                            fontSize: 15,
                                            fontWeight:
                                                FontWeight.bold,
                                            color: Colors.green)),
                                    if (_pointsEarned != null ||
                                        challenge.pointsEarned !=
                                            null)
                                      Text(
                                          '+${_pointsEarned ?? challenge.pointsEarned} points earned',
                                          style: const TextStyle(
                                              fontSize: 13,
                                              color: Colors.green)),
                                  ],
                                ),
                              ),
                            ],
                          ),
                        ),

                      // ── Flag submission (only if not solved)
                      if (!challenge.isSolved && !_submitSuccess) ...[
                        const Text('Submit Flag',
                            style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        _Card(
                          child: Column(
                            children: [
                              TextField(
                                controller: _flagController,
                                decoration: InputDecoration(
                                  hintText: 'FLAG{...}',
                                  hintStyle: const TextStyle(
                                      color: Colors.black38,
                                      fontFamily: 'monospace'),
                                  filled: true,
                                  fillColor:
                                      const Color(0xFFF5F5F5),
                                  border: OutlineInputBorder(
                                    borderRadius:
                                        BorderRadius.circular(10),
                                    borderSide: BorderSide.none,
                                  ),
                                  prefixIcon: const Icon(
                                      Icons.flag_rounded,
                                      color: Color(0xFF5B7BFF)),
                                  errorText: _submitError,
                                  errorStyle: const TextStyle(
                                      color: Colors.red),
                                ),
                                style: const TextStyle(
                                    fontFamily: 'monospace',
                                    fontSize: 14),
                                onSubmitted: (_) =>
                                    _submitFlag(challenge.id),
                              ),
                              const SizedBox(height: 12),
                              SizedBox(
                                width: double.infinity,
                                height: 48,
                                child: ElevatedButton(
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor:
                                        const Color(0xFF5B7BFF),
                                    shape: RoundedRectangleBorder(
                                        borderRadius:
                                            BorderRadius.circular(
                                                10)),
                                    elevation: 0,
                                  ),
                                  onPressed: _submitting
                                      ? null
                                      : () =>
                                          _submitFlag(challenge.id),
                                  child: _submitting
                                      ? const SizedBox(
                                          width: 20,
                                          height: 20,
                                          child:
                                              CircularProgressIndicator(
                                            color: Colors.white,
                                            strokeWidth: 2,
                                          ),
                                        )
                                      : const Text('Submit Flag',
                                          style: TextStyle(
                                              color: Colors.white,
                                              fontSize: 15,
                                              fontWeight:
                                                  FontWeight.w600)),
                                ),
                              ),
                            ],
                          ),
                        ),
                        const SizedBox(height: 16),
                      ],

                      // ── Hints
                      if (challenge.hints.isNotEmpty) ...[
                        Row(children: [
                          const Text('Hints',
                              style: TextStyle(
                                  fontSize: 15,
                                  fontWeight: FontWeight.bold)),
                          const SizedBox(width: 8),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 2),
                            decoration: BoxDecoration(
                              color: Colors.amber.shade100,
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                                '${challenge.hints.length} available',
                                style: TextStyle(
                                    fontSize: 11,
                                    color: Colors.amber.shade800)),
                          ),
                        ]),
                        const SizedBox(height: 10),
                        ...challenge.hints.asMap().entries.map(
                              (entry) => _HintCard(
                                hintNumber: entry.key + 1,
                                penalty:
                                    entry.value.penalty,
                                unlockedText:
                                    entry.value.unlockedText,
                                onUnlock: () => _unlockHint(
                                    challenge.id, entry.key),
                              ),
                            ),
                        const SizedBox(height: 16),
                      ],

                      const SizedBox(height: 32),
                    ],
                  ),
                ),
    );
  }
}

// ── Hint Card
class _HintCard extends StatelessWidget {
  final int hintNumber;
  final int penalty;
  final String? unlockedText;
  final VoidCallback onUnlock;

  const _HintCard({
    required this.hintNumber,
    required this.penalty,
    required this.unlockedText,
    required this.onUnlock,
  });

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: unlockedText != null
              ? Colors.amber.shade50
              : Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: Border.all(
            color: unlockedText != null
                ? Colors.amber.shade300
                : Colors.grey.shade200,
          ),
        ),
        child: Row(
          children: [
            Container(
              width: 32,
              height: 32,
              decoration: BoxDecoration(
                color: Colors.amber.shade100,
                borderRadius: BorderRadius.circular(8),
              ),
              alignment: Alignment.center,
              child: Text('💡',
                  style: const TextStyle(fontSize: 16)),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: unlockedText != null
                  ? Text(unlockedText!,
                      style: const TextStyle(
                          fontSize: 13, height: 1.5))
                  : Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        Text('Hint $hintNumber',
                            style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600)),
                        Text('-$penalty point penalty',
                            style: TextStyle(
                                fontSize: 11,
                                color: Colors.amber.shade800)),
                      ],
                    ),
            ),
            if (unlockedText == null)
              TextButton(
                onPressed: onUnlock,
                style: TextButton.styleFrom(
                    foregroundColor: Colors.amber.shade800),
                child: const Text('Unlock'),
              ),
          ],
        ),
      );
}

// ── Reusable widgets
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
            BoxShadow(
              color: Colors.black.withOpacity(0.04),
              blurRadius: 8,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: child,
      );
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
          color: color.withOpacity(0.12),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Text(label,
            style: TextStyle(
                fontSize: 11,
                color: color,
                fontWeight: FontWeight.w600)),
      );
}