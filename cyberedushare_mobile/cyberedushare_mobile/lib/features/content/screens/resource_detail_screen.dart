import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:dio/dio.dart';
import 'package:path_provider/path_provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/content/providers/content_provider.dart';

class ResourceDetailScreen extends StatefulWidget {
  const ResourceDetailScreen({super.key});

  @override
  State<ResourceDetailScreen> createState() => _ResourceDetailScreenState();
}

class _ResourceDetailScreenState extends State<ResourceDetailScreen> {
  bool _downloading = false;
  double _downloadProgress = 0;
  int? _userRating;
  bool _loadedArgs = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loadedArgs) {
      _loadedArgs = true;
      final id = ModalRoute.of(context)?.settings.arguments as String?;
      if (id != null) {
        final token = context.read<AuthProvider>().token ?? '';
        context.read<ContentProvider>().loadResource(token: token, id: id);
      }
    }
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
          content: Text('Downloaded to: $savePath'),
          backgroundColor: const Color(0xFF5B7BFF),
        ),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text('Download failed: $e'),
          backgroundColor: Colors.red,
        ),
      );
    } finally {
      if (mounted) setState(() => _downloading = false);
    }
  }

  Future<void> _handleBookmark(String contentId) async {
    final token = context.read<AuthProvider>().token ?? '';
    await context
        .read<ContentProvider>()
        .toggleBookmark(token: token, contentId: contentId);

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Bookmark updated'),
        backgroundColor: Color(0xFF5B7BFF),
      ),
    );
  }

  void _showRatingDialog(String contentId) {
    int tempRating = _userRating ?? 0;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Rate this resource'),
        content: StatefulBuilder(
          builder: (context, setDialogState) => Row(
            mainAxisAlignment: MainAxisAlignment.center,
            children: List.generate(5, (index) {
              return GestureDetector(
                onTap: () => setDialogState(() => tempRating = index + 1),
                child: Icon(
                  index < tempRating ? Icons.star : Icons.star_border,
                  color: Colors.amber,
                  size: 36,
                ),
              );
            }),
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5B7BFF)),
            onPressed: () async {
              Navigator.pop(ctx);
              final token = context.read<AuthProvider>().token ?? '';
              final success = await context.read<ContentProvider>().rate(
                    token: token,
                    contentId: contentId,
                    score: tempRating,
                  );
              if (success && mounted) {
                setState(() => _userRating = tempRating);
                ScaffoldMessenger.of(context).showSnackBar(
                  const SnackBar(
                    content: Text('Rating saved!'),
                    backgroundColor: Color(0xFF5B7BFF),
                  ),
                );
              }
            },
            child: const Text('Submit',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ContentProvider>();
    final content = provider.selectedContent;
    final related = provider.relatedContent;
    final isBookmarked = content != null
        ? context.watch<ContentProvider>().isBookmarked(content.id)
        : false;

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
        title: const Text('Resource',
            style: TextStyle(
                color: Color(0xFF1E1E1E),
                fontSize: 16,
                fontWeight: FontWeight.w600)),
      ),
      body: provider.isLoading
          ? const Center(
              child:
                  CircularProgressIndicator(color: Color(0xFF5B7BFF)))
          : content == null
              ? const Center(child: Text('Resource not found'))
              : SingleChildScrollView(
                  padding: const EdgeInsets.all(16),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      // ── Main Info Card
                      _Card(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              content.title,
                              style: const TextStyle(
                                fontSize: 17,
                                fontWeight: FontWeight.bold,
                                color: Color(0xFF1E1E1E),
                              ),
                            ),
                            const SizedBox(height: 6),
                            Text(
                              content.description,
                              style: const TextStyle(
                                  fontSize: 13, color: Colors.black54),
                            ),
                            const SizedBox(height: 14),
                            Row(
                              children: [
                                _InfoChip('Subject: ${content.subject}'),
                                const Spacer(),
                                if (content.isVerified)
                                  const Row(children: [
                                    Icon(Icons.check_circle_rounded,
                                        color: Colors.green, size: 14),
                                    SizedBox(width: 4),
                                    Text('Verified',
                                        style: TextStyle(
                                            fontSize: 12,
                                            color: Colors.green)),
                                  ]),
                              ],
                            ),
                            const SizedBox(height: 6),
                            _InfoChip('Difficulty: ${content.difficulty}'),
                            const SizedBox(height: 6),
                            Text(
                              'Uploaded by: ${content.uploaderName}',
                              style: const TextStyle(
                                  fontSize: 12, color: Colors.black45),
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 14),

                      // ── Action Buttons
                      Row(
                        children: [
                          Expanded(
                            child: _ActionButton(
                              label: isBookmarked
                                  ? 'Bookmarked'
                                  : 'Bookmark',
                              color: isBookmarked
                                  ? Colors.orange
                                  : const Color(0xFF5B7BFF),
                              onTap: () => _handleBookmark(content.id),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _downloading
                                ? Column(children: [
                                    LinearProgressIndicator(
                                      value: _downloadProgress,
                                      color: const Color(0xFF5B7BFF),
                                    ),
                                    const SizedBox(height: 4),
                                    Text(
                                      '${(_downloadProgress * 100).toStringAsFixed(0)}%',
                                      style: const TextStyle(
                                          fontSize: 12),
                                    ),
                                  ])
                                : _ActionButton(
                                    label: 'Download',
                                    color: const Color(0xFF5B7BFF),
                                    onTap: () => _handleDownload(
                                        content.fileUrl, content.title),
                                  ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: _ActionButton(
                              label: 'Rate',
                              color: const Color(0xFF5B7BFF),
                              onTap: () =>
                                  _showRatingDialog(content.id),
                            ),
                          ),
                        ],
                      ),

                      const SizedBox(height: 14),

                      // ── Description Card
                      _Card(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            const Text('Description',
                                style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 15)),
                            const SizedBox(height: 8),
                            Text(content.description,
                                style: const TextStyle(
                                    fontSize: 13, height: 1.5)),
                            const SizedBox(height: 14),
                            if (content.tags.isNotEmpty) ...[
                              const Text('Tags:',
                                  style: TextStyle(
                                      fontSize: 13,
                                      fontWeight: FontWeight.w500)),
                              const SizedBox(height: 6),
                              Wrap(
                                spacing: 8,
                                children: content.tags
                                    .map((tag) => Container(
                                          padding: const EdgeInsets.symmetric(
                                              horizontal: 10,
                                              vertical: 4),
                                          decoration: BoxDecoration(
                                            color: const Color(0xFFEEF1FF),
                                            borderRadius:
                                                BorderRadius.circular(8),
                                          ),
                                          child: Text(
                                            '[${tag}]',
                                            style: const TextStyle(
                                                fontSize: 12,
                                                color: Color(0xFF5B7BFF)),
                                          ),
                                        ))
                                    .toList(),
                              ),
                            ],
                          ],
                        ),
                      ),

                      const SizedBox(height: 14),

                      // ── Related Resources
                      if (related.isNotEmpty) ...[
                        const Text('Related resources you may like',
                            style: TextStyle(
                                fontSize: 15,
                                fontWeight: FontWeight.bold)),
                        const SizedBox(height: 10),
                        ...related.map((r) => GestureDetector(
                              onTap: () => Navigator.pushReplacementNamed(
                                context,
                                '/resource-detail',
                                arguments: r.id,
                              ),
                              child: Container(
                                margin: const EdgeInsets.only(bottom: 10),
                                padding: const EdgeInsets.all(14),
                                decoration: BoxDecoration(
                                  color: Colors.white,
                                  borderRadius: BorderRadius.circular(12),
                                ),
                                child: Row(
                                  children: [
                                    Expanded(
                                      child: Column(
                                        crossAxisAlignment:
                                            CrossAxisAlignment.start,
                                        children: [
                                          Text(r.title,
                                              style: const TextStyle(
                                                  fontWeight: FontWeight.w600,
                                                  fontSize: 13)),
                                          const SizedBox(height: 4),
                                          Text(r.description,
                                              style: const TextStyle(
                                                  fontSize: 12,
                                                  color: Colors.black45),
                                              maxLines: 1,
                                              overflow:
                                                  TextOverflow.ellipsis),
                                        ],
                                      ),
                                    ),
                                    Container(
                                      width: 32,
                                      height: 32,
                                      decoration: BoxDecoration(
                                        color: const Color(0xFF5B7BFF),
                                        borderRadius:
                                            BorderRadius.circular(8),
                                      ),
                                      child: const Icon(
                                          Icons.arrow_forward_ios_rounded,
                                          color: Colors.white,
                                          size: 14),
                                    ),
                                  ],
                                ),
                              ),
                            )),
                      ],

                      const SizedBox(height: 24),
                    ],
                  ),
                ),
    );
  }
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

class _InfoChip extends StatelessWidget {
  final String label;
  const _InfoChip(this.label);

  @override
  Widget build(BuildContext context) => Text(
        label,
        style: const TextStyle(fontSize: 13, color: Color(0xFF1E1E1E)),
      );
}

class _ActionButton extends StatelessWidget {
  final String label;
  final Color color;
  final VoidCallback onTap;

  const _ActionButton({
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
            color: color,
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            label,
            style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w600,
                fontSize: 13),
          ),
        ),
      );
}