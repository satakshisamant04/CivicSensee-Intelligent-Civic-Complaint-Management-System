import { Request, Response } from 'express';
import { UserSession } from '../../types/index.js';

const DEMO_USERS = [
  {
    id: 'user_admin_01',
    name: 'Administrator Sarah Jenkins',
    email: 'admin@civicsense.gov',
    role: 'Admin' as const,
    password: 'password123',
  },
  {
    id: 'user_citizen_01',
    name: 'Aarav Sharma',
    email: 'aarav.sharma@example.com',
    role: 'Citizen' as const,
    password: 'password123',
  }
];

export const login = (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required' });
    }

    const matched = DEMO_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    // Quick demo login support
    let user: UserSession;
    if (matched) {
      user = {
        id: matched.id,
        name: matched.name,
        email: matched.email,
        role: matched.role,
        token: `jwt_cs_${matched.role.toLowerCase()}_${Date.now()}`
      };
    } else {
      user = {
        id: `user_${Date.now()}`,
        name: email.split('@')[0],
        email: email,
        role: (role === 'Admin' ? 'Admin' : 'Citizen'),
        token: `jwt_cs_${(role === 'Admin' ? 'admin' : 'citizen')}_${Date.now()}`
      };
    }

    res.json({ success: true, user, token: user.token });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Login error' });
  }
};

export const register = (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;
    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required' });
    }

    const assignedRole = role?.toLowerCase() === 'admin' ? 'Admin' : 'Citizen';
    const user: UserSession = {
      id: `user_${Date.now()}`,
      name,
      email,
      role: assignedRole,
      token: `jwt_cs_${assignedRole.toLowerCase()}_${Date.now()}`
    };

    res.status(201).json({ success: true, user, token: user.token });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Registration error' });
  }
};
