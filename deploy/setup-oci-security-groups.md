# OCI Security Groups Setup Guide

Before deploying your application, you need to configure Oracle Cloud security groups to allow traffic to your application.

## Required Security Group Rules

### Ingress Rules (Inbound Traffic)

Add these rules to your OCI instance's security list:

| Protocol | Port Range | Source CIDR | Description |
|----------|------------|-------------|-------------|
| TCP | 22 | 0.0.0.0/0 | SSH Access |
| TCP | 80 | 0.0.0.0/0 | HTTP (for future SSL setup) |
| TCP | 443 | 0.0.0.0/0 | HTTPS (for future SSL setup) |
| TCP | 3000 | 0.0.0.0/0 | Frontend Application |
| TCP | 8000 | 0.0.0.0/0 | Backend API |

## How to Configure in OCI Console

1. **Go to OCI Console** → Networking → Virtual Cloud Networks
2. **Select your VCN** (where your instance is located)
3. **Click on Security Lists**
4. **Select the security list** associated with your instance's subnet
5. **Add Ingress Rules** with the specifications above

### Step-by-step for each rule:

**For Frontend (Port 3000):**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `3000`
- Description: `Frontend Application`

**For Backend (Port 8000):**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP` 
- Destination Port Range: `8000`
- Description: `Backend API`

**For HTTP (Port 80):**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `80`
- Description: `HTTP`

**For HTTPS (Port 443):**
- Source CIDR: `0.0.0.0/0`
- IP Protocol: `TCP`
- Destination Port Range: `443`
- Description: `HTTPS`

## Security Considerations

- **For production use**, consider restricting source CIDRs to specific IP ranges instead of `0.0.0.0/0`
- **SSH access** should be restricted to your IP address only: replace `0.0.0.0/0` with `YOUR_IP/32`
- **Consider using a reverse proxy** (like Nginx) to handle SSL termination and proxy requests

## Alternative: Quick CLI Commands

If you prefer using OCI CLI, you can add these rules with:

```bash
# Get your security list OCID first
oci network security-list list --compartment-id <your-compartment-id> --vcn-id <your-vcn-id>

# Add ingress rules
oci network security-list update --security-list-id <security-list-ocid> \
  --ingress-security-rules '[{
    "protocol": "6",
    "source": "0.0.0.0/0",
    "tcpOptions": {"destinationPortRange": {"min": 3000, "max": 3000}},
    "description": "Frontend Application"
  }]'
```

## Testing Connectivity

After configuring security groups, test connectivity:

```bash
# Test if ports are accessible
telnet YOUR_OCI_IP 3000
telnet YOUR_OCI_IP 8000

# Or use curl
curl http://YOUR_OCI_IP:8000/health
curl http://YOUR_OCI_IP:3000
```