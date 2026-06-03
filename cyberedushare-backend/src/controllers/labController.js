const Lab = require('../models/Lab');

function fixVmUrlForWeb(req, vmUrl) {
  if (!vmUrl) return vmUrl;

  const host = req.get('host')?.split(':')[0];

  if (!host) return vmUrl;

  return vmUrl
    .replace('10.0.2.2', host)
    .replace('localhost', host)
    .replace('127.0.0.1', host);
}

// ── GET ALL LABS
exports.getLabs = async (req, res) => {
  try {
    const { subject, difficulty } = req.query;
    const filter = { isActive: true };

    if (subject) filter.subject = { $regex: subject, $options: 'i' };
    if (difficulty) filter.difficulty = difficulty;

    const labs = await Lab.find(filter)
      .sort({ createdAt: -1 })
      .select('-completions -vmPassword');

    const fixedLabs = labs.map((lab) => {
      const obj = lab.toObject();
      obj.vmUrl = fixVmUrlForWeb(req, obj.vmUrl);
      return obj;
    });

    res.json(fixedLabs);
  } catch (error) {
    console.error('Get labs error:', error);
    res.status(500).json({ message: 'Server error fetching labs' });
  }
};

// ── GET SINGLE LAB
exports.getLab = async (req, res) => {
  try {
    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const alreadyCompleted = lab.completions.some(
      (c) => c.user.toString() === req.user._id.toString()
    );

    const labData = lab.toObject();
    delete labData.completions;

    labData.vmUrl = fixVmUrlForWeb(req, labData.vmUrl);

    res.json({
      ...labData,
      alreadyCompleted,
    });
  } catch (error) {
    console.error('Get lab error:', error);
    res.status(500).json({ message: 'Server error fetching lab' });
  }
};

// ── SUBMIT LAB COMPLETION
exports.submitCompletion = async (req, res) => {
  try {
    const { timeTaken } = req.body;

    const lab = await Lab.findById(req.params.id);

    if (!lab) {
      return res.status(404).json({ message: 'Lab not found' });
    }

    const alreadyCompleted = lab.completions.some(
      (c) => c.user.toString() === req.user._id.toString()
    );

    if (!alreadyCompleted) {
      lab.completions.push({
        user: req.user._id,
        timeTaken: timeTaken || 0,
      });

      await lab.save();
    }

    res.json({
      message: alreadyCompleted
        ? 'Lab already completed'
        : 'Lab marked as completed!',
      alreadyCompleted,
    });
  } catch (error) {
    console.error('Submit completion error:', error);
    res.status(500).json({ message: 'Server error submitting completion' });
  }
};

// ── CREATE LAB
exports.createLab = async (req, res) => {
  try {
    const {
      title,
      description,
      subject,
      difficulty,
      duration,
      instructions,
      vmUrl,
      vmUsername,
      vmPassword,
    } = req.body;

    if (!title || !subject) {
      return res.status(400).json({ message: 'Title and subject required' });
    }

    const lab = await Lab.create({
      title,
      description,
      subject,
      difficulty,
      duration,
      instructions,
      vmUrl,
      vmUsername,
      vmPassword,
    });

    res.status(201).json(lab);
  } catch (error) {
    console.error('Create lab error:', error);
    res.status(500).json({ message: 'Server error creating lab' });
  }
};