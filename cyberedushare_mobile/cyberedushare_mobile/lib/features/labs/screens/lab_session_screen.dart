import 'dart:async';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:webview_flutter/webview_flutter.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/labs/providers/lab_provider.dart';

class LabSessionScreen extends StatefulWidget {
  const LabSessionScreen({super.key});

  @override
  State<LabSessionScreen> createState() => _LabSessionScreenState();
}

class _LabSessionScreenState extends State<LabSessionScreen> {
  bool _loadedArgs = false;
  bool _labLaunched = false;
  bool _showWebView = false;
  WebViewController? _webViewController;

  // Timer
  late Timer _timer;
  int _elapsedSeconds = 0;
  bool _timerRunning = false;

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (!_loadedArgs) {
      _loadedArgs = true;
      final id =
          ModalRoute.of(context)?.settings.arguments as String?;
      if (id != null) {
        final token = context.read<AuthProvider>().token ?? '';
        context.read<LabProvider>().loadLab(token: token, id: id);
      }
    }
  }

  @override
  void dispose() {
    if (_timerRunning) _timer.cancel();
    super.dispose();
  }

  void _startTimer() {
    _timerRunning = true;
    _timer = Timer.periodic(const Duration(seconds: 1), (_) {
      setState(() => _elapsedSeconds++);
    });
  }

  void _stopTimer() {
    if (_timerRunning) {
      _timer.cancel();
      _timerRunning = false;
    }
  }

  String get _formattedTime {
    final h = _elapsedSeconds ~/ 3600;
    final m = (_elapsedSeconds % 3600) ~/ 60;
    final s = _elapsedSeconds % 60;
    if (h > 0) {
      return '${h.toString().padLeft(2, '0')}:${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
    }
    return '${m.toString().padLeft(2, '0')}:${s.toString().padLeft(2, '0')}';
  }

  void _launchLab(String vmUrl) {
    final controller = WebViewController()
      ..setJavaScriptMode(JavaScriptMode.unrestricted)
      ..setUserAgent(
        'Mozilla/5.0 (Linux; Android 10; Mobile) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
      )
      ..setNavigationDelegate(NavigationDelegate(
        onPageFinished: (_) {},
        onWebResourceError: (error) {
          debugPrint('WebView error: ${error.description}');
        },
      ))
      ..loadRequest(Uri.parse(vmUrl));

    setState(() {
      _webViewController = controller;
      _labLaunched = true;
      _showWebView = true;
    });

    _startTimer();
  }

  Future<void> _handleSubmit(String labId) async {
    _stopTimer();
    final timeTaken = _elapsedSeconds ~/ 60; // convert to minutes

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text('Submit Lab'),
        content: Text(
            'Mark this lab as completed?\nTime taken: $_formattedTime'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF5B7BFF)),
            onPressed: () => Navigator.pop(ctx, true),
            child: const Text('Submit',
                style: TextStyle(color: Colors.white)),
          ),
        ],
      ),
    );

    if (confirmed != true) {
      _startTimer(); // resume timer if cancelled
      return;
    }

    final token = context.read<AuthProvider>().token ?? '';
    final success =
        await context.read<LabProvider>().submitCompletion(
              token: token,
              labId: labId,
              timeTaken: timeTaken,
            );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Lab completed! Great work 🎉'),
          backgroundColor: Colors.green,
        ),
      );
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<LabProvider>();
    final lab = provider.selectedLab;

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      appBar: AppBar(
        backgroundColor: const Color(0xFF5B7BFF),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Colors.white, size: 20),
          onPressed: () {
            _stopTimer();
            Navigator.pop(context);
          },
        ),
        title: Text(
          lab?.title ?? 'Lab Session',
          style: const TextStyle(
              color: Colors.white,
              fontSize: 16,
              fontWeight: FontWeight.w600),
        ),
        actions: [
          // Timer display
          if (_timerRunning)
            Padding(
              padding: const EdgeInsets.symmetric(
                  horizontal: 16, vertical: 14),
              child: Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: Colors.white.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(children: [
                  const Icon(Icons.timer_rounded,
                      color: Colors.white, size: 14),
                  const SizedBox(width: 4),
                  Text(_formattedTime,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 13,
                          fontWeight: FontWeight.w600)),
                ]),
              ),
            ),
          // Toggle between instructions and WebView
          if (_labLaunched)
            IconButton(
              icon: Icon(
                _showWebView
                    ? Icons.list_alt_rounded
                    : Icons.open_in_browser_rounded,
                color: Colors.white,
              ),
              tooltip: _showWebView ? 'Instructions' : 'VM Console',
              onPressed: () =>
                  setState(() => _showWebView = !_showWebView),
            ),
        ],
      ),
      body: provider.isLoading
          ? const Center(
              child:
                  CircularProgressIndicator(color: Color(0xFF5B7BFF)))
          : lab == null
              ? const Center(child: Text('Lab not found'))
              : _showWebView && _webViewController != null
                  // ── WebView (VMware console)
                  ? WebViewWidget(controller: _webViewController!)
                  // ── Instructions view
                  : SingleChildScrollView(
                      padding: const EdgeInsets.all(16),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          // ── Lab info card
                          _Card(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Row(
                                  children: [
                                    _Badge(
                                        lab.difficulty,
                                        lab.difficulty == 'Easy'
                                            ? Colors.green
                                            : lab.difficulty == 'Hard'
                                                ? Colors.red
                                                : Colors.orange),
                                    const SizedBox(width: 8),
                                    _Badge(
                                        '${lab.duration} min',
                                        const Color(0xFF5B7BFF)),
                                    if (lab.alreadyCompleted) ...[
                                      const SizedBox(width: 8),
                                      _Badge('Completed',
                                          Colors.green),
                                    ],
                                  ],
                                ),
                                const SizedBox(height: 10),
                                Text(lab.title,
                                    style: const TextStyle(
                                        fontSize: 16,
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF1E1E1E))),
                                const SizedBox(height: 4),
                                Text(lab.subject,
                                    style: const TextStyle(
                                        fontSize: 13,
                                        color: Color(0xFF5B7BFF))),
                                if (lab.description.isNotEmpty) ...[
                                  const SizedBox(height: 10),
                                  Text(lab.description,
                                      style: const TextStyle(
                                          fontSize: 13,
                                          height: 1.5,
                                          color: Colors.black87)),
                                ],
                              ],
                            ),
                          ),

                          const SizedBox(height: 16),

                          // ── VM Credentials Card
                          if (lab.vmUsername.isNotEmpty) ...[
                            _Card(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: [
                                  const Text('VM Credentials',
                                      style: TextStyle(
                                          fontSize: 14,
                                          fontWeight:
                                              FontWeight.bold)),
                                  const SizedBox(height: 10),
                                  _CredRow('Username',
                                      lab.vmUsername),
                                  const SizedBox(height: 6),
                                  _CredRow('Password',
                                      lab.vmPassword),
                                ],
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // ── Instructions
                          if (lab.instructions.isNotEmpty) ...[
                            const Text('Lab Instructions',
                                style: TextStyle(
                                    fontSize: 15,
                                    fontWeight: FontWeight.bold)),
                            const SizedBox(height: 10),
                            _Card(
                              child: Column(
                                crossAxisAlignment:
                                    CrossAxisAlignment.start,
                                children: lab.instructions
                                    .asMap()
                                    .entries
                                    .map((e) => Padding(
                                          padding:
                                              const EdgeInsets.only(
                                                  bottom: 12),
                                          child: Row(
                                            crossAxisAlignment:
                                                CrossAxisAlignment
                                                    .start,
                                            children: [
                                              Container(
                                                width: 24,
                                                height: 24,
                                                margin:
                                                    const EdgeInsets
                                                        .only(
                                                        right: 10,
                                                        top: 1),
                                                decoration:
                                                    BoxDecoration(
                                                  color: const Color(
                                                      0xFF5B7BFF),
                                                  borderRadius:
                                                      BorderRadius
                                                          .circular(
                                                              6),
                                                ),
                                                alignment:
                                                    Alignment.center,
                                                child: Text(
                                                    '${e.key + 1}',
                                                    style: const TextStyle(
                                                        color: Colors
                                                            .white,
                                                        fontSize: 12,
                                                        fontWeight:
                                                            FontWeight
                                                                .bold)),
                                              ),
                                              Expanded(
                                                child: Text(
                                                    e.value,
                                                    style: const TextStyle(
                                                        fontSize: 13,
                                                        height: 1.5,
                                                        color: Colors
                                                            .black87)),
                                              ),
                                            ],
                                          ),
                                        ))
                                    .toList(),
                              ),
                            ),
                            const SizedBox(height: 16),
                          ],

                          // ── Launch / Submit buttons
                          if (!_labLaunched && lab.vmUrl.isNotEmpty)
                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor:
                                      const Color(0xFF5B7BFF),
                                  shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(12)),
                                  elevation: 0,
                                ),
                                icon: const Icon(
                                    Icons.play_arrow_rounded,
                                    color: Colors.white),
                                label: const Text(
                                  'Launch VMware Lab',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600),
                                ),
                                onPressed: () =>
                                    _launchLab(lab.vmUrl),
                              ),
                            ),

                          if (_labLaunched &&
                              !lab.alreadyCompleted) ...[
                            const SizedBox(height: 10),
                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: ElevatedButton.icon(
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: Colors.green,
                                  shape: RoundedRectangleBorder(
                                      borderRadius:
                                          BorderRadius.circular(12)),
                                  elevation: 0,
                                ),
                                icon: const Icon(
                                    Icons.check_circle_rounded,
                                    color: Colors.white),
                                label: const Text(
                                  'Submit Lab',
                                  style: TextStyle(
                                      color: Colors.white,
                                      fontSize: 15,
                                      fontWeight: FontWeight.w600),
                                ),
                                onPressed: () =>
                                    _handleSubmit(lab.id),
                              ),
                            ),
                          ],

                          if (lab.alreadyCompleted)
                            Container(
                              width: double.infinity,
                              padding: const EdgeInsets.all(16),
                              decoration: BoxDecoration(
                                color: Colors.green.shade50,
                                borderRadius:
                                    BorderRadius.circular(12),
                                border: Border.all(
                                    color: Colors.green.shade200),
                              ),
                              child: const Row(
                                mainAxisAlignment:
                                    MainAxisAlignment.center,
                                children: [
                                  Icon(Icons.check_circle_rounded,
                                      color: Colors.green),
                                  SizedBox(width: 8),
                                  Text('Lab Already Completed',
                                      style: TextStyle(
                                          color: Colors.green,
                                          fontWeight:
                                              FontWeight.w600,
                                          fontSize: 15)),
                                ],
                              ),
                            ),

                          const SizedBox(height: 32),
                        ],
                      ),
                    ),
    );
  }
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

class _CredRow extends StatelessWidget {
  final String label;
  final String value;
  const _CredRow(this.label, this.value);

  @override
  Widget build(BuildContext context) => Row(
        children: [
          SizedBox(
            width: 80,
            child: Text(label,
                style: const TextStyle(
                    fontSize: 13, color: Colors.black54)),
          ),
          Expanded(
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(6),
              ),
              child: Text(value,
                  style: const TextStyle(
                      fontSize: 13,
                      fontFamily: 'monospace',
                      color: Color(0xFF1E1E1E))),
            ),
          ),
        ],
      );
}