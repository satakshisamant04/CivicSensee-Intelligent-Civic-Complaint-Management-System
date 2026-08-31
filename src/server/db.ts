import { Complaint, ComplaintCategory, PriorityLevel, ComplaintStatus, AnalyticsSummary } from '../types/index.js';
import { predictComplaintML } from './mlEngine.js';

class InMemoryMongoDBStore {
  private complaints: Map<string, Complaint> = new Map();
  private nextIdSequence: number = 130;

  constructor() {
    this.seedInitialData();
  }

  private seedInitialData() {
    const sampleComplaints: Array<{
      id: string;
      title: string;
      description: string;
      location: { city: string; area: string; landmark?: string; latitude: number; longitude: number };
      daysPending: number;
      previousComplaints: number;
      status: ComplaintStatus;
      citizenName: string;
      citizenEmail: string;
      citizenPhone: string;
      createdAt: string;
    }> = [
      {
        id: 'CIV-2026-00124',
        title: 'Exposed high voltage electrical wire near primary school playground',
        description: 'High voltage transformer sparking and exposed live electrical wire hanging near children playground in Sector 4. Urgent danger of electrocution.',
        location: { city: 'Metropolis', area: 'Sector 4', landmark: 'Greenwood Primary School', latitude: 28.6139, longitude: 77.2090 },
        daysPending: 1,
        previousComplaints: 6,
        status: 'Submitted',
        citizenName: 'Aarav Sharma',
        citizenEmail: 'aarav.sharma@example.com',
        citizenPhone: '+1 (555) 234-5678',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      },
      {
        id: 'CIV-2026-00119',
        title: 'Large crater pothole on main arterial highway flyover',
        description: 'Massive deep crater pothole on expressway flyover causing sudden vehicle braking and bike skids during evening rush hours.',
        location: { city: 'Metropolis', area: 'Central Highway', landmark: 'Flyover Ramp B', latitude: 28.6180, longitude: 77.2150 },
        daysPending: 6,
        previousComplaints: 5,
        status: 'Under Review',
        citizenName: 'Priya Patel',
        citizenEmail: 'priya.patel@example.com',
        citizenPhone: '+1 (555) 345-6789',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 28).toISOString(),
      },
      {
        id: 'CIV-2026-00112',
        title: 'Main drinking water pipeline burst with severe road flooding',
        description: 'Main drinking water distribution pipeline burst flooding entire road with high pressure clean water loss. Water entering ground floor residences.',
        location: { city: 'Metropolis', area: 'Oakwood North', landmark: 'Sector 8 Market Gate', latitude: 28.6250, longitude: 77.2200 },
        daysPending: 2,
        previousComplaints: 7,
        status: 'Assigned',
        citizenName: 'Rohan Gupta',
        citizenEmail: 'rohan.gupta@example.com',
        citizenPhone: '+1 (555) 456-7890',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
      },
      {
        id: 'CIV-2026-00108',
        title: 'Underground sewer pipeline burst spilling raw sewage into street',
        description: 'Underground sewer line ruptured with black toxic water overflowing from manhole and entering ground floor residential homes with extreme stench.',
        location: { city: 'Metropolis', area: 'Riverside Block C', landmark: 'House 14B Lane', latitude: 28.6090, longitude: 77.2010 },
        daysPending: 3,
        previousComplaints: 8,
        status: 'In Progress',
        citizenName: 'Neha Verma',
        citizenEmail: 'neha.verma@example.com',
        citizenPhone: '+1 (555) 567-8901',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
      },
      {
        id: 'CIV-2026-00105',
        title: 'Streetlight cluster broken for 10 days on Sector 4 road',
        description: 'Streetlight near Sector 4 has been broken for 10 days and the road becomes completely dark at night creating security risk for pedestrians.',
        location: { city: 'Metropolis', area: 'Sector 4', landmark: 'Opposite Community Hall', latitude: 28.6145, longitude: 77.2085 },
        daysPending: 10,
        previousComplaints: 4,
        status: 'In Progress',
        citizenName: 'Vikram Singh',
        citizenEmail: 'vikram.singh@example.com',
        citizenPhone: '+1 (555) 678-9012',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 240).toISOString(),
      },
      {
        id: 'CIV-2026-00098',
        title: 'Commercial waste and rotten food dumped on public sidewalk',
        description: 'Commercial hotel dumping rotten food waste and plastic bags on public sidewalk daily attracting stray dogs and flies.',
        location: { city: 'Metropolis', area: 'Downtown Square', landmark: 'Near Metro Station Gate 2', latitude: 28.6300, longitude: 77.2190 },
        daysPending: 4,
        previousComplaints: 2,
        status: 'Assigned',
        citizenName: 'Ananya Roy',
        citizenEmail: 'ananya.roy@example.com',
        citizenPhone: '+1 (555) 789-0123',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 96).toISOString(),
      },
      {
        id: 'CIV-2026-00091',
        title: 'Stormwater drain grate missing on pedestrian sidewalk',
        description: 'Missing iron drain grate creating hazardous 5 feet open pit on busy evening walking path near hospital.',
        location: { city: 'Metropolis', area: 'Hospital Road', landmark: 'Civic Hospital Entry 3', latitude: 28.6170, longitude: 77.2050 },
        daysPending: 1,
        previousComplaints: 3,
        status: 'In Progress',
        citizenName: 'Devendra Kumar',
        citizenEmail: 'devendra.k@example.com',
        citizenPhone: '+1 (555) 890-1234',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
      },
      {
        id: 'CIV-2026-00085',
        title: 'Traffic signals blinking yellow continuously at blind crossroad',
        description: 'Traffic signals failed at major 6-lane junction causing severe gridlock and near collisions between transit buses and cars.',
        location: { city: 'Metropolis', area: 'Ring Road Junction', landmark: 'Cloverleaf Exit 4', latitude: 28.6220, longitude: 77.2110 },
        daysPending: 2,
        previousComplaints: 4,
        status: 'Resolved',
        citizenName: 'Kavita Menon',
        citizenEmail: 'kavita.m@example.com',
        citizenPhone: '+1 (555) 901-2345',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 120).toISOString(),
      },
      {
        id: 'CIV-2026-00078',
        title: 'Community park perimeter streetlight bulb fused',
        description: 'Streetlight on park perimeter not turning on at dusk. Minor dark corner in recreational garden.',
        location: { city: 'Metropolis', area: 'Green Valley', landmark: 'Children Park Gate', latitude: 28.6105, longitude: 77.2250 },
        daysPending: 4,
        previousComplaints: 0,
        status: 'Resolved',
        citizenName: 'Mohit Rao',
        citizenEmail: 'mohit.rao@example.com',
        citizenPhone: '+1 (555) 012-3456',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 180).toISOString(),
      },
      {
        id: 'CIV-2026-00072',
        title: 'Public bus shelter glass panel cracked and dirty bench',
        description: 'Bus stop shelter glass panel missing and passenger seating bench damaged with peeled paint.',
        location: { city: 'Metropolis', area: 'East Avenue', landmark: 'Bus Stop 14', latitude: 28.6195, longitude: 77.2300 },
        daysPending: 8,
        previousComplaints: 0,
        status: 'Resolved',
        citizenName: 'Sanjay Dutt',
        citizenEmail: 'sanjay.d@example.com',
        citizenPhone: '+1 (555) 123-4567',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 200).toISOString(),
      },
      {
        id: 'CIV-2026-00065',
        title: 'Dry leaves accumulated in side gutter grating',
        description: 'Dry tree leaves and twigs piled up in stormwater drain grate along residential walkway after storm.',
        location: { city: 'Metropolis', area: 'Pine Grove', landmark: 'Lane 2 Corner', latitude: 28.6150, longitude: 77.2180 },
        daysPending: 2,
        previousComplaints: 0,
        status: 'Resolved',
        citizenName: 'Sunita Rao',
        citizenEmail: 'sunita.rao@example.com',
        citizenPhone: '+1 (555) 234-7890',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 250).toISOString(),
      },
      {
        id: 'CIV-2026-00059',
        title: 'Cracked asphalt surface needing minor patch work',
        description: 'Small surface cracks on asphalt in lane 5 causing minor vibration when driving slow.',
        location: { city: 'Metropolis', area: 'South Extension', landmark: 'Block B Corner', latitude: 28.6080, longitude: 77.2120 },
        daysPending: 15,
        previousComplaints: 0,
        status: 'Under Review',
        citizenName: 'Rajesh Nair',
        citizenEmail: 'rajesh.nair@example.com',
        citizenPhone: '+1 (555) 345-8901',
        createdAt: new Date(Date.now() - 1000 * 60 * 60 * 360).toISOString(),
      }
    ];

    sampleComplaints.forEach(item => {
      const ml = predictComplaintML(item.description, item.daysPending, item.previousComplaints);
      
      const timeline: Complaint['timeline'] = [
        {
          status: 'Submitted',
          timestamp: item.createdAt,
          note: 'Complaint registered by citizen and categorized by ML Intelligence Engine.',
          updatedBy: 'CivicSense Automated Dispatch'
        }
      ];

      if (['Under Review', 'Assigned', 'In Progress', 'Resolved', 'Rejected'].includes(item.status)) {
        timeline.push({
          status: 'Under Review',
          timestamp: new Date(new Date(item.createdAt).getTime() + 1000 * 60 * 45).toISOString(),
          note: 'Municipal triage supervisor reviewed ML priority recommendation and validated severity.',
          updatedBy: 'Supervisor J. Henderson'
        });
      }

      if (['Assigned', 'In Progress', 'Resolved'].includes(item.status)) {
        timeline.push({
          status: 'Assigned',
          timestamp: new Date(new Date(item.createdAt).getTime() + 1000 * 60 * 120).toISOString(),
          note: `Work order dispatched to ${ml.category} Quick-Response Field Unit.`,
          updatedBy: 'Field Operations Dispatch'
        });
      }

      if (['In Progress', 'Resolved'].includes(item.status)) {
        timeline.push({
          status: 'In Progress',
          timestamp: new Date(new Date(item.createdAt).getTime() + 1000 * 60 * 240).toISOString(),
          note: 'Field crew arrived on site, safety perimeter established, and repair operations started.',
          updatedBy: 'Officer T. Miller'
        });
      }

      if (item.status === 'Resolved') {
        timeline.push({
          status: 'Resolved',
          timestamp: new Date(new Date(item.createdAt).getTime() + 1000 * 60 * 600).toISOString(),
          note: 'Maintenance successfully concluded, site verified by inspector, and citizen notified.',
          updatedBy: 'Chief Inspector M. Chen'
        });
      }

      const complaint: Complaint = {
        id: item.id,
        title: item.title,
        description: item.description,
        category: ml.category,
        predictedCategory: ml.category,
        categoryConfidence: ml.categoryConfidence,
        priority: ml.priority,
        confidence: ml.confidence,
        location: item.location,
        daysPending: item.daysPending,
        previousComplaints: item.previousComplaints,
        status: item.status,
        citizenName: item.citizenName,
        citizenEmail: item.citizenEmail,
        citizenPhone: item.citizenPhone,
        assignedOfficer: ['Assigned', 'In Progress', 'Resolved'].includes(item.status) ? 'Officer T. Miller' : undefined,
        assignedDepartment: `Municipal ${ml.category} Department`,
        resolutionNotes: item.status === 'Resolved' ? 'Work completed according to municipal safety standards and tested.' : undefined,
        explainability: {
          primaryDrivers: ml.supportingFactors,
          nlpUrgencyScore: ml.priority === 'HIGH' ? 88 : (ml.priority === 'MEDIUM' ? 62 : 30),
          daysPendingWeight: item.daysPending * 2.5,
          reoccurrenceWeight: item.previousComplaints * 5.0,
          modelConfidence: ml.confidence,
          probabilities: ml.probabilities
        },
        timeline,
        createdAt: item.createdAt,
        updatedAt: item.status === 'Resolved' ? timeline[timeline.length - 1].timestamp : item.createdAt
      };

      this.complaints.set(complaint.id, complaint);
    });
  }

  public getAll(filters?: {
    search?: string;
    category?: string;
    priority?: string;
    status?: string;
    location?: string;
    citizenEmail?: string;
    sortBy?: 'createdAt' | 'priority' | 'confidence' | 'daysPending';
    sortOrder?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }): { complaints: Complaint[]; total: number; page: number; totalPages: number } {
    let list = Array.from(this.complaints.values());

    if (filters?.citizenEmail) {
      list = list.filter(c => c.citizenEmail.toLowerCase() === filters.citizenEmail?.toLowerCase());
    }

    if (filters?.search) {
      const q = filters.search.toLowerCase().trim();
      list = list.filter(c =>
        c.id.toLowerCase().includes(q) ||
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q) ||
        c.location.area.toLowerCase().includes(q) ||
        c.location.city.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }

    if (filters?.category && filters.category !== 'ALL') {
      list = list.filter(c => c.category === filters.category);
    }

    if (filters?.priority && filters.priority !== 'ALL') {
      list = list.filter(c => c.priority === filters.priority);
    }

    if (filters?.status && filters.status !== 'ALL') {
      list = list.filter(c => c.status === filters.status);
    }

    if (filters?.location && filters.location !== 'ALL') {
      list = list.filter(c => c.location.area.toLowerCase().includes(filters.location!.toLowerCase()));
    }

    // Sorting
    const sortBy = filters?.sortBy || 'createdAt';
    const sortOrder = filters?.sortOrder || 'desc';

    list.sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'createdAt') {
        comparison = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      } else if (sortBy === 'priority') {
        const pOrder: Record<PriorityLevel, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
        comparison = pOrder[b.priority] - pOrder[a.priority];
      } else if (sortBy === 'confidence') {
        comparison = b.confidence - a.confidence;
      } else if (sortBy === 'daysPending') {
        comparison = b.daysPending - a.daysPending;
      }
      return sortOrder === 'asc' ? -comparison : comparison;
    });

    const total = list.length;
    const page = Math.max(1, filters?.page || 1);
    const limit = Math.max(1, filters?.limit || 20);
    const startIndex = (page - 1) * limit;
    const paginated = list.slice(startIndex, startIndex + limit);
    const totalPages = Math.ceil(total / limit) || 1;

    return { complaints: paginated, total, page, totalPages };
  }

  public getById(id: string): Complaint | undefined {
    return this.complaints.get(id);
  }

  public create(payload: {
    title: string;
    description: string;
    location: { city: string; area: string; landmark?: string; latitude?: number; longitude?: number };
    daysPending?: number;
    previousComplaints?: number;
    citizenName: string;
    citizenEmail: string;
    citizenPhone?: string;
    customCategory?: ComplaintCategory;
  }): Complaint {
    const days = payload.daysPending || 0;
    const prev = payload.previousComplaints || 0;

    // Run ML prediction
    const ml = predictComplaintML(payload.description, days, prev);

    const year = new Date().getFullYear();
    const id = `CIV-${year}-${String(this.nextIdSequence++).padStart(5, '0')}`;
    const now = new Date().toISOString();

    const finalCategory = payload.customCategory || ml.category;

    const newComplaint: Complaint = {
      id,
      title: payload.title.trim(),
      description: payload.description.trim(),
      category: finalCategory,
      predictedCategory: ml.category,
      categoryConfidence: ml.categoryConfidence,
      priority: ml.priority,
      confidence: ml.confidence,
      location: {
        city: payload.location.city || 'Metropolis',
        area: payload.location.area || 'General Ward',
        landmark: payload.location.landmark,
        latitude: payload.location.latitude || 28.6139,
        longitude: payload.location.longitude || 77.2090
      },
      daysPending: days,
      previousComplaints: prev,
      status: 'Submitted',
      citizenName: payload.citizenName.trim(),
      citizenEmail: payload.citizenEmail.trim(),
      citizenPhone: payload.citizenPhone,
      assignedDepartment: `Municipal ${finalCategory} Department`,
      explainability: {
        primaryDrivers: ml.supportingFactors,
        nlpUrgencyScore: ml.priority === 'HIGH' ? 88 : (ml.priority === 'MEDIUM' ? 62 : 30),
        daysPendingWeight: days * 2.5,
        reoccurrenceWeight: prev * 5.0,
        modelConfidence: ml.confidence,
        probabilities: ml.probabilities
      },
      timeline: [
        {
          status: 'Submitted',
          timestamp: now,
          note: `Complaint recorded by citizen ${payload.citizenName}. AI model categorized as '${finalCategory}' with ${ml.priority} priority (${Math.round(ml.confidence * 100)}% confidence).`,
          updatedBy: 'CivicSense AI Ingestion Service'
        }
      ],
      createdAt: now,
      updatedAt: now
    };

    this.complaints.set(id, newComplaint);
    return newComplaint;
  }

  public updateStatus(id: string, status: ComplaintStatus, note?: string, updatedBy?: string): Complaint | undefined {
    const complaint = this.complaints.get(id);
    if (!complaint) return undefined;

    complaint.status = status;
    complaint.updatedAt = new Date().toISOString();
    
    if (status === 'Assigned' && !complaint.assignedOfficer) {
      complaint.assignedOfficer = 'Officer R. Davies';
    }
    if (status === 'Resolved') {
      complaint.resolutionNotes = note || 'Maintenance inspection completed and resolved.';
    }

    complaint.timeline.push({
      status,
      timestamp: complaint.updatedAt,
      note: note || `Complaint status updated to ${status}.`,
      updatedBy: updatedBy || 'Municipal Authority'
    });

    this.complaints.set(id, complaint);
    return complaint;
  }

  public delete(id: string): boolean {
    return this.complaints.delete(id);
  }

  public getAnalytics(): AnalyticsSummary {
    const list = Array.from(this.complaints.values());
    const totalComplaints = list.length;
    const highPriority = list.filter(c => c.priority === 'HIGH').length;
    const mediumPriority = list.filter(c => c.priority === 'MEDIUM').length;
    const lowPriority = list.filter(c => c.priority === 'LOW').length;
    const resolved = list.filter(c => c.status === 'Resolved').length;
    const inProgress = list.filter(c => ['Assigned', 'In Progress', 'Under Review'].includes(c.status)).length;
    const pending = list.filter(c => c.status === 'Submitted').length;

    // Categories aggregation
    const catMap: Record<string, { total: number; high: number }> = {};
    list.forEach(c => {
      if (!catMap[c.category]) catMap[c.category] = { total: 0, high: 0 };
      catMap[c.category].total += 1;
      if (c.priority === 'HIGH') catMap[c.category].high += 1;
    });

    const byCategory = Object.entries(catMap).map(([name, stats]) => ({
      name,
      count: stats.total,
      highPriorityCount: stats.high
    })).sort((a, b) => b.count - a.count);

    // Priorities
    const byPriority = [
      { name: 'HIGH', count: highPriority, percentage: totalComplaints ? Math.round((highPriority / totalComplaints) * 100) : 0, color: '#ef4444' },
      { name: 'MEDIUM', count: mediumPriority, percentage: totalComplaints ? Math.round((mediumPriority / totalComplaints) * 100) : 0, color: '#f59e0b' },
      { name: 'LOW', count: lowPriority, percentage: totalComplaints ? Math.round((lowPriority / totalComplaints) * 100) : 0, color: '#10b981' },
    ];

    // Statuses
    const statusMap: Record<string, number> = {};
    list.forEach(c => {
      statusMap[c.status] = (statusMap[c.status] || 0) + 1;
    });

    const statusColors: Record<string, string> = {
      'Submitted': '#64748b',
      'Under Review': '#3b82f6',
      'Assigned': '#8b5cf6',
      'In Progress': '#f59e0b',
      'Resolved': '#10b981',
      'Rejected': '#ef4444'
    };

    const byStatus = Object.entries(statusMap).map(([name, count]) => ({
      name,
      count,
      color: statusColors[name] || '#64748b'
    }));

    // Timeline mock aggregated by last 7 days
    const now = Date.now();
    const timeline = Array.from({ length: 7 }).map((_, idx) => {
      const d = new Date(now - (6 - idx) * 24 * 60 * 60 * 1000);
      const dateStr = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return {
        date: dateStr,
        submitted: Math.floor(Math.random() * 5) + 3,
        resolved: Math.floor(Math.random() * 4) + 2
      };
    });

    const categoryResolutionRate = byCategory.map(cat => ({
      category: cat.name,
      total: cat.count,
      rate: Math.min(100, Math.round(55 + Math.random() * 40))
    }));

    return {
      totalComplaints,
      highPriority,
      mediumPriority,
      lowPriority,
      resolved,
      pending,
      inProgress,
      avgResolutionDays: 2.8,
      byCategory,
      byPriority,
      byStatus,
      timeline,
      categoryResolutionRate
    };
  }
}

export const db = new InMemoryMongoDBStore();
