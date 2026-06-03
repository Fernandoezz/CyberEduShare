import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/labs/providers/lab_provider.dart';
import '../../../features/labs/models/lab_model.dart';

class VirtualLabsScreen extends StatefulWidget {
  const VirtualLabsScreen({super.key});

  @override
  State<VirtualLabsScreen> createState() => _VirtualLabsScreenState();
}

class _VirtualLabsScreenState extends State<VirtualLabsScreen> {
  String? _selectedSubject;
  String? _selectedDifficulty;

  final List<String> _subjects = [
    'CS101', 'CS102', 'CS201', 'CS205', 'Networks', 'Cryptography', 'OS',
  ];
  final List<String> _difficulties = ['Easy', 'Medium', 'Hard'];

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load({String? subject, String? difficulty}) {
    final token = context.read<AuthProvider>().token ?? '';
    context.read<LabProvider>().loadLabs(
          token: token,
          subject: subject,
          difficulty: difficulty,
        );
  }

  Color _difficultyColor(String difficulty) {
    switch (difficulty) {
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
    final provider = context.watch<LabProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
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
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Virtual Labs',
                    style: TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                    ),
                  ),
                  const SizedBox(height: 4),
                  const Text(
                    'Launch a VMware-powered lab session',
                    style: TextStyle(fontSize: 13, color: Colors.white70),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 14),

            // ── Subject filter
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _subjects.length + 1,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _Chip(
                      label: 'All',
                      active: _selectedSubject == null,
                      onTap: () {
                        setState(() => _selectedSubject = null);
                        _load(difficulty: _selectedDifficulty);
                      },
                    );
                  }
                  final s = _subjects[index - 1];
                  return _Chip(
                    label: s,
                    active: _selectedSubject == s,
                    onTap: () {
                      setState(() => _selectedSubject = s);
                      _load(
                          subject: s,
                          difficulty: _selectedDifficulty);
                    },
                  );
                },
              ),
            ),

            const SizedBox(height: 8),

            // ── Difficulty filter
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _difficulties.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final d = _difficulties[index];
                  final color = _difficultyColor(d);
                  return _Chip(
                    label: d,
                    active: _selectedDifficulty == d,
                    color: color,
                    onTap: () {
                      setState(() => _selectedDifficulty =
                          _selectedDifficulty == d ? null : d);
                      _load(
                          subject: _selectedSubject,
                          difficulty: _selectedDifficulty);
                    },
                  );
                },
              ),
            ),

            const SizedBox(height: 14),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Available Labs (${provider.labs.length})',
                style: const TextStyle(
                    fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ),

            const SizedBox(height: 10),

            // ── Labs list
            Expanded(
              child: provider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: Color(0xFF5B7BFF)))
                  : provider.labs.isEmpty
                      ? const Center(
                          child: Text('No labs available.',
                              style:
                                  TextStyle(color: Colors.black45)))
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16),
                          itemCount: provider.labs.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 12),
                          itemBuilder: (ctx, i) =>
                              _LabCard(lab: provider.labs[i]),
                        ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Lab Card
class _LabCard extends StatelessWidget {
  final LabModel lab;
  const _LabCard({required this.lab});

  Color get _diffColor {
    switch (lab.difficulty) {
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
    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context,
        '/lab-session',
        arguments: lab.id,
      ),
      child: Container(
        padding: const EdgeInsets.all(16),
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
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                // Lab icon
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: const Color(0xFFEEF1FF),
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: const Icon(Icons.laptop_rounded,
                      color: Color(0xFF5B7BFF), size: 24),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(lab.title,
                          style: const TextStyle(
                              fontSize: 14,
                              fontWeight: FontWeight.w600,
                              color: Color(0xFF1E1E1E))),
                      const SizedBox(height: 2),
                      Text(lab.subject,
                          style: const TextStyle(
                              fontSize: 12,
                              color: Color(0xFF5B7BFF))),
                    ],
                  ),
                ),
                if (lab.alreadyCompleted)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('Done',
                        style: TextStyle(
                            fontSize: 11,
                            color: Colors.green,
                            fontWeight: FontWeight.w600)),
                  ),
              ],
            ),
            if (lab.description.isNotEmpty) ...[
              const SizedBox(height: 10),
              Text(lab.description,
                  style: const TextStyle(
                      fontSize: 12, color: Colors.black54),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis),
            ],
            const SizedBox(height: 12),
            Row(
              children: [
                _InfoBadge(
                    label: lab.difficulty, color: _diffColor),
                const SizedBox(width: 8),
                _InfoBadge(
                  label: '${lab.duration} min',
                  color: const Color(0xFF5B7BFF),
                ),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 6),
                  decoration: BoxDecoration(
                    color: const Color(0xFF5B7BFF),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text('Launch',
                      style: TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                          fontWeight: FontWeight.w600)),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoBadge extends StatelessWidget {
  final String label;
  final Color color;
  const _InfoBadge({required this.label, required this.color});

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
    required this.onTap,
    this.color = const Color(0xFF5B7BFF),
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