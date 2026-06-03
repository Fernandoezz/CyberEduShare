import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/questions/providers/question_provider.dart';
import '../../../features/questions/models/question_model.dart';

class QuestionDetailScreen extends StatefulWidget {
  const QuestionDetailScreen({super.key});

  @override
  State<QuestionDetailScreen> createState() =>
      _QuestionDetailScreenState();
}

class _QuestionDetailScreenState extends State<QuestionDetailScreen> {
  final _answerController = TextEditingController();
  bool _loadedArgs = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loadedArgs) {
      _loadedArgs = true;
      final id =
          ModalRoute.of(context)?.settings.arguments as String?;
      if (id != null) {
        final token = context.read<AuthProvider>().token ?? '';
        context
            .read<QuestionProvider>()
            .loadQuestion(token: token, id: id);
      }
    }
  }

  @override
  void dispose() {
    _answerController.dispose();
    super.dispose();
  }

  Future<void> _submitAnswer(String questionId) async {
    final body = _answerController.text.trim();
    if (body.isEmpty) return;

    final token = context.read<AuthProvider>().token ?? '';
    final success = await context.read<QuestionProvider>().postAnswer(
          token: token,
          questionId: questionId,
          body: body,
        );

    if (success && mounted) {
      _answerController.clear();
      FocusScope.of(context).unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<QuestionProvider>();
    final question = provider.selectedQuestion;
    final currentUserId =
        context.watch<AuthProvider>().currentUser?.id ?? '';
    final token = context.read<AuthProvider>().token ?? '';
    final isAuthor =
        question?.askedByName ==
        context.read<AuthProvider>().currentUser?.username;

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF1E1E1E), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text('Question',
            style: TextStyle(
                color: Color(0xFF1E1E1E),
                fontSize: 16,
                fontWeight: FontWeight.w600)),
      ),
      body: provider.isLoading
          ? const Center(
              child:
                  CircularProgressIndicator(color: Color(0xFF5B7BFF)))
          : question == null
              ? const Center(child: Text('Question not found'))
              : Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            // ── Question Card
                            _Card(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Row(
                                    children: [
                                      Expanded(
                                        child: Text(
                                          question.title,
                                          style: const TextStyle(
                                              fontSize: 16,
                                              fontWeight:
                                                  FontWeight.bold,
                                              color:
                                                  Color(0xFF1E1E1E)),
                                        ),
                                      ),
                                      if (question.isSolved)
                                        Container(
                                          padding:
                                              const EdgeInsets.symmetric(
                                                  horizontal: 8,
                                                  vertical: 3),
                                          decoration: BoxDecoration(
                                            color: Colors.green.shade50,
                                            borderRadius:
                                                BorderRadius.circular(
                                                    6),
                                          ),
                                          child: const Text('Solved',
                                              style: TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.green,
                                                  fontWeight:
                                                      FontWeight.w600)),
                                        ),
                                    ],
                                  ),
                                  const SizedBox(height: 6),
                                  Text(question.subject,
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: Color(0xFF5B7BFF))),
                                  if (question.body.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Text(question.body,
                                        style: const TextStyle(
                                            fontSize: 13,
                                            height: 1.5,
                                            color: Colors.black87)),
                                  ],
                                  if (question.tags.isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Wrap(
                                      spacing: 6,
                                      children: question.tags
                                          .map((t) => Container(
                                                padding: const EdgeInsets
                                                    .symmetric(
                                                    horizontal: 8,
                                                    vertical: 3),
                                                decoration: BoxDecoration(
                                                  color: const Color(
                                                      0xFFEEF1FF),
                                                  borderRadius:
                                                      BorderRadius
                                                          .circular(6),
                                                ),
                                                child: Text(t,
                                                    style: const TextStyle(
                                                        fontSize: 11,
                                                        color: Color(
                                                            0xFF5B7BFF))),
                                              ))
                                          .toList(),
                                    ),
                                  ],
                                  const SizedBox(height: 12),
                                  Row(
                                    children: [
                                      GestureDetector(
                                        onTap: () =>
                                            context
                                                .read<QuestionProvider>()
                                                .upvoteQuestion(
                                                  token: token,
                                                  id: question.id,
                                                ),
                                        child: Row(children: [
                                          const Icon(
                                              Icons.arrow_upward_rounded,
                                              size: 16,
                                              color: Color(0xFF5B7BFF)),
                                          const SizedBox(width: 4),
                                          Text(
                                              '${question.upvoteCount} Upvotes',
                                              style: const TextStyle(
                                                  fontSize: 12,
                                                  color:
                                                      Color(0xFF5B7BFF))),
                                        ]),
                                      ),
                                      const Spacer(),
                                      Text(
                                          'Asked by ${question.askedByName}',
                                          style: const TextStyle(
                                              fontSize: 11,
                                              color: Colors.black38)),
                                    ],
                                  ),
                                ],
                              ),
                            ),

                            const SizedBox(height: 20),

                            Text(
                                '${question.answers.length} Answer${question.answers.length == 1 ? '' : 's'}',
                                style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold)),

                            const SizedBox(height: 10),

                            // ── Answers list
                            ...question.answers.map(
                              (answer) => _AnswerCard(
                                answer: answer,
                                isAuthor: isAuthor,
                                onUpvote: () =>
                                    context
                                        .read<QuestionProvider>()
                                        .upvoteAnswer(
                                          token: token,
                                          questionId: question.id,
                                          answerId: answer.id,
                                        ),
                                onAccept: () =>
                                    context
                                        .read<QuestionProvider>()
                                        .acceptAnswer(
                                          token: token,
                                          questionId: question.id,
                                          answerId: answer.id,
                                        ),
                              ),
                            ),

                            const SizedBox(height: 80),
                          ],
                        ),
                      ),
                    ),

                    // ── Answer input bar
                    Container(
                      color: Colors.white,
                      padding: EdgeInsets.only(
                        left: 16,
                        right: 16,
                        top: 12,
                        bottom:
                            MediaQuery.of(context).viewInsets.bottom +
                                12,
                      ),
                      child: Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _answerController,
                              decoration: InputDecoration(
                                hintText: 'Write your answer...',
                                hintStyle: const TextStyle(
                                    color: Colors.black38,
                                    fontSize: 14),
                                filled: true,
                                fillColor: const Color(0xFFF5F5F5),
                                border: OutlineInputBorder(
                                  borderRadius:
                                      BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                                contentPadding:
                                    const EdgeInsets.symmetric(
                                        horizontal: 14, vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          GestureDetector(
                            onTap: () =>
                                _submitAnswer(question.id),
                            child: Container(
                              width: 44,
                              height: 44,
                              decoration: BoxDecoration(
                                color: const Color(0xFF5B7BFF),
                                borderRadius:
                                    BorderRadius.circular(10),
                              ),
                              child: const Icon(Icons.send_rounded,
                                  color: Colors.white, size: 20),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
    );
  }
}

// ── Answer Card
class _AnswerCard extends StatelessWidget {
  final AnswerModel answer;
  final bool isAuthor;
  final VoidCallback onUpvote;
  final VoidCallback onAccept;

  const _AnswerCard({
    required this.answer,
    required this.isAuthor,
    required this.onUpvote,
    required this.onAccept,
  });

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: answer.isAccepted
              ? Colors.green.shade50
              : Colors.white,
          borderRadius: BorderRadius.circular(14),
          border: answer.isAccepted
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
            if (answer.isAccepted)
              const Row(children: [
                Icon(Icons.check_circle_rounded,
                    color: Colors.green, size: 16),
                SizedBox(width: 6),
                Text('Accepted Answer',
                    style: TextStyle(
                        fontSize: 12,
                        color: Colors.green,
                        fontWeight: FontWeight.w600)),
              ]),
            if (answer.isAccepted) const SizedBox(height: 8),
            Text(answer.body,
                style: const TextStyle(
                    fontSize: 13, height: 1.5, color: Colors.black87)),
            const SizedBox(height: 10),
            Row(
              children: [
                GestureDetector(
                  onTap: onUpvote,
                  child: Row(children: [
                    const Icon(Icons.arrow_upward_rounded,
                        size: 15, color: Color(0xFF5B7BFF)),
                    const SizedBox(width: 4),
                    Text('${answer.upvoteCount}',
                        style: const TextStyle(
                            fontSize: 12,
                            color: Color(0xFF5B7BFF))),
                  ]),
                ),
                const SizedBox(width: 16),
                if (isAuthor && !answer.isAccepted)
                  GestureDetector(
                    onTap: onAccept,
                    child: Row(children: [
                      const Icon(Icons.check_circle_outline_rounded,
                          size: 15, color: Colors.green),
                      const SizedBox(width: 4),
                      const Text('Accept',
                          style: TextStyle(
                              fontSize: 12, color: Colors.green)),
                    ]),
                  ),
                const Spacer(),
                Text('by ${answer.answeredByName}',
                    style: const TextStyle(
                        fontSize: 11, color: Colors.black38)),
              ],
            ),
          ],
        ),
      );
}

// ── Card wrapper
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