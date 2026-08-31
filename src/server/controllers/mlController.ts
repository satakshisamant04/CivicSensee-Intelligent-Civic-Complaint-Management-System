import { Request, Response } from 'express';
import { predictComplaintML, getStaticModelEvaluation } from '../mlEngine.js';

export const predictComplaint = async (req: Request, res: Response) => {
  try {
    const { complaint_text, days_pending, previous_complaints } = req.body;

    if (!complaint_text || !complaint_text.trim()) {
      return res.status(400).json({ success: false, error: 'complaint_text is required.' });
    }

    const text = complaint_text.trim();
    const days = Math.max(0, Number(days_pending) || 0);
    const prev = Math.max(0, Number(previous_complaints) || 0);

    // If external FastAPI service is configured via environment variable
    const fastApiUrl = process.env.ML_SERVICE_URL;
    if (fastApiUrl) {
      try {
        const response = await fetch(`${fastApiUrl}/predict`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ complaint_text: text, days_pending: days, previous_complaints: prev }),
          signal: AbortSignal.timeout(2500)
        });
        if (response.ok) {
          const data = await response.json();
          return res.json({ success: true, source: 'fastapi-microservice', data });
        }
      } catch (err) {
        console.warn('FastAPI microservice unreachable, falling back to embedded ML pipeline engine.');
      }
    }

    // Local embedded Scikit-learn equivalent TF-IDF & Logistic Regression model
    const prediction = predictComplaintML(text, days, prev);
    res.json({ success: true, source: 'embedded-tfidf-logistic-model', data: prediction });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'ML Prediction Failure' });
  }
};

export const getModelEvaluation = (_req: Request, res: Response) => {
  try {
    const evalData = getStaticModelEvaluation();
    res.json({ success: true, data: evalData });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message || 'Failed to load ML metrics' });
  }
};
