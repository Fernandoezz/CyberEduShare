import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/content/providers/content_provider.dart';
import '../../../features/content/models/content_model.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final _searchController = TextEditingController();
  String? _selectedSubject;
  String? _selectedDifficulty;
  String? _selectedType;

  final List<String> _subjects = ['CS101', 'CS102', 'CS201', 'Networks', 'OS', 'Cryptography'];
  final List<String> _difficulties = ['Easy', 'Medium', 'Hard'];
  final List<String> _types = ['PDF', 'Video', 'ZIP', 'Image'];

  @override
  void initState() {
    super.initState();
    _runSearch();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _runSearch() {
    final token = context.read<AuthProvider>().token ?? '';
    context.read<ContentProvider>().search(
      token: token,
      query: _searchController.text,
      subject: _selectedSubject,
      difficulty: _selectedDifficulty,
      type: _selectedType,
    );
  }

  void _clearFilters() {
    setState(() {
      _selectedSubject = null;
      _selectedDifficulty = null;
      _selectedType = null;
    });
    _runSearch();
  }

  @override
  Widget build(BuildContext context) {
    final contentProvider = context.watch<ContentProvider>();

    return Scaffold(
      backgroundColor: const Color(0xFFF2F3F7),
      body: SafeArea(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Blue Header with search
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
                  const Text(
                    'Hi, Ali 👋\nReady to learn today?',
                    style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.bold,
                      color: Colors.white,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 14),
                  Container(
                    height: 44,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: TextField(
                      controller: _searchController,
                      onSubmitted: (_) => _runSearch(),
                      onChanged: (_) => _runSearch(),
                      decoration: const InputDecoration(
                        hintText: 'Search resources, questions...',
                        hintStyle:
                            TextStyle(color: Colors.black38, fontSize: 14),
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

            const SizedBox(height: 14),

            // ── Filter chips
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Wrap(
                spacing: 8,
                children: [
                  _FilterChip(
                    label: _selectedSubject ?? 'Subject',
                    active: _selectedSubject != null,
                    onTap: () => _showPicker(
                      title: 'Select Subject',
                      options: _subjects,
                      onSelected: (v) {
                        setState(() => _selectedSubject = v);
                        _runSearch();
                      },
                    ),
                  ),
                  _FilterChip(
                    label: _selectedDifficulty ?? 'Difficulty',
                    active: _selectedDifficulty != null,
                    onTap: () => _showPicker(
                      title: 'Select Difficulty',
                      options: _difficulties,
                      onSelected: (v) {
                        setState(() => _selectedDifficulty = v);
                        _runSearch();
                      },
                    ),
                  ),
                  _FilterChip(
                    label: _selectedType ?? 'Type',
                    active: _selectedType != null,
                    onTap: () => _showPicker(
                      title: 'Select Type',
                      options: _types,
                      onSelected: (v) {
                        setState(() => _selectedType = v);
                        _runSearch();
                      },
                    ),
                  ),
                  if (_selectedSubject != null ||
                      _selectedDifficulty != null ||
                      _selectedType != null)
                    GestureDetector(
                      onTap: _clearFilters,
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 12, vertical: 7),
                        decoration: BoxDecoration(
                          color: Colors.grey.shade200,
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: const Text('Clear',
                            style: TextStyle(
                                fontSize: 13, color: Colors.black54)),
                      ),
                    ),
                ],
              ),
            ),

            const SizedBox(height: 12),

            // ── Results label
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                contentProvider.isLoading
                    ? 'Searching...'
                    : 'Results (${contentProvider.totalResults})',
                style: const TextStyle(
                  fontSize: 15,
                  fontWeight: FontWeight.bold,
                  color: Color(0xFF1E1E1E),
                ),
              ),
            ),

            const SizedBox(height: 10),

            // ── Results list
            Expanded(
              child: contentProvider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: Color(0xFF5B7BFF)))
                  : contentProvider.searchResults.isEmpty
                      ? const Center(
                          child: Text('No resources found.',
                              style: TextStyle(color: Colors.black45)))
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(horizontal: 16),
                          itemCount: contentProvider.searchResults.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (context, index) {
                            final item =
                                contentProvider.searchResults[index];
                            return _ResourceCard(item: item);
                          },
                        ),
            ),
          ],
        ),
      ),
    );
  }

  void _showPicker({
    required String title,
    required List<String> options,
    required ValueChanged<String> onSelected,
  }) {
    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (ctx) => Padding(
        padding: const EdgeInsets.all(20),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title,
                style: const TextStyle(
                    fontSize: 16, fontWeight: FontWeight.bold)),
            const SizedBox(height: 12),
            ...options.map((opt) => ListTile(
                  title: Text(opt),
                  onTap: () {
                    Navigator.pop(ctx);
                    onSelected(opt);
                  },
                )),
          ],
        ),
      ),
    );
  }
}

// ── Filter Chip Widget
class _FilterChip extends StatelessWidget {
  final String label;
  final bool active;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.active,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding:
            const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
        decoration: BoxDecoration(
          color: active ? const Color(0xFF5B7BFF) : Colors.white,
          borderRadius: BorderRadius.circular(20),
          border: Border.all(
            color: active
                ? const Color(0xFF5B7BFF)
                : Colors.grey.shade300,
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              label,
              style: TextStyle(
                fontSize: 13,
                color: active ? Colors.white : Colors.black54,
                fontWeight: FontWeight.w500,
              ),
            ),
            const SizedBox(width: 4),
            Icon(
              Icons.keyboard_arrow_down_rounded,
              size: 16,
              color: active ? Colors.white : Colors.black45,
            ),
          ],
        ),
      ),
    );
  }
}

// ── Resource Card Widget
class _ResourceCard extends StatelessWidget {
  final ContentModel item;

  const _ResourceCard({required this.item});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.pushNamed(
        context,
        '/resource-detail',
        arguments: item.id,
      ),
      child: Container(
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
        child: Row(
          children: [
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    item.title,
                    style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1E1E1E),
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    item.description.isNotEmpty
                        ? item.description
                        : '${item.subject} · ${item.type}',
                    style: const TextStyle(
                        fontSize: 12, color: Colors.black45),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ],
              ),
            ),
            const SizedBox(width: 12),
            Container(
              width: 36,
              height: 36,
              decoration: BoxDecoration(
                color: const Color(0xFF5B7BFF),
                borderRadius: BorderRadius.circular(10),
              ),
              child: const Icon(Icons.arrow_forward_ios_rounded,
                  color: Colors.white, size: 16),
            ),
          ],
        ),
      ),
    );
  }
}