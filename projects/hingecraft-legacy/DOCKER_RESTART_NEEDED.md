# Docker Desktop I/O Error - Restart Required

## Issue
Docker Desktop is experiencing I/O errors when trying to push images:
```
write /var/lib/desktop-containerd/daemon/io.containerd.metadata.v1.bolt/meta.db: input/output error
```

## Solution
**Restart Docker Desktop** to fix the I/O error:

1. **Quit Docker Desktop**:
   - Click the Docker icon in the menu bar
   - Select "Quit Docker Desktop"
   - Or: `killall Docker`

2. **Restart Docker Desktop**:
   - Open Docker Desktop from Applications
   - Wait for it to fully start (whale icon stops animating)

3. **Re-login to Docker Hub**:
   ```bash
   cd [PROJECT_ROOT]/HingeCraft
   echo "dckr_pat_k8ZdXrNQIvCKXjN3wSbwd8PyZUQ" | docker login -u departmentsai --password-stdin
   ```

4. **Push images**:
   ```bash
   docker push departmentsai/wix-db-adaptor:latest
   docker push departmentsai/wix-python-server:latest
   ```

   Or run the full deployment:
   ```bash
   ./auto-deploy-all.sh
   ```

## Alternative: Use Deploy Script
The deployment script will handle the push automatically:
```bash
./auto-deploy-all.sh
```

## Status
- ✅ Token updated in .env
- ✅ Docker login successful
- ✅ Images built locally
- ⚠️ Docker Desktop I/O error (needs restart)
- ⏳ Waiting for Docker restart to push images



