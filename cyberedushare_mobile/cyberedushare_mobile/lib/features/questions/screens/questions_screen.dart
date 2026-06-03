import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/questions/providers/question_provider.dart';
import '../../../features/questions/models/question_model.dart';

class QuestionsScreen extends StatefulWidget {
  const QuestionsScreen({super.key});

  @override
  State<QuestionsScreen> createState() => _QuestionsScreenState();
}

class _QuestionsScreenState extends State<QuestionsScreen> {
  final _searchController = TextEditingController();
  String? _selectedSubject;

  final List<String> _subjects = [
    'CS101', 'CS102', 'CS201', 'CS205', 'Networks', 'Cryptography', 'OS',
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  void _load({String query = '', String? subject}) {
    final token = context.read<AuthProvider>().token ?? '';
    context.read<QuestionProvider>().loadQuestions(
          token: token,
          query: query,
          subject: subject,
        );
  }

  void _showPostQuestionSheet() {
    final titleCtrl = TextEditingController();
    final bodyCtrl = TextEditingController();
    final tagsCtrl = TextEditingController();
    String subject = '';

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: StatefulBuilder(
          builder: (ctx, setSheet) => Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              const Text('Ask a Question',
                  style: TextStyle(
                      fontSize: 17, fontWeight: FontWeight.bold)),
              const SizedBox(height: 16),
              _SheetField(controller: titleCtrl, hint: 'Title *'),
              const SizedBox(height: 10),
              _SheetField(
                  controller: bodyCtrl,
                  hint: 'Describe your question...',
                  maxLines: 4),
              const SizedBox(height: 10),
              DropdownButtonFormField<String>(
                value: subject.isEmpty ? null : subject,
                hint: const Text('Select Subject *',
                    style:
                        TextStyle(color: Colors.black38, fontSize: 14)),
                decoration: InputDecoration(
                  filled: true,
                  fillColor: const Color(0xFFF5F5F5),
                  border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(10),
                    borderSide: BorderSide.none,
                  ),
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 14),
                ),
                items: _subjects
                    .map((s) =>
                        DropdownMenuItem(value: s, child: Text(s)))
                    .toList(),
                onChanged: (v) => setSheet(() => subject = v ?? ''),
              ),
              const SizedBox(height: 10),
              _SheetField(
                  controller: tagsCtrl, hint: 'Tags (comma separated)'),
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
                  onPressed: () async {
                    if (titleCtrl.text.trim().isEmpty ||
                        subject.isEmpty) {
                      ScaffoldMessenger.of(context).showSnackBar(
                        const SnackBar(
                            content: Text(
                                'Title and subject are required')),
                      );
                      return;
                    }
                    Navigator.pop(ctx);
                    final token =
                        context.read<AuthProvider>().token ?? '';
                    await context.read<QuestionProvider>().postQuestion(
                          token: token,
                          title: titleCtrl.text.trim(),
                          body: bodyCtrl.text.trim(),
                          subject: subject,
                          tags: tagsCtrl.text.trim(),
                        );
                  },
                  child: const Text('Post Question',
                      style: TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w600)),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<QuestionProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Header
            Container(
              width: double.infinity,
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 20),
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
                      IconButton(
                        icon: const Icon(
                            Icons.arrow_back_ios_new_rounded,
                            color: Colors.white,
                            size: 20),
                        onPressed: () => Navigator.pop(context),
                      ),
                      const Text('Questions & Answers',
                          style: TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.bold,
                              color: Colors.white)),
                    ],
                  ),
                  const SizedBox(height: 12),
                  Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onSubmitted: (v) =>
                          _load(query: v, subject: _selectedSubject),
                      decoration: const InputDecoration(
                        hintText: 'Search questions...',
                        hintStyle: TextStyle(
                            color: Colors.black38, fontSize: 14),
                        prefixIcon: Icon(Icons.search_rounded,
                            color: Colors.black38, size: 20),
                        border: InputBorder.none,
                        contentPadding:
                            EdgeInsets.symmetric(vertical: 12),
                      ),
                    ),
                  ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ── Subject filter chips
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _subjects.length + 1,
                separatorBuilder: (_, __) =>
                    const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _SubjectChip(
                      label: 'All',
                      active: _selectedSubject == null,
                      onTap: () {
                        setState(() => _selectedSubject = null);
                        _load(query: _searchController.text);
                      },
                    );
                  }
                  final s = _subjects[index - 1];
                  return _SubjectChip(
                    label: s,
                    active: _selectedSubject == s,
                    onTap: () {
                      setState(() => _selectedSubject = s);
                      _load(
                          query: _searchController.text,
                          subject: s);
                    },
                  );
                },
              ),
            ),

            const SizedBox(height: 12),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Questions (${provider.total})',
                style: const TextStyle(
                    fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ),

            const SizedBox(height: 8),

            // ── Questions list
            Expanded(
              child: provider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: Color(0xFF5B7BFF)))
                  : provider.questions.isEmpty
                      ? const Center(
                          child: Text('No questions yet. Ask one!',
                              style:
                                  TextStyle(color: Colors.black45)))
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16),
                          itemCount: provider.questions.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (ctx, i) {
                            final q = provider.questions[i];
                            return _QuestionCard(question: q);
                          },
                        ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showPostQuestionSheet,
        backgroundColor: const Color(0xFF5B7BFF),
        icon: const Icon(Icons.add_rounded, color: Colors.white),
        label: const Text('Ask',
            style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

// ── Question Card
class _QuestionCard extends StatelessWidget {
  final QuestionModel question;
  const _QuestionCard({required this.question});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context,
        '/question-detail',
        arguments: question.id,
      ),
      child: Container(
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
                Expanded(
                  child: Text(
                    question.title,
                    style: const TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w600,
                        color: Color(0xFF1E1E1E)),
                  ),
                ),
                if (question.isSolved)
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 8, vertical: 3),
                    decoration: BoxDecoration(
                      color: Colors.green.shade50,
                      borderRadius: BorderRadius.circular(6),
                    ),
                    child: const Text('Solved',
                        style: TextStyle(
                            fontSize: 11, color: Colors.green)),
                  ),
              ],
            ),
            const SizedBox(height: 6),
            Text(question.subject,
                style: const TextStyle(
                    fontSize: 12, color: Color(0xFF5B7BFF))),
            const SizedBox(height: 8),
            Row(
              children: [
                const Icon(Icons.arrow_upward_rounded,
                    size: 14, color: Colors.black45),
                const SizedBox(width: 4),
                Text('${question.upvoteCount}',
                    style: const TextStyle(
                        fontSize: 12, color: Colors.black45)),
                const SizedBox(width: 14),
                const Icon(Icons.chat_bubble_outline_rounded,
                    size: 14, color: Colors.black45),
                const SizedBox(width: 4),
                Text('${question.answerCount}',
                    style: const TextStyle(
                        fontSize: 12, color: Colors.black45)),
                const Spacer(),
                Text('by ${question.askedByName}',
                    style: const TextStyle(
                        fontSize: 11, color: Colors.black38)),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Subject Chip
class _SubjectChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;
  const _SubjectChip(
      {required this.label, required this.active, required this.onTap});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color:
                active ? const Color(0xFF5B7BFF) : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
              color: active
                  ? const Color(0xFF5B7BFF)
                  : Colors.grey.shade300,
            ),
          ),
          child: Text(
            label,
            style: TextStyle(
                fontSize: 12,
                color: active ? Colors.white : Colors.black54,
                fontWeight: FontWeight.w500),
          ),
        ),
      );
}

// ── Sheet Field
class _SheetField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final int maxLines;
  const _SheetField(
      {required this.controller,
      required this.hint,
      this.maxLines = 1});

  @override
  Widget build(BuildContext context) => TextField(
        controller: controller,
        maxLines: maxLines,
        decoration: InputDecoration(
          hintText: hint,
          hintStyle:
              const TextStyle(color: Colors.black38, fontSize: 14),
          filled: true,
          fillColor: const Color(0xFFF5F5F5),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(10),
            borderSide: BorderSide.none,
          ),
          contentPadding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        ),
      );
}