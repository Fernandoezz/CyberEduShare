const Question = require('../models/Question');

// ── POST QUESTION
exports.postQuestion = async (req, res) => {
  try {
    const { title, body, subject, tags } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject are required' });
    }

    const parsedTags = Array.isArray(tags)
      ? tags
      : tags
        ? tags.split(',').map((t) => t.trim()).filter(Boolean)
        : [];

    const question = await Question.create({
      title,
      body: body || '',
      subject,
      tags: parsedTags,
      askedBy: req.user._id,
      askedByName: req.user.username,
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Post question error:', error);
    res.status(500).json({ message: 'Server error posting question' });
  }
};

// ── GET ALL QUESTIONS
exports.getQuestions = async (req, res) => {
  try {
    const { q, subject, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (q) {
      filter.$or = [
        { title: { $regex: q, $options: 'i' } },
        { body: { $regex: q, $options: 'i' } },
        { tags: { $regex: q, $options: 'i' } },
      ];
    }

    if (subject) {
      filter.subject = { $regex: subject, $options: 'i' };
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [questions, total] = await Promise.all([
      Question.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .select('-answers.body')
        .lean(),
      Question.countDocuments(filter),
    ]);

    const formattedQuestions = questions.map((q) => ({
      ...q,
      answerCount: q.answers ? q.answers.length : 0,
    }));

    res.json({
      questions: formattedQuestions,
      total,
      page: parseInt(page),
    });
  } catch (error) {
    console.error('Get questions error:', error);
    res.status(500).json({ message: 'Server error fetching questions' });
  }
};

// ── GET SINGLE QUESTION
exports.getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Get question error:', error);
    res.status(500).json({ message: 'Server error fetching question' });
  }
};

// ── UPVOTE QUESTION
exports.upvoteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = question.upvotes.includes(userId);

    if (hasUpvoted) {
      question.upvotes.pull(userId);
    } else {
      question.upvotes.push(userId);
    }

    await question.save();

    res.json({
      upvoted: !hasUpvoted,
      upvoteCount: question.upvotes.length,
    });
  } catch (error) {
    console.error('Upvote question error:', error);
    res.status(500).json({ message: 'Server error upvoting question' });
  }
};

// ── POST ANSWER
exports.postAnswer = async (req, res) => {
  try {
    const { body } = req.body;

    if (!body) {
      return res.status(400).json({ message: 'Answer body is required' });
    }

    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    question.answers.push({
      body,
      answeredBy: req.user._id,
      answeredByName: req.user.username,
    });

    await question.save();

    res.status(201).json(question);
  } catch (error) {
    console.error('Post answer error:', error);
    res.status(500).json({ message: 'Server error posting answer' });
  }
};

// ── UPVOTE ANSWER
exports.upvoteAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const answer = question.answers.id(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    const userId = req.user._id;
    const hasUpvoted = answer.upvotes.includes(userId);

    if (hasUpvoted) {
      answer.upvotes.pull(userId);
    } else {
      answer.upvotes.push(userId);
    }

    await question.save();

    res.json({
      upvoted: !hasUpvoted,
      upvoteCount: answer.upvotes.length,
    });
  } catch (error) {
    console.error('Upvote answer error:', error);
    res.status(500).json({ message: 'Server error upvoting answer' });
  }
};

// ── MARK ANSWER AS ACCEPTED
exports.acceptAnswer = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    if (question.askedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: 'Only the question author can accept an answer',
      });
    }

    const answer = question.answers.id(req.params.answerId);

    if (!answer) {
      return res.status(404).json({ message: 'Answer not found' });
    }

    question.answers.forEach((a) => {
      a.isAccepted = false;
    });

    answer.isAccepted = true;
    question.isSolved = true;

    await question.save();

    res.json({
      message: 'Answer accepted',
      question,
    });
  } catch (error) {
    console.error('Accept answer error:', error);
    res.status(500).json({ message: 'Server error accepting answer' });
  }
};