```Bash
# Terminal 1: ATP Gateway
cd gateway
pip install -r requirements.txt
export OPENAI_API_KEY=sk-your-key-here
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Terminal 2: Dashboard
cd dashboard
npm install
npm run dev

# Terminal 3: n8n (optional)
docker run -it --rm \
  --name n8n \
  -p 5678:5678 \
  -e N8N_BASIC_AUTH_ACTIVE=true \
  -e N8N_BASIC_AUTH_USER=admin \
  -e N8N_BASIC_AUTH_PASSWORD=admin \
  n8nio/n8n

# Terminal 4: dev k8s cluster KinD, k3s, microk8s ....

# Infra Setup
# 1. setup argocd 
# 2. create simple argocd application 
# 3. add application endpiont to uptime kuma
# 4. add webhook notification to the application

```