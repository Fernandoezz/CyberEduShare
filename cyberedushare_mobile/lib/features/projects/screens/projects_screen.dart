import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/projects/providers/project_provider.dart';
import '../../../features/projects/models/project_model.dart';

class ProjectsScreen extends StatefulWidget {
  const ProjectsScreen({super.key});

  @override
  State<ProjectsScreen> createState() => _ProjectsScreenState();
}

class _ProjectsScreenState extends State<ProjectsScreen> {
  final _searchController = TextEditingController();
  String? _selectedSubject;
  String? _selectedTech;

  final List<String> _subjects = [
    'CS101', 'CS102', 'CS201', 'CS205', 'Networks', 'Cryptography', 'OS',
  ];
  final List<String> _techOptions = [
    'Python', 'Java', 'C++', 'JavaScript', 'Flutter', 'React', 'Node.js',
    'Docker', 'Linux', 'Other',
  ];

  @override
  void initState() {
    super.initState();
    _load();
  }

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _load({String query = '', String? subject, String? tech}) {
    final token = context.read<AuthProvider>().token ?? '';
    context.read<ProjectProvider>().loadProjects(
          token: token,
          query: query,
          subject: subject,
          tech: tech,
        );
  }

  void _showSubmitSheet() {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    final techCtrl = TextEditingController();
    String subject = '';
    File? pickedFile;
    String? pickedFileName;

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
          borderRadius:
              BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) => Padding(
        padding: EdgeInsets.only(
          left: 20,
          right: 20,
          top: 24,
          bottom: MediaQuery.of(ctx).viewInsets.bottom + 24,
        ),
        child: StatefulBuilder(
          builder: (ctx, setSheet) => SingleChildScrollView(
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Submit Project',
                    style: TextStyle(
                        fontSize: 17, fontWeight: FontWeight.bold)),
                const SizedBox(height: 16),
                _SheetField(controller: titleCtrl, hint: 'Project Title *'),
                const SizedBox(height: 10),
                _SheetField(
                    controller: descCtrl,
                    hint: 'Description',
                    maxLines: 3),
                const SizedBox(height: 10),
                DropdownButtonFormField<String>(
                  value: subject.isEmpty ? null : subject,
                  hint: const Text('Select Subject *',
                      style: TextStyle(
                          color: Colors.black38, fontSize: 14)),
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
                  onChanged: (v) =>
                      setSheet(() => subject = v ?? ''),
                ),
                const SizedBox(height: 10),
                _SheetField(
                    controller: techCtrl,
                    hint: 'Tech Stack (comma separated)'),
                const SizedBox(height: 10),

                // ── File picker row
                Row(
                  children: [
                    Expanded(
                      child: Container(
                        height: 44,
                        padding:
                            const EdgeInsets.symmetric(horizontal: 12),
                        decoration: BoxDecoration(
                          color: const Color(0xFFF5F5F5),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        alignment: Alignment.centerLeft,
                        child: Text(
                          pickedFileName ?? 'No file chosen',
                          style: TextStyle(
                              fontSize: 13,
                              color: pickedFileName != null
                                  ? const Color(0xFF1E1E1E)
                                  : Colors.black38),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    ElevatedButton(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: const Color(0xFF5B7BFF),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8)),
                        elevation: 0,
                        padding: const EdgeInsets.symmetric(
                            horizontal: 14, vertical: 12),
                      ),
                      onPressed: () async {
                        final result =
                            await FilePicker.platform.pickFiles(
                          type: FileType.custom,
                          allowedExtensions: [
                            'pdf', 'zip', 'mp4', 'jpg', 'jpeg', 'png'
                          ],
                        );
                        if (result != null &&
                            result.files.single.path != null) {
                          setSheet(() {
                            pickedFile =
                                File(result.files.single.path!);
                            pickedFileName = result.files.single.name;
                          });
                        }
                      },
                      child: const Text('Browse',
                          style: TextStyle(
                              color: Colors.white, fontSize: 13)),
                    ),
                  ],
                ),

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
                      final success = await context
                          .read<ProjectProvider>()
                          .submitProject(
                            token: token,
                            title: titleCtrl.text.trim(),
                            description: descCtrl.text.trim(),
                            subject: subject,
                            techStack: techCtrl.text.trim(),
                            file: pickedFile,
                          );
                      if (success && context.mounted) {
                        ScaffoldMessenger.of(context).showSnackBar(
                          const SnackBar(
                            content:
                                Text('Project submitted successfully!'),
                            backgroundColor: Color(0xFF5B7BFF),
                          ),
                        );
                      }
                    },
                    child: const Text('Submit Project',
                        style: TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.w600)),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final provider = context.watch<ProjectProvider>();

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
                      const Text('Projects Repository',
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
                      onSubmitted: (v) => _load(
                          query: v,
                          subject: _selectedSubject,
                          tech: _selectedTech),
                      decoration: const InputDecoration(
                        hintText: 'Search projects...',
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
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  if (index == 0) {
                    return _FilterChip(
                      label: 'All',
                      active: _selectedSubject == null,
                      onTap: () {
                        setState(() {
                          _selectedSubject = null;
                          _selectedTech = null;
                        });
                        _load(query: _searchController.text);
                      },
                    );
                  }
                  final s = _subjects[index - 1];
                  return _FilterChip(
                    label: s,
                    active: _selectedSubject == s,
                    onTap: () {
                      setState(() {
                        _selectedSubject = s;
                        _selectedTech = null;
                      });
                      _load(
                          query: _searchController.text, subject: s);
                    },
                  );
                },
              ),
            ),

