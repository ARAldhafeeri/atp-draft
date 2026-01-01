```Bash
# Terminal 1: ATP Gateway n8n, atp, uptimekuma
sudo docker compose up -d 

# Terminal 2: Dashboard
cd dashboard
npm install
npm run dev


# Infra Setup
# 1. setup argocd 
# 2. create simple argocd application 
# 3. add application endpiont to uptime kuma
# 4. add webhook notification to the application monitoring on uptime kuma.
# 5. sumilate error : uptime kuma -> apt gateaway ( declare action ) -> n8n workflow or human approval  then n8n workflow

# note to reach argocd from within microk8s you need to get your ip address 
ip addr show eth0 | grep -oP '(?<=inet\s)\d+(\.\d+){3}'

```