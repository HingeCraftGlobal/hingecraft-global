package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"os"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/redis/go-redis/v9"
	"golang.org/x/crypto/argon2"
)

var (
	dbPool   *pgxpool.Pool
	redisClient *redis.Client
	jwtSecret   []byte
)

func main() {
	// Production mode
	gin.SetMode(gin.ReleaseMode)
	log.Println("🚀 Starting Gateway in PRODUCTION mode")

	// Initialize database connection
	dbURL := fmt.Sprintf("postgres://%s:%s@%s:%s/%s",
		getEnv("DB_USER", "admin"),
		getEnv("DB_PASSWORD", "changeme"),
		getEnv("DB_HOST", "db"),
		getEnv("DB_PORT", "5432"),
		getEnv("DB_NAME", "cloud_db"),
	)

	var err error
	dbPool, err = pgxpool.New(context.Background(), dbURL)
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	defer dbPool.Close()

	// Initialize Redis
	redisClient = redis.NewClient(&redis.Options{
		Addr: fmt.Sprintf("%s:%s", getEnv("REDIS_HOST", "redis"), getEnv("REDIS_PORT", "6379")),
	})

	// JWT Secret
	jwtSecret = []byte(getEnv("JWT_SECRET", "changeme"))

	// Setup router
	r := gin.Default()
	r.SetTrustedProxies([]string{"*"})

	// Health check
	r.GET("/health", healthCheck)

	// Public routes
	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/signup", signup)
			auth.POST("/login", login)
		}

		// Protected routes
		vault := api.Group("/vault")
		vault.Use(authMiddleware())
		{
			vault.POST("/collect", collectData)
			vault.GET("/search", semanticSearch)
			vault.GET("/status/:id", getStatus)
		}

		// Admin routes
		admin := api.Group("/admin")
		admin.Use(authMiddleware())
		{
			admin.GET("/health", adminHealth)
		}
	}

	port := getEnv("PORT", "8080")
	log.Printf("✅ Gateway listening on port %s", port)
	log.Fatal(r.Run(":" + port))
}

func healthCheck(c *gin.Context) {
	c.JSON(http.StatusOK, gin.H{
		"status":  "healthy",
		"service": "gateway",
		"time":    time.Now().UTC(),
	})
}

func signup(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required,email"`
		Password string `json:"password" binding:"required,min=8"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Hash password with Argon2id
	salt := make([]byte, 16)
	hash := argon2.IDKey([]byte(req.Password), salt, 1, 64*1024, 4, 32)

	// Create company and member
	var companyID string
	err := dbPool.QueryRow(context.Background(),
		`INSERT INTO companies (name, domain) VALUES ($1, $2) 
		 ON CONFLICT (domain) DO UPDATE SET domain = EXCLUDED.domain RETURNING id`,
		req.Email, req.Email).Scan(&companyID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create company"})
		return
	}

	var memberID string
	err = dbPool.QueryRow(context.Background(),
		`INSERT INTO members (email, password_hash, company_id) VALUES ($1, $2, $3) RETURNING id`,
		req.Email, fmt.Sprintf("%x", hash), companyID).Scan(&memberID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create member"})
		return
	}

	c.JSON(http.StatusCreated, gin.H{
		"message": "Account created successfully",
		"member_id": memberID,
	})
}

func login(c *gin.Context) {
	var req struct {
		Email    string `json:"email" binding:"required"`
		Password string `json:"password" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Generate JWT token
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, jwt.MapClaims{
		"email":    req.Email,
		"member_id": "temp",
		"exp":      time.Now().Add(time.Hour * 24 * 30).Unix(),
	})

	tokenString, err := token.SignedString(jwtSecret)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to generate token"})
		return
	}

	c.JSON(http.StatusOK, gin.H{
		"token": tokenString,
		"expires_in": 2592000,
	})
}

func authMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		tokenString := c.GetHeader("Authorization")
		if tokenString == "" {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing authorization header"})
			c.Abort()
			return
		}

		if len(tokenString) > 7 && tokenString[:7] == "Bearer " {
			tokenString = tokenString[7:]
		}

		token, err := jwt.Parse(tokenString, func(token *jwt.Token) (interface{}, error) {
			return jwtSecret, nil
		})

		if err != nil || !token.Valid {
			c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
			c.Abort()
			return
		}

		c.Next()
	}
}

func collectData(c *gin.Context) {
	var req struct {
		DataType string          `json:"data_type" binding:"required"`
		Data     json.RawMessage `json:"data" binding:"required"`
	}

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	// Insert into vault
	var vaultID string
	err := dbPool.QueryRow(context.Background(),
		`INSERT INTO member_vault (member_id, company_id, data_type, raw_data) 
		 VALUES ($1, $2, $3, $4) RETURNING id`,
		"temp", "temp", req.DataType, req.Data).Scan(&vaultID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store data"})
		return
	}

	// Queue ML processing
	redisClient.LPush(context.Background(), "ml_queue", vaultID)

	c.JSON(http.StatusAccepted, gin.H{
		"id":     vaultID,
		"status": "pending",
		"message": "Data queued for processing",
	})
}

func semanticSearch(c *gin.Context) {
	query := c.Query("q")
	if query == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Query parameter 'q' is required"})
		return
	}

	// Call ML Brain service for embedding
	resp, err := http.Get(fmt.Sprintf("http://ml-brain:8000/embed?text=%s", query))
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "ML service unavailable"})
		return
	}
	defer resp.Body.Close()

	var result struct {
		Embedding []float32 `json:"embedding"`
	}
	json.NewDecoder(resp.Body).Decode(&result)

	// Perform semantic search in database
	rows, err := dbPool.Query(context.Background(),
		`SELECT id, raw_data, ai_summary FROM member_vault 
		 WHERE embedding IS NOT NULL 
		 ORDER BY embedding <=> $1::vector LIMIT 10`,
		fmt.Sprintf("[%v]", result.Embedding))

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Search failed"})
		return
	}
	defer rows.Close()

	var results []map[string]interface{}
	for rows.Next() {
		var id, summary string
		var data json.RawMessage
		rows.Scan(&id, &data, &summary)
		results = append(results, map[string]interface{}{
			"id":      id,
			"data":    data,
			"summary": summary,
		})
	}

	c.JSON(http.StatusOK, gin.H{"results": results})
}

func getStatus(c *gin.Context) {
	id := c.Param("id")
	var status string
	err := dbPool.QueryRow(context.Background(),
		`SELECT processing_status FROM member_vault WHERE id = $1`, id).Scan(&status)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Not found"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": id, "status": status})
}

func adminHealth(c *gin.Context) {
	var dbStatus, redisStatus string

	err := dbPool.Ping(context.Background())
	if err != nil {
		dbStatus = "unhealthy"
	} else {
		dbStatus = "healthy"
	}

	err = redisClient.Ping(context.Background()).Err()
	if err != nil {
		redisStatus = "unhealthy"
	} else {
		redisStatus = "healthy"
	}

	c.JSON(http.StatusOK, gin.H{
		"database": dbStatus,
		"redis":    redisStatus,
		"gateway":  "healthy",
	})
}

func getEnv(key, defaultValue string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return defaultValue
}
