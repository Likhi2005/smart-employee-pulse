# Pull MongoDB image
docker pull mongo:latest

# Run MongoDB container
docker run -d \
  --name workpulse-mongo \
  -p 27017:27017 \
  -v workpulse-data:/data/db \
  -e MONGO_INITDB_ROOT_USERNAME=admin \
  -e MONGO_INITDB_ROOT_PASSWORD=admin123 \
  mongo:latest

# Verify it's running
docker ps | grep workpulse-mongo

# Stop it
docker stop workpulse-mongo

# Start it again
docker start workpulse-mongo

# Remove container
docker rm workpulse-mongo



# ------------------Backedn Image-------------------

# Build image
docker build -t workpulse-backend:latest .

# Run backend with MongoDB link
docker run -d \
  --name workpulse-backend \
  -p 5000:5000 \
  --link workpulse-mongo \
  -e MONGODB_URI=mongodb://admin:admin123@workpulse-mongo:27017/workpulse \
  workpulse-backend:latest

# View logs
docker logs -f workpulse-backend


#--------------------------Dcoker database ------------------------
# Access MongoDB inside docker container
docker exec -it workpulse-mongo mongosh \
  -u admin -p admin123 \
  --authenticationDatabase admin \
  admin

# Then use mongosh commands above
use workpulse                          # Switch database
show collections                       # List all collections
db.users.find().pretty()              # View all users
db.users.findOne()                    # View first user
db.tasks.find({status: 'pending'})    # Filter tasks
db.users.countDocuments()             # Count records
db.users.deleteMany({})   