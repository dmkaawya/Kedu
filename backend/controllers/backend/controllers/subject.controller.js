import Subject from '../models/Subject.js';
import { validationResult } from 'express-validator';

export const createSubject = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, code, description, teachers } = req.body;
    const { schoolId } = req.user;

    const subject = await Subject.create({
      schoolId,
      name,
      code,
      description,
      teachers
    });

    res.status(201).json({
      message: 'Subject created successfully',
      subject
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ message: 'Subject name or code already exists in this school' });
    }
    res.status(500).json({ message: error.message });
  }
};

export const getSubjects = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const subjects = await Subject.find({ schoolId, isActive: true })
      .populate('teachers', 'profile email')
      .sort({ name: 1 });
    res.json({ subjects });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getSubjectById = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const subject = await Subject.findOne({ _id: req.params.id, schoolId })
      .populate('teachers', 'profile email');
    
    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }
    res.json({ subject });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateSubject = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const updates = req.body;

    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      updates,
      { new: true, runValidators: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({
      message: 'Subject updated successfully',
      subject
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteSubject = async (req, res) => {
  try {
    const { schoolId } = req.user;
    const subject = await Subject.findOneAndUpdate(
      { _id: req.params.id, schoolId },
      { isActive: false },
      { new: true }
    );

    if (!subject) {
      return res.status(404).json({ message: 'Subject not found' });
    }

    res.json({ message: 'Subject deactivated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