            const SizedBox(height: 8),

            // ── Tech filter chips
            SizedBox(
              height: 36,
              child: ListView.separated(
                scrollDirection: Axis.horizontal,
                padding: const EdgeInsets.symmetric(horizontal: 16),
                itemCount: _techOptions.length,
                separatorBuilder: (_, __) => const SizedBox(width: 8),
                itemBuilder: (context, index) {
                  final t = _techOptions[index];
                  return _FilterChip(
                    label: t,
                    active: _selectedTech == t,
                    color: const Color(0xFF34A853),
                    onTap: () {
                      setState(() => _selectedTech =
                          _selectedTech == t ? null : t);
                      _load(
                        query: _searchController.text,
                        subject: _selectedSubject,
                        tech: _selectedTech,
                      );
                    },
                  );
                },
              ),
            ),

            const SizedBox(height: 12),

            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Text(
                'Projects (${provider.total})',
                style: const TextStyle(
                    fontSize: 15, fontWeight: FontWeight.bold),
              ),
            ),

            const SizedBox(height: 8),

            // ── Projects list
            Expanded(
              child: provider.isLoading
                  ? const Center(
                      child: CircularProgressIndicator(
                          color: Color(0xFF5B7BFF)))
                  : provider.projects.isEmpty
                      ? const Center(
                          child: Text('No projects yet. Submit one!',
                              style:
                                  TextStyle(color: Colors.black45)))
                      : ListView.separated(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 16),
                          itemCount: provider.projects.length,
                          separatorBuilder: (_, __) =>
                              const SizedBox(height: 10),
                          itemBuilder: (ctx, i) {
                            return _ProjectCard(
                                project: provider.projects[i]);
                          },
                        ),
            ),
          ],
        ),
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: _showSubmitSheet,
        backgroundColor: const Color(0xFF5B7BFF),
        icon: const Icon(Icons.upload_rounded, color: Colors.white),
        label: const Text('Submit',
            style: TextStyle(
                color: Colors.white, fontWeight: FontWeight.w600)),
      ),
    );
  }
}

// ── Project Card
class _ProjectCard extends StatelessWidget {
  final ProjectModel project;
  const _ProjectCard({required this.project});

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: () => Navigator.pushNamed(
          context,
          '/project-detail',
          arguments: project.id,
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
              Text(project.title,
                  style: const TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: Color(0xFF1E1E1E))),
              const SizedBox(height: 4),
              Text(project.subject,
                  style: const TextStyle(
                      fontSize: 12, color: Color(0xFF5B7BFF))),
              if (project.description.isNotEmpty) ...[
                const SizedBox(height: 6),
                Text(project.description,
                    style: const TextStyle(
                        fontSize: 12, color: Colors.black54),
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis),
              ],
              if (project.techStack.isNotEmpty) ...[
                const SizedBox(height: 8),
                Wrap(
                  spacing: 6,
                  children: project.techStack
                      .map((t) => Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: const Color(0xFFE8F5E9),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(t,
                                style: const TextStyle(
                                    fontSize: 11,
                                    color: Color(0xFF34A853))),
                          ))
                      .toList(),
                ),
              ],
              const SizedBox(height: 10),
              Row(
                children: [
                  const Icon(Icons.favorite_border_rounded,
                      size: 14, color: Colors.black45),
                  const SizedBox(width: 4),
                  Text('${project.likeCount}',
                      style: const TextStyle(
                          fontSize: 12, color: Colors.black45)),
                  const SizedBox(width: 14),
                  const Icon(Icons.chat_bubble_outline_rounded,
                      size: 14, color: Colors.black45),
                  const SizedBox(width: 4),
                  Text('${project.commentCount}',
                      style: const TextStyle(
                          fontSize: 12, color: Colors.black45)),
                  const Spacer(),
                  Text('by ${project.submittedByName}',
                      style: const TextStyle(
                          fontSize: 11, color: Colors.black38)),
                ],
              ),
            ],
          ),
        ),
      );
}

// ── Filter Chip
class _FilterChip extends StatelessWidget {
  final String label;
  final bool active;
  final Color color;
  final VoidCallback onTap;

  const _FilterChip({
    required this.label,
    required this.active,
    required this.onTap,
    this.color = const Color(0xFF5B7BFF),
  });

  @override
  Widget build(BuildContext context) => GestureDetector(
        onTap: onTap,
        child: Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 7),
          decoration: BoxDecoration(
            color: active ? color : Colors.white,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(
                color: active ? color : Colors.grey.shade300),
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
          contentPadding: const EdgeInsets.symmetric(
              horizontal: 14, vertical: 12),
        ),
      );
}