import { mockApiService } from "./mock-api";

// API Configuration
const API_BASE_URL = import.meta.env.VITE_API_URL 
const shouldUseMock = import.meta.env.VITE_NODE_ENV === 'development' 
  && import.meta.env.VITE_USE_MOCK === 'true';

  console.log("should use mock", shouldUseMock, import.meta.env.VITE_NODE_ENV , import.meta.env.VITE_USE_MOCK);
const apiServiceReal = {
  async getHealth() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return response.json();
  },

  async getActions() {
    const response = await fetch(`${API_BASE_URL}/actions`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });
    return response.json();
  },


  async declareAction(data) {
    const response = await fetch(`${API_BASE_URL}/actions/declare`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async approveAction(actionId, approver, reason) {
    const response = await fetch(`${API_BASE_URL}/actions/${actionId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ approver, reason, action_id: actionId }),
    });
    return response.json();
  },

  async executeAction(actionId, webhookUrl) {
    const response = await fetch(`${API_BASE_URL}/actions/${actionId}/execute`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ n8n_webhook_url: webhookUrl }),
    });
    return response.json();
  },

  async getAuditTrail(actionId) {
    const response = await fetch(`${API_BASE_URL}/actions/${actionId}/audit-trail`);
    return response.json();
  },

  async getExplanation(actionId) {
    const response = await fetch(`${API_BASE_URL}/actions/${actionId}/explain`);
    return response.json();
  },
};

export const apiService = shouldUseMock ? mockApiService : apiServiceReal;
