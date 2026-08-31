import { Request, Response } from 'express';
import { db } from '../db.js';
import { ComplaintStatus, ComplaintCategory } from '../../types/index.js';

export const getComplaints = (req: Request, res: Response) => {
  try {
    const { search, category, priority, status, location, citizenEmail, sortBy, sortOrder, page, limit } = req.query;

    const result = db.getAll({
      search: search as string,
      category: category as string,
      priority: priority as string,
      status: status as string,
      location: location as string,
      citizenEmail: citizenEmail as string,
      sortBy: sortBy as any,
      sortOrder: sortOrder as any,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 25,
    });

    res.json({ success: true, ...result });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

export const getComplaintById = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const complaint = db.getById(id);

    if (!complaint) {
      return res.status(404).json({ success: false, error: `Complaint with ID '${id}' not found.` });
    }

    res.json({ success: true, complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Internal Server Error' });
  }
};

export const createComplaint = (req: Request, res: Response) => {
  try {
    const { title, description, location, daysPending, previousComplaints, citizenName, citizenEmail, citizenPhone, customCategory } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, error: 'Complaint title is required.' });
    }

    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, error: 'Complaint description is required for ML analysis.' });
    }

    if (!citizenName || !citizenEmail) {
      return res.status(400).json({ success: false, error: 'Citizen name and email are required.' });
    }

    const complaint = db.create({
      title,
      description,
      location: location || { city: 'Metropolis', area: 'Sector 4' },
      daysPending: Number(daysPending) || 0,
      previousComplaints: Number(previousComplaints) || 0,
      citizenName,
      citizenEmail,
      citizenPhone,
      customCategory: customCategory as ComplaintCategory
    });

    res.status(201).json({ success: true, complaint });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to register complaint' });
  }
};

export const updateComplaintStatus = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, note, updatedBy } = req.body;

    const validStatuses: ComplaintStatus[] = ['Submitted', 'Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ success: false, error: `Invalid status. Must be one of: ${validStatuses.join(', ')}` });
    }

    const updated = db.updateStatus(id, status, note, updatedBy);
    if (!updated) {
      return res.status(404).json({ success: false, error: `Complaint with ID '${id}' not found.` });
    }

    res.json({ success: true, complaint: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to update complaint status' });
  }
};

export const deleteComplaint = (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deleted = db.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: `Complaint with ID '${id}' not found.` });
    }
    res.json({ success: true, message: `Complaint ${id} deleted successfully.` });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to delete complaint' });
  }
};
