package main

import (
	"net/http"
	"github.com/gin-gonic/gin"
	"github.com/gin-contrib/cors"
)

func main() {
	r := gin.Default()
	
	// Enable CORS
	r.Use(cors.Default())
	
	r.GET("/", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"message": "Hello from Go Gin App!",
			"status": "running",
			"framework": "gin",
		})
	})
	
	r.GET("/health", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "healthy",
		})
	})
	
	r.Run(":8080")
}