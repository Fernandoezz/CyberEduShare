import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/projects/providers/project_provider.dart';
import '../../../features/projects/models/project_model.dart';

class ProjectDetailScreen extends StatefulWidget {
  const ProjectDetailScreen({super.key});

  @override
  State<ProjectDetailScreen> createState() =>
      _ProjectDetailScreenState();
}

class _ProjectDetailScreenState extends State<ProjectDetailScreen> {
  final _commentController = TextEditingController();
  bool _loadedArgs = false;
  bool _downloading = false;
  double _downloadProgress = 0;

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
            .read<ProjectProvider>()
            .loadProject(token: token, id: id);
      }
    }
  }

  @override
  void dispose() {
    _commentController.dispose();
    super.dispose();
  }

  Future<void> _handleLike(String projectId) async {
    final token = context.read<AuthProvider>().token ?? '';
    await context
        .read<ProjectProvider>()
        .toggleLike(token: token, projectId: projectId);
  }

  Future<void> _handleDownload(String fileUrl, String title) async {
    setState(() {
      _downloading = true;
      _downloadProgress = 0;
    });

    try {
      final dir = await getApplicationDocumentsDirectory();
      final ext = fileUrl.split('.').last.split('?').first;
      final fileName =
          '${title.replaceAll(RegExp(r'[^\w]'), '_')}.$ext';
      final savePath = '${dir.path}/$fileName';

      final dio = Dio();
      await dio.download(
        fileUrl,
        savePath,
        onReceiveProgress: (received, total) {
          if (total != -1) {
            setState(
                () => _downloadProgress = received / total);
          }
        },
      );

      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Downloaded: $fileName'),
          backgroundColor: const Color(0xFF5B7BFF),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
            content: Text('Download failed: $e'),
            backgroundColor: Colors.red),
      );
    } finally {
      if (mounted) setState(() => _downloading = false);
    }
  }

  Future<void> _submitComment(String projectId) async {
    final body = _commentController.text.trim();
    if (body.isEmpty) return;

    final token = context.read<AuthProvider>().token ?? '';
    final success = await context.read<ProjectProvider>().postComment(
          token: token,
          projectId: projectId,
          body: body,
        );

    if (success && mounted) {
      _commentController.clear();
      FocusScope.of(context).unfocus();
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ProjectProvider>();
    final project = provider.selectedProject;

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
        title: const Text('Project',
            style: TextStyle(
                color: Color(0xFF1E1E1E),
                fontSize: 16,
                fontWeight: FontWeight.w600)),
      ),
      body: provider.isLoading
          ? const Center(
              child:
                  CircularProgressIndicator(color: Color(0xFF5B7BFF)))
          : project == null
              ? const Center(child: Text('Project not found'))
              : Column(
                  children: [
                    Expanded(
                      child: SingleChildScrollView(
                        padding: const EdgeInsets.all(16),
                        child: Column(
                          crossAxisAlignment:
                              CrossAxisAlignment.start,
                          children: [
                            // ── Main Info Card
                            _Card(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  Text(project.title,
                                      style: const TextStyle(
                                          fontSize: 17,
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF1E1E1E))),
                                  const SizedBox(height: 4),
                                  Text(project.subject,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          color: Color(0xFF5B7BFF))),
                                  if (project.description
                                      .isNotEmpty) ...[
                                    const SizedBox(height: 10),
                                    Text(project.description,
                                        style: const TextStyle(
                                            fontSize: 13,
                                            height: 1.5,
                                            color: Colors.black87)),
                                  ],
                                  if (project.techStack
                                      .isNotEmpty) ...[
                                    const SizedBox(height: 12),
                                    const Text('Tech Stack',
                                        style: TextStyle(
                                            fontSize: 13,
                                            fontWeight:
                                                FontWeight.w600)),
                                    const SizedBox(height: 6),
                                    Wrap(
                                      spacing: 6,
                                      children: project.techStack
                                          .map((t) => Container(
                                                padding: const EdgeInsets
                                                    .symmetric(
                                                    horizontal: 8,
                                                    vertical: 3),
                                                decoration:
                                                    BoxDecoration(
                                                  color: const Color(
                                                      0xFFE8F5E9),
                                                  borderRadius:
                                                      BorderRadius
                                                          .circular(
                                                              6),
                                                ),
                                                child: Text(t,
                                                    style: const TextStyle(
                                                        fontSize: 12,
                                                        color: Color(
                                                            0xFF34A853))),
                                              ))
                                          .toList(),
                                    ),
                                  ],
                                  const SizedBox(height: 12),
                                  Text(
                                      'Submitted by ${project.submittedByName}',
                                      style: const TextStyle(
                                          fontSize: 12,
                                          color: Colors.black45)),
                                ],
                              ),
                            ),

                            const SizedBox(height: 12),

                            // ── Action Buttons
                            Row(
                              children: [
                                // Like
                                Expanded(
                                  child: _ActionButton(
                                    icon: Icons.favorite_rounded,
                                    label:
                                        '${project.likeCount} Likes',
                                    color: Colors.red,
                                    onTap: () =>
                                        _handleLike(project.id),
                                  ),
                                ),
                                const SizedBox(width: 10),
                                // Download
                                if (project.fileUrl != null)
                                  Expanded(
                                    child: _downloading
                                        ? Column(children: [
                                            LinearProgressIndicator(
                                              value:
                                                  _downloadProgress,
                                              color: const Color(
                                                  0xFF5B7BFF),
                                            ),
                                            Text(
                                              '${(_downloadProgress * 100).toStringAsFixed(0)}%',
                                              style: const TextStyle(
                                                  fontSize: 12),
                                            ),
                                          ])
                                        : _ActionButton(
                                            icon: Icons
                                                .download_rounded,
                                            label: 'Download',
                                            color: const Color(
                                                0xFF5B7BFF),
                                            onTap: () =>
                                                _handleDownload(
                                                    project.fileUrl!,
                                                    project.title),
                                          ),
                                  ),
                              ],
                            ),

                            const SizedBox(height: 20),

                            // ── Comments section
                            Text(
                                '${project.comments.length} Comment${project.comments.length == 1 ? '' : 's'}',
                                style: const TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold)),

                            const SizedBox(height: 10),

                            if (project.comments.isEmpty)
                              const Text('No comments yet.',
                                  style: TextStyle(
                                      color: Colors.black45,
                                      fontSize: 13))
                            else
                              ...project.comments.map((c) =>
                                  _CommentCard(comment: c)),

                            const SizedBox(height: 80),
                          ],
                        ),
                      ),
                    ),

                    // ── Comment input bar
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
                              controller: _commentController,
                              decoration: InputDecoration(
                                hintText: 'Write a comment...',
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
                                        horizontal: 14,
                                        vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          GestureDetector(
                            onTap: () =>
                                _submitComment(project.id),
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

// ── Comment Card
class _CommentCard extends StatelessWidget {
  final ProjectComment comment;
  const _CommentCard({required this.comment});

  @override
  Widget build(BuildContext context) => Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withOpacity(0.03),
              blurRadius: 6,
              offset: const Offset(0, 1),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(comment.commentedByName,
                style: const TextStyle(
                    fontSize: 12,
                    fontWeight: FontWeight.w600,
                    color: Color(0xFF5B7BFF))),
            const SizedBox(height: 4),
            Text(comment.body,
                style: const TextStyle(
                    fontSize: 13, color: Colors.black87)),
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

// ── Action Button
class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          height: 44,
          decoration: BoxDecoration(
            color: color.withOpacity(0.1),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withOpacity(0.3)),
          ),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(icon, color: color, size: 16),
              const SizedBox(width: 6),
              Text(label,
                  style: TextStyle(
                      color: color,
                      fontSize: 13,
                      fontWeight: FontWeight.w600)),
            ],
          ),
        ),
      );
}