import 'dart:io';
import 'package:flutter/material.dart';
import '../models/project_model.dart';
import '../services/project_service.dart';

enum ProjectStatus { idle, loading, success, error }

class ProjectProvider extends ChangeNotifier {
  final ProjectService _service = ProjectService();

  ProjectStatus _status = ProjectStatus.idle;
  String _errorMessage = '';
  List<ProjectModel> _projects = [];
  ProjectModel? _selectedProject;
  int _total = 0;

  ProjectStatus get status => _status;
  String get errorMessage => _errorMessage;
  List<ProjectModel> get projects => _projects;
  ProjectModel? get selectedProject => _selectedProject;
  int get total => _total;
  bool get isLoading => _status == ProjectStatus.loading;

  // ── LOAD PROJECTS
  Future<void> loadProjects({
    required String token,
    String query = '',
    String? subject,
    String? tech,
  }) async {
    _setStatus(ProjectStatus.loading);
    try {
      final result = await _service.getProjects(
        token: token,
        query: query,
        subject: subject,
        tech: tech,
      );
      _projects = result['projects'];
      _total = result['total'];
      _setStatus(ProjectStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(ProjectStatus.error);
    }
  }

  // ── LOAD SINGLE PROJECT
  Future<void> loadProject({
    required String token,
    required String id,
  }) async {
    _setStatus(ProjectStatus.loading);
    try {
      _selectedProject =
          await _service.getProject(token: token, id: id);
      _setStatus(ProjectStatus.success);
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(ProjectStatus.error);
    }
  }

  // ── SUBMIT PROJECT
  Future<bool> submitProject({
    required String token,
    required String title,
    required String description,
    required String subject,
    required String techStack,
    File? file,
  }) async {
    _setStatus(ProjectStatus.loading);
    try {
      final project = await _service.submitProject(
        token: token,
        title: title,
        description: description,
        subject: subject,
        techStack: techStack,
        file: file,
      );
      _projects.insert(0, project);
      _setStatus(ProjectStatus.success);
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      _setStatus(ProjectStatus.error);
      return false;
    }
  }

  // ── TOGGLE LIKE
  Future<void> toggleLike({
    required String token,
    required String projectId,
  }) async {
    try {
      await _service.toggleLike(token: token, id: projectId);
      await loadProject(token: token, id: projectId);
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
    }
  }

  // ── POST COMMENT
  Future<bool> postComment({
    required String token,
    required String projectId,
    required String body,
  }) async {
    try {
      _selectedProject = await _service.postComment(
        token: token,
        projectId: projectId,
        body: body,
      );
      notifyListeners();
      return true;
    } catch (e) {
      _errorMessage = e.toString();
      notifyListeners();
      return false;
    }
  }

  void clearError() {
    _errorMessage = '';
    _status = ProjectStatus.idle;
    notifyListeners();
  }

  void _setStatus(ProjectStatus s) {
    _status = s;
    notifyListeners();
  }
}