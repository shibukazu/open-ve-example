package main

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"io"
	"log"
	"net/http"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type CheckRequest struct {
	ID        string `json:"id"`
	Variables struct {
		Image struct {
			Type  string `json:"@type"`
			Value string `json:"value"`
		} `json:"image"`
	} `json:"variables"`
}

type CheckResponse struct {
	IsValid bool `json:"isValid"`
}

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
		file, err := c.FormFile("image")

		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
			return
		}
		// TODO: 現状は画像のみチェック
		// ファイルを読み込み
		fileContent, err := file.Open()
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
			return
		}
		defer fileContent.Close()

		fileBytes, err := io.ReadAll(fileContent)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
			return
		}

		// Base64エンコード
		base64Image := base64.StdEncoding.EncodeToString(fileBytes)

		// v1/check にリクエストを送信
		checkRequest := CheckRequest{
			ID: "image",
		}
		checkRequest.Variables.Image.Type = "type.googleapis.com/google.protobuf.BytesValue"
		checkRequest.Variables.Image.Value = base64Image

		checkRequestBody, err := json.Marshal(checkRequest)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
			return
		}

		resp, err := http.Post("http://localhost:8080/v1/check", "application/json", bytes.NewBuffer(checkRequestBody))
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
			return
		}
		defer resp.Body.Close()

		respBody, err := io.ReadAll(resp.Body)
		if err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
			return
		}

		var checkResponse CheckResponse
		if err := json.Unmarshal(respBody, &checkResponse); err != nil {
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
			return
		}

		if checkResponse.IsValid {
			log.Println("Image Valid")
			c.JSON(http.StatusOK, gin.H{"message": "Image upload success"})
		} else {
			log.Println("Image Invalid")
			c.JSON(http.StatusBadRequest, gin.H{"message": "Image upload failed"})
		}
	})

	r.Run(":8090")
}