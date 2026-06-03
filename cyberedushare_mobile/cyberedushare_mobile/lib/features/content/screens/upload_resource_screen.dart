import 'dart:io';
import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:file_picker/file_picker.dart';
import '../../../features/auth/providers/auth_provider.dart';
import '../../../features/content/providers/content_provider.dart';

class UploadResourceScreen extends StatefulWidget {
  const UploadResourceScreen({super.key});

  @override
  State<UploadResourceScreen> createState() => _UploadResourceScreenState();
}

class _UploadResourceScreenState extends State<UploadResourceScreen> {
  final _titleController = TextEditingController();
  final _tagsController = TextEditingController();
  final _notesController = TextEditingController();

  String _selectedSubject = '';
  String _selectedDifficulty = 'Medium';
  File? _pickedFile;
  String? _pickedFileName;

  final List<String> _subjects = [
  'CS101',
  'CS102', 
  'CS201',
  'CS205',
  'Networks',
  'Cryptography',
  'OS',
];

  @override
  void dispose() {
    _titleController.dispose();
    _tagsController.dispose();
    _notesController.dispose();
    super.dispose();
  }

  Future<void> _pickFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['pdf', 'zip', 'mp4', 'jpg', 'jpeg', 'png'],
    );

    if (result != null && result.files.single.path != null) {
      setState(() {
        _pickedFile = File(result.files.single.path!);
        _pickedFileName = result.files.single.name;
      });
    }
  }

  String _getFileType(String fileName) {
    final ext = fileName.split('.').last.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'PDF';
      case 'zip':
        return 'ZIP';
      case 'mp4':
        return 'Video';
      case 'jpg':
      case 'jpeg':
      case 'png':
        return 'Image';
      default:
        return 'Other';
    }
  }

  Future<void> _handleSubmit() async {
    final title = _titleController.text.trim();
    final notes = _notesController.text.trim();
    final tags = _tagsController.text.trim();

    if (title.isEmpty) {
      _showError('Please enter a title.');
      return;
    }
    if (_selectedSubject.isEmpty) {
      _showError('Please select a course/subject.');
      return;
    }
    if (_pickedFile == null) {
      _showError('Please select a file to upload.');
      return;
    }

    final token = context.read<AuthProvider>().token ?? '';
    final fileType = _getFileType(_pickedFileName ?? '');

    final success = await context.read<ContentProvider>().upload(
      token: token,
      title: title,
      subject: _selectedSubject,
      difficulty: _selectedDifficulty,
      type: fileType,
      tags: tags,
      description: notes,
      file: _pickedFile!,
    );

    if (!mounted) return;

    if (success) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Resource uploaded successfully!'),
          backgroundColor: Color(0xFF5B7BFF),
        ),
      );
      Navigator.pop(context);
    } else {
      _showError(context.read<ContentProvider>().errorMessage);
    }
  }

  void _showError(String message) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(message), backgroundColor: Colors.red),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isLoading = context.watch<ContentProvider>().isLoading;

    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded,
              color: Color(0xFF1E1E1E), size: 20),
          onPressed: () => Navigator.pop(context),
        ),
        title: const Text(
          'Upload Resource',
          style: TextStyle(
            color: Color(0xFF1E1E1E),
            fontSize: 18,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Title
            _FieldLabel('Title', required: true),
            const SizedBox(height: 8),
            _InputField(
              controller: _titleController,
              hint: 'Enter a clear title for your file',
            ),

            const SizedBox(height: 20),

            // ── Course / Subject dropdown
            _FieldLabel('Course', required: true),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: DropdownButtonFormField<String>(
                value: _selectedSubject.isEmpty ? null : _selectedSubject,
                hint: const Text('Select Course',
                    style: TextStyle(color: Colors.black38, fontSize: 14)),
                decoration: const InputDecoration(
                  border: InputBorder.none,
                  contentPadding:
                      EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                ),
                items: _subjects
                    .map((s) => DropdownMenuItem(value: s, child: Text(s)))
                    .toList(),
                onChanged: (val) =>
                    setState(() => _selectedSubject = val ?? ''),
              ),
            ),

            const SizedBox(height: 20),

            // ── Tags
            _FieldLabel('Tags'),
            const SizedBox(height: 8),
            _InputField(
              controller: _tagsController,
              hint: 'Insert Tags (comma separated)',
            ),

            const SizedBox(height: 20),

            // ── Difficulty
            _FieldLabel('Difficulty'),
            const SizedBox(height: 8),
            Row(
              children: ['Easy', 'Medium', 'Hard'].map((d) {
                final selected = _selectedDifficulty == d;
                return Row(
                  children: [
                    Radio<String>(
                      value: d,
                      groupValue: _selectedDifficulty,
                      activeColor: const Color(0xFF5B7BFF),
                      onChanged: (val) =>
                          setState(() => _selectedDifficulty = val!),
                    ),
                    Text(d,
                        style: TextStyle(
                          fontSize: 14,
                          fontWeight: selected
                              ? FontWeight.w600
                              : FontWeight.normal,
                          color: selected
                              ? const Color(0xFF5B7BFF)
                              : Colors.black54,
                        )),
                    const SizedBox(width: 8),
                  ],
                );
              }).toList(),
            ),

            const SizedBox(height: 20),

            // ── File Upload
            _FieldLabel('File Upload', required: true),
            const SizedBox(height: 4),
            const Text(
              'Tap to choose file (PDF / ZIP / Video / Image)',
              style: TextStyle(fontSize: 12, color: Colors.black45),
            ),
            const SizedBox(height: 10),

            Row(
              children: [
                Expanded(
                  child: Container(
                    height: 48,
                    decoration: BoxDecoration(
                      color: const Color(0xFFF5F5F5),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    alignment: Alignment.centerLeft,
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    child: Text(
                      _pickedFileName ?? 'No file chosen',
                      style: TextStyle(
                        fontSize: 13,
                        color: _pickedFileName != null
                            ? const Color(0xFF1E1E1E)
                            : Colors.black38,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                ElevatedButton(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF5B7BFF),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(8),
                    ),
                    padding: const EdgeInsets.symmetric(
                        horizontal: 16, vertical: 12),
                    elevation: 0,
                  ),
                  onPressed: _pickFile,
                  child: const Text('Browse',
                      style:
                          TextStyle(color: Colors.white, fontSize: 13)),
                ),
              ],
            ),

            // ── Selected file indicator
            if (_pickedFileName != null) ...[
              const SizedBox(height: 12),
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 12, vertical: 10),
                decoration: BoxDecoration(
                  color: const Color(0xFFEEF1FF),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.insert_drive_file_rounded,
                        color: Color(0xFF5B7BFF), size: 18),
                    const SizedBox(width: 8),
                    Expanded(
                      child: Text(
                        _pickedFileName!,
                        style: const TextStyle(
                            fontSize: 13, color: Color(0xFF1E1E1E)),
                        overflow: TextOverflow.ellipsis,
                      ),
                    ),
                    GestureDetector(
                      onTap: () => setState(() {
                        _pickedFile = null;
                        _pickedFileName = null;
                      }),
                      child: const Icon(Icons.close_rounded,
                          color: Colors.black45, size: 18),
                    ),
                  ],
                ),
              ),
            ],

            const SizedBox(height: 20),

            // ── Optional Notes
            _FieldLabel('Optional Notes (README)'),
            const SizedBox(height: 8),
            Container(
              decoration: BoxDecoration(
                color: const Color(0xFFF5F5F5),
                borderRadius: BorderRadius.circular(10),
              ),
              child: TextField(
                controller: _notesController,
                maxLines: 5,
                decoration: const InputDecoration(
                  hintText:
                      'Add explanation, description, or instructions',
                  hintStyle:
                      TextStyle(color: Colors.black38, fontSize: 14),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.all(14),
                ),
              ),
            ),

            const SizedBox(height: 32),

            // ── Submit Button
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFF5B7BFF),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                  elevation: 0,
                ),
                onPressed: isLoading ? null : _handleSubmit,
                child: isLoading
                    ? const SizedBox(
                        height: 22,
                        width: 22,
                        child: CircularProgressIndicator(
                          color: Colors.white,
                          strokeWidth: 2.5,
                        ),
                      )
                    : const Text(
                        'Submit',
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
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

class _FieldLabel extends StatelessWidget {
  final String label;
  final bool required;
  const _FieldLabel(this.label, {this.required = false});

  @override
  Widget build(BuildContext context) => RichText(
        text: TextSpan(
          text: label,
          style: const TextStyle(
            fontSize: 14,
            fontWeight: FontWeight.w600,
            color: Color(0xFF1E1E1E),
          ),
          children: [
            if (required)
              const TextSpan(
                text: ' *',
                style: TextStyle(color: Colors.red),
              ),
          ],
        ),
      );
}

class _InputField extends StatelessWidget {
  final TextEditingController controller;
  final String hint;

  const _InputField({required this.controller, required this.hint});

  @override
  Widget build(BuildContext context) => Container(
        decoration: BoxDecoration(
          color: const Color(0xFFF5F5F5),
          borderRadius: BorderRadius.circular(10),
        ),
        child: TextField(
          controller: controller,
          decoration: InputDecoration(
            hintText: hint,
            hintStyle:
                const TextStyle(color: Colors.black38, fontSize: 14),
            border: InputBorder.none,
            contentPadding: const EdgeInsets.symmetric(
                horizontal: 16, vertical: 14),
          ),
        ),
      );
}