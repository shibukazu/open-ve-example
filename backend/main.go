package main

import (
	"fmt"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowMethods:     []string{"POST", "GET", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	r.POST("/upload", func(c *gin.Context) {
		price := c.PostForm("price")
		file, err := c.FormFile("image")

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
			return
		}

		// Save the file to the server (example: ./uploads/)
		filepath := fmt.Sprintf("./uploads/%s", file.Filename)
		if err := c.SaveUploadedFile(file, filepath); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"message": "Saving image failed"})
			return
		}

		c.JSON(http.StatusOK, gin.H{"message": "File uploaded successfully", "price": price, "file": file.Filename})
	})

	r.Run(":8090")
}